// ═══════════════════════════════════════════════════════════════
// components/three/DependencyTube.jsx
// 3D Dependency Edge - Hybrid line + flowing particles
//
// Visual: Thin glowing bezier curve with particles flowing along
// "Celestial vine" aesthetic: organic, alive, energy flowing
// ═══════════════════════════════════════════════════════════════

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { QuadraticBezierLine, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '@/constants';

// ─── Distance-based depth perception constants ──────────────
const FOCUS_DISTANCE = 30;
const FADE_DISTANCE = 80;
const MIN_OPACITY = 0.2;  // Edges can fade more than spheres

const SPHERE_RADIUS = 1; // Must match TaskSphere
const PARTICLE_COUNT = 5; // Flowing particles per edge

// ─── Unlock Animation Parameters ────────────────────────────
const NORMAL_PARTICLE_SPEED = 0.3;
const UNLOCK_PARTICLE_SPEED = 0.8;  // 2.5x faster during unlock
const UNLOCK_PARTICLE_SIZE = 0.12;  // 1.5x larger during unlock
const NORMAL_PARTICLE_SIZE = 0.08;

/**
 * DependencyTube - 3D edge between task spheres
 *
 * @param {Object} props
 * @param {{x: number, y: number, z?: number}} props.sourcePos - Source task position
 * @param {{x: number, y: number, z?: number}} props.targetPos - Target task position
 * @param {boolean} props.isUnlocking - Animate unlock energy flow
 * @param {boolean} props.isSelected - Highlight when selected
 */
export function DependencyTube({
  sourcePos,
  targetPos,
  isUnlocking = false,
  isSelected = false,
}) {
  const lineRef = useRef();
  const particlesRef = useRef([]);

  // ─── Calculate bezier curve ────────────────────────────────
  const { start, end, mid, curve } = useMemo(() => {
    const srcZ = sourcePos.z || 0;
    const tgtZ = targetPos.z || 0;

    const srcCenter = new THREE.Vector3(sourcePos.x, sourcePos.y, srcZ);
    const tgtCenter = new THREE.Vector3(targetPos.x, targetPos.y, tgtZ);

    // Direction from source to target
    const dir = tgtCenter.clone().sub(srcCenter).normalize();

    // Start/end at sphere surfaces
    const start = srcCenter.clone().add(dir.clone().multiplyScalar(SPHERE_RADIUS));
    const end = tgtCenter.clone().sub(dir.clone().multiplyScalar(SPHERE_RADIUS));

    // Bezier midpoint with perpendicular offset for curve
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const perpendicular = new THREE.Vector3(-dir.y, dir.x, 0);
    const curveAmount = start.distanceTo(end) * 0.1;
    const mid = midpoint.clone().add(perpendicular.multiplyScalar(curveAmount));

    // Create bezier curve for particle animation
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

    return { start, end, mid, curve };
  }, [sourcePos, targetPos]);

  // ─── Calculate distance-based opacity ─────────────────────────
  const { camera } = useThree();

  // Calculate average distance of edge from camera (use midpoint)
  const edgeMidpoint = useMemo(() => {
    const srcZ = sourcePos.z || 0;
    const tgtZ = targetPos.z || 0;
    return new THREE.Vector3(
      (sourcePos.x + targetPos.x) / 2,
      (sourcePos.y + targetPos.y) / 2,
      (srcZ + tgtZ) / 2
    );
  }, [sourcePos, targetPos]);

  // Use ref to track distance opacity (updated in useFrame)
  const distanceOpacityRef = useRef(1);
  useFrame(() => {
    const edgeDistance = camera.position.distanceTo(edgeMidpoint);
    if (edgeDistance <= FOCUS_DISTANCE) {
      distanceOpacityRef.current = 1;
    } else if (edgeDistance >= FADE_DISTANCE) {
      distanceOpacityRef.current = MIN_OPACITY;
    } else {
      const t = (edgeDistance - FOCUS_DISTANCE) / (FADE_DISTANCE - FOCUS_DISTANCE);
      distanceOpacityRef.current = 1 - t * (1 - MIN_OPACITY);
    }
  });
  const distanceOpacity = distanceOpacityRef.current;

  // ─── Animate flowing particles + unlock energy ──────────────
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Particle speed based on unlock state
    const speed = isUnlocking ? UNLOCK_PARTICLE_SPEED : NORMAL_PARTICLE_SPEED;

    // Animate each particle along the curve
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return;

      // Stagger particles along the path
      const offset = i / PARTICLE_COUNT;
      const t = ((time * speed) + offset) % 1; // 0->1 position along curve

      // Get position on bezier curve
      const pos = curve.getPoint(t);
      particle.position.copy(pos);

      // Particles glow brighter and larger when unlocking
      if (particle.material) {
        particle.material.opacity = isUnlocking ? 0.95 : 0.5;
      }

      // Scale particles during unlock
      const particleScale = isUnlocking ? UNLOCK_PARTICLE_SIZE / NORMAL_PARTICLE_SIZE : 1;
      particle.scale.setScalar(particleScale);
    });

    // Animate line dash offset when unlocking (energy flow direction)
    if (isUnlocking && lineRef.current?.material) {
      lineRef.current.material.dashOffset -= 0.08; // Faster dash flow
    }
  });

  // ─── Colors based on state ─────────────────────────────────
  const lineColor = isUnlocking
    ? COLORS.accentSecondary
    : isSelected
      ? COLORS.accentTertiary
      : '#5a6577';

  const particleColor = isUnlocking
    ? COLORS.accentSecondary
    : COLORS.accentPrimary;

  const lineWidth = isUnlocking ? 3 : isSelected ? 2 : 1;

  return (
    <group>
      {/* BASE LINE: Thin glowing bezier curve */}
      <QuadraticBezierLine
        ref={lineRef}
        start={start}
        end={end}
        mid={mid}
        color={lineColor}
        lineWidth={lineWidth}
        transparent
        opacity={0.6 * distanceOpacity}
        dashed={isUnlocking}
        dashScale={5}
        dashSize={0.5}
        gapSize={0.2}
      />

      {/* FLOWING PARTICLES: Energy moving along the edge */}
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Sphere
          key={i}
          ref={(el) => (particlesRef.current[i] = el)}
          args={[NORMAL_PARTICLE_SIZE, 8, 8]}
        >
          <meshBasicMaterial
            color={particleColor}
            transparent
            opacity={0.5 * distanceOpacity}
          />
        </Sphere>
      ))}
    </group>
  );
}

export default DependencyTube;
