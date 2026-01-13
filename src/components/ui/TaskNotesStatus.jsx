// src/components/ui/TaskNotesStatus.jsx

import { useState, useEffect } from 'react';
import { testConnection } from '@/services/tasknotes';
import { COLORS } from '@/constants';

/**
 * Connection status indicator for TaskNotes API
 * Shows green when connected, red when disconnected
 */
export function TaskNotesStatus() {
  const [status, setStatus] = useState({ connected: null, error: null });

  useEffect(() => {
    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    const result = await testConnection();
    setStatus(result);
  };

  const color = status.connected === null
    ? COLORS.textMuted
    : status.connected
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
      title={status.error || 'Connected to TaskNotes'}
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
