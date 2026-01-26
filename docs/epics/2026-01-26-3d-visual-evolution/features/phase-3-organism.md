# Phase 3: Organism Behavior Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port cascade unlock animations to 3D, enhance CosmicParticles with focus attraction and session state response, and add readiness glow shader to create a "living 3D ecosystem" feel.

**Architecture:** Phase 3 builds on Phase 1's component foundations. TaskSphere gains cascade unlock animation state, DependencyTube gets energy flow during unlocks, CosmicParticles becomes responsive to focus and session state, and a new ReadinessMaterial shader provides gradient glow based on upstream completion. All animations use the `useFrame` pattern established in Phase 1.

**Tech Stack:**
- React Three Fiber (established in Phase 1)
- `@react-three/drei` - Sphere, shaderMaterial
- Three.js shaders - Custom GLSL for readiness gradient
- Existing Orrery state management (useOrrery hook)

**Depends On:** Phase 1: 3D Foundation (must be complete)

---

## Phase 3A: TaskSphere Cascade Unlock Animation

**Objective:** Add cascade unlock animation to TaskSphere - when a task unlocks due to dependency completion, it pulses with a scale animation that propagates through the DAG.
**Verification:**
- Completing a task triggers unlock animation on dependent tasks
- Animation has noticeable scale pulse (1.0 -> 1.2 -> 1.0)
- Multiple tasks animate in sequence with staggered timing
- Animation does not interfere with normal breathing animation

### Task 3.1: Add Unlock Animation State to TaskSphere

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/TaskSphere.jsx`

**Step 1: Add unlock animation state and effect**

Add these imports and state at the top of the TaskSphere function:

```jsx
import { useRef, useState, useEffect } from 'react';
```

Add after the existing state declarations:

```jsx
// ─── Cascade Unlock Animation State ─────────────────────────
const [isUnlocking, setIsUnlocking] = useState(false);
const unlockStartTimeRef = useRef(null);

// Watch for unlock animation trigger from task state
useEffect(() => {
  if (task._unlockAnimationStart) {
    // Calculate delay based on cascade timing
    const delay = Math.max(0, task._unlockAnimationStart - Date.now());
    const timer = setTimeout(() => {
      setIsUnlocking(true);
      unlockStartTimeRef.current = Date.now();
      // Reset after animation duration (600ms)
      setTimeout(() => {
        setIsUnlocking(false);
        unlockStartTimeRef.current = null;
      }, 600);
    }, delay);
    return () => clearTimeout(timer);
  }
}, [task._unlockAnimationStart]);
```

**Step 2: Integrate unlock animation into useFrame**

Replace the existing useFrame callback with this enhanced version:

```jsx
// ─── Animation: Breathing + Organic Wobble + Unlock ─────────
useFrame((state) => {
  if (!meshRef.current) return;
  const time = state.clock.elapsedTime;

  // BASE SCALE: Layer 3 pulsation based on cognitive load
  let scale = 1 + Math.sin(time * pulseSpeed) * pulseAmplitude;

  // UNLOCK ANIMATION: Override with scale pulse when unlocking
  if (isUnlocking && unlockStartTimeRef.current) {
    const elapsed = Date.now() - unlockStartTimeRef.current;
    const t = Math.min(elapsed / 600, 1); // 0 -> 1 over 600ms

    // Ease-out elastic: grow then settle
    // Peak at t=0.3, settle by t=1.0
    const unlockScale = t < 0.3
      ? 1 + 0.2 * (t / 0.3)                    // 0->0.3: grow to 1.2
      : 1 + 0.2 * Math.cos((t - 0.3) * Math.PI / 0.7) * 0.5 + 0.1; // 0.3->1: settle with bounce

    scale = unlockScale;
  }

  meshRef.current.scale.setScalar(scale);

  // Organic wobble (subtle surface variation feel)
  meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.02;
  meshRef.current.rotation.y = Math.cos(time * 0.4) * 0.02;
});
```

**Step 3: Add visual feedback during unlock**

Update the meshStandardMaterial to boost glow during unlock:

```jsx
<meshStandardMaterial
  color={baseColor}
  emissive={glowColor}
  emissiveIntensity={
    isUnlocking
      ? glowIntensity + 0.4  // Strong boost during unlock
      : hovered || isSelected
        ? glowIntensity + 0.2  // Boost on interaction
        : glowIntensity
  }
  roughness={0.7}
  metalness={0.1}
  transparent
  opacity={status === 'locked' ? 0.5 : 1}
/>
```

**Step 4: Verify component still renders**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 5: Commit**

```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery
git add src/components/three/TaskSphere.jsx
git commit -m "feat(3d): add cascade unlock animation to TaskSphere

- Watch task._unlockAnimationStart for cascade timing
- Scale pulse animation (1.0 -> 1.2 -> settle) over 600ms
- Boost emissive intensity during unlock
- Integrates with existing breathing animation"
```

---

## Phase 3B: DependencyTube Energy Flow Animation

**Objective:** Enhance DependencyTube to show energy flowing from completed task to newly unlocked task during cascade unlock.
**Verification:**
- When isUnlocking=true, particles flow faster and brighter
- Line dashes animate in unlock direction
- Visual clearly shows "energy transfer" along the edge
- Animation returns to normal when unlock completes

### Task 3.2: Enhance DependencyTube Unlock Animation

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/DependencyTube.jsx`

**Step 1: Add unlock-specific animation parameters**

Add constants near the top of the file:

```jsx
const SPHERE_RADIUS = 1;
const PARTICLE_COUNT = 5;

// ─── Unlock Animation Parameters ────────────────────────────
const NORMAL_PARTICLE_SPEED = 0.3;
const UNLOCK_PARTICLE_SPEED = 0.8;  // 2.5x faster during unlock
const UNLOCK_PARTICLE_SIZE = 0.12;  // 1.5x larger during unlock
const NORMAL_PARTICLE_SIZE = 0.08;
```

**Step 2: Update useFrame for enhanced unlock animation**

Replace the existing useFrame callback:

```jsx
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
```

**Step 3: Update particle rendering for size variation**

Update the particle Sphere args to use base size (scaling handled in useFrame):

```jsx
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
      opacity={0.5}
    />
  </Sphere>
))}
```

**Step 4: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 5: Commit**

```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery
git add src/components/three/DependencyTube.jsx
git commit -m "feat(3d): enhance DependencyTube energy flow during unlock

- Particles 2.5x faster during unlock (0.3 -> 0.8)
- Particles 1.5x larger during unlock
- Increased particle opacity (0.5 -> 0.95)
- Faster dash animation for energy flow direction"
```

---

## Phase 3C: CosmicParticles Focus Attraction

**Objective:** Make CosmicParticles drift toward the focused/selected task, creating a subtle "attention follows focus" effect.
**Verification:**
- When focusPosition is set, particles slowly drift toward it
- Drift is subtle (not a vortex) - particles still float organically
- Particles don't clump at focus point (maintain spread)
- When focus clears, particles return to random floating

### Task 3.3: Enhance CosmicParticles Focus Drift

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/CosmicParticles.jsx`

**Step 1: Add focus attraction constants**

Add near the top of the file:

```jsx
// ─── Focus Attraction Parameters ────────────────────────────
const FOCUS_ATTRACTION_STRENGTH = 0.0003;  // Very subtle drift
const FOCUS_ATTRACTION_RADIUS = 30;         // Only particles within this radius are affected
const FOCUS_REPULSION_RADIUS = 5;           // Particles bounce back if too close
```

**Step 2: Replace useFrame with enhanced focus attraction**

Replace the existing useFrame callback:

```jsx
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
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery
git add src/components/three/CosmicParticles.jsx
git commit -m "feat(3d): add focus attraction to CosmicParticles

- Particles within 30 units drift toward focus position
- Repulsion at 5 units prevents clumping
- Strength falls off with distance for natural feel
- Z-axis movement reduced for visual stability"
```

---

### Task 3.4: Add Session State Response to CosmicParticles

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/CosmicParticles.jsx`

**Step 1: Add sessionState prop and response parameters**

Update the function signature and add constants:

```jsx
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
  count = 100,
  focusPosition = null,
  sessionState = 'idle',
}) {
```

**Step 2: Update PointMaterial to respond to session state**

Replace the PointMaterial component:

```jsx
<PointMaterial
  transparent
  color={SESSION_STATE_COLORS[sessionState] || SESSION_STATE_COLORS.idle}
  size={sessionState === 'completing' ? 0.3 : 0.2}
  sizeAttenuation
  depthWrite={false}
  opacity={SESSION_STATE_INTENSITY[sessionState] || 0.4}
/>
```

**Step 3: Add burst animation on completing state**

Add this inside useFrame, after the focus attraction code:

```jsx
// Session state: Extra movement during "completing" burst
if (sessionState === 'completing') {
  // Random outward burst
  const burstStrength = Math.sin(time * 10) * 0.005;
  positions[i3] += (Math.random() - 0.5) * burstStrength;
  positions[i3 + 1] += (Math.random() - 0.5) * burstStrength;
  positions[i3 + 2] += (Math.random() - 0.5) * burstStrength * 0.5;
}
```

**Step 4: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 5: Commit**

```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery
git add src/components/three/CosmicParticles.jsx
git commit -m "feat(3d): add session state response to CosmicParticles

- idle: cyan, 0.4 opacity (calm)
- active: green, 0.6 opacity (productive)
- completing: yellow, 0.9 opacity, burst animation
- Particles grow during completing state"
```

---

## Phase 3D: ReadinessMaterial Shader

**Objective:** Create a custom shader material that shows readiness gradient based on upstream dependency completion percentage.
**Verification:**
- Tasks show gradient fill based on readiness (0-100%)
- Gradient goes from bottom (dark) to fill level (glow color)
- Readiness of 0% shows minimal glow, 100% shows full glow
- Shader integrates with existing TaskSphere

### Task 3.5: Create ReadinessMaterial Component

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/ReadinessMaterial.jsx`

**Step 1: Write the ReadinessMaterial shader component**

```jsx
// ═══════════════════════════════════════════════════════════════
// components/three/ReadinessMaterial.jsx
// Custom shader for readiness gradient visualization
//
// Shows "fill level" based on upstream dependency completion
// Gradient rises from bottom as more dependencies complete
// ═══════════════════════════════════════════════════════════════

import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Vertex Shader ──────────────────────────────────────────
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ─── Fragment Shader ────────────────────────────────────────
const fragmentShader = `
  uniform vec3 baseColor;
  uniform vec3 glowColor;
  uniform float readiness;      // 0.0 - 1.0
  uniform float glowIntensity;
  uniform float time;
  uniform float opacity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Calculate fill level based on readiness (bottom to top)
    // vPosition.y goes from -1 to 1 on sphere
    float normalizedY = (vPosition.y + 1.0) / 2.0; // 0 at bottom, 1 at top
    float fillLevel = readiness;

    // Soft edge for the fill gradient
    float fillEdge = smoothstep(fillLevel - 0.1, fillLevel + 0.1, normalizedY);

    // Base color below fill, glow color at/above fill
    vec3 color = mix(glowColor, baseColor, fillEdge);

    // Emissive glow based on readiness and fill position
    float emissiveStrength = glowIntensity * (1.0 - fillEdge) * readiness;

    // Subtle pulse animation
    float pulse = 1.0 + sin(time * 2.0) * 0.05 * readiness;
    emissiveStrength *= pulse;

    // Rim lighting for 3D depth
    float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
    rim = pow(rim, 2.0) * 0.3;

    // Final color with emission
    vec3 finalColor = color + glowColor * emissiveStrength + vec3(rim);

    gl_FragColor = vec4(finalColor, opacity);
  }
`;

// ─── Create Shader Material ─────────────────────────────────
const ReadinessShaderMaterial = shaderMaterial(
  {
    baseColor: new THREE.Color('#3d4255'),
    glowColor: new THREE.Color('#7c3aed'),
    readiness: 0.0,
    glowIntensity: 0.5,
    time: 0,
    opacity: 1.0,
  },
  vertexShader,
  fragmentShader
);

// Extend Three.js with our custom material
extend({ ReadinessShaderMaterial });

/**
 * ReadinessMaterial - Wrapper component for readiness shader
 *
 * @param {Object} props
 * @param {string} props.baseColor - Base sphere color (hex)
 * @param {string} props.glowColor - Glow/emissive color (hex)
 * @param {number} props.readiness - Fill level 0-1 (0% to 100% ready)
 * @param {number} props.glowIntensity - Emissive intensity multiplier
 * @param {number} props.opacity - Material opacity
 */
export function ReadinessMaterial({
  baseColor = '#3d4255',
  glowColor = '#7c3aed',
  readiness = 0,
  glowIntensity = 0.5,
  opacity = 1.0,
}) {
  return (
    <readinessShaderMaterial
      baseColor={new THREE.Color(baseColor)}
      glowColor={new THREE.Color(glowColor)}
      readiness={readiness}
      glowIntensity={glowIntensity}
      opacity={opacity}
      transparent={opacity < 1}
      side={THREE.FrontSide}
    />
  );
}

export default ReadinessMaterial;
```

**Step 2: Update index exports**

Modify `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/index.js`:

```javascript
// ═══════════════════════════════════════════════════════════════
// components/three/index.js
// 3D component exports for The Orrery
// ═══════════════════════════════════════════════════════════════

export { OrreryCanvas } from './OrreryCanvas';
export { TaskSphere } from './TaskSphere';
export { DependencyTube } from './DependencyTube';
export { CosmicParticles } from './CosmicParticles';
export { ReadinessMaterial } from './ReadinessMaterial';
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery
git add src/components/three/ReadinessMaterial.jsx src/components/three/index.js
git commit -m "feat(3d): add ReadinessMaterial shader component

- Custom GLSL shader for readiness gradient
- Fill level rises from bottom based on readiness
- Emissive glow increases with readiness
- Subtle pulse animation proportional to readiness
- Rim lighting for 3D depth"
```

---

### Task 3.6: Add Time Uniform Animation to ReadinessMaterial

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/ReadinessMaterial.jsx`

**Step 1: Add useFrame for time uniform**

Update imports and add ref + animation:

```jsx
import { useRef } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
```

Update the ReadinessMaterial component:

```jsx
export function ReadinessMaterial({
  baseColor = '#3d4255',
  glowColor = '#7c3aed',
  readiness = 0,
  glowIntensity = 0.5,
  opacity = 1.0,
}) {
  const materialRef = useRef();

  // Animate time uniform for pulse effect
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
    }
  });

  return (
    <readinessShaderMaterial
      ref={materialRef}
      baseColor={new THREE.Color(baseColor)}
      glowColor={new THREE.Color(glowColor)}
      readiness={readiness}
      glowIntensity={glowIntensity}
      opacity={opacity}
      transparent={opacity < 1}
      side={THREE.FrontSide}
    />
  );
}
```

**Step 2: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 3: Commit**

```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery
git add src/components/three/ReadinessMaterial.jsx
git commit -m "feat(3d): animate ReadinessMaterial time uniform

- useFrame updates time for pulse animation
- Shader pulse now animates smoothly"
```

---

## Phase 3E: MicroView3D Integration

**Objective:** Wire up all Phase 3 features in MicroView3D - cascade unlock propagation, CosmicParticles focus/session, and readiness calculation.
**Verification:**
- Selected task position passed to CosmicParticles as focusPosition
- Session state passed to CosmicParticles
- Task readiness calculated from dependency completion
- Unlock animations propagate through DAG on task completion

### Task 3.7: Add Session State and Focus to MicroView3D

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/views/MicroView/MicroView3D.jsx`

**Step 1: Calculate session state and focus position**

Add after the existing useMemo hooks:

```jsx
// ─── Calculate session state for particles ──────────────────
const sessionState = useMemo(() => {
  if (state.activeSession?.completingAt) {
    return 'completing';
  }
  if (state.activeSession) {
    return 'active';
  }
  return 'idle';
}, [state.activeSession]);

// ─── Calculate focus position for particles ─────────────────
const focusPosition = useMemo(() => {
  if (!selectedTaskId) return null;
  const task = visibleTasks.find(t => t.id === selectedTaskId);
  if (!task) return null;
  return getPosition(task);
}, [selectedTaskId, visibleTasks, getPosition]);
```

**Step 2: Pass props to CosmicParticles**

Update the CosmicParticles component in the render:

```jsx
{/* Background particles with focus and session response */}
<CosmicParticles
  count={100}
  focusPosition={focusPosition}
  sessionState={sessionState}
/>
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery
git add src/components/views/MicroView/MicroView3D.jsx
git commit -m "feat(3d): wire CosmicParticles focus and session state

- Calculate sessionState from activeSession
- Pass selectedTaskId position as focusPosition
- Particles now respond to selection and session"
```

---

### Task 3.8: Calculate Task Readiness from Dependencies

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/views/MicroView/MicroView3D.jsx`

**Step 1: Add readiness calculation function**

Add this utility function before the MicroView3D component:

```jsx
/**
 * Calculate task readiness based on upstream dependency completion
 * @param {string} taskId - Task to calculate readiness for
 * @param {Array} edges - All edges in the graph
 * @param {Array} tasks - All tasks
 * @param {Object} state - Orrery state for status calculation
 * @returns {number} Readiness from 0 to 1
 */
function calculateReadiness(taskId, edges, tasks, state) {
  // Find all upstream dependencies (edges where this task is target)
  const upstreamEdges = edges.filter(e => e.target === taskId);

  if (upstreamEdges.length === 0) {
    // No dependencies = fully ready
    return 1;
  }

  // Count completed upstream tasks
  let completedCount = 0;
  upstreamEdges.forEach(edge => {
    const sourceTask = tasks.find(t => t.id === edge.source);
    if (sourceTask) {
      const status = getComputedTaskStatus(sourceTask, state);
      if (status === 'completed') {
        completedCount++;
      }
    }
  });

  return completedCount / upstreamEdges.length;
}
```

**Step 2: Pass readiness to TaskSphere**

Update the TaskSphere rendering to include readiness:

```jsx
{/* Render task nodes with readiness */}
{visibleTasks.map(task => {
  const position = getPosition(task);
  const computedStatus = getComputedTaskStatus(task, state);
  const readiness = calculateReadiness(task.id, state.edges, state.tasks, state);

  return (
    <TaskSphere
      key={task.id}
      task={{
        ...task,
        status: computedStatus,
        readiness: readiness,
      }}
      position={position}
      isSelected={selectedTaskId === task.id}
      onSelect={handleSelect}
      onDoubleClick={handleDoubleClick}
      quests={questsWithColors}
    />
  );
})}
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 4: Commit**

```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery
git add src/components/views/MicroView/MicroView3D.jsx
git commit -m "feat(3d): calculate and pass task readiness

- calculateReadiness counts completed upstream dependencies
- Readiness 0-1 passed to each TaskSphere
- Foundation for ReadinessMaterial integration"
```

---

### Task 3.9: Wire Unlock Animation Triggers in MicroView3D

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/views/MicroView/MicroView3D.jsx`

**Step 1: Add unlock cascade logic**

Add state for tracking unlock animations:

```jsx
const [unlockAnimations, setUnlockAnimations] = useState(new Map());
```

Add a function to trigger cascade unlock:

```jsx
/**
 * Trigger cascade unlock animation for dependent tasks
 * @param {string} completedTaskId - Task that was just completed
 */
const triggerCascadeUnlock = useCallback((completedTaskId) => {
  // Find tasks that depend on the completed task
  const dependentEdges = state.edges.filter(e => e.source === completedTaskId);

  if (dependentEdges.length === 0) return;

  const newAnimations = new Map(unlockAnimations);
  const baseDelay = 100; // ms between cascade steps

  dependentEdges.forEach((edge, index) => {
    const targetTaskId = edge.target;
    const targetTask = state.tasks.find(t => t.id === targetTaskId);

    if (targetTask) {
      // Check if this task becomes available (all other deps complete)
      const otherDeps = state.edges.filter(
        e => e.target === targetTaskId && e.source !== completedTaskId
      );
      const allOtherDepsComplete = otherDeps.every(e => {
        const sourceTask = state.tasks.find(t => t.id === e.source);
        return sourceTask && getComputedTaskStatus(sourceTask, state) === 'completed';
      });

      if (allOtherDepsComplete) {
        // Schedule unlock animation with cascade delay
        const unlockTime = Date.now() + (index * baseDelay);
        newAnimations.set(targetTaskId, unlockTime);
      }
    }
  });

  setUnlockAnimations(newAnimations);

  // Clear animations after they complete
  setTimeout(() => {
    setUnlockAnimations(new Map());
  }, 1000);
}, [state.edges, state.tasks, unlockAnimations]);
```

**Step 2: Update handleDoubleClick to trigger cascade**

Modify the existing handleDoubleClick:

```jsx
const handleDoubleClick = useCallback((task) => {
  const status = getComputedTaskStatus(task, state);
  if (status === 'available') {
    dispatch({
      type: 'START_SESSION',
      payload: { taskId: task.id, plannedMinutes: task.estimatedMinutes || 25 }
    });
  } else if (status === 'in_progress' && api) {
    api.completeTask(task.id)
      .then(() => {
        // Trigger cascade unlock animation
        triggerCascadeUnlock(task.id);
      })
      .catch(e => console.error('Complete failed:', e));
  }
}, [dispatch, state, api, triggerCascadeUnlock]);
```

**Step 3: Pass unlock animation time to TaskSphere**

Update the TaskSphere rendering:

```jsx
{visibleTasks.map(task => {
  const position = getPosition(task);
  const computedStatus = getComputedTaskStatus(task, state);
  const readiness = calculateReadiness(task.id, state.edges, state.tasks, state);
  const unlockAnimationStart = unlockAnimations.get(task.id) || null;

  return (
    <TaskSphere
      key={task.id}
      task={{
        ...task,
        status: computedStatus,
        readiness: readiness,
        _unlockAnimationStart: unlockAnimationStart,
      }}
      position={position}
      isSelected={selectedTaskId === task.id}
      onSelect={handleSelect}
      onDoubleClick={handleDoubleClick}
      quests={questsWithColors}
    />
  );
})}
```

**Step 4: Verify build**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run build 2>&1 | head -30`
Expected: No build errors

**Step 5: Commit**

```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery
git add src/components/views/MicroView/MicroView3D.jsx
git commit -m "feat(3d): wire cascade unlock animation triggers

- Track unlock animation timestamps per task
- triggerCascadeUnlock finds newly unlocked dependents
- Staggered cascade timing (100ms between tasks)
- Pass _unlockAnimationStart to TaskSphere"
```

---

## Phase 3F: Browser Verification and Polish

**Objective:** Verify all Phase 3 features work correctly in browser, fix any issues, and ensure 60fps performance.
**Verification:**
- Cascade unlock animation visible when completing tasks
- Particles drift toward selected task
- Particles respond to session state (idle/active/completing)
- Readiness calculation reflects dependency completion
- All animations maintain 60fps

### Task 3.10: Browser Verification

**Step 1: Start development server**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run dev`

**Step 2: Manual verification checklist**

Open browser and verify:
- [ ] Select a task - particles should slowly drift toward it
- [ ] Start a session - particles should turn green, increase opacity
- [ ] Complete a task with dependents - dependent tasks should pulse (unlock animation)
- [ ] Check task with partial dependencies complete - should show partial readiness glow
- [ ] Check performance - should maintain 60fps during animations
- [ ] Verify DependencyTube - particles should flow faster when unlock happens

**Step 3: Fix any issues discovered**

If issues found, create targeted fixes and commit.

**Step 4: Final commit**

```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery
git add -A
git commit -m "feat(3d): Phase 3 complete - Organism Behavior

Phase 3 delivers:
- TaskSphere cascade unlock animation (scale pulse on dependency completion)
- DependencyTube enhanced energy flow during unlock
- CosmicParticles focus attraction (drift toward selected task)
- CosmicParticles session state response (idle/active/completing)
- ReadinessMaterial shader for dependency completion gradient
- Full integration in MicroView3D

Ready for Phase 4: VR Integration"
```

---

## Epic Integration

### Dependencies

This feature depends on:

**Phase 1: 3D Foundation** (Wave 1) - REQUIRED inputs:
- `TaskSphere.jsx` with `useFrame` hooks for animation patterns
- `CosmicParticles.jsx` with `focusPosition` prop (foundation exists, we enhance)
- `DependencyTube.jsx` with `isUnlocking` prop wired
- `MicroView3D.jsx` with state management integration
- Three.js dependencies installed and configured
- Bloom post-processing for glow effects

### Provides To

This feature provides to dependent features:

**Phase 4: VR Integration** (Wave 3)
- Animated TaskSphere components ready for VR rendering
- Responsive CosmicParticles system that works in 3D space
- ReadinessMaterial shader compatible with VR rendering
- Cascade unlock animations that will be visually impressive in VR
- All animations optimized for 60fps (VR will need 72fps+)

### Integration Verification

- [ ] TaskSphere._unlockAnimationStart triggers scale pulse animation
- [ ] DependencyTube.isUnlocking triggers enhanced particle flow
- [ ] CosmicParticles.focusPosition causes particle drift
- [ ] CosmicParticles.sessionState changes color/opacity/behavior
- [ ] ReadinessMaterial.readiness shows gradient fill
- [ ] MicroView3D calculates and passes all props correctly
- [ ] All animations maintain 60fps with 50+ nodes
- [ ] No visual glitches when switching between 2D/3D views

### Handoff Criteria

Before Phase 4 can start:
- [ ] All Phase 3 tasks completed and committed
- [ ] Cascade unlock animation works end-to-end
- [ ] Particle focus attraction visible in browser
- [ ] Session state changes particle behavior
- [ ] Readiness gradient visible on tasks with partial dependencies
- [ ] Performance acceptable (60fps with animations active)
- [ ] Phase 2 also complete (camera controls for VR navigation)

---

## Summary

| Phase | Tasks | Objective |
|-------|-------|-----------|
| 3A | 3.1 | TaskSphere Cascade Unlock Animation |
| 3B | 3.2 | DependencyTube Energy Flow Animation |
| 3C | 3.3-3.4 | CosmicParticles Focus + Session Response |
| 3D | 3.5-3.6 | ReadinessMaterial Shader |
| 3E | 3.7-3.9 | MicroView3D Integration |
| 3F | 3.10 | Browser Verification |

**Total Tasks:** 10
**Estimated Duration:** 3-4 days
**Critical Path:** 3.1 -> 3.7 -> 3.9 -> 3.10 (unlock animation end-to-end)
**Parallel Work:** 3.2, 3.3, 3.4, 3.5 can proceed in parallel after 3.1

---

## Parallel Execution Note (Wave 2)

Phase 3 runs in parallel with Phase 2 (Depth & Camera). These features are independent:

**Phase 2 touches:**
- OrreryCanvas.jsx (OrbitControls)
- d3PhysicsEngine.js (Z-depth)
- CameraController.jsx (new)

**Phase 3 touches:**
- TaskSphere.jsx (unlock animation)
- DependencyTube.jsx (energy flow)
- CosmicParticles.jsx (focus/session)
- ReadinessMaterial.jsx (new)
- MicroView3D.jsx (integration)

**No conflicts:** Different components, can merge independently.
