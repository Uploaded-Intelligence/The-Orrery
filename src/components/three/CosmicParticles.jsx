// ═══════════════════════════════════════════════════════════════
// components/three/CosmicParticles.jsx
// 3D Particle System - Background cosmic ambiance
//
// Phase 1: Basic floating particles
// Phase 3: Will add focus attraction and session response
// ═══════════════════════════════════════════════════════════════

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { COLORS } from '@/constants';

/**
 * CosmicParticles - Background particle field
 *
 * @param {Object} props
 * @param {number} props.count - Number of particles (default 100)
 * @param {{x: number, y: number, z?: number}|null} props.focusPosition - Optional attraction point
 */
export function CosmicParticles({ count = 100, focusPosition = null }) {
  const pointsRef = useRef();

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

  // ─── Animate particles ─────────────────────────────────────
  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Gentle floating motion
      positions[i3 + 1] += Math.sin(time * 0.5 + i) * 0.002;
      positions[i3] += Math.cos(time * 0.3 + i * 0.5) * 0.001;

      // If focused, drift toward focus position (Phase 3 enhancement)
      if (focusPosition) {
        const dx = focusPosition.x - positions[i3];
        const dy = focusPosition.y - positions[i3 + 1];
        positions[i3] += dx * 0.0001;
        positions[i3 + 1] += dy * 0.0001;
      }

      // Wrap around bounds
      if (positions[i3 + 1] > 50) positions[i3 + 1] = -50;
      if (positions[i3 + 1] < -50) positions[i3 + 1] = 50;
      if (positions[i3] > 50) positions[i3] = -50;
      if (positions[i3] < -50) positions[i3] = 50;
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
        color={COLORS.accentSecondary}
        size={0.2}
        sizeAttenuation
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

export default CosmicParticles;
