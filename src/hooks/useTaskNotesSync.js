// src/hooks/useTaskNotesSync.js

import { useState, useEffect, useCallback } from 'react';
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

  // Fetch all tasks from TaskNotes and update Orrery state
  const syncFromTaskNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tasks = await taskNotesClient.getTasks();
      const transformed = transformTasksFromAPI(tasks);

      dispatch({
        type: 'LOAD_FROM_TASKNOTES',
        payload: { tasks: transformed }
      });

      setLastSync(new Date());
      setIsConnected(true);
    } catch (e) {
      setError(e.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Create task via API, then update local state
  const createTask = useCallback(async (task) => {
    const tnTask = orreryToTaskNotes(task);
    const created = await taskNotesClient.createTask(tnTask);
    await syncFromTaskNotes(); // Re-sync to get server state
    return created;
  }, [syncFromTaskNotes]);

  // Update task via API
  const updateTask = useCallback(async (id, updates) => {
    const tnUpdates = orreryToTaskNotes(updates);
    await taskNotesClient.updateTask(id, tnUpdates);
    await syncFromTaskNotes();
  }, [syncFromTaskNotes]);

  // Complete task via API
  const completeTask = useCallback(async (id) => {
    await taskNotesClient.toggleTaskStatus(id);
    await syncFromTaskNotes();
  }, [syncFromTaskNotes]);

  // Delete task via API
  const deleteTask = useCallback(async (id) => {
    await taskNotesClient.deleteTask(id);
    await syncFromTaskNotes();
  }, [syncFromTaskNotes]);

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
