// src/hooks/useLifeRPG.js
// Hook for syncing with LifeRPG API (Experiments ontology)
// Replaces useTaskNotesSync

import { useState, useEffect, useCallback, useRef } from 'react';
import { liferpgClient } from '@/services/liferpg';

/**
 * useLifeRPG - Sync state with LifeRPG API
 *
 * Maps Experiments ontology to current UI terminology for backward compatibility:
 * - experiments → tasks (UI still shows "tasks" until we update)
 * - inquiries → quests (UI still shows "quests" until we update)
 *
 * The API is authoritative. Local state is for optimistic updates only.
 */
export function useLifeRPG(dispatch) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Prevent duplicate syncs
  const syncInProgressRef = useRef(false);

  // ═══════════════════════════════════════════════════════════════
  // SYNC - Load all data from API
  // ═══════════════════════════════════════════════════════════════

  const sync = useCallback(async () => {
    if (syncInProgressRef.current) return;
    syncInProgressRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [experiments, inquiries, edges, vines] = await Promise.all([
        liferpgClient.getExperiments(),
        liferpgClient.getInquiries(),
        liferpgClient.getEdges(),
        liferpgClient.getVines(),
      ]);

      // Map experiments → tasks for UI compatibility
      // (The experiment fields will pass through, UI can access them)
      const tasks = experiments.map(exp => ({
        ...exp,
        // Map experiment fields to task fields for UI
        title: exp.hypothesis,
        questIds: exp.inquiryId ? [exp.inquiryId] : [],
        cognitiveLoad: exp.energyRequired,
        estimatedMinutes: exp.timeboxed,
        // Keep original fields for new UI components
        hypothesis: exp.hypothesis,
        findings: exp.findings,
        conditions: exp.conditions,
        nextExperiment: exp.nextExperiment,
      }));

      // Map inquiries → quests for UI compatibility
      const quests = inquiries.map(inq => ({
        ...inq,
        // Map inquiry fields to quest fields for UI
        title: inq.question,
        description: inq.description,
        taskIds: inq.experimentIds,
        // Keep original fields
        question: inq.question,
        keyFindings: inq.keyFindings,
        experimentIds: inq.experimentIds,
      }));

      // Map vines to questVines format
      const questVines = vines.map(vine => ({
        id: vine.id,
        sourceQuestId: vine.sourceInquiry,
        targetQuestId: vine.targetInquiry,
        strength: vine.strength,
        reason: vine.reason,
      }));

      dispatch({
        type: 'LOAD_FROM_API',
        payload: { tasks, quests, edges, questVines },
      });

      setLastSync(new Date());
      setIsConnected(true);
    } catch (e) {
      console.error('LifeRPG sync failed:', e);
      setError(e.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      syncInProgressRef.current = false;
    }
  }, [dispatch]);

  // ═══════════════════════════════════════════════════════════════
  // AUTO-SYNC EFFECTS
  // ═══════════════════════════════════════════════════════════════

  // Initial sync on mount
  useEffect(() => {
    sync();
  }, [sync]);

  // Poll every 30 seconds (less aggressive than before)
  useEffect(() => {
    const interval = setInterval(sync, 30000);
    return () => clearInterval(interval);
  }, [sync]);

  // Sync on window focus
  useEffect(() => {
    const handleFocus = () => sync();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [sync]);

  // ═══════════════════════════════════════════════════════════════
  // EXPERIMENT CRUD (mapped as "task" operations for UI)
  // ═══════════════════════════════════════════════════════════════

  const createExperiment = useCallback(async (data) => {
    try {
      const experiment = await liferpgClient.createExperiment({
        hypothesis: data.title || data.hypothesis,
        status: data.status || 'designed',
        conditions: data.conditions || [],
        energyRequired: data.cognitiveLoad || data.energyRequired || 3,
        timeboxed: data.estimatedMinutes || data.timeboxed || 25,
        inquiryId: data.questIds?.[0] || data.inquiryId || null,
        notes: data.notes || '',
        position: data.position || { x: 0, y: 0 },
      });
      await sync(); // Refresh state
      return experiment;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [sync]);

  const updateExperiment = useCallback(async (id, updates) => {
    try {
      // Map UI field names to experiment field names
      const experimentUpdates = {
        ...updates,
        hypothesis: updates.title || updates.hypothesis,
        energyRequired: updates.cognitiveLoad || updates.energyRequired,
        timeboxed: updates.estimatedMinutes || updates.timeboxed,
        inquiryId: updates.questIds?.[0] || updates.inquiryId,
      };
      const experiment = await liferpgClient.updateExperiment(id, experimentUpdates);
      await sync();
      return experiment;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [sync]);

  const concludeExperiment = useCallback(async (id, findings, nextExperiment = '') => {
    try {
      // Conclude an experiment with findings (required!)
      const experiment = await liferpgClient.patchExperiment(id, {
        status: 'concluded',
        findings,
        nextExperiment,
      });
      await sync();
      return experiment;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [sync]);

  const deleteExperiment = useCallback(async (id) => {
    try {
      await liferpgClient.deleteExperiment(id);
      await sync();
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [sync]);

  // ═══════════════════════════════════════════════════════════════
  // INQUIRY CRUD (mapped as "quest" operations for UI)
  // ═══════════════════════════════════════════════════════════════

  const createInquiry = useCallback(async (data) => {
    try {
      const inquiry = await liferpgClient.createInquiry({
        question: data.title || data.question,
        description: data.description || '',
        status: data.status || 'active',
      });
      await sync();
      return inquiry;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [sync]);

  const updateInquiry = useCallback(async (id, updates) => {
    try {
      const inquiryUpdates = {
        ...updates,
        question: updates.title || updates.question,
      };
      const inquiry = await liferpgClient.updateInquiry(id, inquiryUpdates);
      await sync();
      return inquiry;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [sync]);

  const integrateInquiry = useCallback(async (id, keyFindings = []) => {
    try {
      // Integrate an inquiry (requires key findings!)
      const inquiry = await liferpgClient.patchInquiry(id, {
        status: 'integrated',
        keyFindings,
      });
      await sync();
      return inquiry;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [sync]);

  const deleteInquiry = useCallback(async (id) => {
    try {
      await liferpgClient.deleteInquiry(id);
      await sync();
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [sync]);

  // ═══════════════════════════════════════════════════════════════
  // EDGE & VINE CRUD
  // ═══════════════════════════════════════════════════════════════

  const createEdge = useCallback(async (source, target, condition = '') => {
    try {
      const edge = await liferpgClient.createEdge(source, target, condition);
      await sync();
      return edge;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [sync]);

  const deleteEdge = useCallback(async (source, target) => {
    try {
      await liferpgClient.deleteEdge(source, target);
      await sync();
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [sync]);

  const createVine = useCallback(async (sourceInquiry, targetInquiry, strength, reason) => {
    try {
      const vine = await liferpgClient.createVine(sourceInquiry, targetInquiry, strength, reason);
      await sync();
      return vine;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [sync]);

  const deleteVine = useCallback(async (sourceInquiry, targetInquiry) => {
    try {
      await liferpgClient.deleteVine(sourceInquiry, targetInquiry);
      await sync();
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [sync]);

  // ═══════════════════════════════════════════════════════════════
  // LEGACY ALIASES (for backward compatibility with current UI)
  // ═══════════════════════════════════════════════════════════════

  return {
    // Connection state
    isConnected,
    isLoading,
    error,
    lastSync,
    sync,

    // Experiment operations (Experiments ontology)
    createExperiment,
    updateExperiment,
    concludeExperiment,
    deleteExperiment,

    // Inquiry operations (Experiments ontology)
    createInquiry,
    updateInquiry,
    integrateInquiry,
    deleteInquiry,

    // Edge & Vine operations
    createEdge,
    deleteEdge,
    createVine,
    deleteVine,

    // Legacy aliases (map to current UI expectations)
    createTask: createExperiment,
    updateTask: updateExperiment,
    completeTask: (id) => concludeExperiment(id, 'Completed', ''),
    deleteTask: deleteExperiment,
    createQuest: createInquiry,
    updateQuest: updateInquiry,
    deleteQuest: deleteInquiry,
    syncFromTaskNotes: sync, // Backward compatibility
  };
}

export default useLifeRPG;
