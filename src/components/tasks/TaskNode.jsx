// ═══════════════════════════════════════════════════════════════
// components/tasks/TaskNode.jsx
// Task node for Micro View - VISUAL ADHD Design
//
// Features:
// - TIME → Arc around node (fuller = longer task)
// - COGNITIVE LOAD → 5 orbs with drag-to-adjust slider UX
// - HIGH LOAD → Decompose button for Claude to break down
// - Locked tasks CAN be edited (name, time, difficulty)
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react';
import { Circle, CheckCircle2, Lock, Play, Trash2, RotateCcw, Sparkles } from 'lucide-react';
import { COLORS } from '@/constants';
import { LAYOUT } from '@/utils';

// Visual constants
const ORB_RADIUS = 5;        // Bigger orbs
const ORB_SPACING = 12;      // More spacing
const ORB_COUNT = 5;

// Hour ring constants - PROMINENT time visualization
const RING_BASE_RADIUS = 58;  // Just outside node
const RING_SPACING = 10;      // Space between rings
const RING_STROKE = 4;        // Visible stroke
const MINUTES_PER_RING = 60;  // 1 hour = 1 full ring

/**
 * Generate SVG arc path
 */
function describeArc(percentage, radius, cx, cy) {
  if (percentage <= 0) return '';
  if (percentage >= 1) {
    return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius}`;
  }
  const startAngle = -90;
  const endAngle = startAngle + (percentage * 360);
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const largeArcFlag = percentage > 0.5 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
}

/**
 * Get cognitive load visual properties (1-5 scale)
 */
function getCognitiveLoadStyle(load) {
  const styles = {
    1: { color: '#6EE7B7', glowIntensity: 0.15, borderWidth: 2, pulseSpeed: 0, arcWidth: 4 },
    2: { color: '#22D3EE', glowIntensity: 0.25, borderWidth: 2, pulseSpeed: 0, arcWidth: 5 },
    3: { color: '#FBBF24', glowIntensity: 0.4, borderWidth: 2.5, pulseSpeed: 0, arcWidth: 6 },
    4: { color: '#F97316', glowIntensity: 0.6, borderWidth: 3, pulseSpeed: 3, arcWidth: 7 },
    5: { color: '#EF4444', glowIntensity: 0.8, borderWidth: 3.5, pulseSpeed: 1.5, arcWidth: 8 },
  };
  return styles[load] || styles[3];
}

/**
 * Get status style
 */
function getStatusStyle(status) {
  switch (status) {
    case 'locked':
      return { bg: 'rgba(30, 30, 40, 0.7)', border: COLORS.statusLocked, icon: Lock, opacity: 0.6 };
    case 'available':
      return { bg: 'rgba(40, 45, 60, 0.95)', border: COLORS.statusAvailable, icon: Circle, opacity: 1 };
    case 'in_progress':
      return { bg: 'rgba(50, 45, 70, 0.95)', border: COLORS.statusActive, icon: Play, opacity: 1 };
    case 'completed':
      return { bg: 'rgba(35, 45, 40, 0.85)', border: COLORS.statusComplete, icon: CheckCircle2, opacity: 0.7 };
    default:
      return { bg: 'rgba(30, 30, 40, 0.7)', border: COLORS.textMuted, icon: Circle, opacity: 0.5 };
  }
}

/**
 * ActionButton - MUST stop mousedown to prevent drag interference
 */
function ActionButton({ x, y, icon: Icon, color, onClick, title, delay = 0, size = 16 }) {
  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClick?.();
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={handleClick}
      onTouchEnd={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <circle cx="0" cy="0" r={size} fill={COLORS.bgElevated} stroke={color} strokeWidth="2"
        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}>
        <animate attributeName="r" from="0" to={size} dur="0.12s" begin={`${delay}s`} fill="freeze" />
      </circle>
      <foreignObject x={-size * 0.625} y={-size * 0.625} width={size * 1.25} height={size * 1.25}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Icon size={size * 0.875} color={color} />
        </div>
      </foreignObject>
      <title>{title}</title>
    </g>
  );
}

/**
 * TaskNode - VISUAL ADHD-optimized design with 5-level cognitive load
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
  onDecompose,
}) {
  const statusStyle = getStatusStyle(computedStatus);
  const cognitiveStyle = getCognitiveLoadStyle(task.cognitiveLoad || 3);
  const StatusIcon = statusStyle.icon;

  // Edit state
  const [editingField, setEditingField] = useState(null);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editMinutes, setEditMinutes] = useState(task.estimatedMinutes || 25);
  const [isHovered, setIsHovered] = useState(false);
  const titleInputRef = useRef(null);

  // Orb slider drag state
  const [isDraggingOrbs, setIsDraggingOrbs] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartLoad, setDragStartLoad] = useState(3);
  const orbsRef = useRef(null);

  useEffect(() => {
    if (!editingField) {
      setEditTitle(task.title);
      setEditMinutes(task.estimatedMinutes || 25);
    }
  }, [task.title, task.estimatedMinutes, editingField]);

  useEffect(() => {
    if (editingField === 'title' && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingField]);

  // Visual calculations
  const ghostMult = isGhosted ? 0.3 : 1;
  const effectiveOpacity = statusStyle.opacity * ghostMult;

  // Hour rings calculation
  const totalMinutes = task.estimatedMinutes || 0;
  const fullHours = Math.floor(totalMinutes / MINUTES_PER_RING);
  const remainingMinutes = totalMinutes % MINUTES_PER_RING;
  const partialPercent = remainingMinutes / MINUTES_PER_RING;
  const centerX = LAYOUT.NODE_WIDTH / 2;
  const centerY = LAYOUT.NODE_HEIGHT / 2;

  // Quest info
  const primaryQuest = quests.find(q => task.questIds.includes(q.id));

  // High cognitive load warning (4 or 5)
  const isHighLoad = (task.cognitiveLoad || 3) >= 4;

  const getCursor = () => {
    if (isDragging) return 'grabbing';
    if (isGhosted) return 'not-allowed';
    return 'grab';
  };

  const handleSave = () => {
    onUpdate?.({
      title: editTitle,
      estimatedMinutes: parseInt(editMinutes) || 25,
    });
    setEditingField(null);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') {
      setEditingField(null);
      setEditTitle(task.title);
      setEditMinutes(task.estimatedMinutes || 25);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!editingField) return;
      handleSave();
    }, 150);
  };

  // ═══ ORB SLIDER DRAG HANDLERS ═══
  const handleOrbMouseDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingOrbs(true);
    setDragStartX(e.clientX);
    setDragStartLoad(task.cognitiveLoad || 3);
  }, [task.cognitiveLoad]);

  const handleOrbTouchStart = useCallback((e) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setIsDraggingOrbs(true);
    setDragStartX(touch.clientX);
    setDragStartLoad(task.cognitiveLoad || 3);
  }, [task.cognitiveLoad]);

  useEffect(() => {
    if (!isDraggingOrbs) return;

    const handleMove = (clientX) => {
      const deltaX = clientX - dragStartX;
      const orbsPerDelta = ORB_SPACING; // pixels per orb level
      const deltaLevels = Math.round(deltaX / orbsPerDelta);
      const newLoad = Math.max(1, Math.min(5, dragStartLoad + deltaLevels));
      if (newLoad !== (task.cognitiveLoad || 3)) {
        onUpdate?.({ cognitiveLoad: newLoad });
      }
    };

    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => handleMove(e.touches[0].clientX);

    const handleEnd = () => {
      setIsDraggingOrbs(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingOrbs, dragStartX, dragStartLoad, task.cognitiveLoad, onUpdate]);

  // Actions
  const actionX = LAYOUT.NODE_WIDTH + 28;
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

  // Calculate orb slider width
  const orbSliderWidth = (ORB_COUNT - 1) * ORB_SPACING + ORB_RADIUS * 2;

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
      {/* ═══════════════════════════════════════════════════════════════
          HOUR RINGS - Visual duration indicator (1 ring = 1 hour)
          Drawn OUTSIDE the node for maximum visibility
          ═══════════════════════════════════════════════════════════════ */}

      {/* ═══════════════════════════════════════════════════════════════
          COGNITIVE LOAD GLOW
          ═══════════════════════════════════════════════════════════════ */}
      {!isGhosted && (task.cognitiveLoad || 3) >= 3 && (
        <rect
          x="-4" y="-4"
          width={LAYOUT.NODE_WIDTH + 8}
          height={LAYOUT.NODE_HEIGHT + 8}
          rx="16"
          fill="none"
          stroke={cognitiveStyle.color}
          strokeWidth={cognitiveStyle.borderWidth}
          opacity={cognitiveStyle.glowIntensity}
          style={{ filter: `blur(${cognitiveStyle.glowIntensity * 4}px)` }}
        >
          {cognitiveStyle.pulseSpeed > 0 && (
            <animate
              attributeName="stroke-opacity"
              values={`${cognitiveStyle.glowIntensity * 0.5};${cognitiveStyle.glowIntensity};${cognitiveStyle.glowIntensity * 0.5}`}
              dur={`${cognitiveStyle.pulseSpeed}s`}
              repeatCount="indefinite"
            />
          )}
        </rect>
      )}

      {/* Status-specific glow */}
      {computedStatus === 'available' && !isGhosted && (
        <rect x="-6" y="-6" width={LAYOUT.NODE_WIDTH + 12} height={LAYOUT.NODE_HEIGHT + 12} rx="18" fill="none" stroke={COLORS.statusAvailable} strokeWidth="2" opacity="0.3">
          <animate attributeName="stroke-opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Drop shadow when dragging */}
      {isDragging && (
        <rect x="5" y="5" width={LAYOUT.NODE_WIDTH} height={LAYOUT.NODE_HEIGHT} rx="12" fill="rgba(0,0,0,0.4)" style={{ filter: 'blur(5px)' }} />
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MAIN NODE BODY
          ═══════════════════════════════════════════════════════════════ */}
      <rect
        x="0" y="0"
        width={LAYOUT.NODE_WIDTH}
        height={LAYOUT.NODE_HEIGHT}
        rx="12"
        fill={statusStyle.bg}
        stroke={isSelected ? COLORS.accentSecondary : statusStyle.border}
        strokeWidth={isSelected ? 3 : cognitiveStyle.borderWidth}
        opacity={effectiveOpacity}
      />

      {/* Quest stripe */}
      {primaryQuest && (
        <rect x="0" y="0" width="5" height={LAYOUT.NODE_HEIGHT} rx="2" fill={primaryQuest.color} opacity={effectiveOpacity} />
      )}

      {/* ═══════════════════════════════════════════════════════════════
          COGNITIVE LOAD ORBS - Drag left/right to adjust
          Bigger orbs with slider interaction
          ═══════════════════════════════════════════════════════════════ */}
      <g
        ref={orbsRef}
        transform={`translate(${LAYOUT.NODE_WIDTH - orbSliderWidth - 8}, 14)`}
        style={{ cursor: isDraggingOrbs ? 'ew-resize' : 'grab' }}
        onMouseDown={handleOrbMouseDown}
        onTouchStart={handleOrbTouchStart}
      >
        {/* Slider track background */}
        <rect
          x={-4}
          y={-ORB_RADIUS - 2}
          width={orbSliderWidth + 8}
          height={ORB_RADIUS * 2 + 4}
          rx={ORB_RADIUS + 2}
          fill={COLORS.bgPanel}
          fillOpacity={effectiveOpacity * 0.5}
        />
        {/* Orbs */}
        {[1, 2, 3, 4, 5].map((level) => {
          const isFilled = level <= (task.cognitiveLoad || 3);
          const levelStyle = getCognitiveLoadStyle(level);
          return (
            <circle
              key={level}
              cx={(level - 1) * ORB_SPACING}
              cy="0"
              r={ORB_RADIUS}
              fill={isFilled ? levelStyle.color : 'transparent'}
              stroke={levelStyle.color}
              strokeWidth="2"
              opacity={effectiveOpacity * (isFilled ? 1 : 0.3)}
              style={isFilled ? { filter: `drop-shadow(0 0 4px ${levelStyle.color})` } : {}}
            >
              {isFilled && cognitiveStyle.pulseSpeed > 0 && level === (task.cognitiveLoad || 3) && (
                <animate
                  attributeName="r"
                  values={`${ORB_RADIUS};${ORB_RADIUS + 1};${ORB_RADIUS}`}
                  dur={`${cognitiveStyle.pulseSpeed}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          );
        })}
        {/* Drag hint on hover */}
        {isHovered && !isDraggingOrbs && (
          <text
            x={orbSliderWidth / 2}
            y={ORB_RADIUS + 12}
            fill={COLORS.textMuted}
            fontSize="8"
            textAnchor="middle"
            opacity="0.6"
          >
            ← drag →
          </text>
        )}
      </g>

      {/* Status icon */}
      <foreignObject x="12" y="16" width="24" height="24">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StatusIcon size={20} color={statusStyle.border} style={{ opacity: effectiveOpacity }} />
        </div>
      </foreignObject>

      {/* ═══════════════════════════════════════════════════════════════
          TITLE - Can edit even when locked
          Uses foreignObject for proper text wrapping
          ═══════════════════════════════════════════════════════════════ */}
      {editingField === 'title' ? (
        <foreignObject x="40" y="12" width={LAYOUT.NODE_WIDTH - 100} height="32">
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
              width: '100%', height: '100%', padding: '4px 8px',
              background: COLORS.bgElevated, border: `2px solid ${COLORS.accentPrimary}`,
              borderRadius: '6px', color: COLORS.textPrimary,
              fontSize: '13px', fontWeight: 700, outline: 'none',
            }}
          />
        </foreignObject>
      ) : (
        <foreignObject x="38" y="12" width={LAYOUT.NODE_WIDTH - 100} height="32">
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              color: COLORS.textPrimary,
              fontSize: '13px',
              fontWeight: 700,
              opacity: effectiveOpacity,
              cursor: 'text',
              overflow: 'hidden',
              lineHeight: '1.2',
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingField('title');
            }}
            title={task.title} // Full title on hover
          >
            <span style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}>
              {task.title}
            </span>
          </div>
        </foreignObject>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TIME DISPLAY - Double-click to edit
          ═══════════════════════════════════════════════════════════════ */}
      <g
        transform={`translate(14, ${LAYOUT.NODE_HEIGHT - 22})`}
        style={{ cursor: 'pointer' }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditingField('time');
        }}
      >
        {editingField === 'time' ? (
          <foreignObject x="0" y="-12" width="60" height="24">
            <input
              type="number"
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              autoFocus
              style={{
                width: '50px', height: '100%', padding: '2px 4px',
                background: COLORS.bgElevated, border: `2px solid ${COLORS.accentPrimary}`,
                borderRadius: '4px', color: cognitiveStyle.color,
                fontSize: '14px', fontWeight: 700, textAlign: 'center', outline: 'none',
              }}
            />
          </foreignObject>
        ) : (
          <>
            <rect
              x="0" y="-10" width="50" height="20" rx="10"
              fill={cognitiveStyle.color} fillOpacity={effectiveOpacity * 0.15}
              stroke={cognitiveStyle.color} strokeWidth="1.5" strokeOpacity={effectiveOpacity * 0.4}
            />
            <text
              x="25" y="5"
              fill={cognitiveStyle.color}
              fontSize="13"
              fontWeight="800"
              textAnchor="middle"
              opacity={effectiveOpacity}
            >
              {task.estimatedMinutes ? `${task.estimatedMinutes}m` : '—'}
            </text>
          </>
        )}
      </g>

      {/* Quest badge */}
      {primaryQuest && (
        <g transform={`translate(70, ${LAYOUT.NODE_HEIGHT - 22})`}>
          <rect x="0" y="-10" width="60" height="20" rx="10" fill={primaryQuest.color} fillOpacity={effectiveOpacity * 0.2} stroke={primaryQuest.color} strokeWidth="1" strokeOpacity={effectiveOpacity * 0.5} />
          <text x="30" y="5" fill={primaryQuest.color} fontSize="10" fontWeight="600" textAnchor="middle" opacity={effectiveOpacity}>
            {primaryQuest.title.length > 8 ? primaryQuest.title.slice(0, 7) + '…' : primaryQuest.title}
          </text>
        </g>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          DECOMPOSE BUTTON - For high cognitive load (4-5)
          ═══════════════════════════════════════════════════════════════ */}
      {isHighLoad && showActions && onDecompose && (
        <g
          transform={`translate(${LAYOUT.NODE_WIDTH / 2}, ${LAYOUT.NODE_HEIGHT + 20})`}
          onClick={(e) => { e.stopPropagation(); onDecompose?.(task); }}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x="-55" y="-12" width="110" height="24" rx="12"
            fill={cognitiveStyle.color} fillOpacity="0.2"
            stroke={cognitiveStyle.color} strokeWidth="1.5"
          >
            <animate attributeName="stroke-opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
          </rect>
          <foreignObject x="-50" y="-10" width="20" height="20">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={14} color={cognitiveStyle.color} />
            </div>
          </foreignObject>
          <text x="5" y="5" fill={cognitiveStyle.color} fontSize="11" fontWeight="600" opacity="0.9">
            Break it down
          </text>
        </g>
      )}

      {/* Connector handle */}
      <g
        onMouseDown={(e) => { e.stopPropagation(); onConnectorDragStart?.(e); }}
        onTouchStart={(e) => { e.stopPropagation(); onConnectorTouchStart?.(e); }}
        style={{ cursor: 'crosshair' }}
      >
        <circle cx={LAYOUT.NODE_WIDTH} cy={LAYOUT.NODE_HEIGHT / 2} r="18" fill="transparent" />
        <circle
          cx={LAYOUT.NODE_WIDTH} cy={LAYOUT.NODE_HEIGHT / 2}
          r={isEdgeSource ? 10 : (isSelected ? 7 : 5)}
          fill={isEdgeSource ? COLORS.accentSecondary : (isSelected ? COLORS.accentPrimary : COLORS.textMuted)}
          stroke={COLORS.bgVoid} strokeWidth="2"
          opacity={isEdgeSource ? 1 : (isSelected ? 0.8 : 0.4)}
        />
      </g>

      {/* Drop zone */}
      {isCreatingEdge && !isEdgeSource && (
        <rect x="-4" y="-4" width={LAYOUT.NODE_WIDTH + 8} height={LAYOUT.NODE_HEIGHT + 8} rx="16" fill="none" stroke={COLORS.accentSecondary} strokeWidth="2" strokeDasharray="6 3" opacity="0.5" />
      )}

      {/* Selection */}
      {isSelected && (
        <rect x="-3" y="-3" width={LAYOUT.NODE_WIDTH + 6} height={LAYOUT.NODE_HEIGHT + 6} rx="15" fill="none" stroke={COLORS.accentSecondary} strokeWidth="2" strokeOpacity="0.4" />
      )}

      {/* Actions */}
      {showActions && actions.length > 0 && (
        <g style={{ opacity: isSelected ? 1 : 0.85 }}>
          {actions.map((action, i) => (
            <ActionButton key={i} x={actionX} y={actionY + (i - (actions.length - 1) / 2) * 36} icon={action.icon} color={action.color} onClick={action.onClick} title={action.title} delay={i * 0.03} />
          ))}
          <line x1={LAYOUT.NODE_WIDTH + 4} y1={LAYOUT.NODE_HEIGHT / 2} x2={actionX - 18} y2={LAYOUT.NODE_HEIGHT / 2} stroke={COLORS.accentSecondary} strokeWidth="2" strokeOpacity="0.2" strokeDasharray="4 2" />
        </g>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          HOUR RINGS - Rendered ON TOP for maximum visibility
          Each full ring = 1 hour, partial ring for remaining minutes
          Pin this to your browser for highly visual time tracking!
          ═══════════════════════════════════════════════════════════════ */}
      {totalMinutes > 0 && (
        <g style={{ pointerEvents: 'none' }}>
          {/* Full hour rings */}
          {Array.from({ length: fullHours }, (_, i) => {
            const radius = RING_BASE_RADIUS + i * RING_SPACING;
            return (
              <circle
                key={`ring-${i}`}
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke={cognitiveStyle.color}
                strokeWidth={RING_STROKE}
                opacity={effectiveOpacity * 0.8}
                style={{
                  filter: `drop-shadow(0 0 ${4 + cognitiveStyle.glowIntensity * 6}px ${cognitiveStyle.color})`,
                }}
              >
                {computedStatus === 'in_progress' && (
                  <animate
                    attributeName="stroke-opacity"
                    values="0.6;1;0.6"
                    dur={`${2 + i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            );
          })}

          {/* Partial ring for remaining minutes */}
          {partialPercent > 0 && (
            <path
              d={describeArc(
                partialPercent,
                RING_BASE_RADIUS + fullHours * RING_SPACING,
                centerX,
                centerY
              )}
              fill="none"
              stroke={cognitiveStyle.color}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              opacity={effectiveOpacity * 0.9}
              style={{
                filter: `drop-shadow(0 0 ${6 + cognitiveStyle.glowIntensity * 8}px ${cognitiveStyle.color})`,
              }}
            >
              {computedStatus === 'in_progress' && (
                <animate
                  attributeName="stroke-opacity"
                  values="0.7;1;0.7"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </path>
          )}

          {/* Time label on outer ring */}
          <text
            x={centerX}
            y={centerY - RING_BASE_RADIUS - (fullHours * RING_SPACING) - 8}
            fill={cognitiveStyle.color}
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
            opacity={effectiveOpacity * 0.9}
            style={{
              filter: `drop-shadow(0 0 4px ${COLORS.bgVoid})`,
            }}
          >
            {fullHours > 0 ? `${fullHours}h${remainingMinutes > 0 ? remainingMinutes : ''}` : `${remainingMinutes}m`}
          </text>
        </g>
      )}
    </g>
  );
}

export default TaskNode;
