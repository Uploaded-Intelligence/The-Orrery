// src/hooks/useTaskNotesSync.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { taskNotesClient } from '@/services/tasknotes';
import { transformTasksFromAPI, orreryToTaskNotes } from '@/services/tasknotes-transform';

/**
 * Hook for syncing Orrery state with TaskNotes API
 *
 * Implements server-authoritative pattern:
 * - TaskNotes is source of truth
 * - Orrery optimistically updates, then syncs
 * - Poll on focus or interval for updates
 */
export function useTaskNotesSync(dispatch) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Guard to prevent state updates after unmount
  const isMounted = useRef(true);

  // Fetch all tasks from TaskNotes and update Orrery state
  const syncFromTaskNotes = useCallback(async () => {
    console.log('[TaskNotesSync] Starting sync...');
    if (!isMounted.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const tasks = await taskNotesClient.getTasks();
      console.log('[TaskNotesSync] Raw API response:', tasks);
      const transformed = transformTasksFromAPI(tasks);
      console.log('[TaskNotesSync] Transformed tasks:', transformed);

      // Only update state if still mounted
      if (!isMounted.current) return;

      dispatch({
        type: 'LOAD_FROM_TASKNOTES',
        payload: { tasks: transformed }
      });

      setLastSync(new Date());
      setIsConnected(true);
      console.log('[TaskNotesSync] ✓ Connected');
    } catch (e) {
      console.error('[TaskNotesSync] ✗ Error:', e.message);
      // Only update state if still mounted
      if (!isMounted.current) return;

      setError(e.message);
      setIsConnected(false);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [dispatch]);

  // Create task via API (optimistic - no immediate sync)
  const createTask = useCallback(async (task) => {
    const tnTask = orreryToTaskNotes(task);
    const created = await taskNotesClient.createTask(tnTask);
    // Don't sync immediately - let polling handle it
    // This prevents race condition with Orrery-local data (like position)
    return created;
  }, []);

  // Update task via API (optimistic updates pattern)
  const updateTask = useCallback(async (id, updates) => {
    // 1. Optimistically update local state immediately
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id, updates }
    });

    // 2. Send to server in background
    try {
      const tnUpdates = orreryToTaskNotes(updates);
      await taskNotesClient.updateTask(id, tnUpdates);
      // Don't sync - let polling handle it
    } catch (e) {
      // 3. On failure, revert optimistic update
      console.error('[TaskNotesSync] Update failed, reverting:', e);
      await syncFromTaskNotes(); // Only sync on error to revert
    }
  }, [dispatch, syncFromTaskNotes]);

  // Complete task via API (optimistic updates pattern)
  const completeTask = useCallback(async (id) => {
    // 1. Optimistically update local state
    dispatch({
      type: 'COMPLETE_TASK',
      payload: id
    });

    // 2. Send to server in background
    try {
      await taskNotesClient.toggleTaskStatus(id);
      // Don't sync - let polling handle it
    } catch (e) {
      // 3. On failure, revert optimistic update
      console.error('[TaskNotesSync] Complete failed, reverting:', e);
      await syncFromTaskNotes();
    }
  }, [dispatch, syncFromTaskNotes]);

  // Delete task via API (optimistic updates pattern)
  const deleteTask = useCallback(async (id) => {
    // 1. Optimistically update local state
    dispatch({
      type: 'DELETE_TASK',
      payload: id
    });

    // 2. Send to server in background
    try {
      await taskNotesClient.deleteTask(id);
      // Don't sync - let polling handle it
    } catch (e) {
      // 3. On failure, revert optimistic update
      console.error('[TaskNotesSync] Delete failed, reverting:', e);
      await syncFromTaskNotes();
    }
  }, [dispatch, syncFromTaskNotes]);

  // Initial sync on mount
  useEffect(() => {
    syncFromTaskNotes();
  }, [syncFromTaskNotes]);

  // Re-sync when window gains focus
  useEffect(() => {
    const handleFocus = () => syncFromTaskNotes();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncFromTaskNotes]);

  // Poll every 30 seconds as backup
  useEffect(() => {
    const interval = setInterval(syncFromTaskNotes, 30000);
    return () => clearInterval(interval);
  }, [syncFromTaskNotes]);

  // Cleanup: Mark as unmounted to prevent state updates
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    lastSync,
    syncFromTaskNotes,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
  };
}
