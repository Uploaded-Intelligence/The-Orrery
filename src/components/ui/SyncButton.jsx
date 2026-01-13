// src/components/ui/SyncButton.jsx
import { useState } from 'react';
import { manifestToState } from '@/utils/obsidianSync';

/**
 * Button to import state from Obsidian sync manifest
 * @param {{dispatch: Function}} props
 */
export function SyncButton({ dispatch }) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/sync/obsidian-manifest.json');
      if (!response.ok) {
        throw new Error(`No sync file found (${response.status})`);
      }

      const manifest = await response.json();
      const stateUpdate = manifestToState(manifest);

      dispatch({
        type: 'IMPORT_FROM_OBSIDIAN',
        payload: stateUpdate,
      });

    } catch (err) {
      setError(err.message);
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        background: syncing ? '#666' : '#4a5568',
        color: 'white',
        border: 'none',
        cursor: syncing ? 'wait' : 'pointer',
        fontSize: '14px',
      }}
      title={error || 'Import tasks from Obsidian'}
    >
      {syncing ? 'Syncing...' : error ? 'Retry Sync' : 'Sync from Obsidian'}
    </button>
  );
}
