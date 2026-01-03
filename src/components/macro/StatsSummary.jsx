// ═══════════════════════════════════════════════════════════════
// components/macro/StatsSummary.jsx
// Dashboard statistics overview for Macro view
// ═══════════════════════════════════════════════════════════════

import { Orbit, Target, Zap, CheckCircle2 } from 'lucide-react';
import { COLORS } from '@/constants';
import { getComputedTaskStatus } from '@/utils';
import { useOrrery } from '@/store';

/**
 * StatsSummary - Shows key metrics: Quests, Tasks, Available, Completed
 */
export function StatsSummary() {
  const { state } = useOrrery();

  const totalQuests = state.quests.length;
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
  const availableTasks = state.tasks.filter(t => {
    const status = getComputedTaskStatus(t, state);
    return status === 'available' || status === 'in_progress';
  }).length;

  const stats = [
    { label: 'Quests', value: totalQuests, icon: Orbit, color: COLORS.accentPrimary },
    { label: 'Tasks', value: totalTasks, icon: Target, color: COLORS.accentSecondary },
    { label: 'Available', value: availableTasks, icon: Zap, color: COLORS.accentWarning },
    { label: 'Completed', value: completedTasks, icon: CheckCircle2, color: COLORS.accentSuccess },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
    }}>
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            background: COLORS.bgPanel,
            border: `1px solid ${color}30`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Icon size={14} style={{ color }} />
            <span style={{ color: COLORS.textMuted, fontSize: '0.75rem' }}>{label}</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: COLORS.textPrimary }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsSummary;
