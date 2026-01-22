// src/components/edges/CelestialVine.jsx
// Organic vine connections between quests (inquiries)
// Represents affinity/resonance between research programs

import { useMemo } from 'react';
import { COLORS } from '@/constants';

/**
 * CelestialVine - Organic curved connection between quests
 *
 * @param {Object} sourcePos - {x, y} center of source quest
 * @param {Object} targetPos - {x, y} center of target quest
 * @param {number} strength - 0-1 affinity strength (affects curve and thickness)
 * @param {string} sourceColor - Color of source quest
 * @param {string} targetColor - Color of target quest
 * @param {string} reason - Why these quests are connected (tooltip)
 * @param {boolean} isHovered - Whether either quest is hovered
 * @param {Function} onClick - Click handler
 */
export function CelestialVine({
  sourcePos,
  targetPos,
  strength = 0.5,
  sourceColor = COLORS.accentPrimary,
  targetColor = COLORS.accentSecondary,
  reason = '',
  isHovered = false,
  onClick,
}) {
  // Generate unique gradient ID
  const gradientId = useMemo(() =>
    `vine-grad-${Math.round(sourcePos.x)}-${Math.round(sourcePos.y)}-${Math.round(targetPos.x)}`,
    [sourcePos.x, sourcePos.y, targetPos.x]
  );

  // Calculate bezier curve
  const pathData = useMemo(() => {
    const midX = (sourcePos.x + targetPos.x) / 2;
    const midY = (sourcePos.y + targetPos.y) / 2;

    // Curve offset based on strength - weaker = more curve (uncertain connection)
    const curveOffset = 60 * (1 - strength);

    // Perpendicular offset direction (alternating based on position for variety)
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Perpendicular unit vector
    const perpX = -dy / dist;
    const perpY = dx / dist;

    // Control point offset perpendicular to the line
    const ctrlX = midX + perpX * curveOffset;
    const ctrlY = midY + perpY * curveOffset;

    return `M ${sourcePos.x} ${sourcePos.y} Q ${ctrlX} ${ctrlY}, ${targetPos.x} ${targetPos.y}`;
  }, [sourcePos, targetPos, strength]);

  // Thickness based on strength (stronger = thicker)
  const strokeWidth = 2 + strength * 4;

  // Opacity based on strength
  const baseOpacity = 0.4 + strength * 0.4;
  const opacity = isHovered ? Math.min(baseOpacity + 0.3, 1) : baseOpacity;

  return (
    <g
      className="celestial-vine"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse"
          x1={sourcePos.x} y1={sourcePos.y}
          x2={targetPos.x} y2={targetPos.y}
        >
          <stop offset="0%" stopColor={sourceColor} stopOpacity={opacity} />
          <stop offset="50%" stopColor={COLORS.textMuted} stopOpacity={opacity * 0.7} />
          <stop offset="100%" stopColor={targetColor} stopOpacity={opacity} />
        </linearGradient>

        {/* Glow filter for hover state */}
        <filter id={`${gradientId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow (when hovered) */}
      {isHovered && (
        <path
          d={pathData}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          opacity={0.3}
          filter={`url(#${gradientId}-glow)`}
        />
      )}

      {/* Main vine path */}
      <path
        d={pathData}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={isHovered ? 'none' : `${10 + strength * 10} ${5 - strength * 3}`}
        style={{
          transition: 'stroke-width 0.2s, opacity 0.2s',
        }}
      >
        {reason && <title>{reason}</title>}
      </path>

      {/* Animated particles flowing along the vine (CSS animation) */}
      {isHovered && (
        <circle r={3} fill={sourceColor} opacity={0.8}>
          <animateMotion
            dur={`${2 - strength}s`}
            repeatCount="indefinite"
            path={pathData}
          />
        </circle>
      )}
    </g>
  );
}

/**
 * VinesDefs - SVG definitions for vine effects
 * Include once in the SVG container
 */
export function VinesDefs() {
  return (
    <defs>
      {/* Shared glow filter */}
      <filter id="vine-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

export default CelestialVine;
