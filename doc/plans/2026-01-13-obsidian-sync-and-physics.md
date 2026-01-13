# Obsidian Sync + Force-Directed Physics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect the Orrery to Obsidian TaskNotes as backend, with physics-based auto-layout for Claude-generated tasks.

**Architecture:** Obsidian owns CONTENT (what tasks are), Orrery owns VISUAL (where they appear). JSON is the interchange format. Claude mediates sync during sessions; import/export buttons enable standalone use. Force-directed physics handles layout for tasks without manual positions.

**Tech Stack:** React 19, Vite, localStorage persistence, JSON files in `public/sync/`

---

## Phase 1: Import Mechanism

### Task 1.1: Create Sync Data Structures

**Files:**
- Create: `src/utils/obsidianSync.js`
- Modify: `src/types/index.js` (add sync types)

**Step 1: Add sync types to types/index.js**

```javascript
/**
 * @typedef {Object} ObsidianTaskNote
 * @property {string} filename - Filename without .md extension (used as ID)
 * @property {Object} fm - Frontmatter
 * @property {string} fm.status - "open" | "completed" | "blocked"
 * @property {string} fm.priority - "low" | "normal" | "high" | "urgent"
 * @property {number} [fm.timeEstimate] - Minutes
 * @property {string[]} [fm.projects] - Quest names
 * @property {string[]} [fm.blockedBy] - Task filenames this is blocked by
 * @property {string} [fm.dateCreated]
 * @property {string} [fm.dateModified]
 * @property {string} content - Markdown content
 */

/**
 * @typedef {Object} SyncManifest
 * @property {string} generatedAt - ISO timestamp
 * @property {string} generatedBy - "claude" | "manual"
 * @property {ObsidianTaskNote[]} tasks
 * @property {{name: string, color: string}[]} quests - Project → Quest mapping
 */
```

**Step 2: Create obsidianSync.js utility**

```javascript
// src/utils/obsidianSync.js
// Utilities for syncing between Obsidian TaskNotes and Orrery state

/**
 * Map Obsidian status to Orrery TaskStatus
 * @param {string} obsidianStatus
 * @returns {import('@/types').TaskStatus}
 */
export function mapStatus(obsidianStatus) {
  const statusMap = {
    'open': 'available',
    'in-progress': 'in_progress',
    'completed': 'completed',
    'blocked': 'blocked',
  };
  return statusMap[obsidianStatus] || 'available';
}

/**
 * Map Obsidian priority to Orrery CognitiveLoad
 * @param {string} priority
 * @returns {import('@/types').CognitiveLoad}
 */
export function mapPriorityToCognitiveLoad(priority) {
  const loadMap = {
    'low': 1,
    'normal': 3,
    'high': 4,
    'urgent': 5,
  };
  return loadMap[priority] || 3;
}

/**
 * Generate deterministic UUID from filename
 * @param {string} filename
 * @returns {string}
 */
export function filenameToId(filename) {
  // Simple hash-based UUID generation for consistency
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `obs-${hex}-${filename.slice(0, 8).replace(/[^a-zA-Z0-9]/g, '')}`;
}

/**
 * Convert ObsidianTaskNote to Orrery Task
 * @param {import('@/types').ObsidianTaskNote} note
 * @param {Map<string, string>} questNameToId - Maps project name → quest ID
 * @returns {import('@/types').Task}
 */
export function taskNoteToTask(note, questNameToId) {
  const now = new Date().toISOString();
  const questIds = (note.fm.projects || [])
    .map(p => questNameToId.get(p))
    .filter(Boolean);

  return {
    id: filenameToId(note.filename),
    title: note.filename, // Title is the filename
    notes: note.content,
    questIds,
    status: mapStatus(note.fm.status),
    estimatedMinutes: note.fm.timeEstimate || null,
    actualMinutes: null,
    cognitiveLoad: mapPriorityToCognitiveLoad(note.fm.priority),
    blockers: [],
    position: null, // Let physics handle it
    createdAt: note.fm.dateCreated || now,
    updatedAt: note.fm.dateModified || now,
    completedAt: note.fm.status === 'completed' ? now : null,
  };
}

/**
 * Convert SyncManifest to partial OrreryState
 * @param {import('@/types').SyncManifest} manifest
 * @returns {{tasks: import('@/types').Task[], quests: import('@/types').Quest[], edges: import('@/types').Edge[]}}
 */
export function manifestToState(manifest) {
  // Build quest name → ID map
  const questNameToId = new Map();
  const quests = manifest.quests.map((q, i) => {
    const id = `quest-${q.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    questNameToId.set(q.name, id);
    return {
      id,
      title: q.name,
      description: '',
      status: 'active',
      themeColor: q.color,
      position: null,
      createdAt: manifest.generatedAt,
      updatedAt: manifest.generatedAt,
    };
  });

  // Convert tasks
  const tasks = manifest.tasks.map(note => taskNoteToTask(note, questNameToId));

  // Build edges from blockedBy relationships
  const taskFilenameToId = new Map(
    manifest.tasks.map(t => [t.filename, filenameToId(t.filename)])
  );

  const edges = [];
  for (const note of manifest.tasks) {
    const targetId = filenameToId(note.filename);
    for (const blockerFilename of (note.fm.blockedBy || [])) {
      const sourceId = taskFilenameToId.get(blockerFilename);
      if (sourceId) {
        edges.push({
          id: `edge-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
        });
      }
    }
  }

  return { tasks, quests, edges };
}
```

**Step 3: Verify file created**

Run: `head -20 src/utils/obsidianSync.js`
Expected: Shows the utility functions

**Step 4: Commit**

```bash
git add src/utils/obsidianSync.js src/types/index.js
git commit -m "feat: add Obsidian sync utilities and types"
```

---

### Task 1.2: Add Import Action to Reducer

**Files:**
- Modify: `src/state/reducer.js`

**Step 1: Add IMPORT_FROM_OBSIDIAN action**

Add to the switch statement in reducer.js:

```javascript
case 'IMPORT_FROM_OBSIDIAN': {
  // payload: { tasks, quests, edges } from manifestToState()
  const { tasks: newTasks, quests: newQuests, edges: newEdges } = action.payload;

  // Merge strategy: Add new, update existing (by ID), preserve positions
  const existingTaskMap = new Map(state.tasks.map(t => [t.id, t]));
  const existingQuestMap = new Map(state.quests.map(q => [q.id, q]));

  const mergedTasks = newTasks.map(newTask => {
    const existing = existingTaskMap.get(newTask.id);
    if (existing) {
      // Preserve position and actual minutes, update content
      return {
        ...newTask,
        position: existing.position,
        actualMinutes: existing.actualMinutes,
      };
    }
    return newTask;
  });

  const mergedQuests = newQuests.map(newQuest => {
    const existing = existingQuestMap.get(newQuest.id);
    if (existing) {
      return { ...newQuest, position: existing.position };
    }
    return newQuest;
  });

  // Merge edges (add new, keep existing)
  const existingEdgeIds = new Set(state.edges.map(e => e.id));
  const mergedEdges = [
    ...state.edges,
    ...newEdges.filter(e => !existingEdgeIds.has(e.id)),
  ];

  return {
    ...state,
    tasks: mergedTasks,
    quests: mergedQuests,
    edges: mergedEdges,
    lastSyncedAt: new Date().toISOString(),
  };
}
```

**Step 2: Commit**

```bash
git add src/state/reducer.js
git commit -m "feat: add IMPORT_FROM_OBSIDIAN reducer action"
```

---

### Task 1.3: Add Sync Button to UI

**Files:**
- Modify: `src/App.jsx` (add sync button)
- Create: `src/components/ui/SyncButton.jsx`

**Step 1: Create SyncButton component**

```jsx
// src/components/ui/SyncButton.jsx
import { useState } from 'react';
import { manifestToState } from '@/utils/obsidianSync';

/**
 * Button to import state from Obsidian sync manifest
 * @param {{dispatch: Function}} props
 */
export function SyncButton({ dispatch }) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/sync/obsidian-manifest.json');
      if (!response.ok) {
        throw new Error(`No sync file found (${response.status})`);
      }

      const manifest = await response.json();
      const stateUpdate = manifestToState(manifest);

      dispatch({
        type: 'IMPORT_FROM_OBSIDIAN',
        payload: stateUpdate,
      });

    } catch (err) {
      setError(err.message);
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        background: syncing ? '#666' : '#4a5568',
        color: 'white',
        border: 'none',
        cursor: syncing ? 'wait' : 'pointer',
        fontSize: '14px',
      }}
      title={error || 'Import tasks from Obsidian'}
    >
      {syncing ? 'Syncing...' : error ? '⚠️ Retry Sync' : '🔄 Sync from Obsidian'}
    </button>
  );
}
```

**Step 2: Add SyncButton to App.jsx header area**

Find the header/toolbar area in App.jsx and add:

```jsx
import { SyncButton } from '@/components/ui/SyncButton';

// In the render, add to toolbar:
<SyncButton dispatch={dispatch} />
```

**Step 3: Commit**

```bash
git add src/components/ui/SyncButton.jsx src/App.jsx
git commit -m "feat: add Sync from Obsidian button"
```

---

### Task 1.4: Create Sample Sync Manifest (Claude-Generated)

**Files:**
- Create: `public/sync/obsidian-manifest.json`

**Step 1: Claude generates manifest from actual TaskNotes**

This step is done by Claude reading the Obsidian vault and generating the JSON.

```json
{
  "generatedAt": "2026-01-13T18:00:00.000Z",
  "generatedBy": "claude",
  "quests": [
    {"name": "orrery", "color": "#8b5cf6"}
  ],
  "tasks": [
    {
      "filename": "Build Orrery macro view",
      "fm": {
        "status": "open",
        "priority": "normal",
        "timeEstimate": 60,
        "projects": ["orrery"],
        "blockedBy": []
      },
      "content": "Create the quest constellation view..."
    }
  ]
}
```

**Step 2: Commit**

```bash
git add public/sync/obsidian-manifest.json
git commit -m "feat: add sample Obsidian sync manifest"
```

---

## Phase 2: Export Mechanism

### Task 2.1: Add Export Function

**Files:**
- Create: `src/utils/exportState.js`
- Create: `src/components/ui/ExportButton.jsx`

**Step 1: Create export utility**

```javascript
// src/utils/exportState.js

/**
 * Convert Orrery state to downloadable JSON
 * @param {import('@/types').OrreryState} state
 * @returns {string} JSON string
 */
export function stateToExportJson(state) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    tasks: state.tasks,
    quests: state.quests,
    edges: state.edges,
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Trigger file download
 * @param {string} content
 * @param {string} filename
 */
export function downloadJson(content, filename) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Step 2: Create ExportButton component**

```jsx
// src/components/ui/ExportButton.jsx
import { stateToExportJson, downloadJson } from '@/utils/exportState';

export function ExportButton({ state }) {
  const handleExport = () => {
    const json = stateToExportJson(state);
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadJson(json, `orrery-export-${timestamp}.json`);
  };

  return (
    <button
      onClick={handleExport}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        background: '#4a5568',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      📤 Export State
    </button>
  );
}
```

**Step 3: Add to App.jsx**

```jsx
import { ExportButton } from '@/components/ui/ExportButton';

// In toolbar:
<ExportButton state={state} />
```

**Step 4: Commit**

```bash
git add src/utils/exportState.js src/components/ui/ExportButton.jsx src/App.jsx
git commit -m "feat: add Export State button"
```

---

## Phase 3: Force-Directed Physics

### Task 3.1: Implement Force-Directed Layout Algorithm

**Files:**
- Create: `src/utils/forceLayout.js`

**Step 1: Create force layout utility**

```javascript
// src/utils/forceLayout.js
// Simple force-directed layout for tasks without manual positions

const REPULSION = 5000;    // Node repulsion strength
const ATTRACTION = 0.01;   // Edge attraction (spring constant)
const DAMPING = 0.8;       // Velocity damping
const MIN_DISTANCE = 100;  // Minimum node separation

/**
 * @typedef {Object} LayoutNode
 * @property {string} id
 * @property {number} x
 * @property {number} y
 * @property {number} vx - velocity x
 * @property {number} vy - velocity y
 * @property {boolean} pinned - If true, position is fixed
 */

/**
 * Initialize nodes for layout
 * @param {import('@/types').Task[]} tasks
 * @param {{width: number, height: number}} bounds
 * @returns {Map<string, LayoutNode>}
 */
export function initializeNodes(tasks, bounds) {
  const nodes = new Map();
  const centerX = bounds.width / 2;
  const centerY = bounds.height / 2;

  tasks.forEach((task, i) => {
    const hasPosition = task.position && (task.position.x !== 0 || task.position.y !== 0);
    nodes.set(task.id, {
      id: task.id,
      x: hasPosition ? task.position.x : centerX + (Math.random() - 0.5) * 200,
      y: hasPosition ? task.position.y : centerY + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
      pinned: hasPosition, // Pinned if manually positioned
    });
  });

  return nodes;
}

/**
 * Run one iteration of force-directed layout
 * @param {Map<string, LayoutNode>} nodes
 * @param {import('@/types').Edge[]} edges
 * @returns {boolean} True if still moving significantly
 */
export function stepLayout(nodes, edges) {
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
    const dist = Math.sqrt(dx * dx + dy * dy);

    const force = dist * ATTRACTION;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (!source.pinned) { source.vx += fx; source.vy += fy; }
    if (!target.pinned) { target.vx -= fx; target.vy -= fy; }
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

  return totalMovement > 1; // Still moving if total > threshold
}

/**
 * Run layout until settled
 * @param {import('@/types').Task[]} tasks
 * @param {import('@/types').Edge[]} edges
 * @param {{width: number, height: number}} bounds
 * @param {number} maxIterations
 * @returns {Map<string, {x: number, y: number}>} Final positions
 */
export function computeLayout(tasks, edges, bounds, maxIterations = 100) {
  const nodes = initializeNodes(tasks, bounds);

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

**Step 2: Commit**

```bash
git add src/utils/forceLayout.js
git commit -m "feat: add force-directed layout algorithm"
```

---

### Task 3.2: Integrate Physics into MicroView

**Files:**
- Modify: `src/components/views/MicroView/MicroView.jsx`

**Step 1: Add physics hook**

Add to MicroView.jsx imports:

```javascript
import { computeLayout } from '@/utils/forceLayout';
```

**Step 2: Add effect to compute physics positions**

After the existing position computation, add:

```javascript
// Compute physics-based positions for tasks without manual positions
const physicsPositions = useMemo(() => {
  const unpinnedTasks = tasks.filter(t => !t.position || (t.position.x === 0 && t.position.y === 0));
  if (unpinnedTasks.length === 0) return new Map();

  // Use container bounds (estimate if not available)
  const bounds = { width: 800, height: 600 };
  return computeLayout(tasks, edges, bounds);
}, [tasks, edges]);

// Merge physics positions with manual positions
const finalPositions = useMemo(() => {
  const merged = new Map(positions);
  for (const [id, pos] of physicsPositions) {
    if (!positions.has(id) || (positions.get(id).x === 0 && positions.get(id).y === 0)) {
      merged.set(id, pos);
    }
  }
  return merged;
}, [positions, physicsPositions]);
```

**Step 3: Use finalPositions instead of positions in rendering**

Replace references to `positions` with `finalPositions` in the JSX rendering.

**Step 4: Commit**

```bash
git add src/components/views/MicroView/MicroView.jsx
git commit -m "feat: integrate force-directed physics into MicroView"
```

---

## Phase 4: Deploy and Test

### Task 4.1: Generate Real Sync Manifest

**Step 1: Claude reads all TaskNotes and generates manifest**

This is done in Claude session, not as code.

### Task 4.2: Deploy to Vercel

```bash
cd /home/ungabunga/claude-workspace/The-Orrery
git push origin main
# Vercel auto-deploys
```

### Task 4.3: Test End-to-End

1. Open https://the-orrery.vercel.app
2. Click "Sync from Obsidian"
3. Verify tasks appear with physics layout
4. Drag a task to pin its position
5. Click "Export State" to download JSON
6. Verify JSON contains tasks and positions

---

## Summary

| Phase | Purpose | Outcome |
|-------|---------|---------|
| 1 | Import | Orrery can load from Obsidian manifest |
| 2 | Export | User can download state as JSON |
| 3 | Physics | Claude-generated tasks auto-layout |
| 4 | Deploy | Live testing |

**Total commits:** ~8 focused commits
**Estimated tasks:** 12 steps
