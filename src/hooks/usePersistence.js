// ═══════════════════════════════════════════════════════════════
// hooks/usePersistence.js
// Persistence hook for window.storage sync
// ═══════════════════════════════════════════════════════════════

import { useEffect } from 'react';
import { STORAGE_KEY } from '@/constants';

/**
 * Handle persistence to window.storage
 * @param {import('@/types').OrreryState} state
 * @param {Function} dispatch
 * @param {Function} setLoadError
 * @param {Function} setSaveStatus
 */
export function usePersistence(state, dispatch, setLoadError, setSaveStatus) {
  // Load on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result?.value) {
          const parsed = JSON.parse(result.value);
          dispatch({ type: 'LOAD_STATE', payload: parsed });
        }
      } catch (e) {
        console.error('Failed to load state:', e);
        setLoadError(e.message);
      }
    };
    loadState();
  }, [dispatch, setLoadError]);

  // Save on change (debounced)
  useEffect(() => {
    const saveState = async () => {
      try {
        setSaveStatus('saving');
        await window.storage.set(STORAGE_KEY, JSON.stringify(state));
        setSaveStatus('saved');
      } catch (e) {
        console.error('Failed to save state:', e);
        setSaveStatus('error');
      }
    };

    const timeout = setTimeout(saveState, 500);
    return () => clearTimeout(timeout);
  }, [state, setSaveStatus]);
}
