// ═══════════════════════════════════════════════════════════════
// components/three/TaskSphere.jsx
// 3D Task Node - Organic orb with three-layer cognitive load
//
// THREE-LAYER COGNITIVE LOAD SYSTEM (Game UI/UX Pattern):
// Layer 1 (Glance): Color temperature - peripheral vision scannable
// Layer 2 (Focus): Glow intensity - rewards looking at node
// Layer 3 (Visceral): Pulse speed + amplitude - nervous system
// ═══════════════════════════════════════════════════════════════

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html, Ring } from '@react-three/drei';
import { COLORS, QUEST_COLORS } from '@/constants';

const SPHERE_RADIUS = 1; // World units

// ─── Status Colors (base fill) ───────────────────────────────
const STATUS_COLORS = {
  locked: '#3d4255',
  available: '#7c3aed',
  in_progress: '#22d3ee',
  completed: '#34d399',
};

// ─── THREE-LAYER COGNITIVE LOAD SYSTEM ───────────────────────
// Layer 1 (Glance): Color temperature - peripheral vision
const COGNITIVE_COLORS = [
  '#6EE7B7', // Load 1 - Cool green (calm)
  '#22D3EE', // Load 2 - Cyan (alert)
  '#FBBF24', // Load 3 - Yellow (moderate)
  '#F97316', // Load 4 - Orange (demanding)
  '#EF4444', // Load 5 - Red (intense)
];

// Layer 2 (Focus): Glow intensity multipliers
const COGNITIVE_INTENSITY = [0.35, 0.5, 0.65, 0.8, 0.95];

// Layer 3 (Visceral): Pulse speed (Hz) and amplitude (scale factor)
const COGNITIVE_PULSE = [
  { speed: 1.5, amplitude: 0.02 }, // Load 1 - Slow, gentle
  { speed: 2.0, amplitude: 0.025 },
  { speed: 2.5, amplitude: 0.03 },
  { speed: 3.0, amplitude: 0.04 },
  { speed: 3.5, amplitude: 0.06 }, // Load 5 - Fast, urgent
];

// ─── Status Icons ────────────────────────────────────────────
const STATUS_ICONS = {
  locked: '\uD83D\uDD12',
  available: '\u25C9',
  in_progress: '\u25B6',
  completed: '\u2713',
};

/**
 * TaskSphere - 3D task node with organic orb aesthetic
 *
 * @param {Object} props
 * @param {Object} props.task - Task data from state
 * @param {{x: number, y: number, z?: number}} props.position - World position
 * @param {boolean} props.isSelected - Whether this task is selected
 * @param {Function} props.onSelect - Called when task is clicked
 * @param {Function} props.onDoubleClick - Called on double-click
 * @param {Array} props.quests - Quest list for badge colors
 */
export function TaskSphere({
  task,
  position,
  isSelected,
  onSelect,
  onDoubleClick,
  quests = [],
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // ─── Compute visual properties from task state ─────────────
  const status = task.status || 'available';
  const cognitiveLoad = Math.min(5, Math.max(1, task.cognitiveLoad || 3));
  const loadIndex = cognitiveLoad - 1;

  // Three-layer cognitive load visualization
  const baseColor = STATUS_COLORS[status];
  const glowColor = COGNITIVE_COLORS[loadIndex];           // Layer 1
  const glowIntensity = COGNITIVE_INTENSITY[loadIndex];    // Layer 2
  const { speed: pulseSpeed, amplitude: pulseAmplitude } = COGNITIVE_PULSE[loadIndex]; // Layer 3

  // ─── Animation: Breathing + Organic Wobble ─────────────────
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    // Layer 3: Pulsation based on cognitive load
    // Higher load = faster, more urgent pulse (nervous system engagement)
    const breathe = 1 + Math.sin(time * pulseSpeed) * pulseAmplitude;
    meshRef.current.scale.setScalar(breathe);

    // Organic wobble (subtle surface variation feel)
    meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.02;
    meshRef.current.rotation.y = Math.cos(time * 0.4) * 0.02;
  });

  // ─── Quest badge color ─────────────────────────────────────
  const primaryQuestId = task.questIds?.[0];
  const primaryQuest = quests.find(q => q.id === primaryQuestId);
  const questColor = primaryQuest?.color || QUEST_COLORS[0];

  // ─── Position with Z default ───────────────────────────────
  const pos = [position.x, position.y, position.z || 0];

  return (
    <group position={pos}>
      {/* Main organic orb */}
      <Sphere
        ref={meshRef}
        args={[SPHERE_RADIUS, 32, 32]} // Enough segments for smooth appearance
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(task.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick?.(task);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial
          color={baseColor}
          emissive={glowColor}
          emissiveIntensity={
            hovered || isSelected
              ? glowIntensity + 0.2  // Boost on interaction
              : glowIntensity
          }
          roughness={0.7}  // Slightly matte for organic feel
          metalness={0.1}  // Low metalness = biological
          transparent
          opacity={status === 'locked' ? 0.5 : 1}
        />
      </Sphere>

      {/* Selection ring */}
      {isSelected && (
        <Ring
          args={[SPHERE_RADIUS * 1.2, SPHERE_RADIUS * 1.35, 64]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color={COLORS.accentSecondary}
            transparent
            opacity={0.8}
          />
        </Ring>
      )}

      {/* Cognitive load glow ring */}
      <Ring
        args={[
          SPHERE_RADIUS * 1.05,
          SPHERE_RADIUS * 1.1 + cognitiveLoad * 0.02,
          64
        ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.3 + cognitiveLoad * 0.1}
        />
      </Ring>

      {/* Quest badge (small sphere at bottom) */}
      {primaryQuestId && (
        <Sphere
          args={[0.15, 16, 16]}
          position={[0, -SPHERE_RADIUS * 0.8, SPHERE_RADIUS * 0.3]}
        >
          <meshStandardMaterial
            color={questColor}
            emissive={questColor}
            emissiveIntensity={0.3}
          />
        </Sphere>
      )}

      {/* Status icon - HTML overlay (only on hover/select) */}
      {(hovered || isSelected) && (
        <Html
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
        >
          <div className="task-sphere-label">
            {STATUS_ICONS[status] || '\u25C9'}
          </div>
        </Html>
      )}

      {/* Title tooltip - HTML overlay (only on hover/select) */}
      {(hovered || isSelected) && (
        <Html
          position={[0, -SPHERE_RADIUS * 1.5, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
        >
          <div className="task-sphere-title glass">
            {task.title}
          </div>
        </Html>
      )}
    </group>
  );
}

export default TaskSphere;
