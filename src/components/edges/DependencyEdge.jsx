// ═══════════════════════════════════════════════════════════════
// components/edges/DependencyEdge.jsx
// Arrow edge between tasks in Micro View
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
 */
export function DependencyEdge({
  edge,
  sourcePos,
  targetPos,
  isSelected,
  onClick,
}) {
  const { start, end, midX } = getEdgePath(sourcePos, targetPos);

  // Bezier curve control points for smooth S-curve
  const pathD = `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Wider invisible hit area */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="16"
      />

      {/* Visible edge line */}
      <path
        d={pathD}
        fill="none"
        stroke={isSelected ? COLORS.accentDanger : COLORS.textMuted}
        strokeWidth={isSelected ? 3 : 2}
        strokeOpacity={isSelected ? 1 : 0.5}
        markerEnd={`url(#arrow${isSelected ? '-selected' : ''})`}
      />
    </g>
  );
}

/**
 * Preview edge while creating new dependency
 */
export function EdgePreview({ startPos, endPos }) {
  if (!startPos || !endPos) return null;

  const midX = (startPos.x + endPos.x) / 2;
  const pathD = `M ${startPos.x} ${startPos.y} C ${midX} ${startPos.y}, ${midX} ${endPos.y}, ${endPos.x} ${endPos.y}`;

  return (
    <path
      d={pathD}
      fill="none"
      stroke={COLORS.accentSecondary}
      strokeWidth="2"
      strokeDasharray="8,4"
      strokeOpacity="0.8"
      style={{ pointerEvents: 'none' }}
    />
  );
}

/**
 * SVG defs for arrow markers
 */
export function EdgeDefs() {
  return (
    <defs>
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
        <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.accentDanger} />
      </marker>
    </defs>
  );
}

export default DependencyEdge;
