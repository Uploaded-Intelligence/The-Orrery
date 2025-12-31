// ═══════════════════════════════════════════════════════════════
// components/macro/ImportExportControls.jsx
// Data export, import, and reset controls
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { COLORS } from '@/constants';
import { useOrrery } from '@/store';

/**
 * ImportExportControls - Export/Import JSON, Reset data
 */
export function ImportExportControls() {
  const { state, dispatch } = useOrrery();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orrery-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        dispatch({ type: 'LOAD_STATE', payload: data });
      } catch (err) {
        alert('Failed to import: ' + err.message);
      }
    };
    input.click();
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_STATE' });
    setShowConfirmReset(false);
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.625rem',
    borderRadius: '0.375rem',
    border: `1px solid ${COLORS.textMuted}40`,
    background: 'transparent',
    color: COLORS.textSecondary,
    fontSize: '0.75rem',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <button onClick={handleExport} style={buttonStyle} title="Export data">
        <Download size={12} />
        Export
      </button>
      <button onClick={handleImport} style={buttonStyle} title="Import data">
        <Upload size={12} />
        Import
      </button>

      {showConfirmReset ? (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={handleReset}
            style={{
              padding: '0.375rem 0.625rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: COLORS.accentDanger,
              color: 'white',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Confirm Reset
          </button>
          <button
            onClick={() => setShowConfirmReset(false)}
            style={buttonStyle}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirmReset(true)}
          style={{
            ...buttonStyle,
            border: `1px solid ${COLORS.accentDanger}40`,
            color: COLORS.accentDanger,
          }}
          title="Reset all data"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      )}
    </div>
  );
}

export default ImportExportControls;
