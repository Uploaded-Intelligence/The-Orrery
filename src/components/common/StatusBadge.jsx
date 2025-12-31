// ═══════════════════════════════════════════════════════════════
// components/common/StatusBadge.jsx
// Visual status indicator for tasks
// ═══════════════════════════════════════════════════════════════

import { Lock, Target, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { COLORS } from '@/constants';

const STATUS_CONFIG = {
  locked: { icon: Lock, color: COLORS.statusLocked, label: 'Locked' },
  available: { icon: Target, color: COLORS.statusAvailable, label: 'Available' },
  in_progress: { icon: Play, color: COLORS.statusActive, label: 'In Progress' },
  completed: { icon: CheckCircle2, color: COLORS.statusComplete, label: 'Done' },
  blocked: { icon: AlertCircle, color: COLORS.accentWarning, label: 'Blocked' },
};

/**
 * @param {Object} props
 * @param {'locked' | 'available' | 'in_progress' | 'completed' | 'blocked'} props.status
 */
export function StatusBadge({ status }) {
  const { icon: Icon, color, label } = STATUS_CONFIG[status] || STATUS_CONFIG.available;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.125rem 0.5rem',
      borderRadius: '1rem',
      background: `${color}20`,
      color: color,
      fontSize: '0.625rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      <Icon size={10} />
      {label}
    </span>
  );
}

export default StatusBadge;
