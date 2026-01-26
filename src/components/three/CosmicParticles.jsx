// ═══════════════════════════════════════════════════════════════
// components/three/CosmicParticles.jsx
// 3D Particle System - Background cosmic ambiance
//
// Phase 3: Focus attraction and session state response
// - Particles drift toward focused task
// - Session state affects color, opacity, and behavior
// ═══════════════════════════════════════════════════════════════

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { useVRPerformance } from './VRPerformanceManager';

// ─── Focus Attraction Parameters ────────────────────────────
const FOCUS_ATTRACTION_STRENGTH = 0.0003;  // Very subtle drift
const FOCUS_ATTRACTION_RADIUS = 30;         // Only particles within this radius are affected
const FOCUS_REPULSION_RADIUS = 5;           // Particles bounce back if too close

// ─── Session State Parameters ───────────────────────────────
const SESSION_STATE_COLORS = {
  idle: '#22d3ee',       // Cyan - calm
  active: '#34d399',     // Green - productive
  completing: '#fbbf24', // Yellow - energy burst
};

const SESSION_STATE_INTENSITY = {
  idle: 0.4,
  active: 0.6,
  completing: 0.9,
};

/**
 * CosmicParticles - Background particle field
 *
 * @param {Object} props
 * @param {number} props.count - Number of particles (default 100)
 * @param {{x: number, y: number, z?: number}|null} props.focusPosition - Optional attraction point
 * @param {'idle'|'active'|'completing'} props.sessionState - Current session state
 */
export function CosmicParticles({
  count: propCount,
  focusPosition = null,
  sessionState = 'idle',
}) {
  const pointsRef = useRef();
  const { particleCount: vrParticleCount, isVR } = useVRPerformance();

  // Use VR-optimized count when in VR, otherwise prop or default
  const count = isVR ? vrParticleCount : (propCount || 100);

  // ─── Generate random particle positions ────────────────────
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;     // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;  // Z (shallower depth)
    }
    return positions;
  }, [count]);

  // ─── Animate particles with focus attraction ────────────────
  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const px = positions[i3];
      const py = positions[i3 + 1];
      const pz = positions[i3 + 2];

      // Base: Gentle floating motion (always active)
      positions[i3 + 1] += Math.sin(time * 0.5 + i) * 0.002;
      positions[i3] += Math.cos(time * 0.3 + i * 0.5) * 0.001;

      // Focus attraction (if focusPosition is set)
      if (focusPosition) {
        const fz = focusPosition.z || 0;
        const dx = focusPosition.x - px;
        const dy = focusPosition.y - py;
        const dz = fz - pz;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Only attract particles within radius
        if (distance < FOCUS_ATTRACTION_RADIUS && distance > FOCUS_REPULSION_RADIUS) {
          // Attraction strength falls off with distance
          const strength = FOCUS_ATTRACTION_STRENGTH * (1 - distance / FOCUS_ATTRACTION_RADIUS);
          positions[i3] += dx * strength;
          positions[i3 + 1] += dy * strength;
          positions[i3 + 2] += dz * strength * 0.5; // Less Z movement
        } else if (distance <= FOCUS_REPULSION_RADIUS) {
          // Gentle repulsion to prevent clumping
          const repulsion = 0.001;
          positions[i3] -= dx * repulsion;
          positions[i3 + 1] -= dy * repulsion;
        }
      }

      // Session state: Extra movement during "completing" burst
      if (sessionState === 'completing') {
        // Random outward burst
        const burstStrength = Math.sin(time * 10) * 0.005;
        positions[i3] += (Math.random() - 0.5) * burstStrength;
        positions[i3 + 1] += (Math.random() - 0.5) * burstStrength;
        positions[i3 + 2] += (Math.random() - 0.5) * burstStrength * 0.5;
      }

      // Wrap around bounds
      if (positions[i3 + 1] > 50) positions[i3 + 1] = -50;
      if (positions[i3 + 1] < -50) positions[i3 + 1] = 50;
      if (positions[i3] > 50) positions[i3] = -50;
      if (positions[i3] < -50) positions[i3] = 50;
      if (positions[i3 + 2] > 25) positions[i3 + 2] = -25;
      if (positions[i3 + 2] < -25) positions[i3 + 2] = 25;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        color={SESSION_STATE_COLORS[sessionState] || SESSION_STATE_COLORS.idle}
        size={sessionState === 'completing' ? 0.3 : 0.2}
        sizeAttenuation
        depthWrite={false}
        opacity={SESSION_STATE_INTENSITY[sessionState] || 0.4}
      />
    </Points>
  );
}

export default CosmicParticles;
