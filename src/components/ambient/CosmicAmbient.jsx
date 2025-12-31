// ═══════════════════════════════════════════════════════════════
// components/ambient/CosmicAmbient.jsx
// Living background - floating spores, depth layers, breathing world
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react';
import { COLORS } from '@/constants';

// Generate random particles once
function generateParticles(count, type) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${type}-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: type === 'spore' ? 2 + Math.random() * 3 : 1 + Math.random() * 1.5,
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 20,
    opacity: type === 'spore' ? 0.3 + Math.random() * 0.4 : 0.2 + Math.random() * 0.3,
    drift: -20 + Math.random() * 40, // horizontal drift
  }));
}

/**
 * CosmicAmbient - Living background layer
 * Renders floating particles that drift upward like spores
 */
export function CosmicAmbient({ intensity = 'normal' }) {
  const particleCounts = {
    minimal: { spores: 15, dust: 20 },
    normal: { spores: 25, dust: 35 },
    rich: { spores: 40, dust: 50 },
  };

  const counts = particleCounts[intensity] || particleCounts.normal;

  const spores = useMemo(() => generateParticles(counts.spores, 'spore'), [counts.spores]);
  const dust = useMemo(() => generateParticles(counts.dust, 'dust'), [counts.dust]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Deep cosmic gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 80%, ${COLORS.accentPrimary}08 0%, transparent 40%),
            radial-gradient(ellipse at 80% 20%, ${COLORS.accentSecondary}06 0%, transparent 35%),
            radial-gradient(ellipse at 50% 50%, ${COLORS.bgDeep} 0%, ${COLORS.bgVoid} 100%)
          `,
        }}
      />

      {/* Floating spores - larger, glowing */}
      {spores.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: COLORS.particleCore,
            boxShadow: `0 0 ${p.size * 2}px ${COLORS.glowCyan}`,
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}

      {/* Dust particles - smaller, subtle */}
      {dust.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: COLORS.particleDust,
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}

      {/* Keyframes */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: var(--opacity, 0.5);
          }
          90% {
            opacity: var(--opacity, 0.5);
          }
          100% {
            transform: translateY(-100vh) translateX(var(--drift, 0));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * LocalGlow - A glowing aura effect for individual elements
 */
export function LocalGlow({ color = COLORS.accentSecondary, size = 100, intensity = 0.3 }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        pointerEvents: 'none',
        animation: 'breathe 4s ease-in-out infinite',
      }}
    />
  );
}

export default CosmicAmbient;
