// src/components/ui/APIStatus.jsx

import { COLORS } from '@/constants';
import { useOrrery } from '@/store';

/**
 * Connection status indicator for LifeRPG API
 * Shows green when connected, red when disconnected
 */
export function APIStatus() {
  const { api } = useOrrery();
  const isConnected = api?.isConnected ?? null;
  const isLoading = api?.isLoading ?? false;

  const color = isConnected === null || isLoading
    ? COLORS.textMuted
    : isConnected
      ? COLORS.accentSuccess
      : COLORS.accentDanger;

  const tooltip = isConnected === null
    ? 'Connecting...'
    : isConnected
      ? 'API Connected'
      : `API Disconnected${api?.error ? `\n\nError: ${api.error}` : ''}`;

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
      title={tooltip}
    >
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
      }} />
      API
    </div>
  );
}
