# The Orrery: Celestial Graph Physics Overhaul

> **Plan Version:** 2.0 — Complete Architecture Replacement
> **Previous Plan:** Failed parameter tuning (the architecture was fundamentally broken)
> **This Plan:** Replace custom physics with d3-force + adaptive DAG layer hints

---

## Executive Summary

The current physics implementation is **architecturally broken**:
- Radial bloom forces nodes into rings that **cannot physically fit them**
- Layer 0 (radius 80px) can only hold **3 nodes** without overlap
- Collision runs before velocity application, getting undone each frame
- Result: Nodes pile up in an unusable heap

**The Fix:** Replace custom physics with **d3-force** (what Obsidian uses), keeping DAG layer computation as a gentle hint rather than a hard constraint.

---

## Part 1: Root Cause Analysis

### Why Current Physics Fails

```
┌─────────────────────────────────────────────────────────────────┐
│ FUNDAMENTAL FLAW: Forced Radial Geometry                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Layer 0 target radius: 80px                                     │
│ Circumference: 503px                                            │
│ Node collision radius: 130px                                    │
│ Max nodes that fit: 3                                           │
│                                                                 │
│ You have 20+ tasks. Many are layer 0.                           │
│ THEY CANNOT FIT.                                                │
│                                                                 │
│ Radial force (4.8-28.8) > Repulsion at overlap (20)             │
│ → Nodes forced into overcrowded rings                           │
│ → Collision tries to fix                                        │
│ → Velocities undo collision                                     │
│ → Permanent heap                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### What Obsidian Does Differently

| Aspect | Current Orrery | Obsidian (d3-force) |
|--------|----------------|---------------------|
| Collision | Soft nudge, runs mid-loop | Hard constraint, runs LAST, multiple iterations |
| Repulsion | Weak formula, O(n²) | Barnes-Hut optimized, proper inverse-square |
| Structure | FORCED radial geometry | EMERGENT from link topology |
| DAG awareness | Hard constraint | Gentle hint (or none) |
| Result | Heap | Beautiful organic graph |

---

## Part 2: The Vision

### What The Orrery Graph SHOULD Feel Like

**Obsidian-like organic flow:**
- Nodes find natural positions based on connectivity
- Connected nodes cluster together
- Unconnected nodes spread apart
- DAG structure EMERGES visually without forcing geometry

**Game-like responsiveness:**
- Drag a node → connected nodes follow in real-time
- Release → everything settles into new equilibrium
- Physics feels alive, not static

**DAG visibility through emergence:**
- Roots (no dependencies) naturally cluster
- Downstream experiments naturally radiate
- But NO fixed radii — structure scales with node count

---

## Part 3: Technical Architecture

### d3-force Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW PHYSICS STACK                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  d3.forceSimulation()                                           │
│    ├── forceManyBody()      Strong repulsion (all nodes)        │
│    │     └── strength: -1500 to -3000                           │
│    │                                                            │
│    ├── forceLink()          Spring attraction (edges)           │
│    │     └── distance: 180-250                                  │
│    │     └── strength: 0.3-0.7                                  │
│    │                                                            │
│    ├── forceCollide()       HARD collision (runs last)          │
│    │     └── radius: 80 (node half-width + padding)             │
│    │     └── iterations: 3 (ensure resolution)                  │
│    │                                                            │
│    ├── forceCenter()        Gentle centering                    │
│    │     └── x: 0, y: 0                                         │
│    │                                                            │
│    └── forceRadial()        GENTLE DAG layer hint               │
│          └── radius: computed from layer                        │
│          └── strength: 0.03-0.08 (WEAK - just a preference)     │
│          └── Adapts radius based on nodes per layer             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **forceRadial is WEAK** — It's a preference, not a constraint
   - Collision ALWAYS wins
   - Nodes prefer their layer's radius but spread as needed
   - Radius adapts: `baseRadius + layer * spacing * sqrt(nodesInLayer)`

2. **Collision runs with iterations** — d3-force collision actually resolves overlaps
   - Multiple passes per tick
   - Runs after all other forces
   - Nodes CANNOT overlap when settled

3. **Structure emerges from links** — Connected nodes cluster naturally
   - forceLink creates visual groupings
   - DAG becomes visible through connectivity, not forced geometry

4. **Keep existing DAG computation** — `computeLayers()` is good
   - Provides layer info for gentle radial hints
   - Also used for status computation (blocked/available)

---

## Part 4: Implementation Plan

### Phase 1: Setup (Non-breaking)

**Task 1.1: Install d3-force**
```bash
npm install d3-force
```

**Task 1.2: Create d3-force wrapper**
```
NEW FILE: src/utils/d3PhysicsEngine.js

Purpose: Encapsulate d3-force simulation with Orrery-specific configuration

Exports:
- createSimulation(nodes, links, config) → simulation instance
- tickSimulation(simulation) → updated node positions
- applyDrag(simulation, nodeId, x, y) → pin node during drag
- releaseDrag(simulation, nodeId) → unpin after drag
- isSettled(simulation) → boolean (for stopping animation)
```

### Phase 2: Core Implementation

**Task 2.1: Implement d3PhysicsEngine.js**

```javascript
// src/utils/d3PhysicsEngine.js

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceCenter,
  forceRadial,
} from 'd3-force';

/**
 * Create a d3-force simulation configured for The Orrery
 *
 * @param {Array} nodes - [{id, x, y, layer, pinned}]
 * @param {Array} links - [{source, target}]
 * @param {Object} config - Physics configuration
 * @returns {Object} d3 simulation instance
 */
export function createSimulation(nodes, links, config = {}) {
  const {
    repulsionStrength = -2000,
    linkDistance = 200,
    linkStrength = 0.5,
    collisionRadius = 80,
    collisionIterations = 3,
    radialStrength = 0.05,  // WEAK - just a hint
    layerSpacing = 150,
    baseRadius = 100,
  } = config;

  // Count nodes per layer for adaptive radius
  const layerCounts = new Map();
  nodes.forEach(n => {
    const layer = n.layer || 0;
    layerCounts.set(layer, (layerCounts.get(layer) || 0) + 1);
  });

  // Adaptive radius function: expand based on node count
  const getTargetRadius = (node) => {
    const layer = node.layer || 0;
    const nodesInLayer = layerCounts.get(layer) || 1;
    // Radius grows with sqrt of node count to maintain spacing
    const expansionFactor = Math.sqrt(nodesInLayer / 3);
    return baseRadius + layer * layerSpacing * Math.max(1, expansionFactor);
  };

  const simulation = forceSimulation(nodes)
    // Strong repulsion - all nodes push apart
    .force('charge', forceManyBody()
      .strength(repulsionStrength)
      .distanceMin(30)
      .distanceMax(500)
    )
    // Spring attraction - connected nodes pull together
    .force('link', forceLink(links)
      .id(d => d.id)
      .distance(linkDistance)
      .strength(linkStrength)
    )
    // HARD collision - nodes cannot overlap (runs last, multiple iterations)
    .force('collide', forceCollide()
      .radius(collisionRadius)
      .iterations(collisionIterations)
    )
    // Gentle centering
    .force('center', forceCenter(0, 0).strength(0.05))
    // GENTLE radial DAG hint - just a preference, not a constraint
    .force('radial', forceRadial()
      .radius(getTargetRadius)
      .strength(radialStrength)  // WEAK
    )
    // Start with high alpha for initial layout
    .alpha(1)
    .alphaDecay(0.02)
    .velocityDecay(0.3);

  // Apply pinning for nodes with manual positions
  nodes.forEach(node => {
    if (node.pinned) {
      node.fx = node.x;
      node.fy = node.y;
    }
  });

  return simulation;
}

/**
 * Pin a node during drag
 */
export function applyDrag(simulation, nodeId, x, y) {
  const node = simulation.nodes().find(n => n.id === nodeId);
  if (node) {
    node.fx = x;
    node.fy = y;
  }
  simulation.alpha(0.3).restart(); // Wake up physics
}

/**
 * Release a node after drag (unpin unless manually positioned)
 */
export function releaseDrag(simulation, nodeId, keepPinned = false) {
  const node = simulation.nodes().find(n => n.id === nodeId);
  if (node && !keepPinned) {
    node.fx = null;
    node.fy = null;
  }
}

/**
 * Check if simulation has settled
 */
export function isSettled(simulation) {
  return simulation.alpha() < 0.01;
}

/**
 * Extract positions from simulation nodes
 */
export function getPositions(simulation) {
  const positions = new Map();
  simulation.nodes().forEach(node => {
    positions.set(node.id, { x: node.x, y: node.y });
  });
  return positions;
}
```

**Task 2.2: Update MicroView.jsx to use d3-force**

Changes needed in `src/components/views/MicroView/MicroView.jsx`:

```javascript
// NEW IMPORTS
import {
  createSimulation,
  applyDrag,
  releaseDrag,
  isSettled,
  getPositions,
} from '@/utils/d3PhysicsEngine';

// REPLACE: Physics node state
// OLD: const [physicsNodes, setPhysicsNodes] = useState([]);
// NEW: Use ref for d3 simulation (doesn't trigger re-renders)
const simulationRef = useRef(null);
const [physicsPositions, setPhysicsPositions] = useState(new Map());

// REPLACE: Physics initialization useEffect
useEffect(() => {
  // Convert tasks to d3 nodes
  const nodes = visibleTasks.map(task => {
    const hasManualPos = task.position && (task.position.x !== 0 || task.position.y !== 0);
    const layer = dagLayers.get(task.id) || 0;

    return {
      id: task.id,
      x: hasManualPos ? task.position.x : (Math.random() - 0.5) * 400,
      y: hasManualPos ? task.position.y : (Math.random() - 0.5) * 400,
      layer,
      pinned: hasManualPos,
    };
  });

  // Convert edges to d3 links
  const links = visibleEdges.map(edge => ({
    source: edge.source,
    target: edge.target,
  }));

  // Create simulation
  simulationRef.current = createSimulation(nodes, links, {
    repulsionStrength: -2000,
    linkDistance: 200,
    collisionRadius: 80,
    radialStrength: 0.05,
  });

  return () => {
    if (simulationRef.current) {
      simulationRef.current.stop();
    }
  };
}, [visibleTasks, visibleEdges, dagLayers]);

// REPLACE: Animation frame loop
useAnimationFrame(() => {
  if (!simulationRef.current) return;

  // Tick the simulation
  simulationRef.current.tick();

  // Extract positions for rendering
  setPhysicsPositions(getPositions(simulationRef.current));

  // Check if settled
  if (isSettled(simulationRef.current) && !draggingTaskId) {
    setPhysicsSettled(true);
  }
}, !physicsSettled || draggingTaskId);

// REPLACE: Drag handling
const handleNodeDragStart = useCallback((taskId, e) => {
  // ... existing code for offset calculation ...

  // Pin node in d3 simulation
  if (simulationRef.current) {
    const pos = finalPositions.get(taskId);
    if (pos) {
      applyDrag(simulationRef.current, taskId, pos.x, pos.y);
    }
  }
  setPhysicsSettled(false);
}, [/* deps */]);

const handleMouseMove = useCallback((e) => {
  // ... existing code ...

  if (draggingTaskId && simulationRef.current) {
    const newX = mouseX - dragOffset.x;
    const newY = mouseY - dragOffset.y;
    applyDrag(simulationRef.current, draggingTaskId, newX, newY);
  }
}, [/* deps */]);

const handleMouseUp = useCallback(() => {
  if (draggingTaskId && simulationRef.current) {
    const finalPos = draggedPositions.get(draggingTaskId);
    if (finalPos && dragMovedRef.current) {
      // Persist position
      dispatch({
        type: 'UPDATE_TASK',
        payload: { id: draggingTaskId, updates: { position: finalPos } }
      });
      // Keep pinned since user placed it
      releaseDrag(simulationRef.current, draggingTaskId, true);
    } else {
      // Didn't move, release to physics
      releaseDrag(simulationRef.current, draggingTaskId, false);
    }
  }
  // ... rest of existing code ...
}, [/* deps */]);
```

### Phase 3: Remove Dead Code

**Task 3.1: Clean up forceLayout.js**
- Keep: `computeLayers()` (still needed for DAG layer computation)
- Remove: `physicsStep()`, `initializeNodes()`, `stepLayout()`, `computeLayout()`
- Remove: All the custom force calculations

**Task 3.2: Update exports in utils/index.js**
- Remove old physics exports
- Add new d3PhysicsEngine exports

### Phase 4: Tuning & Polish

**Task 4.1: Parameter tuning**
Test with real Orrery data and adjust:
- `repulsionStrength`: -1500 to -3000 (higher = more spread)
- `linkDistance`: 150 to 250 (connected node spacing)
- `collisionRadius`: 70 to 100 (node half-width + padding)
- `radialStrength`: 0.03 to 0.08 (DAG layer preference, keep WEAK)

**Task 4.2: Visual refinements**
- Ensure edges (CelestialVines) render smoothly with new positions
- Verify drag responsiveness feels Obsidian-like
- Test with various task counts (5, 20, 50, 100)

---

## Part 5: Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Add dependency | `npm install d3-force` |
| `src/utils/d3PhysicsEngine.js` | **CREATE** | New d3-force wrapper |
| `src/utils/forceLayout.js` | Modify | Keep `computeLayers()`, remove physics |
| `src/utils/index.js` | Modify | Update exports |
| `src/components/views/MicroView/MicroView.jsx` | Modify | Use d3-force instead of custom physics |

---

## Part 6: Verification Plan

### Local Testing
```bash
cd /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery
npm install
npm run dev
# Open http://localhost:5173 → Micro view
```

### Visual Verification Checklist
- [ ] **No overlaps:** Nodes never overlap when settled
- [ ] **DAG visible:** Roots cluster near center, downstream radiates out
- [ ] **Organic feel:** Structure emerges from connectivity, not forced geometry
- [ ] **Drag responsive:** Drag a node → connected nodes follow in real-time
- [ ] **Scales:** Works with 5, 20, 50+ nodes without piling up
- [ ] **Edges render:** CelestialVines connect properly between moved nodes
- [ ] **Settlement:** Physics stops when graph is stable (no infinite animation)

### Production Deployment
```bash
git add -A
git commit -m "feat(physics): replace custom physics with d3-force

- Use battle-tested d3-force library (same as Obsidian)
- Implement adaptive radial DAG hints (gentle, not forced)
- Proper collision resolution (nodes never overlap)
- Barnes-Hut optimized repulsion (O(n log n))

Fixes the node heap/overlap issue by using collision as a
hard constraint that runs last, not a soft nudge that gets
undone by velocities.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin main
# Vercel auto-deploys
```

---

## Part 7: Success Criteria

**"I CAN SEE"** — The success signal from the soul transmission:

1. **The unlock tree is VISIBLE** — DAG structure emerges organically
2. **No overlapping heap** — Collision actually works
3. **Obsidian-like feel** — Organic, responsive, alive
4. **Scales gracefully** — 50+ nodes don't pile up
5. **Drag feels RIGHT** — Connected nodes follow naturally

---

## Part 8: Risk Mitigation

| Risk | Mitigation |
|------|------------|
| d3-force API learning curve | Well-documented, many examples online |
| Radial DAG hint too weak | Start at 0.05, tune up if needed |
| Radial DAG hint too strong | Already learned: keep it WEAK |
| Bundle size (+30KB) | Worth it for correct physics |
| Edge cases with pinning | d3 natively supports fx/fy pinning |

---

## Persistence Note

**IMPORTANT:** Before execution, copy this plan to the repository:
```bash
mkdir -p /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/docs/plans
cp /home/ungabunga/.claude/plans/cheerful-painting-flask.md \
   /home/ungabunga/claude-workspace/PROJECTS-WORKSPACE/The-Orrery/docs/plans/d3-force-physics-overhaul.md
```

Plans in `~/.claude/plans/` are ephemeral. Plans in `<repo>/docs/plans/` are canonical and committed.

---

## Timeline

| Phase | Tasks | Verification |
|-------|-------|--------------|
| 1. Setup | Install d3-force | Build succeeds |
| 2. Core | Create d3PhysicsEngine.js, update MicroView | Local visual test |
| 3. Cleanup | Remove dead code | Build succeeds |
| 4. Tuning | Adjust parameters | Visual quality |
| 5. Deploy | Commit, push | Production works |

---

*This plan replaces the failed parameter-tuning approach with a proper architectural fix.*
