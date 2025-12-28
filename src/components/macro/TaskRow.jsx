// ═══════════════════════════════════════════════════════════════
// components/macro/TaskRow.jsx
// Task list row for Macro view
// ═══════════════════════════════════════════════════════════════

import { Clock, Edit3, Trash2 } from 'lucide-react';
import { COLORS } from '@/constants';
import { getComputedTaskStatus } from '@/utils';
import { useOrrery } from '@/store';
import { StatusBadge } from '@/components/common';

const STATUS_STYLES = {
  locked: { opacity: 0.5, borderColor: COLORS.statusLocked },
  available: { opacity: 1, borderColor: COLORS.statusAvailable },
  in_progress: { opacity: 1, borderColor: COLORS.statusActive },
  completed: { opacity: 0.7, borderColor: COLORS.statusComplete },
  blocked: { opacity: 0.8, borderColor: COLORS.accentWarning },
};

/**
 * @param {Object} props
 * @param {import('@/types').Task} props.task
 * @param {Function} props.onComplete - Called with task.id
 * @param {Function} props.onDelete - Called with task.id
 * @param {Function} props.onEdit - Called with task object
 */
export function TaskRow({ task, onComplete, onDelete, onEdit }) {
  const { state } = useOrrery();
  const status = getComputedTaskStatus(task, state);
  const quests = state.quests.filter(q => task.questIds.includes(q.id));
  const config = STATUS_STYLES[status] || STATUS_STYLES.available;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        background: COLORS.bgPanel,
        border: `1px solid ${config.borderColor}40`,
        opacity: config.opacity,
        transition: 'all 0.2s',
      }}
    >
      <StatusBadge status={status} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: COLORS.textPrimary,
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textDecoration: status === 'completed' ? 'line-through' : 'none',
        }}>
          {task.title}
        </div>
        {quests.length > 0 && (
          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            {quests.map(q => (
              <span
                key={q.id}
                style={{
                  padding: '0 0.375rem',
                  borderRadius: '0.25rem',
                  background: `${q.themeColor}30`,
                  color: q.themeColor,
                  fontSize: '0.625rem',
                  fontWeight: 500,
                }}
              >
                {q.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {task.estimatedMinutes && (
        <span style={{
          color: COLORS.textMuted,
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <Clock size={12} />
          {task.estimatedMinutes}m
        </span>
      )}

      {status === 'available' && (
        <button
          onClick={() => onComplete(task.id)}
          style={{
            background: COLORS.accentSuccess,
            border: 'none',
            borderRadius: '0.25rem',
            padding: '0.25rem 0.5rem',
            color: 'white',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      )}

      <button
        onClick={() => onEdit(task)}
        style={{
          background: 'transparent',
          border: 'none',
          color: COLORS.textMuted,
          cursor: 'pointer',
          padding: '0.25rem',
        }}
        title="Edit task"
      >
        <Edit3 size={14} />
      </button>

      <button
        onClick={() => onDelete(task.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: COLORS.textMuted,
          cursor: 'pointer',
          padding: '0.25rem',
        }}
        title="Delete task"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default TaskRow;
