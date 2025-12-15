// ═══════════════════════════════════════════════════════════════
// components/tasks/TaskNode.jsx
// Task node for Micro View DAG
// ═══════════════════════════════════════════════════════════════

import { Circle, CheckCircle2, Lock, Play } from 'lucide-react';
import { COLORS } from '@/constants';
import { LAYOUT } from '@/utils';

/**
 * Get visual style based on task status
 * @param {'locked' | 'available' | 'in_progress' | 'completed'} status
 */
function getStatusStyle(status) {
  switch (status) {
    case 'locked':
      return {
        bg: COLORS.bgPanel,
        border: COLORS.statusLocked,
        text: COLORS.textMuted,
        opacity: 0.6,
        icon: Lock,
      };
    case 'available':
      return {
        bg: COLORS.bgElevated,
        border: COLORS.statusAvailable,
        text: COLORS.textPrimary,
        opacity: 1,
        icon: Circle,
      };
    case 'in_progress':
      return {
        bg: COLORS.bgElevated,
        border: COLORS.statusActive,
        text: COLORS.textPrimary,
        opacity: 1,
        icon: Play,
      };
    case 'completed':
      return {
        bg: COLORS.bgPanel,
        border: COLORS.statusComplete,
        text: COLORS.textSecondary,
        opacity: 0.8,
        icon: CheckCircle2,
      };
    default:
      return {
        bg: COLORS.bgPanel,
        border: COLORS.textMuted,
        text: COLORS.textSecondary,
        opacity: 0.5,
        icon: Circle,
      };
  }
}

/**
 * @param {Object} props
 * @param {import('@/types').Task} props.task
 * @param {string} props.computedStatus - Status after dependency check
 * @param {{ x: number, y: number }} props.position
 * @param {boolean} props.isSelected
 * @param {Function} props.onClick
 * @param {Function} props.onDoubleClick
 * @param {boolean} props.isEdgeSource - Currently selected as edge source
 */
export function TaskNode({
  task,
  computedStatus,
  position,
  isSelected,
  onClick,
  onDoubleClick,
  isEdgeSource = false,
}) {
  const style = getStatusStyle(computedStatus);
  const Icon = style.icon;

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{ cursor: computedStatus === 'locked' ? 'not-allowed' : 'pointer' }}
    >
      {/* Node background */}
      <rect
        x="0"
        y="0"
        width={LAYOUT.NODE_WIDTH}
        height={LAYOUT.NODE_HEIGHT}
        rx="8"
        ry="8"
        fill={style.bg}
        stroke={isSelected || isEdgeSource ? COLORS.accentSecondary : style.border}
        strokeWidth={isSelected || isEdgeSource ? 3 : 2}
        opacity={style.opacity}
      />

      {/* Status icon */}
      <foreignObject x="12" y={(LAYOUT.NODE_HEIGHT - 20) / 2} width="20" height="20">
        <Icon
          size={18}
          color={style.border}
          style={{ opacity: style.opacity }}
        />
      </foreignObject>

      {/* Task title */}
      <text
        x="40"
        y={LAYOUT.NODE_HEIGHT / 2 - 4}
        fill={style.text}
        fontSize="13"
        fontWeight="500"
        opacity={style.opacity}
        style={{ pointerEvents: 'none' }}
      >
        {task.title.length > 18 ? task.title.slice(0, 16) + '...' : task.title}
      </text>

      {/* Estimated time */}
      {task.estimatedMinutes && (
        <text
          x="40"
          y={LAYOUT.NODE_HEIGHT / 2 + 14}
          fill={COLORS.textMuted}
          fontSize="11"
          opacity={style.opacity}
          style={{ pointerEvents: 'none' }}
        >
          {task.estimatedMinutes}m
        </text>
      )}

      {/* Edge source indicator */}
      {isEdgeSource && (
        <circle
          cx={LAYOUT.NODE_WIDTH}
          cy={LAYOUT.NODE_HEIGHT / 2}
          r="6"
          fill={COLORS.accentSecondary}
          stroke={COLORS.bgVoid}
          strokeWidth="2"
        />
      )}
    </g>
  );
}

export default TaskNode;
