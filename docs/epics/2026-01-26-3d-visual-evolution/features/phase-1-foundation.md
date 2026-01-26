# Phase 1: 3D Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace SVG rendering with Three.js, implementing perspective camera with locked angle, organic orb task nodes with three-layer cognitive load visualization, hybrid edges with flowing particles, and integrating with existing Orrery state management.

**Architecture:** React Three Fiber (R3F) provides a React-native declarative interface to Three.js. We wrap the existing MicroView component's SVG rendering with a new 3D canvas while maintaining the same state management (useOrrery hook) and interaction patterns. The camera is perspective but locked at a fixed angle to show depth from Day 1.

**Tech Stack:**
- `three` ^0.160.0 - Core 3D library
- `@react-three/fiber` ^8.15.0 - React integration
- `@react-three/drei` ^9.88.0 - Useful helpers (Sphere, Ring, Html, QuadraticBezierLine)
- `@react-three/postprocessing` ^2.15.0 - Bloom/glow effects

---

## Phase 1A: Dependencies and Canvas Foundation

**Objective:** Install Three.js dependencies and create the base OrreryCanvas wrapper with perspective camera and bloom post-processing.
**Verification:**
- Canvas renders without errors
- Camera shows depth perspective (nodes at different Z positions would appear at different sizes)
- Bloom effect visible on emissive materials

### Task 1.1: Install Three.js Dependencies

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/package.json`

**Step 1: Install packages**

Run:
```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm install three@^0.160.0 @react-three/fiber@^8.15.0 @react-three/drei@^9.88.0 @react-three/postprocessing@^2.15.0
```

**Step 2: Verify installation**

Run: `npm ls three @react-three/fiber @react-three/drei @react-three/postprocessing`
Expected: All packages listed without errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add Three.js and react-three-fiber for 3D rendering"
```

---

### Task 1.2: Create Three.js Component Directory Structure

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/index.js`

**Step 1: Create directory and index**

```javascript
// ═══════════════════════════════════════════════════════════════
// components/three/index.js
// 3D component exports for The Orrery
// ═══════════════════════════════════════════════════════════════

export { OrreryCanvas } from './OrreryCanvas';
export { TaskSphere } from './TaskSphere';
export { DependencyTube } from './DependencyTube';
export { CosmicParticles } from './CosmicParticles';
```

**Step 2: Commit**

```bash
git add src/components/three/
git commit -m "chore: create three.js component directory structure"
```

---

### Task 1.3: Create OrreryCanvas Component

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/OrreryCanvas.jsx`

**Step 1: Write the OrreryCanvas component**

```jsx
// ═══════════════════════════════════════════════════════════════
// components/three/OrreryCanvas.jsx
// Main 3D canvas for The Orrery - React Three Fiber wrapper
//
// Phase 1: Perspective camera at locked angle (depth visible)
// Phase 2: Add OrbitControls for navigation
// ═══════════════════════════════════════════════════════════════

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { COLORS } from '@/constants';

/**
 * Main 3D canvas wrapper for The Orrery
 * Provides perspective camera, lighting, and post-processing
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 3D scene content
 */
export function OrreryCanvas({ children }) {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]} // Retina support, capped at 2x for performance
      style={{ background: COLORS.bgVoid }}
    >
      {/* Phase 1: Perspective camera at LOCKED angle
          Position creates slight downward angle for depth perception
          No orbit controls yet - camera is fixed but shows dimensionality */}
      <PerspectiveCamera
        makeDefault
        position={[0, -15, 40]}  // Slight downward angle
        fov={50}
        near={0.1}
        far={1000}
      />

      {/* Ambient light for base visibility */}
      <ambientLight intensity={0.3} />

      {/* Point light for depth cues and highlights */}
      <pointLight
        position={[0, 0, 50]}
        intensity={0.5}
        color="#ffffff"
      />

      {/* Secondary point light for rim lighting effect */}
      <pointLight
        position={[-30, 20, -20]}
        intensity={0.3}
        color={COLORS.accentPrimary}
      />

      {children}

      {/* Post-processing for bioluminescent glow effect */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.8}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}

export default OrreryCanvas;
```

**Step 2: Verify component imports correctly**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No import errors for OrreryCanvas

**Step 3: Commit**

```bash
git add src/components/three/OrreryCanvas.jsx src/components/three/index.js
git commit -m "feat(3d): add OrreryCanvas with perspective camera and bloom

- Perspective camera at locked angle for Day 1 depth
- Bloom post-processing for bioluminescent glow
- Ambient + point lights for depth cues"
```

---

## Phase 1B: TaskSphere - 3D Task Node

**Objective:** Create 3D task node with organic orb appearance, three-layer cognitive load visualization (color, glow, pulse), and HTML overlays for labels.
**Verification:**
- Spheres render at correct positions
- Status colors match existing 2D design system
- Cognitive load affects color temperature, glow intensity, and pulse speed
- Hover/selection shows title tooltip

### Task 1.4: Create TaskSphere Component - Core Structure

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/TaskSphere.jsx`

**Step 1: Write TaskSphere with three-layer cognitive load system**

```jsx
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
  locked: '🔒',
  available: '◉',
  in_progress: '▶',
  completed: '✓',
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
            {STATUS_ICONS[status] || '◉'}
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
```

**Step 2: Update index exports**

Update `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/index.js` to ensure TaskSphere is exported.

**Step 3: Commit**

```bash
git add src/components/three/TaskSphere.jsx src/components/three/index.js
git commit -m "feat(3d): add TaskSphere with three-layer cognitive load

- Organic orb with breathing animation via useFrame
- Layer 1: Color temperature (green→cyan→yellow→orange→red)
- Layer 2: Glow intensity multiplier
- Layer 3: Pulse speed + amplitude (nervous system)
- HTML overlays for status icon and title tooltip
- Selection ring and quest badge"
```

---

## Phase 1C: DependencyTube - Hybrid Edges

**Objective:** Create 3D edges with thin glowing bezier curves and flowing particles along the path.
**Verification:**
- Edges connect sphere surfaces correctly
- Particles flow continuously along edges
- Selection and unlock states change appearance

### Task 1.5: Create DependencyTube Component

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/DependencyTube.jsx`

**Step 1: Write DependencyTube with hybrid line + particles**

```jsx
// ═══════════════════════════════════════════════════════════════
// components/three/DependencyTube.jsx
// 3D Dependency Edge - Hybrid line + flowing particles
//
// Visual: Thin glowing bezier curve with particles flowing along
// "Celestial vine" aesthetic: organic, alive, energy flowing
// ═══════════════════════════════════════════════════════════════

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '@/constants';

const SPHERE_RADIUS = 1; // Must match TaskSphere
const PARTICLE_COUNT = 5; // Flowing particles per edge

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

  // ─── Animate flowing particles ─────────────────────────────
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Animate each particle along the curve
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return;

      // Stagger particles along the path
      const offset = i / PARTICLE_COUNT;
      const speed = isUnlocking ? 0.5 : 0.3; // Faster when unlocking
      const t = ((time * speed) + offset) % 1; // 0→1 position along curve

      // Get position on bezier curve
      const pos = curve.getPoint(t);
      particle.position.copy(pos);

      // Particles glow brighter when unlocking
      if (particle.material) {
        particle.material.opacity = isUnlocking ? 0.9 : 0.5;
      }
    });

    // Animate line dash offset when unlocking
    if (isUnlocking && lineRef.current?.material) {
      lineRef.current.material.dashOffset -= 0.05;
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
        opacity={0.6}
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
          args={[0.08, 8, 8]} // Small particle spheres
        >
          <meshBasicMaterial
            color={particleColor}
            transparent
            opacity={0.5}
          />
        </Sphere>
      ))}
    </group>
  );
}

export default DependencyTube;
```

**Step 2: Update index exports**

**Step 3: Commit**

```bash
git add src/components/three/DependencyTube.jsx src/components/three/index.js
git commit -m "feat(3d): add DependencyTube with hybrid line + particles

- QuadraticBezierLine for visual connection path
- 5 flowing particles per edge via useFrame
- Unlock state: faster particles, brighter glow, dash animation
- Selection highlighting"
```

---

## Phase 1D: CosmicParticles Foundation

**Objective:** Create basic 3D particle system for background ambiance (foundation for Phase 3 organism behavior).
**Verification:**
- Particles render in background
- Gentle floating motion visible
- Does not interfere with task interaction

### Task 1.6: Create CosmicParticles Component

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/CosmicParticles.jsx`

**Step 1: Write CosmicParticles**

```jsx
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
```

**Step 2: Update index exports**

**Step 3: Commit**

```bash
git add src/components/three/CosmicParticles.jsx src/components/three/index.js
git commit -m "feat(3d): add CosmicParticles background system

- Floating particle field for cosmic ambiance
- Gentle floating motion via useFrame
- Foundation for Phase 3 focus attraction"
```

---

## Phase 1E: MicroView3D Integration

**Objective:** Create MicroView3D component that connects 3D rendering with existing Orrery state management and replaces SVG rendering.
**Verification:**
- 3D view renders all visible tasks and edges
- Click detection works (select task)
- Double-click starts session on available tasks
- Existing d3-force positions are converted to 3D coordinates

### Task 1.7: Create MicroView3D Component

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/views/MicroView/MicroView3D.jsx`

**Step 1: Write MicroView3D integration component**

```jsx
// ═══════════════════════════════════════════════════════════════
// components/views/MicroView/MicroView3D.jsx
// 3D Micro View - Integrates R3F canvas with Orrery state
//
// Replaces SVG rendering while maintaining:
// - Same state management (useOrrery hook)
// - Same task filtering logic
// - Same interaction patterns (click, double-click)
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react';
import { useOrrery } from '@/store';
import { getComputedTaskStatus } from '@/utils';
import { OrreryCanvas, TaskSphere, DependencyTube, CosmicParticles } from '@/components/three';
import { QUEST_COLORS } from '@/constants';

// Scale factor: d3 positions (pixels) to Three.js world units
// 100px in d3 space = 5 world units in Three.js
const SCALE = 0.05;

/**
 * MicroView3D - 3D visualization of task DAG
 * Connects Three.js rendering with Orrery state
 */
export function MicroView3D() {
  const { state, dispatch, api } = useOrrery();
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // ─── Filter tasks for current quest focus ──────────────────
  const visibleTasks = useMemo(() => {
    let tasks = state.tasks;

    if (state.preferences.focusQuestId) {
      tasks = tasks.filter(t =>
        t.questIds.includes(state.preferences.focusQuestId)
      );
    }

    // Apply "Actual" filter (hide locked tasks)
    if (state.preferences.showActualOnly) {
      tasks = tasks.filter(t => {
        const status = getComputedTaskStatus(t, state);
        return status === 'available' || status === 'in_progress' || status === 'completed';
      });
    }

    return tasks;
  }, [state.tasks, state.preferences.focusQuestId, state.preferences.showActualOnly, state]);

  // ─── Filter edges between visible tasks ────────────────────
  const visibleEdges = useMemo(() => {
    const visibleIds = new Set(visibleTasks.map(t => t.id));
    return state.edges.filter(e =>
      visibleIds.has(e.source) && visibleIds.has(e.target)
    );
  }, [state.edges, visibleTasks]);

  // ─── Prepare quests with colors ────────────────────────────
  const questsWithColors = useMemo(() =>
    state.quests.map((q, i) => ({
      id: q.id,
      title: q.title,
      color: q.themeColor || QUEST_COLORS[i % QUEST_COLORS.length],
    })),
    [state.quests]
  );

  // ─── Convert d3 positions to 3D coordinates ────────────────
  const getPosition = useCallback((task) => {
    // Use task's stored position, or default to origin
    const pos = task.position || { x: 0, y: 0 };
    return {
      x: pos.x * SCALE,
      y: -pos.y * SCALE, // Flip Y for 3D coordinate system (Y-up)
      z: 0, // Phase 2 will add Z-depth distribution by DAG layer
    };
  }, []);

  // ─── Handlers ──────────────────────────────────────────────
  const handleSelect = useCallback((taskId) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
  }, [selectedTaskId]);

  const handleDoubleClick = useCallback((task) => {
    const status = getComputedTaskStatus(task, state);
    if (status === 'available') {
      dispatch({
        type: 'START_SESSION',
        payload: { taskId: task.id, plannedMinutes: task.estimatedMinutes || 25 }
      });
    } else if (status === 'in_progress' && api) {
      api.completeTask(task.id).catch(e => console.error('Complete failed:', e));
    }
  }, [dispatch, state, api]);

  // ─── Get positions map for edges ───────────────────────────
  const positionsMap = useMemo(() => {
    const map = new Map();
    visibleTasks.forEach(task => {
      map.set(task.id, getPosition(task));
    });
    return map;
  }, [visibleTasks, getPosition]);

  return (
    <div
      className="micro-view-3d"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <OrreryCanvas>
        {/* Background particles */}
        <CosmicParticles count={100} />

        {/* Render edges first (behind nodes in 3D via render order) */}
        {visibleEdges.map(edge => {
          const sourcePos = positionsMap.get(edge.source);
          const targetPos = positionsMap.get(edge.target);
          if (!sourcePos || !targetPos) return null;

          return (
            <DependencyTube
              key={edge.id}
              sourcePos={sourcePos}
              targetPos={targetPos}
              isSelected={false} // Edge selection TBD
              isUnlocking={false} // Unlock animation TBD in Phase 3
            />
          );
        })}

        {/* Render task nodes */}
        {visibleTasks.map(task => {
          const position = getPosition(task);
          const computedStatus = getComputedTaskStatus(task, state);

          return (
            <TaskSphere
              key={task.id}
              task={{
                ...task,
                status: computedStatus,
              }}
              position={position}
              isSelected={selectedTaskId === task.id}
              onSelect={handleSelect}
              onDoubleClick={handleDoubleClick}
              quests={questsWithColors}
            />
          );
        })}
      </OrreryCanvas>
    </div>
  );
}

export default MicroView3D;
```

**Step 2: Update MicroView index exports**

Update `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/views/MicroView/index.js`:

```javascript
export { MicroView } from './MicroView';
export { MicroView3D } from './MicroView3D';
```

**Step 3: Commit**

```bash
git add src/components/views/MicroView/MicroView3D.jsx src/components/views/MicroView/index.js
git commit -m "feat(3d): add MicroView3D integration component

- Connects R3F canvas with Orrery state (useOrrery)
- Same task filtering logic as 2D MicroView
- d3 positions converted to 3D world coordinates
- Click selection and double-click session start"
```

---

## Phase 1F: CSS and Feature Flag Integration

**Objective:** Add CSS for HTML overlays and integrate 3D view into App.jsx with feature flag.
**Verification:**
- HTML overlay labels styled correctly
- Feature flag allows switching between 2D and 3D views
- 3D view accessible via UI toggle or preference

### Task 1.8: Create CSS for 3D HTML Overlays

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/styles/three.css`

**Step 1: Write overlay styles**

```css
/* ═══════════════════════════════════════════════════════════════
   styles/three.css
   CSS for Three.js HTML overlays (via drei Html component)
   ═══════════════════════════════════════════════════════════════ */

/* Task sphere status icon */
.task-sphere-label {
  font-size: 20px;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.8);
  user-select: none;
}

/* Task sphere title tooltip */
.task-sphere-title {
  background: rgba(26, 28, 40, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  color: #f0f4f8;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  pointer-events: none;
}

/* Glass effect helper */
.task-sphere-title.glass {
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Canvas container */
.micro-view-3d {
  position: relative;
  overflow: hidden;
}

.micro-view-3d canvas {
  touch-action: none; /* Enable touch gestures */
  outline: none;
}

/* Prevent text selection during 3D interaction */
.micro-view-3d * {
  user-select: none;
}
```

**Step 2: Import CSS in main entry**

Update `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/main.jsx` to import the new CSS:

```javascript
import './styles/three.css';
```

**Step 3: Commit**

```bash
git add src/styles/three.css src/main.jsx
git commit -m "style: add CSS for 3D HTML overlays

- Task sphere label and title tooltip styles
- Glass effect with backdrop blur
- Canvas container touch-action handling"
```

---

### Task 1.9: Add Feature Flag and View Toggle in App.jsx

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/App.jsx`

**Step 1: Add 3D view import and feature flag state**

Add near the top imports:
```javascript
import { MicroView3D } from '@/components/views/MicroView';
```

Add state for view mode (inside App component, after other useState calls):
```javascript
// 3D view feature flag - can be toggled via UI or localStorage
const [use3DView, setUse3DView] = useState(() => {
  const stored = localStorage.getItem('orrery-use-3d-view');
  return stored === 'true';
});

// Persist preference
const toggle3DView = useCallback(() => {
  setUse3DView(prev => {
    const next = !prev;
    localStorage.setItem('orrery-use-3d-view', String(next));
    return next;
  });
}, []);
```

**Step 2: Add toggle button in toolbar and conditional rendering**

In the toolbar section, add a toggle button:
```jsx
{/* 3D View Toggle */}
<button
  onClick={toggle3DView}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: use3DView ? COLORS.accentPrimary + '20' : COLORS.bgElevated,
    border: `1px solid ${use3DView ? COLORS.accentPrimary : COLORS.textMuted}40`,
    borderRadius: '6px',
    color: use3DView ? COLORS.accentPrimary : COLORS.textSecondary,
    fontSize: '13px',
    cursor: 'pointer',
  }}
  title={use3DView ? 'Switch to 2D view' : 'Switch to 3D view'}
>
  {use3DView ? '3D' : '2D'}
</button>
```

In the view rendering section, replace:
```jsx
{currentView === 'micro' && <MicroView />}
```
with:
```jsx
{currentView === 'micro' && (
  use3DView ? <MicroView3D /> : <MicroView />
)}
```

**Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat(3d): add feature flag and toggle for 3D view

- localStorage persisted preference
- Toggle button in toolbar (2D/3D)
- Conditional rendering of MicroView vs MicroView3D"
```

---

## Phase 1G: Browser Verification and Polish

**Objective:** Verify 3D rendering works correctly in browser, fix any issues, and ensure 60fps performance.
**Verification:**
- Canvas renders without console errors
- All visible tasks appear as spheres
- Edges connect correctly between spheres
- Particles animate in background
- Click/double-click interactions work
- 60fps performance with 50+ nodes (if available)
- Feature flag toggle works

### Task 1.10: Browser Verification

**Step 1: Start development server**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run dev`

**Step 2: Manual verification checklist**

Open browser to localhost URL and verify:
- [ ] 3D toggle button appears in toolbar
- [ ] Clicking toggle switches to 3D view
- [ ] OrreryCanvas renders without errors (check console)
- [ ] TaskSpheres appear for each task at correct positions
- [ ] DependencyTubes connect spheres correctly
- [ ] Particles animate in background
- [ ] Click on sphere selects it (shows ring and tooltip)
- [ ] Double-click on available task starts session
- [ ] Hover shows title tooltip
- [ ] Status colors match design system
- [ ] Cognitive load glow visible
- [ ] Bloom post-processing creates glow effect
- [ ] Performance: 60fps feels smooth (no stuttering)
- [ ] Feature flag allows switching back to 2D

**Step 3: Fix any issues discovered**

If issues found, create targeted fixes and commit.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(3d): Phase 1 complete - 3D Foundation

Phase 1 delivers:
- OrreryCanvas with perspective camera (locked angle)
- TaskSphere with three-layer cognitive load visualization
- DependencyTube with hybrid line + flowing particles
- CosmicParticles background system
- MicroView3D integration with existing state
- Feature flag for 2D/3D toggle

Ready for Phase 2: Depth & Camera (orbit controls, Z-distribution)"
```

---

## Epic Integration

### Dependencies

This feature depends on:
- **None** (Wave 1 - first feature in epic)

### Provides To

This feature provides to dependent features:

**Phase 2: Depth & Camera** (Wave 2)
- `OrreryCanvas.jsx` with camera mounting point (PerspectiveCamera component)
- Established R3F Canvas structure for adding OrbitControls
- Lighting setup that works with depth navigation

**Phase 3: Organism Behavior** (Wave 2)
- `TaskSphere.jsx` base component for animation enhancement
- `useFrame` animation patterns established
- `CosmicParticles.jsx` foundation for focus attraction behavior
- Basic particle infrastructure via flowing edge particles

### Integration Verification

- [ ] OrreryCanvas accepts children and renders them correctly
- [ ] TaskSphere exposes consistent props interface for Phase 3 animation hooks
- [ ] CosmicParticles `focusPosition` prop works (foundation for Phase 3)
- [ ] DependencyTube `isUnlocking` prop triggers animation (foundation for Phase 3)
- [ ] All components import from `@/components/three` barrel export

### Handoff Criteria

Before Phase 2 and Phase 3 can start:
- [ ] All Phase 1 tasks completed and committed
- [ ] 3D view renders without errors in browser
- [ ] Feature flag allows fallback to 2D (safety net)
- [ ] Performance is acceptable (60fps with test data)
- [ ] Integration points documented (this section)

---

## Summary

| Phase | Tasks | Objective |
|-------|-------|-----------|
| 1A | 1.1-1.3 | Dependencies and Canvas Foundation |
| 1B | 1.4 | TaskSphere - 3D Task Node |
| 1C | 1.5 | DependencyTube - Hybrid Edges |
| 1D | 1.6 | CosmicParticles Foundation |
| 1E | 1.7 | MicroView3D Integration |
| 1F | 1.8-1.9 | CSS and Feature Flag |
| 1G | 1.10 | Browser Verification |

**Total Tasks:** 10
**Estimated Duration:** 4-5 days
**Critical Path:** 1.1 -> 1.3 -> 1.4 -> 1.5 -> 1.7 -> 1.9 -> 1.10
