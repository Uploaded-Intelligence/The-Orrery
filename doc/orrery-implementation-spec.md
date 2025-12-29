# THE ORRERY
## Implementation Specification v1.0
## Two-Tier Visual Operating System for WorldOE (World Operating Ecosystem)

---

# DOCUMENT PURPOSE

This is the implementation spec for The Orrery.

- **Soul/Context:** See `soul-transmission.md` (REQUIRED READING)
- **Architecture/Why:** See `keystone-master-artifact-v2.md` (REQUIRED READING)
- **This Document:** How to build it, phase by phase

---

# §0 FOUNDATIONAL TRUTH — READ THIS FIRST

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║   THE ORRERY IS A GAME.                                                        ║
║                                                                                ║
║   Not: a productivity tool with game aesthetics.                               ║
║   But: a GAME where your actual life quests are the content.                   ║
║                                                                                ║
║   This is not metaphor. This is the foundational design principle.             ║
║   If you lose sight of this, you will build the wrong thing.                   ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

## §0.1 Why Game-Dev IS The Way

Games work for human nervous systems because they are **designed around how brains actually work**, not how industrial productivity culture wishes they worked.

**Traditional productivity tools fail because they assume:**
- Executive function is reliable
- Willpower is the mechanism
- Checklists generate motivation
- Structure can be self-generated from nothing
- Tasks are meaningful in isolation

**Games succeed because they provide:**
- Immediate feedback loops (every action produces visible response)
- Intrinsic motivation through *felt* progression
- External structure that holds (you don't generate it yourself)
- Actions nested in visible larger arcs (meaning is structural, not manufactured)
- Aliveness that engages rather than deadens

**For ADHD cognition specifically:**
- Games bypass executive function resistance through environmental design
- Dopamine comes from the *experience*, not willpower
- Spatial memory replaces sequence memory
- Visibility replaces mental tracking
- The environment holds what the brain cannot

## §0.2 The Paradigm Inversion

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   WRONG FRAMING (will produce dead software):                                   │
│   "Productivity tool" + "game aesthetics" + "nice animations"                   │
│   = Core is still industrial productivity logic                                 │
│   = Aesthetics are decoration                                                   │
│   = Will feel dead, will be abandoned                                           │
│                                                                                 │
│   ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│   CORRECT FRAMING (will produce living software):                               │
│   "GAME" where life quests are the content                                      │
│   = Core is game-design logic (feel, juice, feedback, progression)              │
│   = Everything serves nervous system engagement                                 │
│   = Aliveness is the MECHANISM, not decoration                                  │
│   = Will feel alive, will be used                                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**The aesthetic choices (bioluminescence, breathing animations, organic shapes) are NOT polish.**
They are the mechanism by which the nervous system engages.

**The game-feel (juice, feedback, celebration) is NOT optional polish.**
It is the mechanism by which dopamine flows and resistance dissolves.

## §0.3 What This Means For Implementation

Every technical decision should be evaluated by:

> **"Does this make it feel more like a game, or more like a productivity app?"**

Examples:
- Task completion → NOT just status change → BLOOM animation, celebration, satisfying feedback
- Adding a dependency → NOT just data structure → VISUAL stretchy connection that responds
- Quest progress → NOT just percentage → ORGANISM that visibly grows, fills with light
- Navigation → NOT just tab switching → MOVING through a living world

If something feels "efficient" but dead, it's wrong.
If something feels "extra" but alive, it's right.

## §0.4 Required Reading Protocol

Before implementing ANY feature, ensure you understand:

1. **Soul Transmission** (`soul-transmission.md`)
   - Who this Being is
   - What "runs on mythopoetics" means
   - Why TTRPGs feel like home

2. **Keystone v2.0** (`keystone-master-artifact-v2.md`)
   - The Experience Machine ontology
   - The World-OE (Operating Ecosystem) architecture
   - The gameplay loops

3. **This spec** — technical patterns that serve the above

**If you find yourself treating the soul/keystone docs as "optional context" or "philosophy,"
you have already failed. They are the spec. This document is the implementation guide.**

## §0.5 The Test

When evaluating any implementation:

```
ASK: "Would a game designer approve this, or would they say 'where's the juice?'"
ASK: "Does this engage the nervous system, or does it feel like a todo app?"
ASK: "Is the aliveness structural, or is it decoration on a dead core?"
```

If you cannot answer confidently, re-read the soul transmission.

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
  position: { x: number, y: number } | null;  // Spatial position in macro view
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
// QUEST CONNECTIONS ("Celestial Vines")
// Organic links between Quest organisms - inspired by Unfallen from Endless Space 2
// ═══════════════════════════════════════════════════════════════

interface QuestVine {
  id: string;                    // UUID
  sourceQuestId: string;         // Origin quest
  targetQuestId: string;         // Destination quest
  strength: number;              // 0.0-1.0, affects visual thickness and physics
  createdAt: string;             // ISO timestamp
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
  microViewPosition: {           // Micro view pan position
    x: number;
    y: number;
  };
  microViewZoom: number;         // Micro zoom level (0.5 to 2.0)
  macroViewPosition: {           // Macro view pan position
    x: number;
    y: number;
  };
  macroViewZoom: number;         // Macro zoom level (0.5 to 2.0)
}

// ═══════════════════════════════════════════════════════════════
// ROOT STATE
// ═══════════════════════════════════════════════════════════════

interface OrreryState {
  quests: Quest[];
  tasks: Task[];
  edges: Edge[];                 // Task-to-task dependencies
  questVines: QuestVine[];       // Quest-to-quest connections ("celestial vines")
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
  questVines: [],
  activeSession: null,
  preferences: {
    currentView: 'macro',
    focusQuestId: null,
    showActualOnly: false,
    microViewPosition: { x: 0, y: 0 },
    microViewZoom: 1.0,
    macroViewPosition: { x: 0, y: 0 },
    macroViewZoom: 1.0,
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

> **LIVING COSMOS AESTHETIC**: This is NOT a mechanical orrery (clockwork planetarium).
> It's an **organic, bioluminescent ecosystem** — mycelial networks, deep-sea creatures,
> flowering cosmic gardens. Think Hollow Knight meets deep ocean documentaries meets Path of Exile skill trees.
> **Inspiration**: Unfallen from Endless Space 2 (celestial vines), bioluminescent organisms, fungal networks.

## 5.1 Color Palette — Bioluminescent Sci-Fantasy

```css
/* ─── Deep Void Layers ─────────────────────────────────────────── */
/* Not pure black - rich, living darkness with hints of color */
--bg-void: #0a0b10;           /* Deepest void - almost black with blue */
--bg-space: #0f1118;          /* Primary background - cosmos */
--bg-deep: #141620;           /* Depth layer */
--bg-panel: #1a1c28;          /* Elevated surfaces */
--bg-elevated: #242736;       /* Highest elevation */

/* ─── Bioluminescent Accents ──────────────────────────────────── */
/* Living light that pulses through the cosmos */
--accent-primary: #7c3aed;    /* Deep violet - mystery, depth */
--accent-secondary: #22d3ee;  /* Bright cyan - bioluminescence */
--accent-tertiary: #a855f7;   /* Light violet - ethereal */

/* ─── Life States ─────────────────────────────────────────────── */
--accent-growth: #34d399;     /* Emerald - living, growing */
--accent-energy: #fbbf24;     /* Warm amber - active energy */
--accent-bloom: #f472b6;      /* Pink - fruiting, completion */
--accent-danger: #f87171;     /* Soft red - warning */

/* Legacy aliases */
--accent-success: #34d399;
--accent-warning: #fbbf24;

/* ─── Organic Text ────────────────────────────────────────────── */
--text-primary: #f0f4f8;      /* Soft white - like moonlight */
--text-secondary: #a0aec0;    /* Muted - distant glow */
--text-muted: #5a6577;        /* Distant - dormant */
--text-glow: #22d3ee;         /* Luminescent highlights */

/* ─── Status States ───────────────────────────────────────────── */
--status-locked: #3d4255;     /* Dormant, unawakened */
--status-available: #7c3aed;  /* Ready to grow */
--status-active: #22d3ee;     /* Pulsing with energy */
--status-complete: #34d399;   /* Fully bloomed */
--status-bridge: #fbbf24;     /* Connecting, bridging (multi-quest) */

/* ─── Particle & Glow Colors ──────────────────────────────────── */
--particle-core: #22d3ee;
--particle-aura: #7c3aed;
--particle-dust: #a855f7;
--glow-cyan: rgba(34, 211, 238, 0.6);
--glow-violet: rgba(124, 58, 237, 0.5);
--glow-pink: rgba(244, 114, 182, 0.5);
--glow-green: rgba(52, 211, 153, 0.5);
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

## 5.3 Effects — Living, Breathing Elements

```css
/* ─── Organic Glassmorphism ───────────────────────────────────── */
.glass {
  background: rgba(26, 28, 40, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(124, 58, 237, 0.15);
  border-radius: 1rem; /* Organic, not sharp */
}

/* ─── Bioluminescent Glow ─────────────────────────────────────── */
.glow-cyan { box-shadow: 0 0 20px var(--glow-cyan), 0 0 40px var(--glow-cyan); }
.glow-violet { box-shadow: 0 0 20px var(--glow-violet), 0 0 40px var(--glow-violet); }
.glow-green { box-shadow: 0 0 20px var(--glow-green), 0 0 40px var(--glow-green); }
.glow-bloom { box-shadow: 0 0 20px var(--glow-pink), 0 0 40px var(--glow-pink); }

/* ─── Radial Depth Gradients ──────────────────────────────────── */
.void-depth {
  background: radial-gradient(ellipse at 50% 50%, var(--bg-deep) 0%, var(--bg-void) 100%);
}

.cosmic-glow {
  background: radial-gradient(ellipse at 30% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%);
}

/* ─── Particle Auras ──────────────────────────────────────────── */
.biolum-aura {
  background: radial-gradient(circle, var(--glow-cyan) 0%, transparent 70%);
}

.growth-aura {
  background: radial-gradient(circle, var(--glow-green) 0%, transparent 70%);
}
```

## 5.4 Animation Principles — Organic, Living Motion

> **Core principle**: Everything breathes. Nothing is static. Motion should feel like
> ocean currents, not machine clicks. Use long durations (2-6s) for ambient animations,
> fast (150-300ms) for interactions.

```css
/* ─── Timing Constants ────────────────────────────────────────── */
--timing-breathe: 4s;         /* Slow, living pulse */
--timing-pulse: 2s;           /* Active energy pulse */
--timing-grow: 0.6s;          /* Growth animation */
--timing-bloom: 0.8s;         /* Completion bloom */
--timing-float: 6s;           /* Floating particles */
--timing-shimmer: 3s;         /* Subtle shimmer */
--timing-fast: 150ms;         /* Interaction response */
--timing-normal: 300ms;       /* Standard transitions */
--easing-organic: cubic-bezier(0.4, 0, 0.2, 1);

/* ─── Breathing — The Heartbeat ───────────────────────────────── */
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.85; }
}

/* ─── Organic Pulse — Living Energy ───────────────────────────── */
@keyframes organicPulse {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.02) rotate(0.5deg); }
  75% { transform: scale(0.98) rotate(-0.5deg); }
}

/* ─── Nucleus Pulse — Core Glow ───────────────────────────────── */
@keyframes nucleusPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

/* ─── Bloom Ring — Completion Celebration ─────────────────────── */
@keyframes bloomRing {
  0% { r: 35; opacity: 0.6; stroke-width: 3; }
  100% { r: 60; opacity: 0; stroke-width: 1; }
}

/* ─── Float Up — Ambient Particles ────────────────────────────── */
@keyframes floatUp {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: var(--opacity, 0.5); }
  90% { opacity: var(--opacity, 0.5); }
  100% { transform: translateY(-100vh) translateX(var(--drift, 0)); opacity: 0; }
}

/* ─── Fade Grow In — Entrance ─────────────────────────────────── */
@keyframes fadeGrowIn {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

/* ─── Pulse Ring — Hover/Selection ────────────────────────────── */
@keyframes pulseRing {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.15); opacity: 0; }
}
```

---

# §6 IMPLEMENTATION PHASES

> **Status Legend**: ✅ Complete | ⚠️ Partial | ❌ Not Started | 🔄 In Progress

## Phase 0: Foundation ✅ COMPLETE
**Goal:** Data layer and persistence working

**Deliverables:**
- [x] TypeScript interfaces defined (JSDoc in `types/index.js`)
- [x] Reducer with all actions implemented (`store/reducer.js`)
- [x] `window.storage` integration working
- [x] State loads on mount, saves on change
- [x] Import/Export JSON functionality
- [x] Reset state with confirmation

**Acceptance test:** ✅ All passing

---

## Phase 1: Micro View Core ✅ COMPLETE
**Goal:** See tasks as nodes, understand dependencies

**Deliverables:**
- [x] Task nodes render on canvas (`components/tasks/TaskNode.jsx`)
- [x] Dependency edges render as bezier curves
- [x] Visual states: locked (dim), available (glow), completed (green)
- [x] Click task to select
- [x] Auto-layout with barycentric ordering (`utils/layout.js`)
- [x] Add/remove task UI
- [x] Drag-to-connect edge creation

**Acceptance test:** ✅ All passing

---

## Phase 2: Micro View Enhanced ✅ COMPLETE
**Goal:** Usable canvas with focus and filter

**Deliverables:**
- [x] Pan canvas (drag background)
- [x] Zoom canvas (scroll wheel, pinch)
- [x] "Actual" filter toggle
- [x] Quest focus overlay (ghost non-quest tasks)
- [x] Improved auto-layout algorithm
- [x] Task detail panel (slide-out)
- [x] Task dragging with position persistence

**Acceptance test:** ✅ All passing

---

## Phase 3: Macro View ⚠️ PARTIAL (Living Cosmos v1 Complete)
**Goal:** See all quests as constellation

**Deliverables:**
- [x] Quest organisms render (Living Cosmos aesthetic)
- [x] Progress shown as rising liquid fill
- [x] Theme colors applied with bioluminescent glow
- [x] Click quest → focus in micro view
- [x] Add/edit quest UI
- [x] View toggle (macro ↔ micro)
- [ ] **Quest dragging with position persistence** ← CRITICAL MISSING
- [ ] **Celestial vines (quest-to-quest connections)** ← CRITICAL MISSING
- [ ] Stretchy physics for connections

**Acceptance test:** Partial — core visuals done, drag/vines needed

---

## Phase 4: Time-Space GPS ✅ COMPLETE
**Goal:** Always-visible HUD for temporal grounding

**Deliverables:**
- [x] GPS component renders (fixed bottom)
- [x] Shows current task + quest context
- [x] Countdown timer (when session active)
- [x] Progress bar
- [x] Session start/end/pause/resume controls
- [x] Hard stop warning visual
- [ ] Vastness reminder (subtle) — low priority

**Acceptance test:** ✅ All core features passing

---

## Phase 5: AI Integration ❌ NOT STARTED
**Goal:** Claude helps structure and suggest (see §12 for vision)

**Deliverables:**
- [ ] AI input panel (brain dump textarea)
- [ ] "Synthesize" action → parse into quests/tasks/edges
- [ ] "Magic Wand" on selected task → expand to subtasks
- [ ] "Oracle" suggestion → what to do next
- [ ] Loading states during AI calls
- [ ] Error handling for failed calls
- [ ] **RE-SYNTHESIS not just append** (see §12)

**Acceptance test:** Not yet applicable

---

## Phase 6: Polish ⚠️ PARTIAL (Living Cosmos aesthetics added)
**Goal:** Feels like playing a game, not using an app

**Deliverables:**
- [x] Animations on state changes (breathe, pulse, bloom)
- [x] Particle effects (CosmicAmbient floating spores)
- [ ] Sound cues (optional, can disable)
- [x] Bloom animation on completion
- [x] Smooth transitions between views
- [ ] Keyboard shortcuts
- [x] Touch/mobile support (iOS touch fixes)
- [x] Empty states ("The garden awaits")

**Acceptance test:** Partial — feels alive, needs sound & shortcuts

---

## Phase 7: Macro View Enhanced 🔄 NEXT PRIORITY
**Goal:** Full Unfallen-inspired organic constellation

**Deliverables:**
- [ ] Quest position persistence (`quest.position: { x, y }`)
- [ ] Quest dragging with touch/mouse support
- [ ] Pan/zoom macro canvas (like micro view)
- [ ] Celestial vines (QuestVine entity)
- [ ] Drag-to-connect vine creation
- [ ] Stretchy physics for vines
- [ ] Vine strength visual (thickness, glow)

**Acceptance test:**
- Drag quest organisms around, positions persist
- Connect quests with vines, vines stretch when dragged
- Vines show gradient between quest colors

**Estimated complexity:** Medium-High

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

## 7.5 CRITICAL RECONCEPTUALIZATION: Organic Knowledge Graph

> **IMPORTANT**: The original §7.4 layout algorithm is WRONG for this project's true intent.
> The Orrery should feel like a **skill tree / knowledge graph**, NOT a workflow DAG tool.

### The Problem with Linear DAG Layout

The column-based left-to-right layout:
- Forces "violent, reductive linearity" onto organic thought
- Removes spatial meaning (position should convey relatedness)
- Creates visual monotony that fails ADHD cognition
- Doesn't match the mental model of game skill trees (references: Path of Exile, Total War reforms, Obsidian knowledge graphs)

### Core Principles for Correct Implementation

**1. SPATIAL FREEDOM**
- Every node can be dragged anywhere
- Position is persisted (`task.position: { x, y }`)
- Spatial proximity implies relatedness
- Users "sculpt" their own mental map

**2. RADIAL/ORGANIC LAYOUT (Auto-Layout Option)**
- Default layout should be force-directed or radial, NOT columnar
- Nodes repel each other, edges act as springs
- Creates organic, breathing structure
- Optional: gravity toward quest "centers"

**3. DIRECT MANIPULATION (Zero Context Switching)**
- **Drag node** → move it
- **Drag from node edge** → create dependency to drop target
- **Click node** → inline edit (NOT slide-out panel)
- **Double-click** → start session (if available)
- Everything visible, nothing hidden in menus

**4. VISUAL LANGUAGE OF SKILL TREES**
- Nodes show lineage (quest badges as implemented)
- Unlocked vs locked is VISUALLY OBVIOUS (glow vs dim)
- Edges glow when path is "hot" (available)
- Completed paths could show as "filled" or "grown"

### Revised Interaction Model

```
┌─────────────────────────────────────────────────────────────────┐
│  DRAG BEHAVIORS:                                                │
│  ─────────────────                                              │
│  • Drag node body → MOVE node (update position)                 │
│  • Drag from node edge-handle → CREATE EDGE (drop on target)    │
│  • Drag background → PAN canvas                                 │
│                                                                 │
│  CLICK BEHAVIORS:                                               │
│  ─────────────────                                              │
│  • Click node → SELECT (show inline edit options)               │
│  • Double-click available → START SESSION                       │
│  • Click edge → SELECT edge (show delete option)                │
│  • Click background → DESELECT all                              │
│                                                                 │
│  NO PANELS. NO MODALS. NO CONTEXT SWITCHING.                    │
└─────────────────────────────────────────────────────────────────┘
```

### Force-Directed Layout Algorithm (Replacement for §7.4)

```typescript
function forceDirectedLayout(tasks: Task[], edges: Edge[], iterations = 100) {
  // Initialize positions (use existing or random)
  const positions = new Map<string, { x: number, y: number, vx: number, vy: number }>();

  tasks.forEach(t => {
    if (t.position) {
      positions.set(t.id, { ...t.position, vx: 0, vy: 0 });
    } else {
      // Radial initial placement
      const angle = Math.random() * Math.PI * 2;
      const radius = 200 + Math.random() * 300;
      positions.set(t.id, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0, vy: 0
      });
    }
  });

  const REPULSION = 5000;  // Nodes push apart
  const ATTRACTION = 0.01; // Edges pull together
  const DAMPING = 0.9;
  const CENTER_GRAVITY = 0.01;

  for (let i = 0; i < iterations; i++) {
    // Repulsion between all nodes
    tasks.forEach(t1 => {
      tasks.forEach(t2 => {
        if (t1.id === t2.id) return;
        const p1 = positions.get(t1.id)!;
        const p2 = positions.get(t2.id)!;
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = REPULSION / (dist * dist);
        p1.vx += (dx / dist) * force;
        p1.vy += (dy / dist) * force;
      });
    });

    // Attraction along edges
    edges.forEach(e => {
      const p1 = positions.get(e.source);
      const p2 = positions.get(e.target);
      if (!p1 || !p2) return;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = dist * ATTRACTION;
      p1.vx += (dx / dist) * force;
      p1.vy += (dy / dist) * force;
      p2.vx -= (dx / dist) * force;
      p2.vy -= (dy / dist) * force;
    });

    // Gravity toward center
    tasks.forEach(t => {
      const p = positions.get(t.id)!;
      p.vx -= p.x * CENTER_GRAVITY;
      p.vy -= p.y * CENTER_GRAVITY;
    });

    // Apply velocity and damping
    tasks.forEach(t => {
      const p = positions.get(t.id)!;
      // Skip if manually positioned (user dragged it)
      if (t.position) return;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= DAMPING;
      p.vy *= DAMPING;
    });
  }

  return positions;
}
```

### Implementation Priority

This reconceptualization should be applied in this order:

1. **Node dragging with position persistence** (CRITICAL) ✅ DONE for Tasks
2. **Drag-to-connect edge creation** (CRITICAL) ✅ DONE for Tasks
3. **Remove TaskDetailPanel, implement inline editing** (IMPORTANT) — in progress
4. **Replace columnar layout with force-directed** (IMPORTANT) — using barycentric ordering
5. **Add visual "glow" for available paths** (POLISH) ✅ DONE

## 7.6 STRETCHY PHYSICS: Living Connections

> **Core insight**: Connections should feel ALIVE, not rigid. Like tendons, not wires.
> When you drag a node, the edges should stretch, resist, and snap back organically.

### Spring-Based Edge Physics

```typescript
interface SpringEdge {
  sourceId: string;
  targetId: string;
  restLength: number;      // Natural length of the spring
  stiffness: number;       // How strongly it resists stretching (0.01-0.5)
  damping: number;         // How quickly oscillations die (0.8-0.99)
}

// During drag/animation frame:
function updateSpringPhysics(edge: SpringEdge, sourcePos: Vec2, targetPos: Vec2) {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const currentLength = Math.sqrt(dx * dx + dy * dy);
  const stretch = currentLength - edge.restLength;

  // Force proportional to stretch (Hooke's law)
  const force = stretch * edge.stiffness;

  // Apply force to pull nodes together (or push apart if compressed)
  // This creates the "stretchy" feel during drag
  return {
    tension: Math.abs(stretch) / edge.restLength, // 0-1, for visual feedback
    force: force,
    direction: { x: dx / currentLength, y: dy / currentLength }
  };
}
```

### Visual Feedback for Tension

```css
/* Edge thickness/glow increases with tension */
.edge-stretched {
  stroke-width: calc(2px + var(--tension) * 4px);
  filter: drop-shadow(0 0 calc(var(--tension) * 10px) var(--glow-cyan));
}

/* Subtle pulse when under tension */
@keyframes strainPulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; stroke-width: calc(2px + var(--tension) * 6px); }
}
```

### Elastic Snap-Back

When dragging ends, edges should:
1. Animate back to rest length (if no manual position set)
2. Use spring physics for realistic bounce
3. Dampen over 2-3 oscillations

## 7.7 CELESTIAL VINES: Quest-to-Quest Connections

> **Inspiration**: The Unfallen from Endless Space 2 — their celestial vines that grow
> between star systems, connecting them into an organic network.
>
> Quest connections are NOT dependencies. They're **affinities** — thematic links,
> shared resources, narrative connections.

### Visual Design

```
┌─────────────────────────────────────────────────────────────────┐
│  CELESTIAL VINE ANATOMY:                                         │
│                                                                  │
│    ◉ Quest A                                                     │
│     ╲                                                            │
│      ╲  ← Vine (glowing, organic curve)                         │
│       ╲                                                          │
│        ╲   ← Pulses of light travel along vine                  │
│         ╲                                                        │
│          ◉ Quest B                                               │
│                                                                  │
│  VINE CHARACTERISTICS:                                           │
│  • Bezier curves, NOT straight lines                            │
│  • Slight organic waviness (perlin noise offset)                │
│  • Thickness based on strength (shared tasks, manual weighting) │
│  • Color gradient between quest theme colors                    │
│  • Particle flow from source → target (growth direction)        │
│  • STRETCHY when quests are dragged apart                       │
│                                                                  │
│  INTERACTIONS:                                                   │
│  • Drag from quest edge → drop on another quest = create vine   │
│  • Click vine → show connection info, delete option             │
│  • Vines can be manually weighted (thin → thick)                │
└─────────────────────────────────────────────────────────────────┘
```

### Vine Rendering (SVG Path)

```typescript
function renderCelestialVine(
  source: Vec2,
  target: Vec2,
  strength: number,  // 0-1
  sourceColor: string,
  targetColor: string
): SVGPath {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Control points for organic bezier curve
  const cp1 = {
    x: source.x + dx * 0.3 + Math.sin(Date.now() * 0.001) * 10, // subtle sway
    y: source.y + dy * 0.1
  };
  const cp2 = {
    x: source.x + dx * 0.7 + Math.sin(Date.now() * 0.001 + 1) * 10,
    y: target.y - dy * 0.1
  };

  return {
    d: `M ${source.x} ${source.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${target.x} ${target.y}`,
    strokeWidth: 2 + strength * 6,
    gradient: `url(#vine-gradient-${sourceColor}-${targetColor})`,
    filter: `drop-shadow(0 0 ${4 + strength * 8}px rgba(34, 211, 238, 0.5))`
  };
}
```

## 7.8 ADHD-EMPOWERING GAME DESIGN PRINCIPLES

> **This is a game, not an app.** Every interaction should produce dopamine, not dread.
> Key references: game feel ("juice"), Discovery (finding hidden things),
> Progression (leveling up), Agency (meaningful choices), Surprise (unexpected rewards).

### Core Principles

**1. NOVELTY GENERATION**
- Visual variety: each quest organism looks slightly different
- Random ambient particles create living, changing environment
- Completion animations are never exactly the same
- "Discovered" quests/tasks vs manually created (AI synthesis)

**2. IMMEDIATE FEEDBACK**
- Every click produces visible change (glow, animation, sound)
- Drag operations show tension/stretch in real-time
- Progress is always visualized (not just numbers)
- Errors are forgiving, not punishing

**3. MICRO-CELEBRATIONS**
- Complete a task → bloom animation + sound
- Complete a quest → constellation celebration
- Start a session → breathing intensifies
- Return after absence → "welcome back" state change

**4. SENSORY VARIETY**
- Multiple animation types (breathe, pulse, grow, bloom, float)
- Color variations based on state
- Particle systems for ambient life
- Optional: subtle sound design (not implemented yet)

**5. CLARITY IN OVERWHELM**
- "Actual" filter reduces to ONLY what's possible NOW
- Quest focus dims everything else
- Time-Space GPS anchors attention
- North Star provides directional clarity

### Anti-Patterns to Avoid

```
┌─────────────────────────────────────────────────────────────────┐
│  ❌ AVOID:                           ✅ INSTEAD:                 │
│  ─────────                           ─────────                  │
│  • Long text instructions            • Visual demonstration     │
│  • Multiple nested menus             • Direct manipulation      │
│  • "Are you sure?" dialogs           • Undo always available   │
│  • Static, unchanging UI             • Breathing, living UI    │
│  • Punishing error states            • Forgiving, recoverable  │
│  • Hidden functionality              • Discoverable affordances │
│  • Counting (tasks remaining)        • Feeling (progress glow) │
│  • Guilt-inducing reminders          • Gentle ambient awareness│
└─────────────────────────────────────────────────────────────────┘
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

# §10 FILE STRUCTURE (Multi-File GitHub Project)

This project uses a modular multi-file structure optimized for iterative development via GitHub. The structure aligns with the phased implementation plan (§6), making it easy to develop features incrementally and review changes in isolation.

## 10.1 Directory Overview

```
The-Orrery/
├── doc/                           # Documentation
│   ├── orrery-implementation-spec.md
│   ├── keystone-master-artifact-v2.md
│   └── soul-transmission.md
│
├── src/
│   ├── main.jsx                   # Application entry point
│   ├── App.jsx                    # Root layout & routing
│   │
│   ├── types/                     # Type definitions
│   │   └── index.js               # JSDoc typedefs for Quest, Task, Edge, etc.
│   │
│   ├── constants/                 # Static configuration
│   │   ├── index.js               # Re-exports
│   │   ├── colors.js              # COLORS palette, QUEST_COLORS
│   │   └── initialState.js        # INITIAL_STATE, STORAGE_KEY
│   │
│   ├── utils/                     # Pure utility functions
│   │   ├── index.js               # Re-exports
│   │   ├── ids.js                 # generateId()
│   │   ├── tasks.js               # isTaskLocked, getComputedTaskStatus, getAvailableTasks
│   │   ├── quests.js              # getQuestProgress
│   │   └── layout.js              # autoLayoutDAG (Phase 1-2)
│   │
│   ├── store/                     # State management
│   │   ├── index.js               # Re-exports
│   │   ├── reducer.js             # orreryReducer with all actions
│   │   ├── context.js             # OrreryContext, OrreryProvider, useOrrery hook
│   │   └── actions.js             # Action type constants (optional)
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── index.js               # Re-exports
│   │   ├── usePersistence.js      # window.storage sync (Phase 0)
│   │   ├── useTimer.js            # Session countdown timer (Phase 4)
│   │   └── useAI.js               # AI integration calls (Phase 5)
│   │
│   ├── components/                # React components
│   │   ├── index.js               # Re-exports
│   │   │
│   │   ├── common/                # Shared/reusable components
│   │   │   ├── StatusBadge.jsx    # Task status indicator
│   │   │   ├── ProgressRing.jsx   # Circular progress indicator
│   │   │   └── Modal.jsx          # Dialog/modal wrapper
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── Header.jsx         # App header with controls
│   │   │   ├── Footer.jsx         # Sync status footer
│   │   │   └── StatsSummary.jsx   # Quest/task statistics grid
│   │   │
│   │   ├── quests/                # Quest-related components
│   │   │   ├── QuestCard.jsx      # Quest display card
│   │   │   ├── QuestList.jsx      # Quest list container
│   │   │   ├── AddQuestForm.jsx   # Create new quest form
│   │   │   └── EditQuestForm.jsx  # Edit quest form
│   │   │
│   │   ├── tasks/                 # Task-related components
│   │   │   ├── TaskRow.jsx        # Task list item
│   │   │   ├── TaskList.jsx       # Task list container
│   │   │   ├── AddTaskForm.jsx    # Create new task form
│   │   │   ├── EditTaskForm.jsx   # Edit task form
│   │   │   └── TaskDetailPanel.jsx # Slide-out task inspector (Phase 2)
│   │   │
│   │   ├── edges/                 # Dependency edge components (Phase 1)
│   │   │   ├── DependencyEdge.jsx # Arrow between tasks
│   │   │   └── EdgeManager.jsx    # Edge creation/deletion UI
│   │   │
│   │   ├── views/                 # Main view components
│   │   │   ├── MacroView/         # Phase 3: The Constellation
│   │   │   │   ├── index.jsx      # Constellation container
│   │   │   │   ├── QuestNode.jsx  # Orbital quest node
│   │   │   │   ├── QuestConnections.jsx  # Inter-quest links
│   │   │   │   └── ConstellationCanvas.jsx
│   │   │   │
│   │   │   └── MicroView/         # Phase 1-2: The Task Engine
│   │   │       ├── index.jsx      # DAG view container
│   │   │       ├── Canvas.jsx     # Pan/zoom canvas
│   │   │       ├── TaskNode.jsx   # DAG task node
│   │   │       └── MiniMap.jsx    # Navigation overview
│   │   │
│   │   ├── gps/                   # Phase 4: Time-Space GPS
│   │   │   ├── TimeSpaceGPS.jsx   # Main floating HUD
│   │   │   ├── SessionTimer.jsx   # Countdown display
│   │   │   ├── ContextBreadcrumb.jsx  # Quest/task context
│   │   │   └── VastnessReminder.jsx   # Possibility space visual
│   │   │
│   │   ├── ai/                    # Phase 5: AI Integration
│   │   │   ├── AIInputPanel.jsx   # Brain dump interface
│   │   │   ├── SynthesizeButton.jsx
│   │   │   ├── MagicWandButton.jsx
│   │   │   └── OracleButton.jsx
│   │   │
│   │   └── controls/              # Control components
│   │       ├── ViewToggle.jsx     # Macro ↔ Micro switch
│   │       ├── ActualFilter.jsx   # Panic button toggle
│   │       ├── ImportExportControls.jsx
│   │       └── SessionControls.jsx # Start/stop session
│   │
│   ├── styles/                    # CSS styles
│   │   ├── index.css              # Global styles & resets
│   │   ├── variables.css          # CSS custom properties
│   │   └── animations.css         # Keyframe animations
│   │
│   └── assets/                    # Static assets
│       └── (icons, images if any)
│
├── public/                        # Static public files
│   └── vite.svg
│
├── index.html                     # HTML entry point
├── package.json                   # Dependencies & scripts
├── vite.config.js                 # Vite configuration
├── eslint.config.js               # ESLint configuration
└── README.md                      # Project overview
```

## 10.2 Phase-to-File Mapping

Each implementation phase (§6) maps to specific files:

| Phase | Focus | Primary Files to Create/Modify |
|-------|-------|-------------------------------|
| **Phase 0** | Foundation | `types/`, `constants/`, `store/`, `hooks/usePersistence.js`, `components/controls/ImportExportControls.jsx` |
| **Phase 1** | Micro View Core | `utils/layout.js`, `components/views/MicroView/`, `components/edges/`, `components/tasks/TaskNode.jsx` |
| **Phase 2** | Micro View Enhanced | `components/views/MicroView/Canvas.jsx`, `components/tasks/TaskDetailPanel.jsx`, `components/controls/ActualFilter.jsx` |
| **Phase 3** | Macro View | `components/views/MacroView/`, `components/controls/ViewToggle.jsx` |
| **Phase 4** | Time-Space GPS | `components/gps/`, `hooks/useTimer.js` |
| **Phase 5** | AI Integration | `components/ai/`, `hooks/useAI.js` |
| **Phase 6** | Polish | `styles/animations.css`, refinements across all components |

## 10.3 Import Conventions

Use barrel exports (`index.js`) for clean imports:

```jsx
// ─── From types ──────────────────────────────────────────────────
// Types are documented via JSDoc, import for reference:
// See types/index.js for Quest, Task, Edge, etc.

// ─── From constants ──────────────────────────────────────────────
import { COLORS, QUEST_COLORS, INITIAL_STATE } from '@/constants';

// ─── From utils ──────────────────────────────────────────────────
import { generateId, isTaskLocked, getQuestProgress } from '@/utils';

// ─── From store ──────────────────────────────────────────────────
import { useOrrery, OrreryProvider } from '@/store';

// ─── From hooks ──────────────────────────────────────────────────
import { usePersistence, useTimer } from '@/hooks';

// ─── From components ─────────────────────────────────────────────
import { QuestCard, TaskRow, TimeSpaceGPS } from '@/components';
```

**Note:** Configure path alias `@/` → `src/` in `vite.config.js`:

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## 10.4 Component File Template

Each component file should follow this structure:

```jsx
// ═══════════════════════════════════════════════════════════════
// ComponentName.jsx
// Brief description of what this component does
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { SomeIcon } from 'lucide-react';
import { COLORS } from '@/constants';
import { useOrrery } from '@/store';

/**
 * @param {Object} props
 * @param {string} props.someRequired - Description
 * @param {boolean} [props.someOptional] - Description
 */
export function ComponentName({ someRequired, someOptional = false }) {
  const { state, dispatch } = useOrrery();

  // ─── Handlers ────────────────────────────────────────────────
  const handleSomething = () => {
    dispatch({ type: 'SOME_ACTION', payload: someRequired });
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div style={{ /* inline styles for now, extract to CSS later */ }}>
      {/* Component content */}
    </div>
  );
}

export default ComponentName;
```

## 10.5 Development Workflow

### Creating a New Feature

1. **Create feature branch:** `git checkout -b feature/phase-X-feature-name`
2. **Add/modify files** according to phase mapping (§10.2)
3. **Export from barrel files** (`index.js`) as needed
4. **Import and integrate** in parent components
5. **Test locally:** `npm run dev`
6. **Commit with descriptive message** referencing the phase
7. **Create PR** for review

### File Naming Conventions

- **Components:** `PascalCase.jsx` (e.g., `QuestCard.jsx`)
- **Hooks:** `camelCase.js` with `use` prefix (e.g., `usePersistence.js`)
- **Utils:** `camelCase.js` (e.g., `tasks.js`)
- **Constants:** `camelCase.js` (e.g., `colors.js`)
- **Directories:** `kebab-case` or `camelCase` (e.g., `views/MacroView/`)

### Commit Message Format

```
Phase X: Brief description

- Detail 1
- Detail 2

Refs: #issue-number (if applicable)
```

Example:
```
Phase 1: Add DAG canvas with task nodes

- Implement Canvas component with pan/zoom
- Create TaskNode with visual states
- Add auto-layout algorithm for DAG positioning
```

## 10.6 Current State Note

As of Phase 0 completion, the application may still have a monolithic `App.jsx`. The refactoring into this multi-file structure should happen incrementally:

1. **Immediate:** Extract `types/`, `constants/`, `store/` (pure logic, no UI)
2. **Phase 1:** Extract view components as they're built
3. **Ongoing:** Refactor existing components into the structure as needed

**Priority:** Working software over perfect structure. Refactor when it aids development, not as busywork.

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

# §12 AI RE-SYNTHESIS VISION

> **Critical understanding**: The AI is NOT a "smart append" machine. It's a **synthesis engine**
> that takes messy human input and RE-STRUCTURES the entire constellation of quests and tasks.
> Think: composting organic matter into fertile soil, not stacking boxes.

## 12.1 The Problem with "Append-Only" AI

Traditional task tools with AI just add new items:
```
User: "I need to work on the authentication system"
Bad AI: Adds task "Work on authentication system" ← USELESS
```

This fails because:
- No context of existing structure
- No relationship to other quests/tasks
- No breakdown into actionable steps
- No identification of dependencies

## 12.2 True Synthesis: Ingestion → Decomposition → Recomposition

The AI should:

**1. INGEST** — Understand the full input
```
User brain dump: "Need to ship auth, also thinking about
the database migration, oh and frontend needs to update
the login form, might be blocked by the API changes..."
```

**2. DECOMPOSE** — Break into atomic elements
```
Extracted concepts:
- Authentication system (broad goal)
- Database migration (dependency?)
- Frontend login form (UI task)
- API changes (blocking dependency)
```

**3. RELATE** — Map to existing structure
```
Existing quest: "MVP Launch"
Existing tasks: ["Set up CI/CD", "Write tests"]
→ Auth work likely belongs to MVP Launch
→ API changes may block frontend work
```

**4. RECOMPOSE** — Synthesize new structure
```
Proposed changes:
- ADD quest "Authentication System" under MVP Launch theme
- ADD tasks with proper dependencies:
  - "API authentication endpoints" (no deps)
  - "Database user migration" (depends on API)
  - "Frontend login form" (depends on API)
- CREATE edges between tasks
- SUGGEST vine connection between "Auth" and "MVP Launch" quests
```

## 12.3 AI Prompt Architecture

```typescript
interface SynthesisContext {
  existingQuests: Quest[];
  existingTasks: Task[];
  existingEdges: Edge[];
  existingVines: QuestVine[];
  userInput: string;
  userHistory?: string[];  // Previous synthesis results for learning
}

interface SynthesisResult {
  // Quests to add/modify
  questsToAdd: Quest[];
  questsToModify: { id: string; updates: Partial<Quest> }[];

  // Tasks to add/modify
  tasksToAdd: Task[];
  tasksToModify: { id: string; updates: Partial<Task> }[];

  // Edges (task dependencies)
  edgesToAdd: Edge[];
  edgesToRemove: string[];  // Edge IDs

  // Quest vines (affinities)
  vinesToAdd: QuestVine[];

  // Reasoning for transparency
  reasoning: string;
}
```

## 12.4 AI Integration Points

**1. Brain Dump → Full Synthesis**
- Large text area for stream-of-consciousness
- AI parses into structured quests/tasks/edges
- User reviews and confirms changes

**2. Task Expansion (Magic Wand)**
- Select a task
- AI breaks it into 3-7 subtasks
- Creates proper dependency edges

**3. Oracle (What Next?)**
- AI analyzes: available tasks, time of day, energy patterns
- Suggests what to focus on with reasoning
- NOT prescriptive — suggestive

**4. Quest Reorganization**
- AI can suggest merging/splitting quests
- Identify orphan tasks that need quest assignment
- Suggest quest vines based on task overlaps

## 12.5 The Ultimate Vision: Conversational Gardening

```
User (via chat): "I've been thinking about the marketing stuff,
we need to coordinate with the launch. Also I forgot about
the legal review that's blocking the TOS page."

AI Response:
"I see the Marketing Quest and MVP Launch Quest. Here's what I suggest:

1. Add task 'Legal review for TOS' (available, no deps)
2. Add task 'Update TOS page' (blocked by legal review)
3. Create vine between Marketing ↔ MVP Launch (strength: 0.7)
4. Move 'Social media assets' task to depend on 'Finalize branding'

This connects your legal blocker to the launch timeline and shows
the marketing-launch relationship visually.

[Apply Changes] [Modify] [Dismiss]"
```

The key insight: **AI as thoughtful gardener**, not mechanical task-adder.

---

# §13 FINAL NOTES

This spec is comprehensive but not exhaustive.

**When uncertain:**
- Refer to Soul Transmission for the "why"
- Refer to Keystone for the architecture
- Default to what creates "I CAN SEE" feeling
- Ask user if genuinely stuck

**Core truth:** This isn't a productivity app. It's infrastructure for existence. Build accordingly.

---

*Implementation Specification v2.0*
*The Orrery — Two-Tier Visual Operating System*
*Part of WorldOE (World Operating Ecosystem)*
*Living Cosmos Aesthetic — Organic, Bioluminescent, Game-like*
