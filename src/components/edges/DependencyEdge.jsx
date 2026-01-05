// ═══════════════════════════════════════════════════════════════
// components/edges/DependencyEdge.jsx
// Organic, flowing dependency edges between tasks
// Designed to feel like energy vines, not boring corporate arrows
// ═══════════════════════════════════════════════════════════════

import { COLORS } from '@/constants';
import { getEdgePath } from '@/utils';

/**
 * @param {Object} props
 * @param {import('@/types').Edge} props.edge
 * @param {{ x: number, y: number }} props.sourcePos
 * @param {{ x: number, y: number }} props.targetPos
 * @param {boolean} props.isSelected
 * @param {Function} props.onClick
 * @param {boolean} props.isGhosted - Dimmed for quest focus overlay
 */
export function DependencyEdge({
  edge,
  sourcePos,
  targetPos,
  isSelected,
  onClick,
  isGhosted = false,
}) {
  const { start, end, midX } = getEdgePath(sourcePos, targetPos);

  // Create organic S-curve with multiple control points
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // More organic curve - slight waves
  const ctrl1X = start.x + dx * 0.3;
  const ctrl1Y = start.y + dy * 0.1;
  const ctrl2X = start.x + dx * 0.7;
  const ctrl2Y = end.y - dy * 0.1;

  const pathD = `M ${start.x} ${start.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${end.x} ${end.y}`;

  // Apply ghosting
  const baseOpacity = isSelected ? 1 : 0.6;
  const effectiveOpacity = isGhosted ? baseOpacity * 0.2 : baseOpacity;

  // Edge colors
  const edgeColor = isSelected ? COLORS.accentSecondary : '#6B7280';
  const glowColor = isSelected ? COLORS.accentSecondary : COLORS.accentPrimary;

  // Generate unique ID for this edge's gradient
  const gradientId = `edge-gradient-${edge.id}`;
  const flowId = `edge-flow-${edge.id}`;

  return (
    <g onClick={onClick} style={{ cursor: isGhosted ? 'default' : 'pointer' }}>
      {/* Gradient definition */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={glowColor} stopOpacity={effectiveOpacity * 0.3} />
          <stop offset="50%" stopColor={edgeColor} stopOpacity={effectiveOpacity * 0.8} />
          <stop offset="100%" stopColor={glowColor} stopOpacity={effectiveOpacity * 0.3} />
        </linearGradient>
      </defs>

      {/* Wider invisible hit area */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
      />

      {/* Glow layer */}
      {!isGhosted && (
        <path
          d={pathD}
          fill="none"
          stroke={glowColor}
          strokeWidth={isSelected ? 8 : 5}
          strokeOpacity={effectiveOpacity * 0.15}
          strokeLinecap="round"
          style={{ filter: 'blur(4px)' }}
        />
      )}

      {/* Main edge line - gradient stroke */}
      <path
        d={pathD}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={isSelected ? 3 : 2}
        strokeLinecap="round"
      />

      {/* Animated flow particles */}
      {!isGhosted && (
        <>
          <circle r={isSelected ? 4 : 3} fill={glowColor} opacity={effectiveOpacity * 0.8}>
            <animateMotion
              dur={isSelected ? "1.5s" : "2.5s"}
              repeatCount="indefinite"
              path={pathD}
            />
          </circle>
          <circle r={isSelected ? 3 : 2} fill={glowColor} opacity={effectiveOpacity * 0.5}>
            <animateMotion
              dur={isSelected ? "1.5s" : "2.5s"}
              repeatCount="indefinite"
              path={pathD}
              begin="0.8s"
            />
          </circle>
        </>
      )}

      {/* Arrowhead at end */}
      <g transform={`translate(${end.x}, ${end.y})`}>
        {/* Calculate rotation based on curve end tangent */}
        <g transform={`rotate(${Math.atan2(end.y - ctrl2Y, end.x - ctrl2X) * 180 / Math.PI})`}>
          <path
            d="M -10 -5 L 0 0 L -10 5"
            fill="none"
            stroke={edgeColor}
            strokeWidth={isSelected ? 2.5 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={effectiveOpacity}
          />
        </g>
      </g>
    </g>
  );
}

/**
 * Preview edge while creating new dependency
 */
export function EdgePreview({ startPos, endPos }) {
  if (!startPos || !endPos) return null;

  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  const ctrl1X = startPos.x + dx * 0.3;
  const ctrl1Y = startPos.y + dy * 0.1;
  const ctrl2X = startPos.x + dx * 0.7;
  const ctrl2Y = endPos.y - dy * 0.1;

  const pathD = `M ${startPos.x} ${startPos.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endPos.x} ${endPos.y}`;

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Glow */}
      <path
        d={pathD}
        fill="none"
        stroke={COLORS.accentSecondary}
        strokeWidth="6"
        strokeOpacity="0.2"
        strokeLinecap="round"
        style={{ filter: 'blur(3px)' }}
      />
      {/* Main line */}
      <path
        d={pathD}
        fill="none"
        stroke={COLORS.accentSecondary}
        strokeWidth="2"
        strokeDasharray="8,6"
        strokeOpacity="0.8"
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="28"
          to="0"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </path>
      {/* Flowing particle */}
      <circle r="4" fill={COLORS.accentSecondary} opacity="0.9">
        <animateMotion
          dur="0.6s"
          repeatCount="indefinite"
          path={pathD}
        />
      </circle>
    </g>
  );
}

/**
 * SVG defs for edge effects (not using markers anymore - inline arrows)
 */
export function EdgeDefs() {
  return (
    <defs>
      {/* Keep for backwards compatibility but not actively used */}
      <marker
        id="arrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.textMuted} fillOpacity="0.5" />
      </marker>
      <marker
        id="arrow-selected"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.accentSecondary} />
      </marker>
      <marker
        id="arrow-ghosted"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.textMuted} fillOpacity="0.15" />
      </marker>
    </defs>
  );
}

export default DependencyEdge;
