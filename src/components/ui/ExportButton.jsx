// src/components/ui/ExportButton.jsx
import { stateToExportJson, downloadJson } from '@/utils/exportState';

export function ExportButton({ state }) {
  const handleExport = () => {
    const json = stateToExportJson(state);
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadJson(json, `orrery-export-${timestamp}.json`);
  };

  return (
    <button
      onClick={handleExport}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        background: '#4a5568',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      Export State
    </button>
  );
}
