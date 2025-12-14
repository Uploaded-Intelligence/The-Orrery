# CLAUDE.MD - The Orrery Project Guide

## Project Overview

**The Orrery** is a two-tier spatio-visual operating system that blends macro quest planning with micro-level task execution. It's an AI-powered project and task management system that makes overarching arcs/quests, actionable tasks, time-space, and possibilities **visible**.

### Core Concept

The system operates on two levels:
- **Macro View ("The Constellation")**: Shows all Quests as an orbital constellation
- **Micro View ("The Task Engine")**: Infinite pan/zoom DAG canvas for task dependencies

### Tech Stack

- **Framework**: React 19 + Vite
- **Icons**: lucide-react
- **Language**: JSDoc-typed JavaScript (.jsx files)
- **Persistence**: `window.storage` API (key-value store)
- **AI Integration**: `window.claude.complete` API

## Project Structure

```
/The-Orrery
├── doc/
│   ├── orrery-implementation-spec.md    # Full technical specification
│   ├── soul-transmission.md             # Project philosophy & context
│   └── keystone-master-artifact-v2.md   # Architecture & design rationale
├── src/
│   ├── App.jsx                          # Main application (currently Phase 0)
│   ├── App.css                          # Styles
│   ├── main.jsx                         # Entry point
│   └── assets/                          # Static assets
├── .github/workflows/
│   └── node.js.yml                      # CI/CD configuration
└── package.json                         # Dependencies & scripts
```

## Core Data Model

### Quest
- **Purpose**: Overarching projects or goals
- **Key Fields**: id, title, description, status, themeColor
- **Status Values**: 'active' | 'paused' | 'completed' | 'archived'

### Task
- **Purpose**: Actionable work items
- **Key Fields**: id, title, notes, questIds[], status, estimatedMinutes, actualMinutes
- **Status Values**: 'locked' | 'available' | 'in_progress' | 'completed' | 'blocked'
- **Note**: Many-to-many relationship with Quests

### Edge
- **Purpose**: Task dependencies (Directed Acyclic Graph)
- **Key Fields**: id, fromTaskId, toTaskId
- **Behavior**: Creates dependency chains; tasks are "locked" until dependencies complete

### TimeBlock
- **Purpose**: Calendar-based time allocation
- **Key Fields**: id, taskId, startTime, endTime, isActual (scheduled vs. what actually happened)

## Core Principles

1. **Visibility over hiding** - Everything that matters is visible
2. **Dependency gating** - Can't see what you can't do yet
3. **Quest-task nesting** - Local actions connect to epic arcs
4. **AI as party member** - Synthesize, don't just store
5. **Panic button exists** - "Actual" filter for overwhelm moments

## Current Implementation Status

**Phase 0: Foundation** (In Progress)
- Data layer with Quest, Task, Edge, TimeBlock entities
- Persistence using window.storage API
- Reducer-based state management
- Basic UI scaffolding

See `doc/orrery-implementation-spec.md` for full phase roadmap.

## Key Features to Understand

### State Management
- Uses `useReducer` for centralized state management
- All mutations go through reducer actions
- State automatically persists to window.storage

### Dependency System
- Tasks form a Directed Acyclic Graph (DAG)
- Tasks are "locked" until their dependencies complete
- System prevents circular dependencies

### Time-Space GPS
- Always-visible component showing current task, quest, time remaining
- Tracks both estimated and actual time spent
- Supports hard stops and progress indicators

### AI Integration
- `window.claude.complete` API for AI assistance
- AI can generate quests from high-level goals
- AI can break down quests into task graphs
- AI provides contextual suggestions

## Development Workflow

### Install & Run
```bash
npm install
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

### Git Workflow
- **Current Branch**: `claude/update-claude-md-tQB6a`
- **Main Branch**: (check git config for default)
- Always develop on feature branches prefixed with `claude/`
- Commit with clear, descriptive messages
- Push to remote: `git push -u origin <branch-name>`

### Code Style
- JSDoc type annotations for all major functions and data structures
- Functional React components with hooks
- Reducer pattern for state management
- No TypeScript (use JSDoc instead)

## Working with This Codebase

### When Adding Features
1. Check the implementation spec (`doc/orrery-implementation-spec.md`) for planned architecture
2. Follow the phased approach outlined in the spec
3. Maintain the data model structure defined in the spec
4. Update reducer actions for state changes
5. Ensure persistence works correctly

### When Reading Code
- Start with `src/App.jsx` for the main application structure
- Check reducer for available actions and state shape
- Look for JSDoc type definitions at the top of files
- Reference `doc/orrery-implementation-spec.md` for detailed specifications

### When Debugging
- Check browser console for persistence issues
- Verify state updates through reducer actions
- Use React DevTools to inspect component state
- Check window.storage for persisted data

### Avoid
- Don't add external dependencies without checking constraints
- Don't create TypeScript files (project uses JSDoc)
- Don't modify core data model without referencing spec
- Don't skip persistence layer for state changes

## Key Documentation

1. **Implementation Spec** (`doc/orrery-implementation-spec.md`)
   - Complete technical specification
   - Data model definitions
   - Component architecture
   - Phased roadmap (Phase 0-4)
   - Reducer actions reference

2. **Soul Transmission** (`doc/soul-transmission.md`)
   - Project philosophy and vision
   - Problem statement and motivation
   - Design principles

3. **Keystone Master Artifact** (`doc/keystone-master-artifact-v2.md`)
   - Architecture decisions
   - Why certain approaches were chosen
   - System design rationale

## AI Integration Points

The Orrery is designed to work with AI assistance. Key integration points:

1. **Quest Generation**: AI generates quests from high-level user goals
2. **Task Breakdown**: AI breaks quests into actionable task graphs
3. **Smart Scheduling**: AI suggests optimal time allocations
4. **Context Awareness**: AI understands quest/task relationships
5. **Synthesis**: AI provides insights from task/time data

## Testing Approach

- No formal test suite currently configured
- Manual testing via `npm run dev`
- CI runs lint checks via GitHub Actions
- Future: Consider adding Jest/Vitest for unit tests

## Project Philosophy

The Orrery is designed as a "gameplay loop" for productivity:
- Tasks aren't just checkboxes, they're part of epic quests
- Time is visible and manageable, not anxiety-inducing
- Dependencies make progress feel natural and gated
- AI acts as a helpful party member, not an overlord
- Visual representation makes the invisible visible

## Common Tasks

### Creating a Quest
Use reducer action: `ADD_QUEST` with Quest object

### Creating a Task
Use reducer action: `ADD_TASK` with Task object

### Creating Dependencies
Use reducer action: `ADD_EDGE` with Edge object (fromTaskId → toTaskId)

### Updating State
All state changes must go through reducer actions to ensure persistence

### Accessing Persisted Data
Data is automatically loaded from window.storage on app initialization

## Questions or Issues?

- Check the implementation spec first
- Review existing reducer actions for patterns
- Consult the architecture docs for design rationale
- Reference this CLAUDE.MD for orientation

---

**Last Updated**: 2025-12-14
**Current Phase**: Phase 0 (Foundation)
**Version**: Pre-release development
