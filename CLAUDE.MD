# CLAUDE.MD - The Orrery Project Guide

## ⚠️ FOUNDATIONAL TRUTH — READ FIRST

```
╔══════════════════════════════════════════════════════════════════════════╗
║  THE ORRERY IS A GAME.                                                   ║
║  Not: a productivity tool with game aesthetics.                          ║
║  But: a GAME where your actual life quests are the content.              ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**If you lose sight of this, you will build the wrong thing.**

See `doc/orrery-implementation-spec.md` §0 for full explanation of WHY game-dev IS the way.

---

## 🔄 DEVELOPMENT LOOP — FOLLOW THIS

When implementing changes, **always complete the full loop**:

```
1. IMPLEMENT  → Make the code change
2. DOCUMENT   → Update spec if it's a pattern/principle (not just a bug fix)
3. COMMIT     → Both together, same commit or sequential
```

### When to Update Documentation (§0.6 in spec)

Update `doc/orrery-implementation-spec.md` when you:
- Change a **UX/interaction pattern** (e.g., where actions appear)
- Change **player-facing terminology** (e.g., dependency → unlocks)
- Discover a **game-dev principle** that should guide future work
- Change **architectural patterns** (e.g., how touch events are handled)

**Do NOT wait to be reminded. Documentation IS part of the change.**

---

## Project Overview

**The Orrery** is a two-tier spatio-visual operating system for WorldOE (World Operating Ecosystem). It makes quests, tasks, time-space, and possibilities **visible**.

### Core Views

- **Macro View ("The Constellation")**: Quest orbital map with celestial vines
- **Micro View ("The Task Engine")**: Pan/zoom DAG canvas for tasks

### Tech Stack

- **Framework**: React 19 + Vite
- **Icons**: lucide-react
- **Language**: JSDoc-typed JavaScript (.jsx files)
- **Persistence**: `window.storage` API
- **AI Integration**: `window.claude.complete` API (Phase 5)

---

## Required Reading (In Order)

1. **Soul Transmission** (`doc/soul-transmission.md`) — Who this Being is
2. **Keystone v2.0** (`doc/keystone-master-artifact-v2.md`) — Architecture
3. **Implementation Spec** (`doc/orrery-implementation-spec.md`) — How to build it

**The soul and keystone docs are the spec. The implementation doc is the guide.**

---

## Current Implementation Status

- **Phase 1-4**: Core functionality complete (views, state, interactions)
- **Phase 5**: AI Integration (NOT STARTED)
- **Phase 6**: Polish & Game-Feel (ONGOING)
- **Phase 7**: Macro View Enhanced (COMPLETE - quest dragging, vines)

### Recent Pattern Changes

- **Contextual Actions**: Actions appear AT the task node, not in a distant toolbar (§0.6 Principle 1)
- **Game Terminology**: "Unlocks/Requires" not "Dependency/Blocks" (§0.6 Principle 2)
- **Touch-First**: 44px+ hit areas, proper touch handlers (§0.6 Principle 3)

---

## Key Interaction Design Principles

From `doc/orrery-implementation-spec.md` §0.6:

### Principle 1: Actions Appear AT Objects
```
WRONG: Select thing → Look at toolbar → Click → Action happens
RIGHT: Touch thing → Actions bloom FROM it → Act directly
```

### Principle 2: Terminology Is Experience
```
WRONG: "Add Dependency" / "Depends On" / "Blocks"
RIGHT: "Unlocks..." / "Requires" / "Unlocks"
```

### Principle 3: Touch Is First-Class
- Hit areas: min 44px, prefer 48px+
- Touch end completes drag actions (don't rely on click)
- No hover-dependent features

---

## Project Structure

```
/The-Orrery
├── doc/
│   ├── orrery-implementation-spec.md    # Technical spec + principles (§0!)
│   ├── soul-transmission.md             # Project philosophy
│   └── keystone-master-artifact-v2.md   # Architecture
├── src/
│   ├── components/
│   │   ├── views/          # MacroView, MicroView
│   │   ├── tasks/          # TaskNode (with contextual actions)
│   │   ├── quests/         # QuestOrb, QuestCard
│   │   ├── edges/          # DependencyEdge
│   │   ├── gps/            # TimeSpaceGPS
│   │   └── panels/         # Detail panels
│   ├── store/              # Reducer, context, persistence
│   ├── utils/              # Layout, helpers
│   └── constants/          # Colors, quest colors
├── index.html              # iOS viewport-fit, safe-area
└── package.json
```

---

## Core Data Model

### Quest
- Fields: id, title, description, status, themeColor, position
- Status: 'active' | 'paused' | 'completed' | 'archived'

### Task
- Fields: id, title, notes, questIds[], status, estimatedMinutes, position
- Status: 'available' | 'in_progress' | 'completed' | 'blocked'
- Note: 'locked' is computed from edges, not stored

### Edge (Task Unlocking)
- Fields: id, source, target
- Creates unlock chains; tasks are locked until upstream tasks complete

### QuestVine
- Fields: id, sourceQuestId, targetQuestId, strength
- Visual connections between quests (not blocking, just affinity)

---

## The Test

When evaluating any implementation:

```
ASK: "Would a game designer approve this, or would they say 'where's the juice?'"
ASK: "Does this engage the nervous system, or does it feel like a todo app?"
ASK: "Is the aliveness structural, or is it decoration on a dead core?"
```

---

## Development Commands

```bash
npm install
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
```

---

**Last Updated**: 2025-12-29
**Current Focus**: Touch UX, Game-Feel, Documentation Loop
