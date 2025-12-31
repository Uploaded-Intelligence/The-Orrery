// ═══════════════════════════════════════════════════════════════
// components/tasks/TaskNode.jsx
// Task node for Micro View DAG - Enhanced with contextual actions
// Actions appear AT the node - game-style, not productivity toolbar
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';
import { Circle, CheckCircle2, Lock, Play, Trash2, Edit3, RotateCcw, Save, X } from 'lucide-react';
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
 * ActionButton - Small circular button that appears near the task
 * Touch-friendly with large hit area
 */
function ActionButton({ x, y, icon: Icon, color, bgColor, onClick, title, delay = 0 }) {
  const handleInteraction = (e) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={handleInteraction}
      onTouchEnd={handleInteraction}
      style={{ cursor: 'pointer', touchAction: 'none' }}
    >
      {/* Background circle */}
      <circle
        cx="0"
        cy="0"
        r="16"
        fill={bgColor || COLORS.bgPanel}
        stroke={color}
        strokeWidth="2"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      >
        {/* Pop-in animation */}
        <animate
          attributeName="r"
          from="0"
          to="16"
          dur="0.15s"
          begin={`${delay}s`}
          fill="freeze"
        />
      </circle>
      {/* Icon */}
      <foreignObject x="-10" y="-10" width="20" height="20">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}>
          <Icon size={14} color={color} />
        </div>
      </foreignObject>
      <title>{title}</title>
    </g>
  );
}

/**
 * @param {Object} props
 * @param {import('@/types').Task} props.task
 * @param {string} props.computedStatus - Status after dependency check
 * @param {{ x: number, y: number }} props.position
 * @param {boolean} props.isSelected
 * @param {Function} props.onClick
 * @param {Function} props.onDoubleClick
 * @param {Function} props.onDragStart - Called on mouse down to start node dragging
 * @param {Function} props.onConnectorDragStart - Called on connector mouse down to start edge creation
 * @param {Function} props.onTouchStart - Called on touch start for mobile node dragging
 * @param {Function} props.onConnectorTouchStart - Called on connector touch start for mobile edge creation
 * @param {boolean} props.isEdgeSource - Currently selected as edge source
 * @param {boolean} props.isGhosted - Dimmed for quest focus overlay
 * @param {boolean} props.isDragging - Currently being dragged
 * @param {boolean} props.isCreatingEdge - Edge creation in progress (show drop zone)
 * @param {Array<{ id: string, title: string, color: string }>} props.quests - Quest info for badges
 * @param {Function} props.onStartSession - Start a session for this task
 * @param {Function} props.onComplete - Mark task complete
 * @param {Function} props.onReopen - Reopen completed task
 * @param {Function} props.onDelete - Delete the task
 * @param {Function} props.onUpdate - Update task (title, minutes)
 */
export function TaskNode({
  task,
  computedStatus,
  position,
  isSelected,
  onClick,
  onDoubleClick,
  onDragStart,
  onConnectorDragStart,
  onTouchStart,
  onConnectorTouchStart,
  isEdgeSource = false,
  isGhosted = false,
  isDragging = false,
  isCreatingEdge = false,
  quests = [],
  onStartSession,
  onComplete,
  onReopen,
  onDelete,
  onUpdate,
}) {
  const style = getStatusStyle(computedStatus);
  const Icon = style.icon;

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editMinutes, setEditMinutes] = useState(task.estimatedMinutes || 25);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);

  // Reset edit state when selection changes
  useEffect(() => {
    if (!isSelected) {
      setIsEditing(false);
      setEditTitle(task.title);
      setEditMinutes(task.estimatedMinutes || 25);
    }
  }, [isSelected, task.title, task.estimatedMinutes]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Apply ghosting (for quest focus overlay)
  const ghostMultiplier = isGhosted ? 0.35 : 1;
  const effectiveOpacity = style.opacity * ghostMultiplier;

  // Get quest badges for this task (max 3 visible)
  const taskQuests = quests.filter(q => task.questIds.includes(q.id)).slice(0, 3);
  const primaryQuest = taskQuests[0];
  const hasMoreQuests = task.questIds.length > 3;

  // Determine cursor based on state
  const getCursor = () => {
    if (isDragging) return 'grabbing';
    if (computedStatus === 'locked' || isGhosted) return 'not-allowed';
    return 'grab';
  };

  // Calculate progress percentage for fill effect
  const getProgressPercent = () => {
    if (computedStatus === 'completed') return 100;
    if (!task.estimatedMinutes) return 0;
    const actual = task.actualMinutes || 0;
    return Math.min(100, (actual / task.estimatedMinutes) * 100);
  };
  const progressPercent = getProgressPercent();

  // Get progress fill color
  const getProgressColor = () => {
    if (computedStatus === 'completed') return COLORS.statusComplete;
    if (computedStatus === 'in_progress') return COLORS.statusActive;
    if (progressPercent > 0) return COLORS.accentPrimary;
    return 'transparent';
  };

  // Handle save from edit mode
  const handleSave = () => {
    onUpdate?.({
      title: editTitle,
      estimatedMinutes: parseInt(editMinutes) || 25,
    });
    setIsEditing(false);
  };

  // Handle key events in edit mode
  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(task.title);
      setEditMinutes(task.estimatedMinutes || 25);
    }
  };

  // Action buttons position - appear to the right of the node
  const actionX = LAYOUT.NODE_WIDTH + 24;
  const actionStartY = LAYOUT.NODE_HEIGHT / 2;

  // Build list of available actions based on status
  const actions = [];

  if (computedStatus === 'available' && onStartSession) {
    actions.push({
      icon: Play,
      color: COLORS.accentPrimary,
      bgColor: COLORS.bgElevated,
      onClick: onStartSession,
      title: 'Start session',
    });
  }

  if (computedStatus === 'in_progress' && onComplete) {
    actions.push({
      icon: CheckCircle2,
      color: COLORS.accentSuccess,
      bgColor: COLORS.bgElevated,
      onClick: onComplete,
      title: 'Mark done',
    });
  }

  if (computedStatus === 'completed' && onReopen) {
    actions.push({
      icon: RotateCcw,
      color: COLORS.accentWarning,
      bgColor: COLORS.bgElevated,
      onClick: onReopen,
      title: 'Reopen',
    });
  }

  // Edit is always available (except when locked)
  if (computedStatus !== 'locked') {
    actions.push({
      icon: Edit3,
      color: COLORS.textSecondary,
      bgColor: COLORS.bgElevated,
      onClick: () => setIsEditing(true),
      title: 'Edit',
    });
  }

  // Delete is always available
  if (onDelete) {
    actions.push({
      icon: Trash2,
      color: COLORS.accentDanger,
      bgColor: COLORS.bgPanel,
      onClick: onDelete,
      title: 'Delete',
    });
  }

  // Handle double-click - open edit mode (game-style: direct manipulation)
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (computedStatus !== 'locked' && !isGhosted) {
      setIsEditing(true);
    }
  };

  // Show actions on hover OR selection
  const showActions = (isSelected || isHovered) && !isEditing && !isDragging && !isGhosted;

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={onDragStart}
      onTouchStart={onTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: getCursor(), touchAction: 'none' }}
    >
      {/* Drop shadow when dragging */}
      {isDragging && (
        <rect
          x="4"
          y="4"
          width={LAYOUT.NODE_WIDTH}
          height={LAYOUT.NODE_HEIGHT}
          rx="8"
          ry="8"
          fill="rgba(0,0,0,0.3)"
          style={{ filter: 'blur(4px)' }}
        />
      )}

      {/* Pulsing glow ring for AVAILABLE tasks - "you can do this NOW" */}
      {computedStatus === 'available' && !isGhosted && (
        <rect
          x="-6"
          y="-6"
          width={LAYOUT.NODE_WIDTH + 12}
          height={LAYOUT.NODE_HEIGHT + 12}
          rx="14"
          ry="14"
          fill="none"
          stroke={COLORS.statusAvailable}
          strokeWidth="2"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.1;0.5;0.1"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-width"
            values="2;4;2"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </rect>
      )}

      {/* Breathing glow for IN_PROGRESS tasks - "this is alive" */}
      {computedStatus === 'in_progress' && !isGhosted && (
        <rect
          x="-4"
          y="-4"
          width={LAYOUT.NODE_WIDTH + 8}
          height={LAYOUT.NODE_HEIGHT + 8}
          rx="12"
          ry="12"
          fill="none"
          stroke={COLORS.statusActive}
          strokeWidth="3"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.3;0.8;0.3"
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>
      )}

      {/* Node background */}
      <rect
        x="0"
        y="0"
        width={LAYOUT.NODE_WIDTH}
        height={LAYOUT.NODE_HEIGHT}
        rx="8"
        ry="8"
        fill={style.bg}
        stroke={isDragging ? COLORS.accentPrimary : (isSelected || isEdgeSource ? COLORS.accentSecondary : style.border)}
        strokeWidth={isDragging ? 3 : (isSelected || isEdgeSource ? 3 : 2)}
        opacity={effectiveOpacity}
      >
        {/* Subtle brightness breathing for in_progress */}
        {computedStatus === 'in_progress' && !isGhosted && (
          <animate
            attributeName="fill-opacity"
            values="1;0.85;1"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </rect>

      {/* Progress fill - visual indicator of time spent vs estimated */}
      {progressPercent > 0 && (
        <g>
          {/* Clip path for rounded corners */}
          <defs>
            <clipPath id={`progress-clip-${task.id}`}>
              <rect x="0" y="0" width={LAYOUT.NODE_WIDTH} height={LAYOUT.NODE_HEIGHT} rx="8" ry="8" />
            </clipPath>
          </defs>
          {/* Progress fill bar at bottom */}
          <rect
            x="0"
            y={LAYOUT.NODE_HEIGHT - 4}
            width={(LAYOUT.NODE_WIDTH * progressPercent) / 100}
            height="4"
            fill={getProgressColor()}
            opacity={effectiveOpacity * 0.8}
            clipPath={`url(#progress-clip-${task.id})`}
          >
            {/* Animate width for in_progress */}
            {computedStatus === 'in_progress' && (
              <animate
                attributeName="opacity"
                values="0.6;0.9;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </rect>
        </g>
      )}

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

      {/* Right connector handle - drag to create outgoing edge */}
      <g
        onMouseDown={(e) => {
          e.stopPropagation();
          onConnectorDragStart?.(e);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          onConnectorTouchStart?.(e);
        }}
        style={{ cursor: 'crosshair', touchAction: 'none' }}
      >
        {/* Invisible hit area - LARGE for touch */}
        <circle
          cx={LAYOUT.NODE_WIDTH}
          cy={LAYOUT.NODE_HEIGHT / 2}
          r="24"
          fill="transparent"
        />
        {/* Visible connector dot - more visible when selected */}
        <circle
          cx={LAYOUT.NODE_WIDTH}
          cy={LAYOUT.NODE_HEIGHT / 2}
          r={isEdgeSource ? 10 : (isSelected ? 8 : 6)}
          fill={isEdgeSource ? COLORS.accentSecondary : (isSelected ? COLORS.accentPrimary : COLORS.textMuted)}
          stroke={COLORS.bgVoid}
          strokeWidth="2"
          opacity={isEdgeSource ? 1 : (isSelected ? 0.9 : 0.5)}
          style={{ transition: 'all 0.15s ease-out' }}
          className="connector-handle"
        />
        {/* "Link from here" hint when selected */}
        {isSelected && !isEdgeSource && (
          <text
            x={LAYOUT.NODE_WIDTH + 16}
            y={LAYOUT.NODE_HEIGHT / 2 + 4}
            fill={COLORS.accentPrimary}
            fontSize="10"
            opacity="0.7"
          >
            →
          </text>
        )}
        {/* Pulse animation when active */}
        {isEdgeSource && (
          <circle
            cx={LAYOUT.NODE_WIDTH}
            cy={LAYOUT.NODE_HEIGHT / 2}
            r="16"
            fill="none"
            stroke={COLORS.accentSecondary}
            strokeWidth="2"
            opacity="0.5"
          >
            <animate
              attributeName="r"
              values="10;18;10"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.2;0.6"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </g>

      {/* Drop zone indicator when edge creation in progress */}
      {isCreatingEdge && !isEdgeSource && (
        <rect
          x="-4"
          y="-4"
          width={LAYOUT.NODE_WIDTH + 8}
          height={LAYOUT.NODE_HEIGHT + 8}
          rx="12"
          ry="12"
          fill="none"
          stroke={COLORS.accentSecondary}
          strokeWidth="2"
          strokeDasharray="6 3"
          opacity="0.6"
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

      {/* ═══════════════════════════════════════════════════════════════
          CONTEXTUAL ACTIONS - Appear on hover or selection (game-style!)
          Actions bloom from the node, not a distant toolbar
          ═══════════════════════════════════════════════════════════════ */}
      {showActions && (
        <g style={{ opacity: isSelected ? 1 : 0.9 }}>
          {/* Action buttons - vertical stack to the right */}
          {actions.map((action, i) => (
            <ActionButton
              key={i}
              x={actionX}
              y={actionStartY + (i - (actions.length - 1) / 2) * 38}
              icon={action.icon}
              color={action.color}
              bgColor={action.bgColor}
              onClick={action.onClick}
              title={action.title}
              delay={i * 0.03}
            />
          ))}

          {/* Connecting line from node to actions */}
          <line
            x1={LAYOUT.NODE_WIDTH + 4}
            y1={LAYOUT.NODE_HEIGHT / 2}
            x2={actionX - 18}
            y2={LAYOUT.NODE_HEIGHT / 2}
            stroke={COLORS.accentSecondary}
            strokeWidth="2"
            strokeOpacity={isSelected ? 0.3 : 0.2}
            strokeDasharray="4 2"
          />
        </g>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          EDIT PANEL - Appears attached to the node when editing
          ═══════════════════════════════════════════════════════════════ */}
      {isSelected && isEditing && (
        <foreignObject
          x={LAYOUT.NODE_WIDTH + 12}
          y="-10"
          width="220"
          height={LAYOUT.NODE_HEIGHT + 20}
        >
          <div style={{
            background: COLORS.bgPanel,
            border: `2px solid ${COLORS.accentPrimary}`,
            borderRadius: '10px',
            padding: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            {/* Title input */}
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              placeholder="Task title"
              style={{
                width: '100%',
                padding: '8px 10px',
                marginBottom: '8px',
                background: COLORS.bgElevated,
                border: `1px solid ${COLORS.textMuted}40`,
                borderRadius: '6px',
                color: COLORS.textPrimary,
                fontSize: '16px', // Larger for touch
                fontWeight: 500,
                boxSizing: 'border-box',
              }}
            />

            {/* Time + buttons row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                value={editMinutes}
                onChange={(e) => setEditMinutes(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                style={{
                  width: '55px',
                  padding: '6px 8px',
                  background: COLORS.bgElevated,
                  border: `1px solid ${COLORS.textMuted}40`,
                  borderRadius: '4px',
                  color: COLORS.textSecondary,
                  fontSize: '14px',
                  textAlign: 'center',
                }}
              />
              <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>min</span>

              <div style={{ flex: 1 }} />

              {/* Cancel */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                  setEditTitle(task.title);
                  setEditMinutes(task.estimatedMinutes || 25);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                style={{
                  padding: '8px',
                  background: COLORS.bgElevated,
                  border: 'none',
                  borderRadius: '4px',
                  color: COLORS.textMuted,
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>

              {/* Save */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                style={{
                  padding: '8px 14px',
                  background: COLORS.accentSuccess,
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Save size={14} />
                Save
              </button>
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  );
}

export default TaskNode;
