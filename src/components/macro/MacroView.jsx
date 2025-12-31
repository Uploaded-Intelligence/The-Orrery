// ═══════════════════════════════════════════════════════════════
// components/macro/MacroView.jsx
// Living Cosmos - Quest Organisms in the Void (Canvas Edition)
// Sci-fantasy aesthetic: organic, bioluminescent, game-like
// Now with pan/zoom, dragging, and celestial vines!
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Plus, Sparkles, Star, ZoomIn, ZoomOut, Maximize2, Link2, Link2Off, Trash2 } from 'lucide-react';
import { COLORS, TIMING } from '@/constants';
import { getQuestProgress } from '@/utils';
import { useOrrery } from '@/store';
import { AddQuestForm, EditQuestForm } from '@/components/forms';
import { CosmicAmbient } from '@/components/ambient';

// ─── Layout Constants ────────────────────────────────────────────────────────
const QUEST_SIZE = 140; // Base size of quest organism
const QUEST_SPACING = 200; // Spacing for auto-layout
const GRID_COLS = 4; // Columns for auto-layout grid

// ─── Quest Organism (SVG version) ────────────────────────────────────────────
function QuestOrganismSVG({
  quest,
  progress,
  taskCount,
  position,
  isSelected,
  isVineSource,
  isDragging,
  isCreatingVine,
  onSelect,
  onEdit,
  onDragStart,
  onVineStart,
  index
}) {
  // Organism characteristics based on state
  const isComplete = progress >= 1;
  const isActive = taskCount > 0 && progress > 0 && progress < 1;
  const isDormant = taskCount === 0;

  // Size grows with task count
  const baseSize = Math.min(160, Math.max(100, 80 + taskCount * 12));
  const halfSize = baseSize / 2;

  // Glow intensity based on progress and state
  const glowIntensity = isDormant ? 0.2 : 0.3 + progress * 0.5;

  // Animation stagger
  const animationDelay = `${index * 0.15}s`;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(quest.id);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onEdit(quest);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onDragStart(quest.id, e);
  };

  const handleTouchStart = (e) => {
    e.stopPropagation();
    onDragStart(quest.id, e.touches[0]);
  };

  // Vine connector handle
  const handleVineMouseDown = (e) => {
    e.stopPropagation();
    onVineStart(quest.id, e);
  };

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      style={{
        cursor: isDragging ? 'grabbing' : (isCreatingVine ? 'crosshair' : 'pointer'),
        animation: `fadeGrowIn 0.8s ease-out backwards`,
        animationDelay,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Outer aura - breathing glow */}
      <circle
        cx={halfSize}
        cy={halfSize}
        r={halfSize + 25}
        fill={`url(#aura-${quest.id})`}
        style={{
          animation: `breathe ${TIMING.breathe} ease-in-out infinite`,
          animationDelay,
          opacity: isSelected ? 1 : 0.7,
        }}
      />

      {/* Definitions for this quest */}
      <defs>
        {/* Aura gradient */}
        <radialGradient id={`aura-${quest.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={quest.themeColor} stopOpacity={glowIntensity * 0.4} />
          <stop offset="100%" stopColor={quest.themeColor} stopOpacity="0" />
        </radialGradient>

        {/* Core gradient */}
        <radialGradient id={`grad-${quest.id}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={quest.themeColor} stopOpacity="0.6" />
          <stop offset="50%" stopColor={quest.themeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={COLORS.bgDeep} stopOpacity="0.8" />
        </radialGradient>

        {/* Progress clip */}
        <clipPath id={`clip-${quest.id}`}>
          <ellipse cx={halfSize} cy={halfSize} rx={halfSize * 0.84} ry={halfSize * 0.8} />
        </clipPath>
      </defs>

      {/* Main body - organic ellipse */}
      <ellipse
        cx={halfSize}
        cy={halfSize}
        rx={halfSize * 0.84}
        ry={halfSize * 0.8}
        fill={`url(#grad-${quest.id})`}
        stroke={quest.themeColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeOpacity={isSelected ? 0.9 : 0.6}
        filter={`drop-shadow(0 0 ${10 * glowIntensity}px ${quest.themeColor})`}
        style={{
          animation: `organicPulse ${TIMING.breathe} ease-in-out infinite`,
          transformOrigin: `${halfSize}px ${halfSize}px`,
        }}
      />

      {/* Progress fill - rising like liquid */}
      <rect
        x={halfSize * 0.16}
        y={baseSize - progress * (baseSize * 0.8)}
        width={baseSize * 0.84}
        height={progress * (baseSize * 0.8)}
        fill={quest.themeColor}
        fillOpacity="0.25"
        clipPath={`url(#clip-${quest.id})`}
        style={{
          transition: 'y 0.5s ease-out, height 0.5s ease-out',
        }}
      />

      {/* Inner glow nucleus */}
      <ellipse
        cx={halfSize}
        cy={halfSize}
        rx={halfSize * 0.3}
        ry={halfSize * 0.28}
        fill={quest.themeColor}
        fillOpacity={isActive ? 0.5 : 0.2}
        style={{
          animation: isActive ? `nucleusPulse ${TIMING.pulse} ease-in-out infinite` : 'none',
        }}
      />

      {/* Completion bloom effect */}
      {isComplete && (
        <circle
          cx={halfSize}
          cy={halfSize}
          r={halfSize * 0.7}
          fill="none"
          stroke={COLORS.accentBloom}
          strokeWidth="2"
          strokeOpacity="0.6"
          style={{
            animation: `bloomRing 2s ease-out infinite`,
          }}
        />
      )}

      {/* Text overlay */}
      <foreignObject x={10} y={halfSize - 25} width={baseSize - 20} height={60}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
        }}>
          <span style={{
            color: COLORS.textPrimary,
            fontSize: baseSize < 120 ? '11px' : '13px',
            fontWeight: 600,
            textShadow: `0 0 10px ${COLORS.bgVoid}`,
            lineHeight: 1.2,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {quest.title}
          </span>
          <span style={{
            color: quest.themeColor,
            fontSize: '10px',
            marginTop: '4px',
            opacity: 0.9,
            textShadow: `0 0 8px ${quest.themeColor}50`,
          }}>
            {isDormant ? 'dormant' : `${Math.round(progress * 100)}% grown`}
          </span>
        </div>
      </foreignObject>

      {/* Selection ring */}
      {isSelected && (
        <ellipse
          cx={halfSize}
          cy={halfSize}
          rx={halfSize * 0.9}
          ry={halfSize * 0.86}
          fill="none"
          stroke={quest.themeColor}
          strokeWidth="2"
          strokeDasharray="8 4"
          opacity="0.8"
          style={{
            animation: 'selectionPulse 1.5s ease-in-out infinite',
          }}
        />
      )}

      {/* Vine connector handle (right side) */}
      <g
        transform={`translate(${baseSize - 8}, ${halfSize - 8})`}
        style={{ cursor: 'crosshair' }}
        onMouseDown={handleVineMouseDown}
      >
        <circle
          cx="8"
          cy="8"
          r="10"
          fill={COLORS.bgPanel}
          stroke={isVineSource ? COLORS.accentBloom : quest.themeColor}
          strokeWidth={isVineSource ? 2 : 1}
          opacity={isVineSource ? 1 : 0.6}
        />
        <circle
          cx="8"
          cy="8"
          r="4"
          fill={isVineSource ? COLORS.accentBloom : quest.themeColor}
        />
      </g>

      {/* Edit button (top-right, visible on hover/select) */}
      <foreignObject x={baseSize - 30} y={5} width={28} height={28}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(quest); }}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: `${COLORS.bgPanel}cc`,
            border: `1px solid ${COLORS.textMuted}30`,
            color: COLORS.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isSelected ? 1 : 0,
            transition: 'opacity 0.2s',
            fontSize: '10px',
            backdropFilter: 'blur(4px)',
          }}
          title="Edit quest"
        >
          ✎
        </button>
      </foreignObject>
    </g>
  );
}

// ─── Celestial Vine (Quest-to-Quest Connection) ──────────────────────────────
function CelestialVine({ vine, sourcePos, targetPos, sourceQuest, targetQuest, isSelected, onClick }) {
  if (!sourcePos || !targetPos) return null;

  const sourceCenter = {
    x: sourcePos.x + QUEST_SIZE / 2,
    y: sourcePos.y + QUEST_SIZE / 2,
  };
  const targetCenter = {
    x: targetPos.x + QUEST_SIZE / 2,
    y: targetPos.y + QUEST_SIZE / 2,
  };

  // Create organic curved path
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Control points for bezier - slight organic curve
  const midX = (sourceCenter.x + targetCenter.x) / 2;
  const midY = (sourceCenter.y + targetCenter.y) / 2;
  const perpX = -dy / dist * 30; // Perpendicular offset
  const perpY = dx / dist * 30;

  const path = `M ${sourceCenter.x} ${sourceCenter.y} Q ${midX + perpX} ${midY + perpY}, ${targetCenter.x} ${targetCenter.y}`;

  // Gradient between quest colors
  const gradId = `vine-grad-${vine.id}`;
  const strokeWidth = 2 + vine.strength * 4;

  return (
    <g onClick={(e) => { e.stopPropagation(); onClick(vine.id); }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={sourceQuest?.themeColor || COLORS.accentPrimary} />
          <stop offset="100%" stopColor={targetQuest?.themeColor || COLORS.accentSecondary} />
        </linearGradient>
      </defs>

      {/* Glow layer */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={strokeWidth + 6}
        strokeLinecap="round"
        opacity="0.15"
        style={{
          filter: 'blur(4px)',
        }}
      />

      {/* Main vine */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={isSelected ? 1 : 0.6}
        style={{
          cursor: 'pointer',
          transition: 'opacity 0.2s',
          animation: `vinePulse ${TIMING.breathe} ease-in-out infinite`,
        }}
      />

      {/* Selection indicator */}
      {isSelected && (
        <path
          d={path}
          fill="none"
          stroke={COLORS.accentEnergy}
          strokeWidth={strokeWidth + 2}
          strokeLinecap="round"
          strokeDasharray="12 6"
          opacity="0.8"
        />
      )}
    </g>
  );
}

// ─── Vine Preview (while creating) ───────────────────────────────────────────
function VinePreview({ startPos, endPos, sourceQuest }) {
  const sourceCenter = {
    x: startPos.x + QUEST_SIZE / 2,
    y: startPos.y + QUEST_SIZE / 2,
  };

  const dx = endPos.x - sourceCenter.x;
  const dy = endPos.y - sourceCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  const midX = (sourceCenter.x + endPos.x) / 2;
  const midY = (sourceCenter.y + endPos.y) / 2;
  const perpX = -dy / dist * 20;
  const perpY = dx / dist * 20;

  const path = `M ${sourceCenter.x} ${sourceCenter.y} Q ${midX + perpX} ${midY + perpY}, ${endPos.x} ${endPos.y}`;

  return (
    <path
      d={path}
      fill="none"
      stroke={sourceQuest?.themeColor || COLORS.accentBloom}
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="10 5"
      opacity="0.7"
      style={{
        animation: 'vinePulse 1s ease-in-out infinite',
      }}
    />
  );
}

// ─── North Star (SVG version) ────────────────────────────────────────────────
function NorthStarSVG({ position }) {
  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      {/* Outer glow */}
      <circle
        cx="24"
        cy="24"
        r="35"
        fill={`${COLORS.accentEnergy}20`}
        style={{
          animation: `breathe ${TIMING.breathe} ease-in-out infinite`,
        }}
      />

      {/* Star shape */}
      <polygon
        points="24,4 29,18 44,18 32,28 36,44 24,34 12,44 16,28 4,18 19,18"
        fill={COLORS.accentEnergy}
        filter={`drop-shadow(0 0 8px ${COLORS.accentEnergy})`}
      />

      {/* Label */}
      <text
        x="24"
        y="65"
        textAnchor="middle"
        fill={COLORS.accentEnergy}
        fontSize="8"
        fontWeight="600"
        style={{ textTransform: 'uppercase', letterSpacing: '0.25em' }}
      >
        NORTH STAR
      </text>

      <text
        x="24"
        y="82"
        textAnchor="middle"
        fill={COLORS.textSecondary}
        fontSize="10"
        fontStyle="italic"
      >
        "A flourishing life-world"
      </text>
    </g>
  );
}

// ─── Auto-layout helper ──────────────────────────────────────────────────────
function getQuestPositions(quests) {
  const positions = new Map();

  quests.forEach((quest, index) => {
    if (quest.position) {
      // Use stored position
      positions.set(quest.id, quest.position);
    } else {
      // Auto-layout in a grid pattern
      const col = index % GRID_COLS;
      const row = Math.floor(index / GRID_COLS);
      positions.set(quest.id, {
        x: 200 + col * QUEST_SPACING,
        y: 150 + row * QUEST_SPACING,
      });
    }
  });

  return positions;
}

// ═══════════════════════════════════════════════════════════════════════════
// MACRO VIEW - The Living Garden (Canvas Edition)
// ═══════════════════════════════════════════════════════════════════════════

export function MacroView() {
  const { state, dispatch } = useOrrery();
  const svgRef = useRef(null);

  // UI state
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  const [selectedVineId, setSelectedVineId] = useState(null);

  // View transform
  const [pan, setPan] = useState(state.preferences.macroViewPosition || { x: 0, y: 0 });
  const [zoom, setZoom] = useState(state.preferences.macroViewZoom || 1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Quest dragging
  const [draggingQuestId, setDraggingQuestId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedPositions, setDraggedPositions] = useState(new Map());

  // Vine creation
  const [vineSourceId, setVineSourceId] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Quest data with progress
  const questsWithData = useMemo(() =>
    state.quests.map(quest => ({
      quest,
      progress: getQuestProgress(quest.id, state),
      taskCount: state.tasks.filter(t => t.questIds.includes(quest.id)).length,
    })),
    [state.quests, state.tasks, state]
  );

  // Calculate positions
  const basePositions = useMemo(() =>
    getQuestPositions(state.quests),
    [state.quests]
  );

  // Merge with dragged positions
  const positions = useMemo(() => {
    const merged = new Map(basePositions);
    draggedPositions.forEach((pos, questId) => {
      merged.set(questId, pos);
    });
    return merged;
  }, [basePositions, draggedPositions]);

  // ─── Quest Selection ───────────────────────────────────────────────────────
  const handleQuestClick = useCallback((questId) => {
    if (vineSourceId) {
      // Creating vine - complete it
      if (vineSourceId !== questId) {
        dispatch({
          type: 'ADD_QUEST_VINE',
          payload: { sourceQuestId: vineSourceId, targetQuestId: questId, strength: 0.5 }
        });
      }
      setVineSourceId(null);
    } else {
      setSelectedQuestId(questId === selectedQuestId ? null : questId);
      setSelectedVineId(null);
    }
  }, [vineSourceId, selectedQuestId, dispatch]);

  const handleQuestDoubleClick = useCallback((quest) => {
    // Double-click to dive into quest
    dispatch({ type: 'SET_FOCUS_QUEST', payload: quest.id });
    dispatch({ type: 'SET_VIEW', payload: 'micro' });
  }, [dispatch]);

  // ─── Quest Dragging ────────────────────────────────────────────────────────
  const handleQuestDragStart = useCallback((questId, e) => {
    if (vineSourceId) return;

    const currentPos = positions.get(questId);
    if (!currentPos) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX || e.pageX;
    const clientY = e.clientY || e.pageY;
    const mouseX = (clientX - rect.left - pan.x) / zoom;
    const mouseY = (clientY - rect.top - pan.y) / zoom;

    setDraggingQuestId(questId);
    setDragOffset({
      x: mouseX - currentPos.x,
      y: mouseY - currentPos.y,
    });
    setSelectedQuestId(questId);
    setSelectedVineId(null);
  }, [vineSourceId, positions, pan, zoom]);

  // ─── Vine Creation ─────────────────────────────────────────────────────────
  const handleVineStart = useCallback((questId, e) => {
    e.stopPropagation();
    setVineSourceId(questId);
    setSelectedQuestId(null);
    setSelectedVineId(null);

    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    });
  }, [pan, zoom]);

  const cancelVineCreation = useCallback(() => {
    setVineSourceId(null);
  }, []);

  // ─── Vine Selection & Deletion ─────────────────────────────────────────────
  const handleVineClick = useCallback((vineId) => {
    setSelectedVineId(vineId === selectedVineId ? null : vineId);
    setSelectedQuestId(null);
  }, [selectedVineId]);

  const deleteSelected = useCallback(() => {
    if (selectedVineId) {
      dispatch({ type: 'DELETE_QUEST_VINE', payload: selectedVineId });
      setSelectedVineId(null);
    } else if (selectedQuestId) {
      dispatch({ type: 'DELETE_QUEST', payload: selectedQuestId });
      setSelectedQuestId(null);
    }
  }, [selectedQuestId, selectedVineId, dispatch]);

  // ─── Pan/Zoom Handlers ─────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.id === 'macro-background') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedQuestId(null);
      setSelectedVineId(null);
      if (vineSourceId) setVineSourceId(null);
    }
  }, [pan, vineSourceId]);

  const handleMouseMove = useCallback((e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    // Track mouse for vine preview
    if (vineSourceId) {
      setMousePos({ x: mouseX, y: mouseY });
    }

    // Handle quest dragging
    if (draggingQuestId) {
      const newPos = {
        x: mouseX - dragOffset.x,
        y: mouseY - dragOffset.y,
      };
      setDraggedPositions(prev => {
        const next = new Map(prev);
        next.set(draggingQuestId, newPos);
        return next;
      });
      return;
    }

    // Handle panning
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart, vineSourceId, pan, zoom, draggingQuestId, dragOffset]);

  const handleMouseUp = useCallback(() => {
    // End quest dragging - persist position
    if (draggingQuestId) {
      const finalPos = draggedPositions.get(draggingQuestId);
      if (finalPos) {
        dispatch({
          type: 'UPDATE_QUEST_POSITION',
          payload: { id: draggingQuestId, position: finalPos }
        });
      }
      setDraggingQuestId(null);
      setDraggedPositions(new Map());
      return;
    }

    // End panning
    if (isPanning) {
      setIsPanning(false);
      dispatch({ type: 'SET_MACRO_POSITION', payload: pan });
    }
  }, [isPanning, pan, dispatch, draggingQuestId, draggedPositions]);

  // Zoom
  const zoomIn = useCallback(() => {
    const newZoom = Math.min(zoom * 1.2, 3);
    setZoom(newZoom);
    dispatch({ type: 'SET_MACRO_ZOOM', payload: newZoom });
  }, [zoom, dispatch]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(zoom / 1.2, 0.3);
    setZoom(newZoom);
    dispatch({ type: 'SET_MACRO_ZOOM', payload: newZoom });
  }, [zoom, dispatch]);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
    dispatch({ type: 'SET_MACRO_POSITION', payload: { x: 0, y: 0 } });
    dispatch({ type: 'SET_MACRO_ZOOM', payload: 1 });
  }, [dispatch]);

  // Wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.3), 3);

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const newPan = {
        x: cursorX - (cursorX - pan.x) * (newZoom / zoom),
        y: cursorY - (cursorY - pan.y) * (newZoom / zoom),
      };

      setPan(newPan);
      setZoom(newZoom);
      dispatch({ type: 'SET_MACRO_POSITION', payload: newPan });
      dispatch({ type: 'SET_MACRO_ZOOM', payload: newZoom });
    }
  }, [zoom, pan, dispatch]);

  // Attach wheel listener
  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener('wheel', handleWheel, { passive: false });
      return () => svg.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Get vine preview start position
  const vinePreviewStart = vineSourceId ? positions.get(vineSourceId) : null;
  const sourceQuest = vineSourceId ? state.quests.find(q => q.id === vineSourceId) : null;

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: COLORS.bgSpace,
    }}>
      {/* Living background */}
      <CosmicAmbient intensity="normal" />

      {/* Toolbar */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: `${COLORS.bgPanel}dd`,
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${COLORS.bgElevated}`,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          color: COLORS.textPrimary,
        }}>
          Quest Cosmos
        </h2>
        <span style={{ color: COLORS.textMuted, fontSize: '13px' }}>
          ({state.quests.length} quests)
        </span>

        <div style={{ flex: 1 }} />

        {/* Vine creation mode indicator */}
        {vineSourceId && (
          <span style={{
            padding: '4px 12px',
            borderRadius: '4px',
            background: COLORS.accentBloom + '20',
            color: COLORS.accentBloom,
            fontSize: '12px',
          }}>
            Click target quest to create vine
            <button
              onClick={cancelVineCreation}
              style={{
                marginLeft: '8px',
                padding: '2px 6px',
                background: 'transparent',
                border: 'none',
                color: COLORS.textMuted,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </span>
        )}

        {/* Add Quest */}
        <button
          onClick={() => setShowAddQuest(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: COLORS.accentPrimary,
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Quest
        </button>

        {/* Add Vine button */}
        {selectedQuestId && !vineSourceId && (
          <button
            onClick={() => setVineSourceId(selectedQuestId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: COLORS.bgElevated,
              border: `1px solid ${COLORS.accentBloom}`,
              borderRadius: '6px',
              color: COLORS.accentBloom,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Link2 size={16} />
            Add Vine
          </button>
        )}

        {/* Delete button */}
        {(selectedQuestId || selectedVineId) && (
          <button
            onClick={deleteSelected}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: COLORS.bgElevated,
              border: `1px solid ${COLORS.accentDanger}`,
              borderRadius: '6px',
              color: COLORS.accentDanger,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {selectedVineId ? <Link2Off size={16} /> : <Trash2 size={16} />}
            Delete
          </button>
        )}

        {/* Zoom controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginLeft: '8px',
          padding: '4px',
          background: COLORS.bgElevated,
          borderRadius: '6px',
        }}>
          <button onClick={zoomOut} style={{ padding: '4px', background: 'transparent', border: 'none', color: COLORS.textSecondary, cursor: 'pointer' }}>
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '12px', color: COLORS.textMuted, minWidth: '40px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={zoomIn} style={{ padding: '4px', background: 'transparent', border: 'none', color: COLORS.textSecondary, cursor: 'pointer' }}>
            <ZoomIn size={16} />
          </button>
          <button onClick={resetView} style={{ padding: '4px', background: 'transparent', border: 'none', color: COLORS.textSecondary, cursor: 'pointer' }}>
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <svg
        ref={svgRef}
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          cursor: draggingQuestId ? 'grabbing' : (isPanning ? 'grabbing' : (vineSourceId ? 'crosshair' : 'grab')),
          userSelect: 'none',
          touchAction: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background */}
        <rect
          id="macro-background"
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={COLORS.bgSpace}
        />

        {/* Transformed content */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* North Star - fixed position */}
          <NorthStarSVG position={{ x: 400, y: 20 }} />

          {/* Celestial Vines layer (behind quests) */}
          {(state.questVines || []).map(vine => {
            const sourcePos = positions.get(vine.sourceQuestId);
            const targetPos = positions.get(vine.targetQuestId);
            const sourceQ = state.quests.find(q => q.id === vine.sourceQuestId);
            const targetQ = state.quests.find(q => q.id === vine.targetQuestId);

            return (
              <CelestialVine
                key={vine.id}
                vine={vine}
                sourcePos={sourcePos}
                targetPos={targetPos}
                sourceQuest={sourceQ}
                targetQuest={targetQ}
                isSelected={selectedVineId === vine.id}
                onClick={handleVineClick}
              />
            );
          })}

          {/* Vine preview while creating */}
          {vineSourceId && vinePreviewStart && (
            <VinePreview
              startPos={vinePreviewStart}
              endPos={mousePos}
              sourceQuest={sourceQuest}
            />
          )}

          {/* Quest Organisms */}
          {questsWithData.map(({ quest, progress, taskCount }, index) => {
            const pos = positions.get(quest.id);
            if (!pos) return null;

            return (
              <QuestOrganismSVG
                key={quest.id}
                quest={quest}
                progress={progress}
                taskCount={taskCount}
                position={pos}
                isSelected={selectedQuestId === quest.id}
                isVineSource={vineSourceId === quest.id}
                isDragging={draggingQuestId === quest.id}
                isCreatingVine={!!vineSourceId}
                onSelect={handleQuestClick}
                onEdit={handleQuestDoubleClick}
                onDragStart={handleQuestDragStart}
                onVineStart={handleVineStart}
                index={index}
              />
            );
          })}
        </g>
      </svg>

      {/* Empty state overlay */}
      {state.quests.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 5,
        }}>
          <div style={{
            position: 'relative',
            width: 100,
            height: 100,
            marginBottom: '1.5rem',
            margin: '0 auto 1.5rem',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${COLORS.accentPrimary}20 0%, ${COLORS.bgDeep} 100%)`,
              border: `1px dashed ${COLORS.textMuted}30`,
              animation: `breathe ${TIMING.breathe} ease-in-out infinite`,
            }} />
            <Sparkles
              size={36}
              color={COLORS.textMuted}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.4,
              }}
            />
          </div>

          <h3 style={{
            color: COLORS.textPrimary,
            margin: '0 0 0.5rem',
            fontSize: '1rem',
            fontWeight: 500,
          }}>
            The cosmos awaits
          </h3>

          <p style={{
            color: COLORS.textMuted,
            margin: '0 0 1.5rem',
            fontSize: '0.8125rem',
            maxWidth: '280px',
            lineHeight: 1.5,
          }}>
            Plant your first quest seed and watch it grow into something magnificent.
          </p>

          <button
            onClick={() => setShowAddQuest(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '2rem',
              border: 'none',
              background: `linear-gradient(135deg, ${COLORS.accentPrimary}, ${COLORS.accentSecondary})`,
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: `0 4px 20px ${COLORS.accentPrimary}40`,
              margin: '0 auto',
            }}
          >
            <Plus size={18} />
            Plant First Seed
          </button>
        </div>
      )}

      {/* Modal: Add Quest */}
      {showAddQuest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 11, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setShowAddQuest(false)}
        >
          <div
            style={{
              background: COLORS.bgPanel,
              borderRadius: '1rem',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '380px',
              border: `1px solid ${COLORS.accentPrimary}30`,
              boxShadow: `0 0 40px ${COLORS.accentPrimary}20`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              color: COLORS.textPrimary,
              margin: '0 0 1rem',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Sparkles size={16} color={COLORS.accentPrimary} />
              Plant New Seed
            </h3>
            <AddQuestForm onClose={() => setShowAddQuest(false)} />
          </div>
        </div>
      )}

      {/* Modal: Edit Quest */}
      {editingQuest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 11, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setEditingQuest(null)}
        >
          <div
            style={{
              background: COLORS.bgPanel,
              borderRadius: '1rem',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '380px',
              border: `1px solid ${COLORS.accentEnergy}30`,
              boxShadow: `0 0 40px ${COLORS.accentEnergy}20`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              color: COLORS.accentEnergy,
              margin: '0 0 1rem',
              fontSize: '1rem',
            }}>
              ✎ Tend Quest
            </h3>
            <EditQuestForm quest={editingQuest} onClose={() => setEditingQuest(null)} />
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        @keyframes organicPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.02) rotate(0.5deg); }
          75% { transform: scale(0.98) rotate(-0.5deg); }
        }

        @keyframes nucleusPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        @keyframes bloomRing {
          0% { r: 35; opacity: 0.6; }
          100% { r: 50; opacity: 0; }
        }

        @keyframes selectionPulse {
          0%, 100% { stroke-dashoffset: 0; opacity: 0.8; }
          50% { stroke-dashoffset: 24; opacity: 0.5; }
        }

        @keyframes vinePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }

        @keyframes fadeGrowIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default MacroView;
