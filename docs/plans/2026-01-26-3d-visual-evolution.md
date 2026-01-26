# The Orrery: 3D Visual Evolution — Building for VR from Day One

> **EPIC-LEVEL PROJECT:** This plan should be executed using the `epic-planning` workflow.
> Invoke skill: **epic-planning** (see `~/.claude/plugins/local/epic-planning/`)
>
> **Complexity Assessment:**
> - Task count: ~30+ (EPIC threshold: ≥15)
> - Feature count: 4 phases (EPIC threshold: ≥3)
> - Duration: 4 weeks (EPIC threshold: >1 week)
> - Cross-feature dependencies: YES
>
> **Thinking Level:** Complex → ULTRATHINK

---

> **For Claude:** After exiting plan mode, invoke `epic-planning` skill to orchestrate this as an epic.
> **For Other LLMs:** Treat each PHASE as a FEATURE. Execute via epic-feature-executor agents.

---

## Executive Summary

**Goal:** Transform The Orrery from 2D SVG to full 3D with VR support.
**Strategy:** 3D-first hybrid approach — no throwaway code.
**Key Insight:** Building 2D circles then migrating to 3D wastes ~60% of work. Build 3D foundation from start, but deploy incrementally.

**Timeline:** 4 weeks to full 3D/VR capability
**Target Platform:** Pico 4 Ultra via WebXR (personal use, no lowest-common-denominator)

---

## Validated Design Decisions (Brainstormed with User)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Phase 1 Camera** | Perspective + locked angle | Depth visible immediately, orbit unlocks in Phase 2 |
| **Node Aesthetic** | Organic orbs (surface noise, breathing) | "Living Cosmos" vision, biological feel, not clinical |
| **Cognitive Load** | Three-layer: Color → Glow → Pulse | Game UI/UX best practice: peripheral + focus + visceral + examination reward |
| **Edges** | Hybrid: line + flowing particles | Visual clarity + living quality ("celestial vines") |
| **VR Platform** | Pico 4 Ultra (WebXR) | Personal use, more headroom than Quest 2 |

### Three-Layer Cognitive Load System (Game UI/UX Pattern)

```
LAYER 1: GLANCE (peripheral vision)
  Color temperature: Green → Cyan → Yellow → Orange → Red
  Scannable instantly without focused attention

LAYER 2: FOCUS (direct attention)
  Glow intensity: Load 1 = dim, Load 5 = blazing
  Rewards looking at specific node

LAYER 3: VISCERAL (nervous system)
  Pulsation speed AND amplitude
  Load 1: Slow, gentle (1.5Hz, 2% amplitude)
  Load 5: Fast, urgent (3.5Hz, 6% amplitude)
  Creates felt-sense response before conscious thought

BONUS: EXAMINATION (hover/select reward)
  Orbital particles appear ONLY on selection
  Rewards attention without cluttering overview
```

---

## Implementation Orchestration Strategy

### Multi-LLM Architecture: "Architect + Drafters"

```
┌─────────────────────────────────────────────────────────────┐
│  CLAUDE (Orchestrator + Architect)                          │
│  - Creates git worktrees                                    │
│  - Writes foundation code (sets patterns)                   │
│  - Reviews and integrates all outputs                       │
│  - Maintains architectural coherence                        │
│  - Final testing and commits                                │
├─────────────────────────────────────────────────────────────┤
│  GEMINI CLI (Component Drafter)                             │
│  - Drafts isolated components from spec                     │
│  - Works in parallel while Claude does integration          │
│  - Outputs reviewed by Claude before merge                  │
├─────────────────────────────────────────────────────────────┤
│  TASK AGENTS (Research + Validation)                        │
│  - Explore codebase for patterns                            │
│  - Verify implementations work                              │
│  - Check existing code for conflicts                        │
└─────────────────────────────────────────────────────────────┘
```

### Phase 1 Execution Flow

```bash
# 1. Claude: Create worktree
git worktree add ../orrery-3d-foundation feature/3d-foundation

# 2. Claude: Write OrreryCanvas.jsx (SETS PATTERNS)
# This establishes camera, lighting, post-processing patterns

# 3. Gemini CLI: Draft components IN PARALLEL
gemini -m gemini-1.5-pro << 'PROMPT'
[Full spec for TaskSphere.jsx from this plan]
PROMPT

gemini -m gemini-1.5-pro << 'PROMPT'
[Full spec for DependencyTube.jsx from this plan]
PROMPT

# 4. Claude: Review Gemini outputs, fix issues, integrate
# 5. Claude: Write MicroView3D.jsx (ties everything together)
# 6. Claude: Test, commit, merge worktree
```

### Why This Strategy

| Benefit | Explanation |
|---------|-------------|
| **Context preservation** | Claude maintains full architectural context |
| **Parallel speed** | Gemini drafts while Claude integrates |
| **No merge conflicts** | Single integration point (Claude) |
| **Quality control** | All Gemini output reviewed before merge |
| **Coherent architecture** | Patterns set by Claude first |

---

## Architecture Decision

### Why Three.js + react-three-fiber

| Option | Pros | Cons |
|--------|------|------|
| **Three.js + R3F** | React integration, huge ecosystem, WebXR native | Learning curve |
| Babylon.js | Good VR support, batteries-included | Heavier, less React-native |
| Raw WebGL | Maximum control | Massive effort |
| Unity WebGL | Game engine power | Overkill, heavy bundle |

**Decision:** `@react-three/fiber` + `@react-three/drei` + `@react-three/xr`

This gives us:
- React component model (familiar patterns)
- Declarative 3D scene definition
- Built-in VR/AR support via WebXR
- Huge ecosystem of helpers (drei)
- PostProcessing for bloom/glow effects

---

## Phase Overview

| Phase | Name | Duration | Deploys As |
|-------|------|----------|------------|
| **1** | 3D Foundation | 4-5 days | "Looks like 2D but is 3D" |
| **2** | Depth & Camera | 3-4 days | "3D you can navigate" |
| **3** | Organism Behavior | 3-4 days | "Living 3D ecosystem" |
| **4** | VR Integration | 4-5 days | "Full VR experience" |

**Total: ~4 weeks**

---

# PHASE 1: 3D FOUNDATION
## "Depth Visible from Day One"

**Objective:** Replace SVG rendering with Three.js with IMMEDIATE depth perception
**Duration:** 4-5 days
**Deploys As:** "Wow, there's depth!" — perspective camera, locked angle, organic orbs

### Design Decisions (Validated via Brainstorming)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Camera** | Perspective + locked angle | Depth visible immediately, orbit unlocks in Phase 2 |
| **Nodes** | Organic orbs (surface noise, breathing) | "Living Cosmos" vision, not clinical spheres |
| **Cognitive Load** | 3-layer system: color → glow → pulse | Game UI/UX best practice: peripheral + focus + visceral |
| **Edges** | Hybrid: line + particles | Visual clarity + living quality |
| **VR Target** | Pico 4 Ultra (WebXR) | Personal use, no lowest-common-denominator |

### 1.1 Dependencies to Install

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
```

**package.json additions:**
```json
{
  "dependencies": {
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "@react-three/postprocessing": "^2.15.0"
  }
}
```

### 1.2 File Structure Changes

**New files to create:**
```
src/
├── components/
│   ├── three/                          # NEW: All 3D components
│   │   ├── OrreryCanvas.jsx            # R3F Canvas wrapper
│   │   ├── TaskSphere.jsx              # 3D task node (replaces TaskNode)
│   │   ├── DependencyTube.jsx          # 3D edge (replaces DependencyEdge)
│   │   ├── CosmicParticles.jsx         # 3D particles (replaces CosmicAmbient)
│   │   ├── CameraController.jsx        # Camera management
│   │   └── PostProcessing.jsx          # Bloom, glow effects
│   │
│   └── views/
│       └── MicroView/
│           └── MicroView3D.jsx         # NEW: 3D version of MicroView
```

**Files to deprecate (keep for reference, remove after Phase 2):**
```
src/components/tasks/TaskNode.jsx        # → TaskSphere.jsx
src/components/edges/DependencyEdge.jsx  # → DependencyTube.jsx
src/components/ambient/CosmicAmbient.jsx # → CosmicParticles.jsx
```

### 1.3 Core Component: OrreryCanvas.jsx

**Path:** `/src/components/three/OrreryCanvas.jsx`

```jsx
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';

/**
 * Main 3D canvas for The Orrery
 * Phase 1: Perspective camera, LOCKED angle (depth visible, no orbit)
 * Phase 2: Add OrbitControls for full navigation
 */
export function OrreryCanvas({ children }) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]} // Retina support
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Phase 1: Perspective camera = DEPTH VISIBLE from Day 1
          Positioned at slight angle for depth perception
          No orbit controls yet (locked, but shows dimensionality) */}
      <PerspectiveCamera
        makeDefault
        position={[0, -15, 40]}  // Slight downward angle for depth
        fov={50}
        near={0.1}
        far={1000}
      />

      {/* Ambient light for base visibility */}
      <ambientLight intensity={0.3} />

      {/* Point light for depth cues */}
      <pointLight position={[0, 0, 50]} intensity={0.5} />

      {children}

      {/* Post-processing for bioluminescent glow */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.8}
        />
      </EffectComposer>
    </Canvas>
  );
}
```

### 1.4 Core Component: TaskSphere.jsx

**Path:** `/src/components/three/TaskSphere.jsx`

```jsx
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html, Ring } from '@react-three/drei';
import * as THREE from 'three';

const SPHERE_RADIUS = 1; // World units (scaled via camera zoom)

// Status colors (base fill)
const STATUS_COLORS = {
  locked: '#3d4255',
  available: '#7c3aed',
  in_progress: '#22d3ee',
  completed: '#34d399',
};

// THREE-LAYER COGNITIVE LOAD SYSTEM
// Layer 1 (Glance): Color temperature - peripheral vision scannable
const COGNITIVE_COLORS = [
  '#6EE7B7', // Load 1 - Cool green (calm)
  '#22D3EE', // Load 2 - Cyan (alert)
  '#FBBF24', // Load 3 - Yellow (moderate)
  '#F97316', // Load 4 - Orange (demanding)
  '#EF4444', // Load 5 - Red (intense)
];

// Layer 2 (Focus): Glow intensity multipliers
const COGNITIVE_INTENSITY = [0.35, 0.5, 0.65, 0.8, 0.95];

// Layer 3 (Visceral): Pulse speed and amplitude
const COGNITIVE_PULSE = [
  { speed: 1.5, amplitude: 0.02 }, // Load 1 - Slow, gentle
  { speed: 2.0, amplitude: 0.025 },
  { speed: 2.5, amplitude: 0.03 },
  { speed: 3.0, amplitude: 0.04 },
  { speed: 3.5, amplitude: 0.06 }, // Load 5 - Fast, urgent
];

export function TaskSphere({
  task,
  position,
  isSelected,
  onSelect,
  onDoubleClick,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Get properties based on task state
  const status = task.status || 'available';
  const cognitiveLoad = Math.min(5, Math.max(1, task.cognitiveLoad || 3));
  const loadIndex = cognitiveLoad - 1;

  // Three-layer cognitive load visualization
  const baseColor = STATUS_COLORS[status];
  const glowColor = COGNITIVE_COLORS[loadIndex];           // Layer 1: Color
  const glowIntensity = COGNITIVE_INTENSITY[loadIndex];    // Layer 2: Intensity
  const { speed: pulseSpeed, amplitude: pulseAmplitude } = COGNITIVE_PULSE[loadIndex]; // Layer 3: Pulse

  // Animation: THREE-LAYER visceral feedback
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    // Layer 3: Pulsation speed + amplitude based on cognitive load
    // Higher load = faster, more urgent pulse (nervous system engagement)
    const breathe = 1 + Math.sin(time * pulseSpeed) * pulseAmplitude;
    meshRef.current.scale.setScalar(breathe);

    // Organic wobble (subtle surface variation feel)
    meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.02;
    meshRef.current.rotation.y = Math.cos(time * 0.4) * 0.02;
  });

  // Quest badge color (first quest)
  const questColor = task.questIds?.[0]
    ? getQuestColor(task.questIds[0])
    : '#666';

  return (
    <group position={[position.x, position.y, 0]}>
      {/* Main sphere */}
      {/* ORGANIC ORB: Subtle surface variation via vertex displacement */}
      <Sphere
        ref={meshRef}
        args={[SPHERE_RADIUS, 32, 32]} // Enough segments for organic feel
        onClick={(e) => {
          e.stopPropagation();
          onSelect(task.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick(task);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={baseColor}
          emissive={glowColor}
          // Layer 2: Glow intensity based on cognitive load
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
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
        </Ring>
      )}

      {/* Quest badge (small sphere at bottom) */}
      <Sphere
        args={[0.15, 16, 16]}
        position={[0, -SPHERE_RADIUS * 0.8, SPHERE_RADIUS * 0.3]}
      >
        <meshStandardMaterial color={questColor} emissive={questColor} emissiveIntensity={0.3} />
      </Sphere>

      {/* Status icon (HTML overlay) - only when hovered/selected */}
      {(hovered || isSelected) && (
        <Html
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
        >
          <div className="task-sphere-label">
            {getStatusIcon(status)}
          </div>
        </Html>
      )}

      {/* Title tooltip (HTML overlay) - only when hovered/selected */}
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

      {/* Cognitive load glow ring */}
      <Ring
        args={[SPHERE_RADIUS * 1.05, SPHERE_RADIUS * 1.1 + cognitiveLoad * 0.02, 64]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.3 + cognitiveLoad * 0.1}
        />
      </Ring>
    </group>
  );
}

// Helper functions
function getStatusIcon(status) {
  const icons = {
    locked: '🔒',
    available: '◉',
    in_progress: '▶',
    completed: '✓',
  };
  return icons[status] || '◉';
}

function getQuestColor(questId) {
  // Import from constants or pass via props
  return '#7c3aed'; // Fallback
}
```

### 1.5 Core Component: DependencyTube.jsx (HYBRID: Line + Particles)

**Path:** `/src/components/three/DependencyTube.jsx`

```jsx
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const SPHERE_RADIUS = 1;
const PARTICLE_COUNT = 5; // Flowing particles per edge

export function DependencyTube({
  sourcePos,
  targetPos,
  isUnlocking = false,
  isSelected = false,
}) {
  const lineRef = useRef();
  const particlesRef = useRef([]);

  // Calculate bezier curve for edge path
  const { start, end, mid, curve } = useMemo(() => {
    const srcCenter = new THREE.Vector3(sourcePos.x, sourcePos.y, 0);
    const tgtCenter = new THREE.Vector3(targetPos.x, targetPos.y, 0);
    const dir = tgtCenter.clone().sub(srcCenter).normalize();

    const start = srcCenter.clone().add(dir.clone().multiplyScalar(SPHERE_RADIUS));
    const end = tgtCenter.clone().sub(dir.clone().multiplyScalar(SPHERE_RADIUS));

    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const perpendicular = new THREE.Vector3(-dir.y, dir.x, 0);
    const curveAmount = start.distanceTo(end) * 0.1;
    const mid = midpoint.clone().add(perpendicular.multiplyScalar(curveAmount));

    // Create bezier curve for particle animation
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

    return { start, end, mid, curve };
  }, [sourcePos, targetPos]);

  // Animate flowing particles along the edge
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Animate each particle along the curve
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return;

      // Stagger particles along the path
      const offset = i / PARTICLE_COUNT;
      const t = ((time * 0.3) + offset) % 1; // 0→1 position along curve

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

  const lineColor = isUnlocking ? '#22d3ee' : isSelected ? '#a855f7' : '#5a6577';
  const particleColor = isUnlocking ? '#22d3ee' : '#7c3aed';
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
```

**Visual Result:**
- Thin glowing line shows the connection path clearly
- 5 small particles flow continuously along the line
- On unlock: line brightens, particles glow more intensely, dash animation adds energy feel
- Achieves "celestial vine" aesthetic: organic, alive, flowing

### 1.6 Core Component: MicroView3D.jsx

**Path:** `/src/components/views/MicroView/MicroView3D.jsx`

```jsx
import { useCallback, useMemo } from 'react';
import { useOrrery } from '@/store';
import { OrreryCanvas } from '@/components/three/OrreryCanvas';
import { TaskSphere } from '@/components/three/TaskSphere';
import { DependencyTube } from '@/components/three/DependencyTube';
import { CosmicParticles } from '@/components/three/CosmicParticles';
import { getComputedTaskStatus } from '@/utils';

// Scale factor: d3 positions (pixels) to Three.js world units
const SCALE = 0.05; // 100px → 5 world units

export function MicroView3D() {
  const { state, dispatch } = useOrrery();
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Filter tasks for current quest focus
  const visibleTasks = useMemo(() => {
    if (!state.preferences.focusQuestId) return state.tasks;
    return state.tasks.filter(t =>
      t.questIds.includes(state.preferences.focusQuestId)
    );
  }, [state.tasks, state.preferences.focusQuestId]);

  // Get edges between visible tasks
  const visibleEdges = useMemo(() => {
    const visibleIds = new Set(visibleTasks.map(t => t.id));
    return state.edges.filter(e =>
      visibleIds.has(e.source) && visibleIds.has(e.target)
    );
  }, [state.edges, visibleTasks]);

  // Convert d3 positions to 3D coordinates
  const getPosition = useCallback((task) => {
    const pos = task.position || { x: 0, y: 0 };
    return {
      x: pos.x * SCALE,
      y: -pos.y * SCALE, // Flip Y for 3D coordinate system
    };
  }, []);

  // Handlers
  const handleSelect = useCallback((taskId) => {
    setSelectedTaskId(taskId);
  }, []);

  const handleDoubleClick = useCallback((task) => {
    const status = getComputedTaskStatus(task, state);
    if (status === 'available') {
      dispatch({
        type: 'START_SESSION',
        payload: { taskId: task.id, plannedMinutes: task.estimatedMinutes || 25 }
      });
    }
  }, [dispatch, state]);

  return (
    <div className="micro-view-3d" style={{ width: '100%', height: '100%' }}>
      <OrreryCanvas>
        {/* Background particles */}
        <CosmicParticles count={100} />

        {/* Render edges first (behind nodes) */}
        {visibleEdges.map(edge => {
          const sourceTask = visibleTasks.find(t => t.id === edge.source);
          const targetTask = visibleTasks.find(t => t.id === edge.target);
          if (!sourceTask || !targetTask) return null;

          return (
            <DependencyTube
              key={edge.id}
              sourcePos={getPosition(sourceTask)}
              targetPos={getPosition(targetTask)}
            />
          );
        })}

        {/* Render task nodes */}
        {visibleTasks.map(task => (
          <TaskSphere
            key={task.id}
            task={{
              ...task,
              status: getComputedTaskStatus(task, state),
            }}
            position={getPosition(task)}
            isSelected={selectedTaskId === task.id}
            onSelect={handleSelect}
            onDoubleClick={handleDoubleClick}
          />
        ))}
      </OrreryCanvas>
    </div>
  );
}
```

### 1.7 Physics Integration: Extend d3-force for 3D

**Path:** `/src/utils/d3PhysicsEngine.js` — UPDATE

The d3-force simulation can work in 3D by adding z coordinates. For Phase 1, we keep z=0 (flat plane).

```javascript
// In createSimulation, update node initialization
nodes.forEach(node => {
  // Ensure z coordinate exists (0 for flat plane initially)
  node.z = node.z || 0;
  node.vz = node.vz || 0;
});

// For Phase 2+, add forceZ for depth distribution
// .force('z', forceZ().strength(0.01))
```

### 1.8 CSS for HTML Overlays

**Path:** `/src/styles/three.css` — NEW

```css
/* Task sphere HTML overlays */
.task-sphere-label {
  font-size: 20px;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.8);
}

.task-sphere-title {
  background: rgba(26, 28, 40, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text-primary);
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Canvas container */
.micro-view-3d {
  position: relative;
  overflow: hidden;
}

.micro-view-3d canvas {
  touch-action: none; /* Enable touch gestures */
}
```

### 1.9 App Integration

**Path:** `/src/App.jsx` — UPDATE

Add feature flag to switch between 2D and 3D views:

```jsx
import { MicroView } from '@/components/views/MicroView/MicroView';
import { MicroView3D } from '@/components/views/MicroView/MicroView3D';

// Feature flag (can be user preference later)
const USE_3D_VIEW = true;

function App() {
  return (
    // ...
    {currentView === 'micro' && (
      USE_3D_VIEW ? <MicroView3D /> : <MicroView />
    )}
    // ...
  );
}
```

### 1.10 Verification Checklist — Phase 1

- [ ] Three.js dependencies installed
- [ ] OrreryCanvas renders without errors
- [ ] TaskSphere shows for each task at correct position
- [ ] DependencyTube connects spheres correctly
- [ ] Click detection works (select task)
- [ ] Double-click starts session (available tasks)
- [ ] Hover shows title tooltip
- [ ] Status colors match design system
- [ ] Cognitive load glow visible
- [ ] Bloom post-processing creates glow effect
- [ ] Performance: 60fps with 50+ nodes
- [ ] Feature flag allows switching back to 2D

### 1.11 Commit Strategy — Phase 1

```bash
# Commit 1: Dependencies and canvas setup
git commit -m "feat(3d): add Three.js foundation with react-three-fiber

- Install three, @react-three/fiber, @react-three/drei
- Create OrreryCanvas with orthographic camera
- Add bloom post-processing for bioluminescent glow"

# Commit 2: Task sphere component
git commit -m "feat(3d): add TaskSphere 3D node component

- Replace SVG rect with 3D sphere
- Implement status colors and cognitive load glow
- Add breathing/pulse animations via useFrame
- HTML overlays for title and status icon"

# Commit 3: Dependency tube component
git commit -m "feat(3d): add DependencyTube 3D edge component

- Quadratic bezier curves between sphere surfaces
- Energy flow animation for unlock state
- Selection highlight"

# Commit 4: Integration with existing state
git commit -m "feat(3d): integrate MicroView3D with Orrery state

- Convert d3 positions to 3D coordinates
- Maintain existing task/edge logic
- Feature flag for 2D/3D toggle"
```

---

# PHASE 2: DEPTH & CAMERA CONTROLS
## "3D You Can Navigate"

**Objective:** Add perspective camera, orbit controls, and Z-depth distribution
**Duration:** 3-4 days
**Deploys As:** Navigable 3D space with depth

### 2.1 Camera Upgrade

**Update OrreryCanvas.jsx:**

```jsx
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

// Replace OrthographicCamera with:
<PerspectiveCamera
  makeDefault
  position={[0, 0, 50]}
  fov={60}
  near={0.1}
  far={1000}
/>

<OrbitControls
  enablePan={true}
  enableZoom={true}
  enableRotate={true}
  minDistance={10}
  maxDistance={200}
  maxPolarAngle={Math.PI / 2} // Limit to hemisphere
/>
```

### 2.2 Z-Depth Distribution

Distribute nodes in Z based on DAG layer:

```javascript
// In d3PhysicsEngine.js
import { forceZ } from 'd3-force-3d'; // or custom implementation

// Add Z force based on layer
.force('z', forceCustomZ()
  .strength(0.1)
  .z(node => node.layer * 5) // 5 units per layer
)

// Custom Z force (since d3-force doesn't have forceZ)
function forceCustomZ() {
  let nodes;
  let strength = 0.1;
  let targetZ = node => 0;

  function force(alpha) {
    nodes.forEach(node => {
      const target = typeof targetZ === 'function' ? targetZ(node) : targetZ;
      node.vz += (target - node.z) * strength * alpha;
    });
  }

  force.initialize = (_nodes) => { nodes = _nodes; };
  force.strength = (s) => { strength = s; return force; };
  force.z = (z) => { targetZ = z; return force; };

  return force;
}
```

### 2.3 Focus/Blur Depth Effect

Blur nodes outside focus distance:

```jsx
// In TaskSphere, add distance-based effects
const distanceFromCamera = /* calculate from camera position */;
const isFocused = distanceFromCamera < FOCUS_DISTANCE;

<meshStandardMaterial
  // ...
  transparent
  opacity={isFocused ? 1 : 0.5}
/>
```

### 2.4 Verification Checklist — Phase 2

- [ ] Camera orbits smoothly around scene
- [ ] Zoom in/out works with scroll/pinch
- [ ] Pan works with right-click drag
- [ ] Nodes distributed in Z by DAG layer
- [ ] Depth blur/focus effect visible
- [ ] Touch gestures work on mobile
- [ ] Camera has reasonable limits (can't flip upside down)

### 2.5 Commit Strategy — Phase 2

```bash
git commit -m "feat(3d): upgrade to perspective camera with orbit controls"
git commit -m "feat(3d): distribute nodes in Z-depth by DAG layer"
git commit -m "feat(3d): add depth-of-field blur for unfocused nodes"
```

---

# PHASE 3: ORGANISM BEHAVIOR
## "Living 3D Ecosystem"

**Objective:** Port cascade animations, reactive particles, and organism feel to 3D
**Duration:** 3-4 days
**Deploys As:** Alive, responsive 3D environment

### 3.1 3D Cascade Unlock Animation

```jsx
// In TaskSphere
const [isUnlocking, setIsUnlocking] = useState(false);

useEffect(() => {
  if (task._unlockAnimationStart) {
    const delay = Math.max(0, task._unlockAnimationStart - Date.now());
    const timer = setTimeout(() => {
      setIsUnlocking(true);
      // Reset after animation
      setTimeout(() => setIsUnlocking(false), 600);
    }, delay);
    return () => clearTimeout(timer);
  }
}, [task._unlockAnimationStart]);

// In useFrame
if (isUnlocking) {
  // Scale up then back
  const t = (Date.now() - unlockStartTime) / 600;
  const scale = t < 0.5
    ? 1 + 0.2 * (t * 2)           // 0→0.5: grow
    : 1 + 0.2 * (2 - t * 2);      // 0.5→1: shrink
  meshRef.current.scale.setScalar(scale);
}
```

### 3.2 CosmicParticles.jsx (3D Particle System)

**Path:** `/src/components/three/CosmicParticles.jsx`

```jsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function CosmicParticles({ count = 500, focusPosition = null }) {
  const pointsRef = useRef();

  // Generate random particle positions
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;     // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;  // Z
    }
    return positions;
  }, [count]);

  // Animate particles
  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Gentle floating motion
      positions[i3 + 1] += Math.sin(time * 0.5 + i) * 0.002;

      // If focused, drift toward focus position
      if (focusPosition) {
        const dx = focusPosition.x - positions[i3];
        const dy = focusPosition.y - positions[i3 + 1];
        positions[i3] += dx * 0.0001;
        positions[i3 + 1] += dy * 0.0001;
      }

      // Wrap around bounds
      if (positions[i3 + 1] > 50) positions[i3 + 1] = -50;
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
        color="#22d3ee"
        size={0.2}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}
```

### 3.3 Readiness Fill (3D Shader)

Create gradient fill based on upstream completion:

```jsx
// Custom shader material for readiness gradient
const ReadinessMaterial = ({ readiness, baseColor, glowColor }) => {
  return (
    <meshStandardMaterial
      color={baseColor}
      emissive={glowColor}
      emissiveIntensity={readiness * 0.5}
    />
  );
};
```

### 3.4 Verification Checklist — Phase 3

- [ ] Cascade unlock animates spheres in sequence
- [ ] Energy flows along tubes during unlock
- [ ] Particles drift toward focused task
- [ ] Particles respond to session state
- [ ] Readiness glow increases as dependencies complete
- [ ] All animations run at 60fps

### 3.5 Commit Strategy — Phase 3

```bash
git commit -m "feat(3d): add 3D cascade unlock animation"
git commit -m "feat(3d): implement CosmicParticles 3D particle system"
git commit -m "feat(3d): add readiness glow based on dependency completion"
```

---

# PHASE 4: VR INTEGRATION
## "Full Immersive Experience"

**Objective:** Enable VR headset usage via WebXR
**Duration:** 4-5 days
**Deploys As:** Full VR experience with hand tracking

### 4.1 Dependencies

```bash
npm install @react-three/xr
```

### 4.2 VR-Enabled Canvas

**Update OrreryCanvas.jsx:**

```jsx
import { VRButton, XR, Controllers, Hands } from '@react-three/xr';

export function OrreryCanvas({ children }) {
  return (
    <>
      <VRButton />
      <Canvas>
        <XR>
          <Controllers />
          <Hands />
          {/* ... existing content ... */}
        </XR>
      </Canvas>
    </>
  );
}
```

### 4.3 VR Interaction

```jsx
import { useXREvent, useController } from '@react-three/xr';

// In TaskSphere
const handleSelect = useXREvent('select', (event) => {
  // VR controller selection
  onSelect(task.id);
});
```

### 4.4 VR UI Panels

```jsx
import { Text } from '@react-three/drei';

// Floating text labels that always face camera
<Text
  position={[0, -2, 0]}
  fontSize={0.5}
  color="white"
  anchorX="center"
  anchorY="middle"
>
  {task.title}
</Text>
```

### 4.5 Verification Checklist — Phase 4

- [ ] VR Button appears on compatible browsers
- [ ] Scene renders in VR headset
- [ ] Controller tracking works
- [ ] Hand tracking works (if supported)
- [ ] Can select tasks with controllers
- [ ] Text labels readable in VR
- [ ] Performance acceptable in VR (72fps+)

### 4.6 Commit Strategy — Phase 4

```bash
git commit -m "feat(vr): add @react-three/xr for WebXR support"
git commit -m "feat(vr): implement VR controller interaction"
git commit -m "feat(vr): add VR-optimized UI panels"
git commit -m "feat(vr): performance optimization for VR rendering"
```

---

# CRITICAL FILES SUMMARY

| File | Phase | Purpose |
|------|-------|---------|
| `src/components/three/OrreryCanvas.jsx` | 1 | Main 3D canvas |
| `src/components/three/TaskSphere.jsx` | 1 | 3D task node |
| `src/components/three/DependencyTube.jsx` | 1 | 3D edge |
| `src/components/three/CosmicParticles.jsx` | 3 | 3D particle system |
| `src/components/three/CameraController.jsx` | 2 | Camera management |
| `src/components/views/MicroView/MicroView3D.jsx` | 1 | 3D view integration |
| `src/utils/d3PhysicsEngine.js` | 2 | 3D physics extension |
| `src/styles/three.css` | 1 | HTML overlay styles |

---

# TESTING & VERIFICATION

### Simplified Testing (Chrome is Good Enough™)

**Primary test:** Desktop Chrome → works? Ship it.

**Per-phase verification:**
- [ ] Renders without console errors
- [ ] Interactions work (click, hover, drag)
- [ ] 60fps feels smooth
- [ ] VR button appears (Phase 4)

---

# GIT DOCUMENTATION

After Phase 4 complete:

```bash
mkdir -p docs/plans
cat > docs/plans/2025-01-26-3d-visual-evolution.md << 'EOF'
# 3D Visual Evolution: SVG to WebXR

## Summary
Migrated The Orrery from 2D SVG rendering to full 3D with VR support.

## Technology Stack
- Three.js + react-three-fiber
- @react-three/drei for helpers
- @react-three/xr for VR
- @react-three/postprocessing for bloom

## Phases Completed
- Phase 1: 3D Foundation (orthographic camera, basic spheres)
- Phase 2: Depth & Camera (perspective, orbit controls, Z-distribution)
- Phase 3: Organism Behavior (cascade, particles, readiness)
- Phase 4: VR Integration (WebXR, controllers, hand tracking)

## Architecture Decisions
- Kept d3-force for physics (extended to 3D)
- Hybrid approach: looked like 2D initially, added depth incrementally
- Feature flag for 2D fallback (deprecated after Phase 2 stable)

## VR Compatibility
- WebXR API (Quest, Pico, SteamVR)
- Controller + hand tracking
- 72fps target achieved
EOF

git add docs/plans/2025-01-26-3d-visual-evolution.md
git commit -m "docs: add 3D visual evolution design document"
git push origin main
```

---

> **END OF PLAN**
>
> This plan builds 3D from the start with zero throwaway code.
> Each phase deploys independently.
> VR is a natural extension, not a rewrite.
>
> **Total Timeline: ~4 weeks**
