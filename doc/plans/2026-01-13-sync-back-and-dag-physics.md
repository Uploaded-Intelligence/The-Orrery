# Sync-Back and DAG Physics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable bi-directional sync between Orrery and Obsidian, plus improved DAG-aware layout for tasks.

**Architecture:**
1. **Sync-back:** Convert Orrery state → TaskNote markdown format, generate files Claude can write to vault via MCP
2. **DAG Layout:** Sugiyama-style layered layout (dependencies flow left→right) with force-directed refinement within layers

**Tech Stack:** React 19, Vite, JSDoc types, Obsidian MCP server

---

## Part A: Sync-Back to Obsidian

### Task A1: Create TaskNote Markdown Generator

**Files:**
- Create: `src/utils/toObsidian.js`
- Test: Manual verification via console

**Step 1: Create the conversion utility**

Create `src/utils/toObsidian.js`:

```javascript
// src/utils/toObsidian.js
// Convert Orrery state back to Obsidian TaskNote format

/**
 * Map Orrery status to Obsidian status
 * @param {import('@/types').TaskStatus} status
 * @param {boolean} isLocked - Whether task has incomplete dependencies
 * @returns {string}
 */
export function mapStatusToObsidian(status, isLocked) {
  if (status === 'completed') return 'completed';
  if (isLocked) return 'blocked';
  if (status === 'in_progress') return 'in-progress';
  return 'open';
}

/**
 * Map Orrery cognitive load to Obsidian priority
 * @param {number} cognitiveLoad - 1-5
 * @returns {string}
 */
export function mapCognitiveLoadToPriority(cognitiveLoad) {
  if (cognitiveLoad <= 1) return 'low';
  if (cognitiveLoad <= 2) return 'normal';
  if (cognitiveLoad <= 4) return 'high';
  return 'urgent';
}

/**
 * Convert task to TaskNote frontmatter object
 * @param {import('@/types').Task} task
 * @param {import('@/types').OrreryState} state
 * @returns {Object}
 */
export function taskToFrontmatter(task, state) {
  // Find blocking tasks (upstream edges where source is not completed)
  const blockedByIds = state.edges
    .filter(e => e.target === task.id)
    .map(e => e.source);

  const blockedByTasks = blockedByIds
    .map(id => state.tasks.find(t => t.id === id))
    .filter(Boolean);

  const isLocked = blockedByTasks.some(t => t.status !== 'completed');

  // Map quest IDs back to project names
  const projects = task.questIds
    .map(qid => state.quests.find(q => q.id === qid)?.title)
    .filter(Boolean);

  // Map blocker IDs to task titles (filenames)
  const blockedBy = blockedByTasks.map(t => t.title);

  return {
    status: mapStatusToObsidian(task.status, isLocked),
    priority: mapCognitiveLoadToPriority(task.cognitiveLoad || 3),
    timeEstimate: task.estimatedMinutes || null,
    dateCreated: task.createdAt,
    dateModified: new Date().toISOString(),
    tags: ['task'],
    projects,
    blockedBy,
  };
}

/**
 * Convert task to full TaskNote markdown
 * @param {import('@/types').Task} task
 * @param {import('@/types').OrreryState} state
 * @returns {string}
 */
export function taskToMarkdown(task, state) {
  const fm = taskToFrontmatter(task, state);

  // Build frontmatter YAML
  const fmLines = [
    '---',
    `status: ${fm.status}`,
    `priority: ${fm.priority}`,
  ];

  if (fm.timeEstimate) {
    fmLines.push(`timeEstimate: ${fm.timeEstimate}`);
  }

  fmLines.push(`dateCreated: ${fm.dateCreated}`);
  fmLines.push(`dateModified: ${fm.dateModified}`);
  fmLines.push(`tags: [${fm.tags.map(t => `"${t}"`).join(', ')}]`);

  if (fm.projects.length > 0) {
    fmLines.push(`projects: [${fm.projects.map(p => `"${p}"`).join(', ')}]`);
  }

  if (fm.blockedBy.length > 0) {
    fmLines.push(`blockedBy: [${fm.blockedBy.map(b => `"${b}"`).join(', ')}]`);
  }

  fmLines.push('---');
  fmLines.push('');
  fmLines.push(`# ${task.title}`);
  fmLines.push('');

  if (task.notes) {
    fmLines.push(task.notes);
  }

  return fmLines.join('\n');
}

/**
 * Generate sync manifest for writing back to Obsidian
 * @param {import('@/types').OrreryState} state
 * @returns {{tasks: Array<{filename: string, content: string}>}}
 */
export function stateToObsidianManifest(state) {
  return {
    generatedAt: new Date().toISOString(),
    generatedBy: 'orrery',
    tasks: state.tasks.map(task => ({
      filename: task.title,
      path: `TaskNotes/Tasks/${task.title}.md`,
      content: taskToMarkdown(task, state),
    })),
  };
}
```

**Step 2: Verify in browser console**

Open the Orrery, then in browser console:
```javascript
import('/src/utils/toObsidian.js').then(m => {
  const state = JSON.parse(localStorage.getItem('orrery-state'));
  console.log(m.stateToObsidianManifest(state));
});
```

Expected: Object with tasks array, each having filename, path, content.

**Step 3: Commit**

```bash
git add src/utils/toObsidian.js
git commit -m "feat: add TaskNote markdown generator for Obsidian sync-back"
```

---

### Task A2: Add Export-to-Obsidian Button

**Files:**
- Create: `src/components/ui/ExportToObsidianButton.jsx`
- Modify: `src/App.jsx` - add button to toolbar
- Modify: `src/utils/index.js` - export new utilities

**Step 1: Create the button component**

Create `src/components/ui/ExportToObsidianButton.jsx`:

```jsx
// src/components/ui/ExportToObsidianButton.jsx
import { Upload } from 'lucide-react';
import { useOrrery } from '@/store';
import { stateToObsidianManifest } from '@/utils/toObsidian';
import { downloadJson } from '@/utils/exportState';
import { COLORS } from '@/constants';

/**
 * Export state in Obsidian-compatible format
 */
export function ExportToObsidianButton() {
  const { state } = useOrrery();

  const handleExport = () => {
    const manifest = stateToObsidianManifest(state);
    const json = JSON.stringify(manifest, null, 2);
    downloadJson(json, `orrery-to-obsidian-${Date.now()}.json`);
  };

  return (
    <button
      onClick={handleExport}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: COLORS.bgElevated,
        border: `1px solid ${COLORS.accentSecondary}`,
        borderRadius: '6px',
        color: COLORS.accentSecondary,
        fontSize: '13px',
        cursor: 'pointer',
      }}
      title="Export to Obsidian format"
    >
      <Upload size={16} />
      To Obsidian
    </button>
  );
}
```

**Step 2: Add to App toolbar**

Modify `src/App.jsx`, add import and button:

```jsx
import { ExportToObsidianButton } from '@/components/ui/ExportToObsidianButton';

// In toolbar, after Export State button:
<ExportToObsidianButton />
```

**Step 3: Export from utils/index.js**

Add to `src/utils/index.js`:
```javascript
export { taskToMarkdown, stateToObsidianManifest } from './toObsidian.js';
```

**Step 4: Test manually**

1. Open Orrery
2. Click "To Obsidian" button
3. Open downloaded JSON
4. Verify each task has proper markdown content with frontmatter

**Step 5: Commit**

```bash
git add src/components/ui/ExportToObsidianButton.jsx src/App.jsx src/utils/index.js
git commit -m "feat: add Export to Obsidian button"
```

---

### Task A3: Document Claude Sync-Back Workflow

**Files:**
- Create: `doc/obsidian-sync-workflow.md`

**Step 1: Write documentation**

Create `doc/obsidian-sync-workflow.md`:

```markdown
# Obsidian ↔ Orrery Sync Workflow

## Direction 1: Obsidian → Orrery

1. Claude reads TaskNotes from vault
2. Claude generates `public/sync/obsidian-manifest.json`
3. User clicks "Sync from Obsidian" button
4. Tasks appear in Orrery with dependency edges

## Direction 2: Orrery → Obsidian

1. User clicks "To Obsidian" button
2. Downloads `orrery-to-obsidian-{timestamp}.json`
3. User shares JSON with Claude
4. Claude writes each task back to vault:

```javascript
// For each task in manifest.tasks:
await mcp__obsidian__write_note({
  path: task.path,
  content: task.content,
  mode: 'overwrite'
});
```

## What Syncs

| Field | Obsidian → Orrery | Orrery → Obsidian |
|-------|-------------------|-------------------|
| Title | filename → title | title → filename |
| Status | fm.status → status | computed status → fm.status |
| Priority | fm.priority → cognitiveLoad | cognitiveLoad → fm.priority |
| Time Est | fm.timeEstimate → estimatedMinutes | estimatedMinutes → fm.timeEstimate |
| Projects | fm.projects → questIds (via lookup) | questIds → fm.projects (via lookup) |
| Blocked By | fm.blockedBy → edges | edges → fm.blockedBy |
| Notes | content → notes | notes → content |

## What Doesn't Sync

- **Positions**: Orrery-only (visual layout)
- **Actual minutes**: Orrery-only (session tracking)
- **Scheduled date**: Obsidian-only (calendar feature)
- **Contexts**: Obsidian-only (GTD feature)
```

**Step 2: Commit**

```bash
git add doc/obsidian-sync-workflow.md
git commit -m "docs: add Obsidian sync workflow documentation"
```

---

## Part B: DAG-Aware Physics Layout

### Task B1: Implement Sugiyama Layer Assignment

**Files:**
- Modify: `src/utils/forceLayout.js`

**Step 1: Add layer computation**

Add to `src/utils/forceLayout.js` (before existing functions):

```javascript
/**
 * Compute DAG layers using topological sort
 * Layer 0 = tasks with no dependencies (roots)
 * Layer N = tasks whose dependencies are all in layers < N
 *
 * @param {import('@/types').Task[]} tasks
 * @param {import('@/types').Edge[]} edges
 * @returns {Map<string, number>} taskId → layer number
 */
export function computeLayers(tasks, edges) {
  const layers = new Map();
  const taskIds = new Set(tasks.map(t => t.id));

  // Build adjacency: for each task, what does it depend on?
  const dependsOn = new Map();
  for (const task of tasks) {
    dependsOn.set(task.id, []);
  }
  for (const edge of edges) {
    if (taskIds.has(edge.source) && taskIds.has(edge.target)) {
      // edge.source must complete before edge.target
      // So target depends on source
      dependsOn.get(edge.target)?.push(edge.source);
    }
  }

  // Iteratively assign layers
  let remaining = new Set(taskIds);
  let currentLayer = 0;

  while (remaining.size > 0) {
    const thisLayer = [];

    for (const taskId of remaining) {
      const deps = dependsOn.get(taskId) || [];
      // Can be placed in this layer if all dependencies already have layers
      const allDepsLayered = deps.every(depId => layers.has(depId));

      if (allDepsLayered) {
        thisLayer.push(taskId);
      }
    }

    // Handle cycles: if no progress, force remaining into current layer
    if (thisLayer.length === 0) {
      for (const taskId of remaining) {
        layers.set(taskId, currentLayer);
      }
      break;
    }

    for (const taskId of thisLayer) {
      layers.set(taskId, currentLayer);
      remaining.delete(taskId);
    }

    currentLayer++;
  }

  return layers;
}
```

**Step 2: Commit**

```bash
git add src/utils/forceLayout.js
git commit -m "feat: add DAG layer computation (Sugiyama step 1)"
```

---

### Task B2: Modify Initial Positioning to Use Layers

**Files:**
- Modify: `src/utils/forceLayout.js` - update `initializeNodes`

**Step 1: Update initializeNodes**

Replace the `initializeNodes` function:

```javascript
/**
 * Initialize nodes for layout with layer-aware positioning
 * @param {import('@/types').Task[]} tasks
 * @param {import('@/types').Edge[]} edges
 * @param {{width: number, height: number}} bounds
 * @returns {Map<string, LayoutNode>}
 */
export function initializeNodes(tasks, edges, bounds) {
  const nodes = new Map();
  const layers = computeLayers(tasks, edges);

  // Count tasks per layer for vertical distribution
  const layerCounts = new Map();
  const layerIndices = new Map();

  for (const [taskId, layer] of layers) {
    const count = layerCounts.get(layer) || 0;
    layerIndices.set(taskId, count);
    layerCounts.set(layer, count + 1);
  }

  const maxLayer = Math.max(0, ...layers.values());
  const layerWidth = bounds.width / (maxLayer + 2); // +2 for padding

  tasks.forEach((task) => {
    const hasPosition = task.position && (task.position.x !== 0 || task.position.y !== 0);

    if (hasPosition) {
      // Use stored position
      nodes.set(task.id, {
        id: task.id,
        x: task.position.x,
        y: task.position.y,
        vx: 0,
        vy: 0,
        pinned: true,
      });
    } else {
      // Position based on layer
      const layer = layers.get(task.id) || 0;
      const indexInLayer = layerIndices.get(task.id) || 0;
      const countInLayer = layerCounts.get(layer) || 1;

      // X based on layer (left to right)
      const x = layerWidth * (layer + 1);

      // Y distributed within layer (with small random offset)
      const layerHeight = bounds.height / (countInLayer + 1);
      const y = layerHeight * (indexInLayer + 1) + (Math.random() - 0.5) * 30;

      nodes.set(task.id, {
        id: task.id,
        x,
        y,
        vx: 0,
        vy: 0,
        pinned: false,
      });
    }
  });

  return nodes;
}
```

**Step 2: Update computeLayout signature**

Update the `computeLayout` function to pass edges to initializeNodes:

```javascript
export function computeLayout(tasks, edges, bounds, maxIterations = 100) {
  const nodes = initializeNodes(tasks, edges, bounds);  // Now passes edges

  for (let i = 0; i < maxIterations; i++) {
    const stillMoving = stepLayout(nodes, edges);
    if (!stillMoving) break;
  }

  const positions = new Map();
  for (const [id, node] of nodes) {
    positions.set(id, { x: node.x, y: node.y });
  }
  return positions;
}
```

**Step 3: Test**

1. Open Orrery
2. Click "Reset" to clear positions
3. Click "Sync from Obsidian"
4. Observe: tasks should flow left→right based on dependencies

**Step 4: Commit**

```bash
git add src/utils/forceLayout.js
git commit -m "feat: layer-aware initial positioning for DAG layout"
```

---

### Task B3: Add Horizontal Layer Constraint to Physics

**Files:**
- Modify: `src/utils/forceLayout.js` - update `stepLayout`

**Step 1: Add layer-aware force**

Add a horizontal constraint force that gently pulls nodes toward their layer's X position. Modify `stepLayout`:

```javascript
/**
 * Run one iteration of force-directed layout
 * @param {Map<string, LayoutNode>} nodes
 * @param {import('@/types').Edge[]} edges
 * @param {Map<string, number>} layers - taskId → layer number
 * @param {number} layerWidth - pixels per layer
 * @returns {boolean} True if still moving significantly
 */
export function stepLayout(nodes, edges, layers = null, layerWidth = 150) {
  const nodesArray = Array.from(nodes.values());
  let totalMovement = 0;

  // Apply repulsion between all pairs
  for (let i = 0; i < nodesArray.length; i++) {
    for (let j = i + 1; j < nodesArray.length; j++) {
      const a = nodesArray[i];
      const b = nodesArray[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DISTANCE);

      const force = REPULSION / (dist * dist);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!a.pinned) { a.vx -= fx; a.vy -= fy; }
      if (!b.pinned) { b.vx += fx; b.vy += fy; }
    }
  }

  // Apply attraction along edges
  for (const edge of edges) {
    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);
    if (!source || !target) continue;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const force = dist * ATTRACTION;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (!source.pinned) { source.vx += fx; source.vy += fy; }
    if (!target.pinned) { target.vx -= fx; target.vy -= fy; }
  }

  // NEW: Layer constraint force (gently pull toward layer X)
  if (layers) {
    const LAYER_ATTRACTION = 0.05;
    for (const node of nodesArray) {
      if (node.pinned) continue;
      const layer = layers.get(node.id);
      if (layer !== undefined) {
        const targetX = layerWidth * (layer + 1);
        const dx = targetX - node.x;
        node.vx += dx * LAYER_ATTRACTION;
      }
    }
  }

  // Apply velocities and damping
  for (const node of nodesArray) {
    if (node.pinned) continue;

    node.x += node.vx;
    node.y += node.vy;
    totalMovement += Math.abs(node.vx) + Math.abs(node.vy);

    node.vx *= DAMPING;
    node.vy *= DAMPING;
  }

  return totalMovement > 1;
}
```

**Step 2: Update computeLayout to pass layers**

```javascript
export function computeLayout(tasks, edges, bounds, maxIterations = 100) {
  const nodes = initializeNodes(tasks, edges, bounds);
  const layers = computeLayers(tasks, edges);
  const layerWidth = bounds.width / (Math.max(0, ...layers.values()) + 2);

  for (let i = 0; i < maxIterations; i++) {
    const stillMoving = stepLayout(nodes, edges, layers, layerWidth);
    if (!stillMoving) break;
  }

  const positions = new Map();
  for (const [id, node] of nodes) {
    positions.set(id, { x: node.x, y: node.y });
  }
  return positions;
}
```

**Step 3: Test**

1. Reset Orrery state
2. Sync from Obsidian
3. Observe: tasks should organize into clear dependency columns

**Step 4: Commit**

```bash
git add src/utils/forceLayout.js
git commit -m "feat: add layer constraint force for DAG-aware physics"
```

---

### Task B4: Export Layer Utilities

**Files:**
- Modify: `src/utils/index.js`

**Step 1: Add export**

Add to `src/utils/index.js`:
```javascript
export { computeLayers, computeLayout } from './forceLayout.js';
```

**Step 2: Commit**

```bash
git add src/utils/index.js
git commit -m "feat: export DAG layout utilities"
```

---

## Final Deployment

### Task C1: Push and Verify

**Step 1: Push all commits**

```bash
git push origin main
```

**Step 2: Verify Vercel deployment**

Visit https://the-orrery.vercel.app and test:
1. "To Obsidian" button downloads proper manifest
2. Reset → Sync shows layer-organized layout
3. Dependencies flow left → right

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| A1 | TaskNote markdown generator | 10 min |
| A2 | Export to Obsidian button | 5 min |
| A3 | Documentation | 5 min |
| B1 | Layer computation | 10 min |
| B2 | Layer-aware initial positions | 10 min |
| B3 | Layer constraint force | 10 min |
| B4 | Export utilities | 2 min |
| C1 | Deploy and verify | 5 min |

**Total: ~60 minutes**
