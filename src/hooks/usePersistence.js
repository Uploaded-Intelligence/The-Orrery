// ═══════════════════════════════════════════════════════════════
// hooks/usePersistence.js
// Persistence hook for window.storage sync
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import { STORAGE_KEY } from '@/constants';

/**
 * Handle persistence to window.storage
 * @param {import('@/types').OrreryState} state
 * @param {Function} dispatch
 * @param {Function} setLoadError
 * @param {Function} setSaveStatus
 */
export function usePersistence(state, dispatch, setLoadError, setSaveStatus) {
  // Guard to prevent saving before initial load completes
  const hasLoaded = useRef(false);

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
      } finally {
        // Mark as loaded even if load fails (to allow saves after)
        hasLoaded.current = true;
      }
    };
    loadState();
  }, [dispatch, setLoadError]);

  // Save on change (debounced)
  useEffect(() => {
    // Don't save until initial load completes
    if (!hasLoaded.current) {
      return;
    }

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
