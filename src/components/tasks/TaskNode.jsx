// ═══════════════════════════════════════════════════════════════
// components/tasks/TaskNode.jsx
// Task node for Micro View DAG - Enhanced with quest context
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
 * @param {boolean} props.isGhosted - Dimmed for quest focus overlay
 * @param {Array<{ id: string, title: string, color: string }>} props.quests - Quest info for badges
 */
export function TaskNode({
  task,
  computedStatus,
  position,
  isSelected,
  onClick,
  onDoubleClick,
  isEdgeSource = false,
  isGhosted = false,
  quests = [],
}) {
  const style = getStatusStyle(computedStatus);
  const Icon = style.icon;

  // Apply ghosting (for quest focus overlay)
  const ghostMultiplier = isGhosted ? 0.35 : 1;
  const effectiveOpacity = style.opacity * ghostMultiplier;

  // Get quest badges for this task (max 3 visible)
  const taskQuests = quests.filter(q => task.questIds.includes(q.id)).slice(0, 3);
  const primaryQuest = taskQuests[0];
  const hasMoreQuests = task.questIds.length > 3;

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{ cursor: computedStatus === 'locked' || isGhosted ? 'not-allowed' : 'pointer' }}
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
        opacity={effectiveOpacity}
      />

      {/* Left color stripe (primary quest) */}
      {primaryQuest && (
        <rect
          x="0"
          y="0"
          width="4"
          height={LAYOUT.NODE_HEIGHT}
          rx="2"
          fill={primaryQuest.color}
          opacity={effectiveOpacity}
        />
      )}

      {/* Status icon */}
      <foreignObject x="14" y="12" width="20" height="20">
        <Icon
          size={18}
          color={style.border}
          style={{ opacity: effectiveOpacity }}
        />
      </foreignObject>

      {/* Task title */}
      <text
        x="42"
        y="26"
        fill={style.text}
        fontSize="13"
        fontWeight="600"
        opacity={effectiveOpacity}
        style={{ pointerEvents: 'none' }}
      >
        {task.title.length > 22 ? task.title.slice(0, 20) + '...' : task.title}
      </text>

      {/* Estimated time */}
      <text
        x="42"
        y="44"
        fill={COLORS.textMuted}
        fontSize="11"
        opacity={effectiveOpacity * 0.8}
        style={{ pointerEvents: 'none' }}
      >
        {task.estimatedMinutes ? `${task.estimatedMinutes}m` : '—'}
        {task.actualMinutes && ` (${task.actualMinutes}m actual)`}
      </text>

      {/* Quest badges row */}
      <g transform={`translate(12, ${LAYOUT.NODE_HEIGHT - 22})`}>
        {taskQuests.map((quest, i) => (
          <g key={quest.id} transform={`translate(${i * 52}, 0)`}>
            {/* Badge background */}
            <rect
              x="0"
              y="0"
              width="48"
              height="16"
              rx="3"
              fill={quest.color}
              fillOpacity={effectiveOpacity * 0.25}
              stroke={quest.color}
              strokeWidth="1"
              strokeOpacity={effectiveOpacity * 0.5}
            />
            {/* Badge text */}
            <text
              x="24"
              y="11"
              fill={quest.color}
              fontSize="9"
              fontWeight="500"
              textAnchor="middle"
              opacity={effectiveOpacity}
              style={{ pointerEvents: 'none' }}
            >
              {quest.title.length > 6 ? quest.title.slice(0, 5) + '…' : quest.title}
            </text>
          </g>
        ))}
        {/* More quests indicator */}
        {hasMoreQuests && (
          <text
            x={taskQuests.length * 52 + 4}
            y="11"
            fill={COLORS.textMuted}
            fontSize="9"
            opacity={effectiveOpacity * 0.7}
            style={{ pointerEvents: 'none' }}
          >
            +{task.questIds.length - 3}
          </text>
        )}
        {/* No quest indicator */}
        {taskQuests.length === 0 && (
          <text
            x="0"
            y="11"
            fill={COLORS.textMuted}
            fontSize="9"
            fontStyle="italic"
            opacity={effectiveOpacity * 0.5}
            style={{ pointerEvents: 'none' }}
          >
            No quest
          </text>
        )}
      </g>

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

      {/* Selection glow */}
      {isSelected && (
        <rect
          x="-2"
          y="-2"
          width={LAYOUT.NODE_WIDTH + 4}
          height={LAYOUT.NODE_HEIGHT + 4}
          rx="10"
          ry="10"
          fill="none"
          stroke={COLORS.accentSecondary}
          strokeWidth="2"
          strokeOpacity="0.3"
        />
      )}
    </g>
  );
}

export default TaskNode;
