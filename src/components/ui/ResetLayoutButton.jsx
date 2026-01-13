// src/components/ui/ResetLayoutButton.jsx
import { RotateCcw, Undo2 } from 'lucide-react';
import { useOrrery } from '@/store';
import { COLORS } from '@/constants';

/**
 * Reset task layout to DAG-computed positions, with undo capability
 */
export function ResetLayoutButton() {
  const { state, dispatch } = useOrrery();
  const canUndo = !!state._previousTaskPositions;

  const handleReset = () => {
    dispatch({ type: 'RESET_LAYOUT' });
  };

  const handleUndo = () => {
    dispatch({ type: 'UNDO_LAYOUT' });
  };

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      <button
        onClick={handleReset}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          background: 'transparent',
          border: `1px solid ${COLORS.textMuted}40`,
          borderRadius: '4px',
          color: COLORS.textMuted,
          fontSize: '12px',
          cursor: 'pointer',
        }}
        title="Reset to auto-layout (DAG layers)"
      >
        <RotateCcw size={14} />
        Reset
      </button>
      {canUndo && (
        <button
          onClick={handleUndo}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            background: COLORS.accentWarning + '20',
            border: `1px solid ${COLORS.accentWarning}`,
            borderRadius: '4px',
            color: COLORS.accentWarning,
            fontSize: '12px',
            cursor: 'pointer',
          }}
          title="Undo reset"
        >
          <Undo2 size={14} />
          Undo
        </button>
      )}
    </div>
  );
}
