# Phase 2: Depth & Camera Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add OrbitControls for camera navigation, enable Z-depth distribution by DAG layer, and implement distance-based opacity/blur for depth perception in The Orrery's 3D view.

**Architecture:** Phase 1 establishes the R3F Canvas with a locked-angle PerspectiveCamera. Phase 2 unlocks camera navigation via OrbitControls and adds the third dimension by distributing nodes along the Z-axis based on their DAG layer. Nodes further from the camera become semi-transparent, creating depth-of-field perception without expensive post-processing.

**Tech Stack:**
- `@react-three/drei` ^9.88.0 - OrbitControls component (already installed in Phase 1)
- `@react-three/fiber` ^8.15.0 - useThree for camera access
- Existing `d3PhysicsEngine.js` - Extended with Z-force

**Dependencies from Phase 1:**
- `OrreryCanvas.jsx` with PerspectiveCamera mounting point
- `TaskSphere.jsx` base component (will add distance-based opacity)
- `MicroView3D.jsx` with position conversion logic

---

## Phase 2A: OrbitControls Integration

**Objective:** Add OrbitControls to OrreryCanvas with sensible limits for navigation.
**Verification:**
- Mouse drag rotates camera around scene
- Scroll wheel zooms in/out
- Right-click drag pans camera
- Camera cannot flip upside down
- Touch gestures work on mobile/tablet

### Task 2.1: Add OrbitControls to OrreryCanvas

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/OrreryCanvas.jsx`

**Step 1: Update imports to include OrbitControls**

Add OrbitControls to the existing drei imports:

```jsx
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
```

**Step 2: Add OrbitControls component after camera**

Insert OrbitControls inside the Canvas, after the PerspectiveCamera:

```jsx
{/* Phase 2: OrbitControls for navigation
    Limits prevent disorientation while allowing exploration */}
<OrbitControls
  enablePan={true}
  enableZoom={true}
  enableRotate={true}
  minDistance={15}        // Don't zoom too close
  maxDistance={150}       // Don't zoom too far
  minPolarAngle={Math.PI / 6}   // Limit downward angle (30 degrees from top)
  maxPolarAngle={Math.PI / 2.2} // Limit upward angle (can't go below horizon)
  dampingEnabled={true}   // Smooth camera movement
  dampingFactor={0.05}    // Gentle damping
  rotateSpeed={0.5}       // Slower rotation for precision
  panSpeed={0.5}          // Slower pan for precision
  zoomSpeed={0.8}         // Responsive zoom
/>
```

**Step 3: Verify camera controls work**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run dev`
Expected:
- Drag rotates view around the scene
- Scroll zooms in/out within 15-150 range
- Right-drag pans the view
- Cannot flip camera upside down

**Step 4: Commit**

```bash
git add src/components/three/OrreryCanvas.jsx
git commit -m "feat(3d): add OrbitControls for camera navigation

- Enable orbit, zoom, and pan controls
- Limit polar angle to prevent disorientation
- Damping enabled for smooth movement
- Distance limits: 15-150 world units"
```

---

### Task 2.2: Create CameraController Component

**Files:**
- Create: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/CameraController.jsx`
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/index.js`

**Step 1: Create CameraController with focus-on-node capability**

```jsx
// =====================================================================
// components/three/CameraController.jsx
// Camera management for The Orrery 3D view
//
// Provides:
// - Programmatic camera positioning
// - Focus-on-node animation
// - Camera state for distance-based effects
// =====================================================================

import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * CameraController - Manages camera state and provides focus capabilities
 *
 * @param {Object} props
 * @param {{x: number, y: number, z: number}|null} props.focusTarget - Position to focus on
 * @param {Function} props.onCameraUpdate - Called with camera position each frame
 */
export function CameraController({ focusTarget = null, onCameraUpdate = null }) {
  const { camera, controls } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  // Animate camera to focus target when it changes
  useEffect(() => {
    if (focusTarget && controls) {
      // Set animation target
      targetRef.current.set(focusTarget.x, focusTarget.y, focusTarget.z);
      isAnimating.current = true;
    }
  }, [focusTarget, controls]);

  // Animation loop for smooth camera focus
  useFrame(() => {
    if (isAnimating.current && controls) {
      // Smoothly interpolate controls target toward focus position
      controls.target.lerp(targetRef.current, 0.05);

      // Check if close enough to stop
      if (controls.target.distanceTo(targetRef.current) < 0.1) {
        controls.target.copy(targetRef.current);
        isAnimating.current = false;
      }

      controls.update();
    }

    // Report camera position for distance-based effects
    if (onCameraUpdate) {
      onCameraUpdate({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      });
    }
  });

  return null; // Pure logic component, no visual output
}

/**
 * Hook to get camera distance to a point
 * Used by TaskSphere for distance-based opacity
 */
export function useCameraDistance(position) {
  const { camera } = useThree();
  const posVec = new THREE.Vector3(position.x, position.y, position.z || 0);
  return camera.position.distanceTo(posVec);
}

export default CameraController;
```

**Step 2: Update index.js exports**

Add to `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/index.js`:

```javascript
export { CameraController, useCameraDistance } from './CameraController';
```

**Step 3: Commit**

```bash
git add src/components/three/CameraController.jsx src/components/three/index.js
git commit -m "feat(3d): add CameraController for focus and distance tracking

- Programmatic focus-on-node with smooth animation
- useCameraDistance hook for distance-based effects
- Exposes camera position via callback"
```

---

## Phase 2B: Z-Depth Distribution

**Objective:** Extend d3-force physics to distribute nodes along Z-axis by DAG layer.
**Verification:**
- Nodes at layer 0 (roots) are at Z=0
- Each subsequent layer is 5 world units further in Z
- Perspective camera shows nodes receding into depth
- Existing XY forces still work correctly

### Task 2.3: Extend d3PhysicsEngine with Z-Force

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/utils/d3PhysicsEngine.js`

**Step 1: Add forceZ custom force function**

Add this function before `createSimulation`:

```javascript
/**
 * Custom Z-axis force for 3D depth distribution
 * d3-force doesn't have native Z support, so we implement it
 *
 * Pulls nodes toward a target Z position based on their DAG layer
 *
 * @returns {Object} d3-force compatible force function
 */
function forceZ() {
  let nodes;
  let strength = 0.1;
  let targetZ = (node) => 0;

  function force(alpha) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const target = typeof targetZ === 'function' ? targetZ(node) : targetZ;
      // Initialize Z properties if missing
      if (node.z === undefined) node.z = 0;
      if (node.vz === undefined) node.vz = 0;
      // Apply force toward target Z
      node.vz += (target - node.z) * strength * alpha;
    }
  }

  force.initialize = (_nodes) => {
    nodes = _nodes;
    // Initialize Z properties on all nodes
    nodes.forEach(node => {
      if (node.z === undefined) node.z = 0;
      if (node.vz === undefined) node.vz = 0;
    });
  };

  force.strength = (s) => {
    if (arguments.length) {
      strength = s;
      return force;
    }
    return strength;
  };

  force.z = (z) => {
    if (arguments.length) {
      targetZ = z;
      return force;
    }
    return targetZ;
  };

  return force;
}
```

**Step 2: Update createSimulation to include Z force**

In the `createSimulation` function, add new config parameter:

```javascript
const {
  // ... existing params ...
  zDepthEnabled = false,    // Enable 3D Z-distribution
  zLayerSpacing = 5,        // World units per DAG layer in Z
  zStrength = 0.1,          // Strength of Z force
} = config;
```

Add this force after the radial force:

```javascript
// Z-DEPTH DISTRIBUTION (Phase 2: 3D mode only)
// Distributes nodes along Z-axis based on DAG layer
// Layer 0 = Z:0, Layer 1 = Z:5, Layer 2 = Z:10, etc.
if (zDepthEnabled) {
  simulation.force('zDepth', forceZ()
    .strength(zStrength)
    .z(node => (node.layer || 0) * zLayerSpacing)
  );
}
```

**Step 3: Update node tick to apply Z velocity**

We need to manually apply Z velocity since d3-force only handles X/Y. Add to simulation after creation:

```javascript
// Apply Z velocity decay (d3-force doesn't handle Z natively)
if (zDepthEnabled) {
  const originalTick = simulation.tick.bind(simulation);
  simulation.tick = function() {
    originalTick();
    // Apply Z velocity with same decay as X/Y
    const velocityDecay = 0.35;
    nodes.forEach(node => {
      if (node.vz !== undefined) {
        node.z += node.vz;
        node.vz *= (1 - velocityDecay);
      }
    });
    return simulation;
  };
}
```

**Step 4: Update getPositions to include Z**

Modify the `getPositions` function:

```javascript
export function getPositions(simulation) {
  const positions = new Map();
  simulation.nodes().forEach(node => {
    positions.set(node.id, {
      x: node.x,
      y: node.y,
      z: node.z || 0,  // Include Z coordinate
    });
  });
  return positions;
}
```

**Step 5: Update updateSimulation to preserve Z**

In `updateSimulation`, update the old nodes preservation:

```javascript
// Preserve positions from old nodes (including Z)
const oldNodes = new Map();
simulation.nodes().forEach(n => {
  oldNodes.set(n.id, {
    x: n.x, y: n.y, z: n.z || 0,
    vx: n.vx, vy: n.vy, vz: n.vz || 0,
    fx: n.fx, fy: n.fy, fz: n.fz
  });
});

// Merge old positions into new nodes (including Z)
newNodes.forEach(node => {
  const old = oldNodes.get(node.id);
  if (old) {
    node.x = old.x;
    node.y = old.y;
    node.z = old.z;
    node.vx = old.vx || 0;
    node.vy = old.vy || 0;
    node.vz = old.vz || 0;
    if (old.fx !== null) node.fx = old.fx;
    if (old.fy !== null) node.fy = old.fy;
    if (old.fz !== null) node.fz = old.fz;
  }
});
```

**Step 6: Commit**

```bash
git add src/utils/d3PhysicsEngine.js
git commit -m "feat(physics): add Z-axis force for 3D depth distribution

- Custom forceZ function (d3-force doesn't have native Z)
- Distributes nodes by DAG layer along Z-axis
- Z velocity decay matches XY behavior
- getPositions now includes Z coordinate
- Config: zDepthEnabled, zLayerSpacing, zStrength"
```

---

### Task 2.4: Enable Z-Depth in MicroView3D

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/views/MicroView/MicroView3D.jsx`

**Step 1: Update physics config to enable Z-depth**

Find where the physics simulation is configured/created (likely via a hook or effect). Add the Z-depth parameters:

```javascript
// Physics configuration for 3D mode
const physicsConfig = {
  // ... existing config ...
  zDepthEnabled: true,      // Enable 3D depth distribution
  zLayerSpacing: 5,         // 5 world units per DAG layer
  zStrength: 0.1,           // Gentle Z force
};
```

**Step 2: Update getPosition to use Z from physics**

Update the `getPosition` callback to pass through the Z coordinate:

```javascript
// Convert d3 positions to 3D coordinates
const getPosition = useCallback((task) => {
  // Get position from physics simulation (includes Z now)
  const pos = positionsMap.get(task.id) || task.position || { x: 0, y: 0, z: 0 };
  return {
    x: pos.x * SCALE,
    y: -pos.y * SCALE,  // Flip Y for 3D coordinate system
    z: (pos.z || 0) * SCALE,  // Pass through Z coordinate
  };
}, [positionsMap]);
```

**Step 3: Commit**

```bash
git add src/components/views/MicroView/MicroView3D.jsx
git commit -m "feat(3d): enable Z-depth distribution in MicroView3D

- Physics config enables Z-depth mode
- Position conversion includes Z coordinate
- DAG layers now distribute in 3D space"
```

---

## Phase 2C: Distance-Based Depth Perception

**Objective:** Implement distance-based opacity/transparency for nodes further from camera.
**Verification:**
- Nodes close to camera appear fully opaque
- Nodes far from camera appear semi-transparent
- Effect creates natural depth-of-field perception
- No performance impact (no post-processing)

### Task 2.5: Add Distance-Based Opacity to TaskSphere

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/TaskSphere.jsx`

**Step 1: Add distance calculation hook usage**

Add import and usage of useThree for camera access:

```jsx
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
```

**Step 2: Add distance-based opacity calculation**

Inside the TaskSphere component, add:

```jsx
// ─── Distance-based depth perception ──────────────────────────
const { camera } = useThree();
const spherePosition = useMemo(
  () => new THREE.Vector3(position.x, position.y, position.z || 0),
  [position.x, position.y, position.z]
);

// Calculate opacity based on distance from camera
// Close nodes: fully opaque, Far nodes: semi-transparent
const FOCUS_DISTANCE = 30;     // Full opacity within this distance
const FADE_DISTANCE = 80;      // Minimum opacity beyond this distance
const MIN_OPACITY = 0.35;      // Don't go fully transparent

const distanceOpacity = useMemo(() => {
  const distance = camera.position.distanceTo(spherePosition);
  if (distance <= FOCUS_DISTANCE) return 1;
  if (distance >= FADE_DISTANCE) return MIN_OPACITY;
  // Linear interpolation between focus and fade distances
  const t = (distance - FOCUS_DISTANCE) / (FADE_DISTANCE - FOCUS_DISTANCE);
  return 1 - t * (1 - MIN_OPACITY);
}, [camera.position, spherePosition]);
```

**Step 3: Apply opacity to material**

Update the meshStandardMaterial in the Sphere component:

```jsx
<meshStandardMaterial
  color={baseColor}
  emissive={glowColor}
  emissiveIntensity={
    hovered || isSelected
      ? glowIntensity + 0.2
      : glowIntensity * distanceOpacity  // Dim glow with distance
  }
  roughness={0.7}
  metalness={0.1}
  transparent
  opacity={
    status === 'locked'
      ? 0.5 * distanceOpacity
      : distanceOpacity
  }
/>
```

**Step 4: Also update glow ring opacity**

Update the cognitive load glow ring:

```jsx
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
    opacity={(0.3 + cognitiveLoad * 0.1) * distanceOpacity}
  />
</Ring>
```

**Step 5: Commit**

```bash
git add src/components/three/TaskSphere.jsx
git commit -m "feat(3d): add distance-based opacity for depth perception

- Nodes within 30 units: fully opaque
- Nodes beyond 80 units: 35% opacity
- Linear falloff between focus and fade distances
- Glow intensity also scales with distance
- Creates depth-of-field effect without post-processing"
```

---

### Task 2.6: Add Distance-Based Effect to DependencyTube

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/three/DependencyTube.jsx`

**Step 1: Add camera distance calculation**

Add imports and distance calculation:

```jsx
import { useThree } from '@react-three/fiber';

// Inside DependencyTube component:
const { camera } = useThree();

// Calculate average distance of edge from camera
const edgeDistance = useMemo(() => {
  const srcZ = sourcePos.z || 0;
  const tgtZ = targetPos.z || 0;
  const midpoint = new THREE.Vector3(
    (sourcePos.x + targetPos.x) / 2,
    (sourcePos.y + targetPos.y) / 2,
    (srcZ + tgtZ) / 2
  );
  return camera.position.distanceTo(midpoint);
}, [camera.position, sourcePos, targetPos]);

// Distance-based opacity (same parameters as TaskSphere)
const FOCUS_DISTANCE = 30;
const FADE_DISTANCE = 80;
const MIN_OPACITY = 0.2;  // Edges can fade more than spheres

const distanceOpacity = useMemo(() => {
  if (edgeDistance <= FOCUS_DISTANCE) return 1;
  if (edgeDistance >= FADE_DISTANCE) return MIN_OPACITY;
  const t = (edgeDistance - FOCUS_DISTANCE) / (FADE_DISTANCE - FOCUS_DISTANCE);
  return 1 - t * (1 - MIN_OPACITY);
}, [edgeDistance]);
```

**Step 2: Apply opacity to line and particles**

Update QuadraticBezierLine:

```jsx
<QuadraticBezierLine
  ref={lineRef}
  start={start}
  end={end}
  mid={mid}
  color={lineColor}
  lineWidth={lineWidth}
  transparent
  opacity={0.6 * distanceOpacity}  // Apply distance fade
  dashed={isUnlocking}
  dashScale={5}
  dashSize={0.5}
  gapSize={0.2}
/>
```

Update particle material:

```jsx
<meshBasicMaterial
  color={particleColor}
  transparent
  opacity={0.5 * distanceOpacity}  // Apply distance fade
/>
```

**Step 3: Commit**

```bash
git add src/components/three/DependencyTube.jsx
git commit -m "feat(3d): add distance-based opacity to DependencyTube

- Edge opacity fades with distance from camera
- Uses midpoint of edge for distance calculation
- Consistent with TaskSphere fade parameters"
```

---

## Phase 2D: Integration and Browser Verification

**Objective:** Integrate CameraController, verify all Phase 2 features work together, ensure performance.
**Verification:**
- Camera controls work smoothly
- Z-depth distribution visible in perspective
- Distance-based opacity creates depth perception
- Focus-on-node works when implemented
- 60fps performance maintained
- Touch gestures work on mobile

### Task 2.7: Integrate CameraController in MicroView3D

**Files:**
- Modify: `/home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/src/components/views/MicroView/MicroView3D.jsx`

**Step 1: Import CameraController**

```jsx
import { OrreryCanvas, TaskSphere, DependencyTube, CosmicParticles, CameraController } from '@/components/three';
```

**Step 2: Add camera state for focus functionality**

Add state for tracking focused node:

```jsx
const [focusTarget, setFocusTarget] = useState(null);

// Focus on selected node when selection changes
useEffect(() => {
  if (selectedTaskId) {
    const position = positionsMap.get(selectedTaskId);
    if (position) {
      setFocusTarget({
        x: position.x * SCALE,
        y: -position.y * SCALE,
        z: (position.z || 0) * SCALE,
      });
    }
  }
}, [selectedTaskId, positionsMap]);
```

**Step 3: Add CameraController to OrreryCanvas**

Inside the OrreryCanvas:

```jsx
<OrreryCanvas>
  {/* Camera controller for focus-on-node */}
  <CameraController focusTarget={focusTarget} />

  {/* ... rest of content ... */}
</OrreryCanvas>
```

**Step 4: Commit**

```bash
git add src/components/views/MicroView/MicroView3D.jsx
git commit -m "feat(3d): integrate CameraController for focus-on-selection

- Camera smoothly pans to selected node
- Focus target updates on selection change"
```

---

### Task 2.8: Browser Verification

**Step 1: Start development server**

Run: `cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery && npm run dev`

**Step 2: Manual verification checklist**

Open browser to localhost URL and verify:

- [ ] **OrbitControls:**
  - [ ] Left-drag rotates view around scene
  - [ ] Scroll wheel zooms in/out
  - [ ] Right-drag pans view
  - [ ] Cannot rotate camera below horizon (polar angle limit)
  - [ ] Zoom limited between 15-150 units
  - [ ] Movement feels smooth (damping working)

- [ ] **Z-Depth Distribution:**
  - [ ] Root tasks (layer 0) appear at front/center
  - [ ] Dependent tasks recede into background
  - [ ] Perspective creates visible depth (far nodes smaller)
  - [ ] Rotating view reveals 3D distribution

- [ ] **Distance-Based Opacity:**
  - [ ] Close nodes fully opaque
  - [ ] Far nodes semi-transparent
  - [ ] Edges also fade with distance
  - [ ] Glow intensity reduces with distance
  - [ ] Effect enhances depth perception

- [ ] **Focus-on-Node:**
  - [ ] Clicking node smoothly pans camera toward it
  - [ ] Multiple selections pan correctly

- [ ] **Performance:**
  - [ ] 60fps with orbit controls active
  - [ ] No lag on zoom/pan
  - [ ] Distance calculation doesn't cause stuttering

- [ ] **Touch (if available):**
  - [ ] Pinch-to-zoom works
  - [ ] Two-finger drag rotates
  - [ ] Three-finger drag pans

**Step 3: Fix any issues discovered**

If issues found, create targeted fixes and commit.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(3d): Phase 2 complete - Depth & Camera Controls

Phase 2 delivers:
- OrbitControls with sensible limits
- Z-depth distribution by DAG layer
- Distance-based opacity for depth perception
- CameraController for focus-on-node
- Touch gesture support

Ready for Phase 3: Organism Behavior (cascade animations, particle system)
Ready for Phase 4: VR Integration (camera system supports VR controller)"
```

---

## Epic Integration

### Dependencies

This feature depends on:

**Phase 1: 3D Foundation** (Wave 1)
- `OrreryCanvas.jsx` - Canvas wrapper where we add OrbitControls
- `TaskSphere.jsx` - Base component we extend with distance-opacity
- `DependencyTube.jsx` - Edge component we extend with distance-opacity
- `MicroView3D.jsx` - Integration point with Orrery state
- Three.js dependencies installed and working
- PerspectiveCamera already configured

### Provides To

This feature provides to dependent features:

**Phase 4: VR Integration** (Wave 3)
- Camera system ready for VR controller takeover
- OrbitControls can be disabled when VR mode activates
- Z-depth distribution provides meaningful 3D space for VR navigation
- CameraController patterns reusable for VR focus mechanics
- Distance-based effects work in VR (no post-processing dependency)

**Phase 3: Organism Behavior** (Wave 2 - parallel)
- No direct dependency - Phase 3 can proceed independently
- Z-positions available for 3D cascade animation calculations

### Integration Points with Phase 3 (Parallel Execution)

Phase 2 and Phase 3 are in Wave 2 (parallel). Integration points:

| Phase 2 Provides | Phase 3 Uses |
|------------------|--------------|
| Z-positions in physics | 3D cascade unlock trajectories |
| Distance-based opacity | Particle density can scale with distance |
| CameraController.focusTarget | Could trigger particle attraction |

**No blocking dependencies** - either can complete first. Final integration happens when both merge to main.

### Integration Verification

- [ ] OrbitControls do not interfere with TaskSphere click events
- [ ] Z-positions from physics match what TaskSphere receives
- [ ] Distance calculation uses correct coordinate space
- [ ] CameraController focus animation is interruptible (user can override)
- [ ] All three components (OrreryCanvas, TaskSphere, DependencyTube) use consistent distance parameters

### Handoff Criteria

Before Phase 4 (VR Integration) can start:
- [ ] All Phase 2 tasks completed and committed
- [ ] OrbitControls functional with no regressions
- [ ] Z-depth distribution visible and correct
- [ ] Distance-based opacity working
- [ ] 60fps performance maintained
- [ ] Camera can be programmatically controlled (for VR takeover)
- [ ] Touch gestures verified working

---

## Summary

| Phase | Tasks | Objective |
|-------|-------|-----------|
| 2A | 2.1-2.2 | OrbitControls Integration |
| 2B | 2.3-2.4 | Z-Depth Distribution |
| 2C | 2.5-2.6 | Distance-Based Depth Perception |
| 2D | 2.7-2.8 | Integration and Browser Verification |

**Total Tasks:** 8
**Estimated Duration:** 3-4 days
**Critical Path:** 2.1 -> 2.3 -> 2.5 -> 2.7 -> 2.8

**Commit Strategy:** One focused commit per task, final summary commit after verification.
