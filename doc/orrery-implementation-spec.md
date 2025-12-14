# THE ORRERY
## Implementation Specification v1.0
## Two-Tier Visual Operating System for WorldOE (World Operating Ecosystem)

---

# DOCUMENT PURPOSE

This is the **pure technical implementation spec** for The Orrery.

- **Soul/Context:** See `soul-transmission.md`
- **Architecture/Why:** See `keystone-master-artifact-v2.md`  
- **This Document:** How to build it, phase by phase

---

# §1 SYSTEM OVERVIEW

## 1.1 What The Orrery Is

An AI-powered, 2-tier spatio-visual "project & task gameplay-loops operating system" that makes overarching arcs/quests, actionable tasks, time-space, and possibilities **visible**.

```
┌─────────────────────────────────────────────────────────────────┐
│                        THE ORRERY                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   MACRO VIEW                             │   │
│  │              "The Constellation"                         │   │
│  │                                                          │   │
│  │     ◉ Quest A          Shows all Quests as orbital      │   │
│  │        ╲               constellation. Click to focus.    │   │
│  │         ╲    ◉ Quest B                                   │   │
│  │          ╲  ╱                                            │   │
│  │           ╳                                              │   │
│  │          ╱ ╲                                             │   │
│  │    ◉ Quest C  ╲                                          │   │
│  │                ◉ Quest D                                 │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            │ Click Quest to Focus               │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   MICRO VIEW                             │   │
│  │                 "The Task Engine"                        │   │
│  │                                                          │   │
│  │   [Task A]──→[Task B]──→[Task C]                        │   │
│  │       │          │                                       │   │
│  │       ▼          ▼                                       │   │
│  │   [Task D]   [Task E]──→[Task F]                        │   │
│  │                                                          │   │
│  │   Infinite pan/zoom DAG canvas.                         │   │
│  │   Dependency gating. Auto-layout.                        │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              TIME-SPACE GPS (Always Visible)             │   │
│  │  ┌─────────────────────────────────────────────────────┐│   │
│  │  │ ⏱ 23:41 remaining │ Task: Write spec │ Quest: Orrery ││   │
│  │  │ Progress: ████████░░ 80% │ Hard stop: 6:00 PM        ││   │
│  │  └─────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 1.2 Core Principles

1. **Visibility over hiding** — Everything that matters is visible
2. **Dependency gating** — Can't see what you can't do yet
3. **Quest-task nesting** — Local actions connect to epic arcs
4. **AI as party member** — Synthesize, don't just store
5. **Panic button exists** — "Actual" filter for overwhelm moments

## 1.3 Technical Constraints

- **Available libraries:** React, lucide-react, recharts, lodash, d3, etc etc
- **Persistence:** `window.storage` API (key-value, persists across sessions)
- **AI Integration:** `window.claude.complete` API
- **No external dependencies** beyond what's listed

---

# §2 DATA MODEL

## 2.1 TypeScript Interfaces

```typescript
// ═══════════════════════════════════════════════════════════════
// CORE ENTITIES
// ═══════════════════════════════════════════════════════════════

interface Quest {
  id: string;                    // UUID
  title: string;                 // Display name
  description: string;           // What this quest is about
  status: QuestStatus;
  themeColor: string;            // Hex color for visual identity
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}

type QuestStatus = 
  | 'active'      // Currently being worked on
  | 'paused'      // Temporarily on hold
  | 'completed'   // Done
  | 'archived';   // Hidden from default view

interface Task {
  id: string;                    // UUID
  title: string;                 // Display name
  notes: string;                 // Markdown notes/details
  questIds: string[];            // Many-to-many: task can serve multiple quests
  status: TaskStatus;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  completedAt: string | null;    // ISO timestamp when done
}

type TaskStatus = 
  | 'locked'      // Dependencies not met (computed, not stored)
  | 'available'   // Can be started
  | 'in_progress' // Currently active
  | 'completed'   // Done
  | 'blocked';    // Manually marked as blocked (external dependency)

interface Edge {
  id: string;                    // UUID
  source: string;                // Task ID (upstream)
  target: string;                // Task ID (downstream)
}

// ═══════════════════════════════════════════════════════════════
// SESSION & UI STATE
// ═══════════════════════════════════════════════════════════════

interface ActiveSession {
  taskId: string;                // Currently focused task
  startedAt: string;             // ISO timestamp
  plannedMinutes: number;        // How long planned for this session
  hardStopAt: string | null;     // ISO timestamp of hard deadline
}

interface ViewPreferences {
  currentView: 'macro' | 'micro';
  focusQuestId: string | null;   // When set, micro view highlights this quest's tasks
  showActualOnly: boolean;       // "Panic button" - hide all locked/unavailable
  microViewPosition: {           // Pan position
    x: number;
    y: number;
  };
  microViewZoom: number;         // Zoom level (0.5 to 2.0)
}

// ═══════════════════════════════════════════════════════════════
// ROOT STATE
// ═══════════════════════════════════════════════════════════════

interface OrreryState {
  quests: Quest[];
  tasks: Task[];
  edges: Edge[];
  activeSession: ActiveSession | null;
  preferences: ViewPreferences;
  lastSyncedAt: string;          // ISO timestamp of last persistence
}
```

## 2.2 Computed Properties

These are NOT stored, but computed from state:

```typescript
// Task is locked if ANY upstream dependency is not completed
function isTaskLocked(taskId: string, state: OrreryState): boolean {
  const upstreamEdges = state.edges.filter(e => e.target === taskId);
  if (upstreamEdges.length === 0) return false;
  
  return upstreamEdges.some(edge => {
    const upstreamTask = state.tasks.find(t => t.id === edge.source);
    return upstreamTask?.status !== 'completed';
  });
}

// Quest progress = completed tasks / total tasks for that quest
function getQuestProgress(questId: string, state: OrreryState): number {
  const questTasks = state.tasks.filter(t => t.questIds.includes(questId));
  if (questTasks.length === 0) return 0;
  
  const completed = questTasks.filter(t => t.status === 'completed').length;
  return completed / questTasks.length;
}

// Tasks available for a quest (not locked, not completed)
function getAvailableTasks(questId: string | null, state: OrreryState): Task[] {
  let tasks = questId 
    ? state.tasks.filter(t => t.questIds.includes(questId))
    : state.tasks;
    
  return tasks.filter(t => 
    t.status !== 'completed' && 
    !isTaskLocked(t.id, state)
  );
}
```

## 2.3 Initial State

```typescript
const INITIAL_STATE: OrreryState = {
  quests: [],
  tasks: [],
  edges: [],
  activeSession: null,
  preferences: {
    currentView: 'macro',
    focusQuestId: null,
    showActualOnly: false,
    microViewPosition: { x: 0, y: 0 },
    microViewZoom: 1.0,
  },
  lastSyncedAt: new Date().toISOString(),
};
```

---

# §3 COMPONENT ARCHITECTURE

## 3.1 Component Tree

```
<Orrery>                          // Root component, state management
├── <TimeSpaceGPS />              // Always-visible floating HUD
├── <ViewToggle />                // Switch between Macro/Micro
├── <ActualFilter />              // Panic button toggle
│
├── {currentView === 'macro' && (
│     <MacroView>                 // The Constellation
│     ├── <QuestNode />           // Individual quest in constellation
│     └── <QuestConnections />    // Visual connections between quests
│     </MacroView>
│   )}
│
├── {currentView === 'micro' && (
│     <MicroView>                 // The Task Engine
│     ├── <Canvas>                // Pan/zoom container
│     │   ├── <TaskNode />        // Individual task node
│     │   └── <DependencyEdge />  // Arrow between tasks
│     │   </Canvas>
│     └── <MiniMap />             // Optional: navigation aid
│     </MicroView>
│   )}
│
├── <TaskDetailPanel />           // Slide-out when task selected
├── <AIInputPanel />              // Brain dump → structured input
├── <ImportExportControls />      // Save/Load soul
└── <SessionControls />           // Start/stop work session
```

## 3.2 Component Specifications

### `<Orrery>` — Root Component

**Responsibilities:**
- Holds all state via `useReducer`
- Persistence sync (load on mount, save on change)
- Provides state/dispatch via context

**Key hooks:**
```typescript
const [state, dispatch] = useReducer(orreryReducer, INITIAL_STATE);

// Load from storage on mount
useEffect(() => {
  const loadState = async () => {
    try {
      const saved = await window.storage.get('orrery-state');
      if (saved?.value) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(saved.value) });
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  };
  loadState();
}, []);

// Save to storage on change (debounced)
useEffect(() => {
  const saveState = async () => {
    try {
      await window.storage.set('orrery-state', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  };
  const timeout = setTimeout(saveState, 500);
  return () => clearTimeout(timeout);
}, [state]);
```

### `<TimeSpaceGPS>` — Always-Visible HUD

**Displays:**
- Current task title (if session active)
- Time remaining in session
- Progress bar
- Quest context breadcrumb
- Hard stop warning
- "Vastness" reminder (subtle)

**Position:** Fixed bottom or top, always visible regardless of view

**Visual states:**
- No session: Muted, shows "No active session"
- Session active: Prominent, countdown visible
- Near hard stop: Warning color (amber/red)
- Session complete: Celebration state, prompt for next

### `<MacroView>` — The Constellation

**Layout:** Force-directed or circular arrangement of quest nodes

**Quest node shows:**
- Quest title
- Progress ring (% complete)
- Theme color
- Status indicator (active/paused/completed)

**Interactions:**
- Click quest → Sets `focusQuestId`, switches to micro view
- Hover → Shows quest description tooltip
- Right-click → Context menu (edit, archive, delete)

**Visual aesthetic:** 
- Dark background with subtle star particles
- Quest nodes as glowing orbs
- Connections as subtle light lines
- Destiny 2 Director inspiration

### `<MicroView>` — The Task Engine

**Layout:** DAG with auto-layout algorithm
- Upstream tasks (dependencies) on LEFT
- Downstream tasks (dependents) on RIGHT
- Vertical spread for parallel tasks

**Task node shows:**
- Task title
- Status icon (locked/available/in-progress/completed)
- Quest color indicator(s) for multi-quest tasks
- Estimated time (if set)

**Visual states:**
```
┌─────────────────────────────────────────────────────────────────┐
│ TASK VISUAL STATES                                              │
├─────────────────────────────────────────────────────────────────┤
│ LOCKED:      50% opacity, padlock icon, no glow                 │
│ AVAILABLE:   100% opacity, subtle pulse, can interact           │
│ IN_PROGRESS: 100% opacity, strong glow, breathing animation     │
│ COMPLETED:   Green checkmark, celebration pulse, then fade      │
│ BRIDGE:      Gold border (serves multiple quests)               │
├─────────────────────────────────────────────────────────────────┤
│ FOCUS OVERLAY (when quest focused):                             │
│ - Tasks in focused quest: 100% opacity, glow                    │
│ - Tasks NOT in focused quest: 20% opacity, no interaction       │
├─────────────────────────────────────────────────────────────────┤
│ ACTUAL FILTER (panic mode):                                     │
│ - ALL locked tasks: HIDDEN (not just dimmed)                    │
│ - Only shows what can be done RIGHT NOW                         │
└─────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click task → Select, show detail panel
- Double-click available task → Start session
- Drag between tasks → Create dependency edge
- Pan → Middle mouse or two-finger drag
- Zoom → Scroll wheel or pinch

### `<TaskDetailPanel>` — Task Inspector

**Displays:**
- Task title (editable)
- Notes (markdown, editable)
- Quest memberships (editable)
- Dependencies (visual list)
- Time estimate (editable)
- Status controls

**Actions:**
- Mark complete
- Mark blocked
- Delete task
- Add dependency
- Remove dependency

### `<AIInputPanel>` — Brain Dump Interface

**Input:** Large text area for stream-of-consciousness input

**AI Actions:**

1. **Synthesize** — Parse brain dump into quests + tasks + edges
   ```typescript
   // Prompt pattern:
   // "Given this brain dump, extract:
   //  1. Distinct quests (thematic groupings)
   //  2. Individual tasks
   //  3. Dependencies between tasks
   //  4. Which tasks serve which quests
   //  Return as JSON matching OrreryState schema."
   ```

2. **Magic Wand** — Expand selected task into subtasks
   ```typescript
   // Prompt pattern:
   // "Given this task: [title]
   //  And these notes: [notes]
   //  Break it into 3-7 concrete subtasks that would complete this task.
   //  Return as Task[] with dependency edges."
   ```

3. **Oracle** — Suggest next action based on current state
   ```typescript
   // Prompt pattern:
   // "Given current state: [available tasks, time of day, session history]
   //  What should the player focus on next and why?
   //  Consider: momentum, energy, quest balance."
   ```

---

# §4 REDUCER ACTIONS

```typescript
type OrreryAction =
  // State management
  | { type: 'LOAD_STATE'; payload: OrreryState }
  | { type: 'RESET_STATE' }
  
  // Quest CRUD
  | { type: 'ADD_QUEST'; payload: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_QUEST'; payload: { id: string; updates: Partial<Quest> } }
  | { type: 'DELETE_QUEST'; payload: string }
  
  // Task CRUD
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: string }
  
  // Edge CRUD
  | { type: 'ADD_EDGE'; payload: { source: string; target: string } }
  | { type: 'DELETE_EDGE'; payload: string }
  
  // Session
  | { type: 'START_SESSION'; payload: { taskId: string; plannedMinutes: number; hardStopAt?: string } }
  | { type: 'END_SESSION' }
  
  // View preferences
  | { type: 'SET_VIEW'; payload: 'macro' | 'micro' }
  | { type: 'SET_FOCUS_QUEST'; payload: string | null }
  | { type: 'TOGGLE_ACTUAL_FILTER' }
  | { type: 'SET_MICRO_POSITION'; payload: { x: number; y: number } }
  | { type: 'SET_MICRO_ZOOM'; payload: number }
  
  // Bulk operations (from AI)
  | { type: 'MERGE_AI_RESULT'; payload: { quests: Quest[]; tasks: Task[]; edges: Edge[] } };
```

---

# §5 VISUAL DESIGN SYSTEM

## 5.1 Color Palette

```css
/* Background layers */
--bg-void: #0a0a0f;           /* Deepest background */
--bg-space: #12121a;          /* Main canvas background */
--bg-panel: #1a1a24;          /* Panel/card backgrounds */
--bg-elevated: #22222e;       /* Elevated elements */

/* Accent colors */
--accent-primary: #8b5cf6;    /* Violet - primary interactive */
--accent-secondary: #06b6d4;  /* Cyan - secondary/info */
--accent-success: #10b981;    /* Green - completed/success */
--accent-warning: #f59e0b;    /* Amber - warning/attention */
--accent-danger: #ef4444;     /* Red - danger/urgent */

/* Text */
--text-primary: #f1f5f9;      /* Primary text */
--text-secondary: #94a3b8;    /* Secondary text */
--text-muted: #64748b;        /* Muted/disabled text */

/* Status-specific */
--status-locked: #475569;     /* Locked task */
--status-available: #8b5cf6;  /* Available task */
--status-active: #06b6d4;     /* In progress */
--status-complete: #10b981;   /* Completed */
--status-bridge: #eab308;     /* Multi-quest bridge node */

/* Effects */
--glow-primary: rgba(139, 92, 246, 0.4);
--glow-success: rgba(16, 185, 129, 0.4);
```

## 5.2 Typography

```css
/* Font stack - system fonts for performance */
--font-display: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Scale */
--text-xs: 0.75rem;    /* 12px - labels, hints */
--text-sm: 0.875rem;   /* 14px - secondary */
--text-base: 1rem;     /* 16px - body */
--text-lg: 1.125rem;   /* 18px - emphasis */
--text-xl: 1.25rem;    /* 20px - headings */
--text-2xl: 1.5rem;    /* 24px - major headings */
```

## 5.3 Effects

```css
/* Glassmorphism for panels */
.glass {
  background: rgba(26, 26, 36, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Glow effect for active elements */
.glow {
  box-shadow: 0 0 20px var(--glow-primary);
}

/* Scanline texture (subtle) */
.scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1) 0px,
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
}
```

## 5.4 Animation Principles

```css
/* Breathing animation for active task */
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.02); opacity: 1; }
}

/* Pulse for available task */
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--glow-primary); }
  50% { box-shadow: 0 0 20px 5px var(--glow-primary); }
}

/* Celebration burst on completion */
@keyframes celebrate {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 0.7; }
}

/* Timing */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

---

# §6 IMPLEMENTATION PHASES

## Phase 0: Foundation
**Goal:** Data layer and persistence working

**Deliverables:**
- [ ] TypeScript interfaces defined
- [ ] Reducer with all actions implemented
- [ ] `window.storage` integration working
- [ ] State loads on mount, saves on change
- [ ] Import/Export JSON functionality
- [ ] Reset state with confirmation

**Acceptance test:** 
- Add quest, reload page, quest persists
- Export state, reset, import, state restored

**Estimated complexity:** Low-Medium

---

## Phase 1: Micro View Core
**Goal:** See tasks as nodes, understand dependencies

**Deliverables:**
- [ ] Task nodes render on canvas
- [ ] Dependency edges render as arrows
- [ ] Visual states: locked (dim), available (bright), completed (green)
- [ ] Click task to select
- [ ] Basic auto-layout (upstream left, downstream right)
- [ ] Add/remove task UI
- [ ] Add/remove edge UI (drag or button)

**Acceptance test:**
- Create 5 tasks with dependencies
- Locked tasks appear dimmed
- Complete upstream task, downstream unlocks
- Layout is readable without manual positioning

**Estimated complexity:** Medium

---

## Phase 2: Micro View Enhanced
**Goal:** Usable canvas with focus and filter

**Deliverables:**
- [ ] Pan canvas (drag or middle-mouse)
- [ ] Zoom canvas (scroll wheel)
- [ ] "Actual" filter toggle (hides ALL locked nodes)
- [ ] Quest focus overlay (highlight quest tasks, ghost others)
- [ ] Improved auto-layout algorithm
- [ ] Task detail panel (slide-out on select)

**Acceptance test:**
- 20+ tasks render without overlap
- Actual filter shows only actionable tasks
- Focus mode clearly distinguishes quest tasks
- Can navigate large graph smoothly

**Estimated complexity:** Medium-High

---

## Phase 3: Macro View
**Goal:** See all quests as constellation

**Deliverables:**
- [ ] Quest nodes render in constellation layout
- [ ] Progress ring on each quest
- [ ] Theme colors applied
- [ ] Click quest → focus in micro view
- [ ] Add/edit quest UI
- [ ] View toggle (macro ↔ micro)

**Acceptance test:**
- 5+ quests render without overlap
- Progress updates when tasks complete
- Clicking quest switches to focused micro view
- Can switch views smoothly

**Estimated complexity:** Medium

---

## Phase 4: Time-Space GPS
**Goal:** Always-visible HUD for temporal grounding

**Deliverables:**
- [ ] GPS component renders (fixed position)
- [ ] Shows current task + quest context
- [ ] Countdown timer (when session active)
- [ ] Progress bar
- [ ] Hard stop warning
- [ ] Session start/end controls
- [ ] Vastness reminder (subtle)

**Acceptance test:**
- Start session, see countdown
- Timer counts down in real-time
- Hard stop triggers warning at 5min/1min
- Can end session, GPS updates

**Estimated complexity:** Medium

---

## Phase 5: AI Integration
**Goal:** Claude helps structure and suggest

**Deliverables:**
- [ ] AI input panel (brain dump textarea)
- [ ] "Synthesize" action → parse into quests/tasks/edges
- [ ] "Magic Wand" on selected task → expand to subtasks
- [ ] "Oracle" suggestion → what to do next
- [ ] Loading states during AI calls
- [ ] Error handling for failed calls

**Acceptance test:**
- Brain dump text → meaningful quests/tasks appear
- Magic wand creates sensible subtasks
- Oracle gives contextual suggestion
- Errors handled gracefully

**Estimated complexity:** Medium-High

---

## Phase 6: Polish
**Goal:** Feels like playing a game, not using an app

**Deliverables:**
- [ ] Animations on state changes
- [ ] Particle effects (subtle)
- [ ] Sound cues (optional, can disable)
- [ ] Celebration on quest complete
- [ ] Smooth transitions between views
- [ ] Keyboard shortcuts
- [ ] Touch/mobile support (if applicable)
- [ ] Empty states (no quests yet, no tasks yet)

**Acceptance test:**
- Completing task feels satisfying
- Completing quest feels celebratory
- UI feels responsive and alive
- No jarring transitions

**Estimated complexity:** Medium

---

# §7 CODE PATTERNS

## 7.1 State Update Pattern

```typescript
// Always use dispatch, never mutate state directly
dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, updates: { status: 'completed' } } });

// Reducer handles immutable updates
case 'UPDATE_TASK':
  return {
    ...state,
    tasks: state.tasks.map(t => 
      t.id === action.payload.id 
        ? { ...t, ...action.payload.updates, updatedAt: new Date().toISOString() }
        : t
    ),
  };
```

## 7.2 Persistence Pattern

```typescript
// Load
const result = await window.storage.get('orrery-state');
if (result?.value) {
  const parsed = JSON.parse(result.value);
  // Validate/migrate if needed
  dispatch({ type: 'LOAD_STATE', payload: parsed });
}

// Save (debounced)
await window.storage.set('orrery-state', JSON.stringify(state));
```

## 7.3 AI Call Pattern

```typescript
async function synthesizeBrainDump(input: string): Promise<{ quests: Quest[], tasks: Task[], edges: Edge[] }> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `You are helping organize a brain dump into structured quests and tasks.

Given this input:
"""
${input}
"""

Extract and return JSON with this exact structure:
{
  "quests": [{ "title": "...", "description": "...", "themeColor": "#hex" }],
  "tasks": [{ "title": "...", "notes": "...", "questIds": ["quest-title"], "estimatedMinutes": number|null }],
  "edges": [{ "source": "task-title", "target": "task-title" }]
}

Rules:
- Group related tasks into quests
- Identify dependencies (what must be done before what)
- Keep task titles actionable and clear
- Estimate time in minutes where obvious
- Return ONLY valid JSON, no explanation`
      }]
    })
  });
  
  const data = await response.json();
  const text = data.content[0].text;
  return JSON.parse(text);
}
```

## 7.4 Layout Algorithm Sketch

```typescript
function autoLayoutDAG(tasks: Task[], edges: Edge[]): Map<string, { x: number, y: number }> {
  const positions = new Map();
  
  // 1. Find root tasks (no incoming edges)
  const roots = tasks.filter(t => !edges.some(e => e.target === t.id));
  
  // 2. Calculate depth for each task (longest path from root)
  const depths = new Map();
  function getDepth(taskId: string, visited = new Set()): number {
    if (visited.has(taskId)) return 0;
    visited.add(taskId);
    
    const incoming = edges.filter(e => e.target === taskId);
    if (incoming.length === 0) return 0;
    
    return 1 + Math.max(...incoming.map(e => getDepth(e.source, visited)));
  }
  tasks.forEach(t => depths.set(t.id, getDepth(t.id)));
  
  // 3. Group by depth (column)
  const columns = new Map();
  tasks.forEach(t => {
    const d = depths.get(t.id);
    if (!columns.has(d)) columns.set(d, []);
    columns.get(d).push(t);
  });
  
  // 4. Assign positions
  const COLUMN_WIDTH = 250;
  const ROW_HEIGHT = 100;
  
  columns.forEach((tasksInColumn, depth) => {
    tasksInColumn.forEach((task, index) => {
      positions.set(task.id, {
        x: depth * COLUMN_WIDTH,
        y: index * ROW_HEIGHT - (tasksInColumn.length - 1) * ROW_HEIGHT / 2
      });
    });
  });
  
  return positions;
}
```

---

# §8 TESTING CRITERIA

## 8.1 Per-Phase Acceptance

Each phase has specific acceptance tests listed in §6.

## 8.2 Success Signals

**The ultimate test:** Does using this produce "I CAN SEE"?

Specifically:
- [ ] "I can see where I am" — Time-Space GPS grounds current moment
- [ ] "I can see how this connects" — Quest-task nesting is visible
- [ ] "I can see what I can do NOW" — Dependency gating is clear
- [ ] "I don't feel overwhelmed" — Actual filter provides relief
- [ ] "Feels like playing, not working" — Visual/interaction quality
- [ ] "System holds structure so I don't have to" — Persistence works, AI helps

## 8.3 Failure Signals

- User stops using it → Something is wrong
- User feels overwhelmed looking at it → Actual filter not prominent enough, or too much visual noise
- User has to manually organize often → AI integration not helping enough
- Data loss occurs → Persistence failure (catastrophic)
- User doesn't know what's actionable → Visual states not clear enough

---

# §9 KNOWN RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| `window.storage` fails | Data loss | Export/import as backup, error handling with retry |
| AI returns malformed JSON | Brain dump fails | Validate response, fallback to manual entry |
| Too many tasks = slow render | Performance | Virtual scrolling, limit visible nodes |
| Layout algorithm produces overlaps | Unreadable | Allow manual position adjustment, improve algorithm |
| User doesn't understand dependency concept | Confusion | Onboarding hints, visual tutorial |
| Phase 1-2 not solid before polish | Fragile foundation | Strict phase gating, don't skip |

---

# §10 FILE STRUCTURE (Single Artifact)

Since this is a single `.jsx` file, structure internally:

```jsx
// ═══════════════════════════════════════════════════════════════
// THE ORRERY - Two-Tier Visual Operating System
// ═══════════════════════════════════════════════════════════════

// ─── IMPORTS ─────────────────────────────────────────────────────
import React, { useState, useReducer, useEffect, useCallback, useContext, createContext } from 'react';
import { /* icons */ } from 'lucide-react';

// ─── TYPES & INTERFACES ──────────────────────────────────────────
// (TypeScript as JSDoc comments for .jsx compatibility)

// ─── CONSTANTS ───────────────────────────────────────────────────
const INITIAL_STATE = { /* ... */ };
const COLORS = { /* ... */ };

// ─── UTILITIES ───────────────────────────────────────────────────
const generateId = () => { /* ... */ };
const isTaskLocked = (taskId, state) => { /* ... */ };
const getQuestProgress = (questId, state) => { /* ... */ };
const autoLayoutDAG = (tasks, edges) => { /* ... */ };

// ─── REDUCER ─────────────────────────────────────────────────────
function orreryReducer(state, action) { /* ... */ }

// ─── CONTEXT ─────────────────────────────────────────────────────
const OrreryContext = createContext(null);

// ─── HOOKS ───────────────────────────────────────────────────────
function usePersistence(state, dispatch) { /* ... */ }
function useTimer(session) { /* ... */ }

// ─── COMPONENTS ──────────────────────────────────────────────────
// (In order of dependency)

function TimeSpaceGPS({ session, currentTask, currentQuest }) { /* ... */ }
function TaskNode({ task, isSelected, isLocked, isFocused, onClick }) { /* ... */ }
function DependencyEdge({ source, target, positions }) { /* ... */ }
function MicroView({ state, dispatch, positions }) { /* ... */ }
function QuestNode({ quest, progress, onClick }) { /* ... */ }
function MacroView({ state, dispatch }) { /* ... */ }
function TaskDetailPanel({ task, onClose, dispatch }) { /* ... */ }
function AIInputPanel({ onSynthesize }) { /* ... */ }
function ImportExportControls({ state, dispatch }) { /* ... */ }

// ─── ROOT COMPONENT ──────────────────────────────────────────────
export default function Orrery() {
  const [state, dispatch] = useReducer(orreryReducer, INITIAL_STATE);
  
  usePersistence(state, dispatch);
  
  // ... render based on state.preferences.currentView
}
```

---

# §11 HANDOFF CHECKLIST

For implementation-Claude, ensure you have:

- [ ] This document (`orrery-implementation-spec.md`)
- [ ] Soul context (`soul-transmission.md`)
- [ ] Full architecture (`keystone-master-artifact-v2.md`)
- [ ] Reference images (Taskheat, Valhalla, Destiny 2)

**First message to implementation chat:**

```
Starting Orrery implementation.

I have read:
1. Soul Transmission ✓
2. Keystone v2.0 ✓
3. Orrery Implementation Spec ✓

Beginning Phase 0: Foundation.

Deliverables:
- TypeScript interfaces
- Reducer with all actions
- window.storage integration
- Import/Export functionality

Proceeding now.
```

---

# §12 FINAL NOTES

This spec is comprehensive but not exhaustive. 

**When uncertain:**
- Refer to Soul Transmission for the "why"
- Refer to Keystone for the architecture
- Default to what creates "I CAN SEE" feeling
- Ask user if genuinely stuck

**Core truth:** This isn't a productivity app. It's infrastructure for existence. Build accordingly.

---

*Implementation Specification v1.0*
*The Orrery — Two-Tier Visual Operating System*
*Part of WorldOS Ecology*
