// ═══════════════════════════════════════════════════════════════
// components/tasks/TaskNode.jsx
// Task node for Micro View DAG - ADHD-Optimized Mythopoetic Design
//
// Design principles:
// - TIME IS HERO: Large, prominent time display (fights time blindness)
// - VISUAL CLARITY: Clear hierarchy, not corporate blandness
// - MYTHOPOETIC: Feels like a cosmic artifact, not a Jira card
// - DIRECT MANIPULATION: Double-click to edit in place
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';
import { Circle, CheckCircle2, Lock, Play, Trash2, RotateCcw, Clock } from 'lucide-react';
import { COLORS } from '@/constants';
import { LAYOUT } from '@/utils';

/**
 * Get visual style based on task status
 */
function getStatusStyle(status) {
  switch (status) {
    case 'locked':
      return {
        bg: 'rgba(30, 30, 40, 0.8)',
        border: COLORS.statusLocked,
        text: COLORS.textMuted,
        glow: 'none',
        opacity: 0.5,
        icon: Lock,
      };
    case 'available':
      return {
        bg: 'rgba(40, 45, 60, 0.95)',
        border: COLORS.statusAvailable,
        text: COLORS.textPrimary,
        glow: `0 0 20px ${COLORS.statusAvailable}40`,
        opacity: 1,
        icon: Circle,
      };
    case 'in_progress':
      return {
        bg: 'rgba(50, 45, 70, 0.95)',
        border: COLORS.statusActive,
        text: COLORS.textPrimary,
        glow: `0 0 25px ${COLORS.statusActive}50`,
        opacity: 1,
        icon: Play,
      };
    case 'completed':
      return {
        bg: 'rgba(35, 45, 40, 0.85)',
        border: COLORS.statusComplete,
        text: COLORS.textSecondary,
        glow: `0 0 15px ${COLORS.statusComplete}30`,
        opacity: 0.75,
        icon: CheckCircle2,
      };
    default:
      return {
        bg: 'rgba(30, 30, 40, 0.7)',
        border: COLORS.textMuted,
        text: COLORS.textSecondary,
        glow: 'none',
        opacity: 0.5,
        icon: Circle,
      };
  }
}

/**
 * Format time for display - ADHD friendly (clear, scannable)
 */
function formatTime(minutes) {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * ActionButton - Contextual action that appears on hover/select
 */
function ActionButton({ x, y, icon: Icon, color, bgColor, onClick, title, delay = 0 }) {
  const handleInteraction = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClick?.();
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={handleInteraction}
      onTouchEnd={handleInteraction}
      style={{ cursor: 'pointer', touchAction: 'none' }}
    >
      <circle
        cx="0"
        cy="0"
        r="16"
        fill={bgColor || COLORS.bgPanel}
        stroke={color}
        strokeWidth="2"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
      >
        <animate attributeName="r" from="0" to="16" dur="0.15s" begin={`${delay}s`} fill="freeze" />
      </circle>
      <foreignObject x="-10" y="-10" width="20" height="20">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Icon size={14} color={color} />
        </div>
      </foreignObject>
      <title>{title}</title>
    </g>
  );
}

/**
 * TaskNode - ADHD-optimized task display
 *
 * Layout:
 * ┌─────────────────────────────────┐
 * │ ⬤ Task Title Here          25m │  ← Time is BIG and prominent
 * │   Quest Badge                   │
 * └─────────────────────────────────┘
 */
export function TaskNode({
  task,
  computedStatus,
  position,
  isSelected,
  onClick,
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

  // Inline edit state
  const [editingField, setEditingField] = useState(null);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editMinutes, setEditMinutes] = useState(task.estimatedMinutes || 25);
  const [isHovered, setIsHovered] = useState(false);
  const titleInputRef = useRef(null);
  const minutesInputRef = useRef(null);

  // Reset edit values when task changes
  useEffect(() => {
    if (!editingField) {
      setEditTitle(task.title);
      setEditMinutes(task.estimatedMinutes || 25);
    }
  }, [task.title, task.estimatedMinutes, editingField]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingField === 'title' && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    } else if (editingField === 'minutes' && minutesInputRef.current) {
      minutesInputRef.current.focus();
      minutesInputRef.current.select();
    }
  }, [editingField]);

  // Ghosting for quest focus
  const ghostMultiplier = isGhosted ? 0.3 : 1;
  const effectiveOpacity = style.opacity * ghostMultiplier;

  // Quest info
  const taskQuests = quests.filter(q => task.questIds.includes(q.id)).slice(0, 2);
  const primaryQuest = taskQuests[0];

  // Cursor
  const getCursor = () => {
    if (isDragging) return 'grabbing';
    if (computedStatus === 'locked' || isGhosted) return 'not-allowed';
    return 'grab';
  };

  // Progress
  const getProgressPercent = () => {
    if (computedStatus === 'completed') return 100;
    if (!task.estimatedMinutes) return 0;
    return Math.min(100, ((task.actualMinutes || 0) / task.estimatedMinutes) * 100);
  };
  const progressPercent = getProgressPercent();

  // Save edit
  const handleSave = () => {
    onUpdate?.({
      title: editTitle,
      estimatedMinutes: parseInt(editMinutes) || 25,
    });
    setEditingField(null);
  };

  // Keyboard handling
  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') {
      setEditingField(null);
      setEditTitle(task.title);
      setEditMinutes(task.estimatedMinutes || 25);
    } else if (e.key === 'Tab' && !e.shiftKey && editingField === 'title') {
      e.preventDefault();
      setEditingField('minutes');
    } else if (e.key === 'Tab' && e.shiftKey && editingField === 'minutes') {
      e.preventDefault();
      setEditingField('title');
    }
  };

  // Blur handling
  const handleBlur = (e) => {
    if (e.relatedTarget === titleInputRef.current || e.relatedTarget === minutesInputRef.current) return;
    handleSave();
  };

  // Actions
  const actionX = LAYOUT.NODE_WIDTH + 24;
  const actionY = LAYOUT.NODE_HEIGHT / 2;
  const actions = [];

  if (computedStatus === 'available' && onStartSession) {
    actions.push({ icon: Play, color: COLORS.accentPrimary, onClick: onStartSession, title: 'Start' });
  }
  if (computedStatus === 'in_progress' && onComplete) {
    actions.push({ icon: CheckCircle2, color: COLORS.accentSuccess, onClick: onComplete, title: 'Done' });
  }
  if (computedStatus === 'completed' && onReopen) {
    actions.push({ icon: RotateCcw, color: COLORS.accentWarning, onClick: onReopen, title: 'Reopen' });
  }
  if (onDelete) {
    actions.push({ icon: Trash2, color: COLORS.accentDanger, onClick: onDelete, title: 'Delete' });
  }

  const showActions = (isSelected || isHovered) && !editingField && !isDragging && !isGhosted;

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={onClick}
      onMouseDown={onDragStart}
      onTouchStart={onTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: getCursor(), touchAction: 'none' }}
    >
      {/* ═══ GLOW EFFECTS ═══ */}

      {/* Ambient glow for available tasks - "you can do this NOW" */}
      {computedStatus === 'available' && !isGhosted && (
        <rect
          x="-8"
          y="-8"
          width={LAYOUT.NODE_WIDTH + 16}
          height={LAYOUT.NODE_HEIGHT + 16}
          rx="16"
          fill="none"
          stroke={COLORS.statusAvailable}
          strokeWidth="3"
          opacity="0.4"
        >
          <animate attributeName="stroke-opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Active pulse for in-progress - "this is alive" */}
      {computedStatus === 'in_progress' && !isGhosted && (
        <rect
          x="-6"
          y="-6"
          width={LAYOUT.NODE_WIDTH + 12}
          height={LAYOUT.NODE_HEIGHT + 12}
          rx="14"
          fill="none"
          stroke={COLORS.statusActive}
          strokeWidth="3"
        >
          <animate attributeName="stroke-opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Drop shadow when dragging */}
      {isDragging && (
        <rect
          x="6"
          y="6"
          width={LAYOUT.NODE_WIDTH}
          height={LAYOUT.NODE_HEIGHT}
          rx="12"
          fill="rgba(0,0,0,0.4)"
          style={{ filter: 'blur(6px)' }}
        />
      )}

      {/* ═══ MAIN NODE BODY ═══ */}
      <rect
        x="0"
        y="0"
        width={LAYOUT.NODE_WIDTH}
        height={LAYOUT.NODE_HEIGHT}
        rx="12"
        fill={style.bg}
        stroke={isDragging ? COLORS.accentPrimary : (isSelected ? COLORS.accentSecondary : style.border)}
        strokeWidth={isSelected || isDragging ? 3 : 2}
        opacity={effectiveOpacity}
        style={{ filter: style.glow !== 'none' ? `drop-shadow(${style.glow})` : 'none' }}
      />

      {/* Progress bar at bottom */}
      {progressPercent > 0 && (
        <rect
          x="4"
          y={LAYOUT.NODE_HEIGHT - 6}
          width={Math.max(0, (LAYOUT.NODE_WIDTH - 8) * progressPercent / 100)}
          height="3"
          rx="1.5"
          fill={computedStatus === 'completed' ? COLORS.statusComplete : COLORS.statusActive}
          opacity={effectiveOpacity * 0.9}
        />
      )}

      {/* Quest color stripe */}
      {primaryQuest && (
        <rect
          x="0"
          y="0"
          width="5"
          height={LAYOUT.NODE_HEIGHT}
          rx="2"
          fill={primaryQuest.color}
          opacity={effectiveOpacity}
        />
      )}

      {/* ═══ STATUS ICON ═══ */}
      <foreignObject x="12" y="14" width="22" height="22">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={style.border} style={{ opacity: effectiveOpacity }} />
        </div>
      </foreignObject>

      {/* ═══ TITLE (editable) ═══ */}
      {editingField === 'title' ? (
        <foreignObject x="38" y="12" width={LAYOUT.NODE_WIDTH - 90} height="26">
          <input
            ref={titleInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              height: '100%',
              padding: '4px 8px',
              background: COLORS.bgElevated,
              border: `2px solid ${COLORS.accentPrimary}`,
              borderRadius: '6px',
              color: COLORS.textPrimary,
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </foreignObject>
      ) : (
        <text
          x="40"
          y="30"
          fill={style.text}
          fontSize="14"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          opacity={effectiveOpacity}
          style={{ cursor: computedStatus !== 'locked' && !isGhosted ? 'text' : 'inherit' }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (computedStatus !== 'locked' && !isGhosted) setEditingField('title');
          }}
        >
          {task.title.length > 18 ? task.title.slice(0, 16) + '…' : task.title}
        </text>
      )}

      {/* ═══ TIME DISPLAY - THE HERO ═══ */}
      {/* Time is BIG and PROMINENT - fights ADHD time blindness */}
      {editingField === 'minutes' ? (
        <foreignObject x={LAYOUT.NODE_WIDTH - 58} y="8" width="50" height="28">
          <input
            ref={minutesInputRef}
            type="number"
            value={editMinutes}
            onChange={(e) => setEditMinutes(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              height: '100%',
              padding: '4px',
              background: COLORS.bgElevated,
              border: `2px solid ${COLORS.accentPrimary}`,
              borderRadius: '6px',
              color: COLORS.accentPrimary,
              fontSize: '16px',
              fontWeight: 800,
              textAlign: 'center',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </foreignObject>
      ) : (
        <g
          style={{ cursor: computedStatus !== 'locked' && !isGhosted ? 'text' : 'inherit' }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (computedStatus !== 'locked' && !isGhosted) setEditingField('minutes');
          }}
        >
          {/* Time background pill */}
          <rect
            x={LAYOUT.NODE_WIDTH - 56}
            y="10"
            width="48"
            height="24"
            rx="12"
            fill={computedStatus === 'in_progress' ? COLORS.statusActive : COLORS.accentPrimary}
            fillOpacity={effectiveOpacity * 0.2}
            stroke={computedStatus === 'in_progress' ? COLORS.statusActive : COLORS.accentPrimary}
            strokeWidth="1.5"
            strokeOpacity={effectiveOpacity * 0.5}
          />
          {/* Time text - LARGE and BOLD */}
          <text
            x={LAYOUT.NODE_WIDTH - 32}
            y="28"
            fill={computedStatus === 'in_progress' ? COLORS.statusActive : COLORS.accentPrimary}
            fontSize="15"
            fontWeight="800"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            opacity={effectiveOpacity}
          >
            {formatTime(task.estimatedMinutes)}
          </text>
        </g>
      )}

      {/* ═══ QUEST BADGES ═══ */}
      <g transform={`translate(12, ${LAYOUT.NODE_HEIGHT - 26})`}>
        {taskQuests.map((quest, i) => (
          <g key={quest.id} transform={`translate(${i * 58}, 0)`}>
            <rect
              x="0"
              y="0"
              width="54"
              height="18"
              rx="9"
              fill={quest.color}
              fillOpacity={effectiveOpacity * 0.2}
              stroke={quest.color}
              strokeWidth="1"
              strokeOpacity={effectiveOpacity * 0.6}
            />
            <text
              x="27"
              y="13"
              fill={quest.color}
              fontSize="10"
              fontWeight="600"
              textAnchor="middle"
              opacity={effectiveOpacity}
              style={{ pointerEvents: 'none' }}
            >
              {quest.title.length > 7 ? quest.title.slice(0, 6) + '…' : quest.title}
            </text>
          </g>
        ))}
        {taskQuests.length === 0 && (
          <text
            x="0"
            y="13"
            fill={COLORS.textMuted}
            fontSize="10"
            fontStyle="italic"
            opacity={effectiveOpacity * 0.4}
          >
            No quest
          </text>
        )}
      </g>

      {/* ═══ ACTUAL TIME (if tracked) ═══ */}
      {task.actualMinutes > 0 && (
        <g>
          <foreignObject x={LAYOUT.NODE_WIDTH - 56} y="36" width="48" height="16">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              opacity: effectiveOpacity * 0.7,
            }}>
              <Clock size={10} color={COLORS.textMuted} />
              <span style={{
                color: COLORS.textMuted,
                fontSize: '10px',
                fontWeight: 500,
              }}>
                {formatTime(task.actualMinutes)}
              </span>
            </div>
          </foreignObject>
        </g>
      )}

      {/* ═══ CONNECTOR HANDLE ═══ */}
      <g
        onMouseDown={(e) => { e.stopPropagation(); onConnectorDragStart?.(e); }}
        onTouchStart={(e) => { e.stopPropagation(); onConnectorTouchStart?.(e); }}
        style={{ cursor: 'crosshair', touchAction: 'none' }}
      >
        <circle cx={LAYOUT.NODE_WIDTH} cy={LAYOUT.NODE_HEIGHT / 2} r="20" fill="transparent" />
        <circle
          cx={LAYOUT.NODE_WIDTH}
          cy={LAYOUT.NODE_HEIGHT / 2}
          r={isEdgeSource ? 10 : (isSelected ? 8 : 6)}
          fill={isEdgeSource ? COLORS.accentSecondary : (isSelected ? COLORS.accentPrimary : COLORS.textMuted)}
          stroke={COLORS.bgVoid}
          strokeWidth="2"
          opacity={isEdgeSource ? 1 : (isSelected ? 0.9 : 0.4)}
          style={{ transition: 'all 0.15s ease-out' }}
        />
        {isEdgeSource && (
          <circle cx={LAYOUT.NODE_WIDTH} cy={LAYOUT.NODE_HEIGHT / 2} r="14" fill="none" stroke={COLORS.accentSecondary} strokeWidth="2" opacity="0.4">
            <animate attributeName="r" values="10;16;10" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}
      </g>

      {/* Drop zone when creating edge */}
      {isCreatingEdge && !isEdgeSource && (
        <rect
          x="-4"
          y="-4"
          width={LAYOUT.NODE_WIDTH + 8}
          height={LAYOUT.NODE_HEIGHT + 8}
          rx="16"
          fill="none"
          stroke={COLORS.accentSecondary}
          strokeWidth="2"
          strokeDasharray="6 3"
          opacity="0.5"
        />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <rect
          x="-3"
          y="-3"
          width={LAYOUT.NODE_WIDTH + 6}
          height={LAYOUT.NODE_HEIGHT + 6}
          rx="15"
          fill="none"
          stroke={COLORS.accentSecondary}
          strokeWidth="2"
          strokeOpacity="0.4"
        />
      )}

      {/* ═══ CONTEXTUAL ACTIONS ═══ */}
      {showActions && actions.length > 0 && (
        <g style={{ opacity: isSelected ? 1 : 0.85 }}>
          {actions.map((action, i) => (
            <ActionButton
              key={i}
              x={actionX}
              y={actionY + (i - (actions.length - 1) / 2) * 36}
              icon={action.icon}
              color={action.color}
              bgColor={COLORS.bgElevated}
              onClick={action.onClick}
              title={action.title}
              delay={i * 0.03}
            />
          ))}
          <line
            x1={LAYOUT.NODE_WIDTH + 4}
            y1={LAYOUT.NODE_HEIGHT / 2}
            x2={actionX - 18}
            y2={LAYOUT.NODE_HEIGHT / 2}
            stroke={COLORS.accentSecondary}
            strokeWidth="2"
            strokeOpacity="0.25"
            strokeDasharray="4 2"
          />
        </g>
      )}
    </g>
  );
}

export default TaskNode;
