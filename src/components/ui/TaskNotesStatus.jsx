// src/components/ui/TaskNotesStatus.jsx

import { COLORS } from '@/constants';
import { useOrrery } from '@/store';

/**
 * Connection status indicator for TaskNotes API
 * Shows green when connected, red when disconnected
 *
 * Uses shared api state from context to avoid duplicate polling
 * (useTaskNotesSync already polls every 30s)
 */
export function TaskNotesStatus() {
  const { api } = useOrrery();
  const isConnected = api?.isConnected ?? null;
  const isLoading = api?.isLoading ?? false;

  const color = isConnected === null || isLoading
    ? COLORS.textMuted
    : isConnected
      ? COLORS.accentSuccess
      : COLORS.accentDanger;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        borderRadius: '4px',
        background: `${color}20`,
        fontSize: '11px',
        color,
      }}
      title={isConnected ? 'Connected to TaskNotes' : 'Disconnected from TaskNotes'}
    >
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
      }} />
      TaskNotes
    </div>
  );
}
