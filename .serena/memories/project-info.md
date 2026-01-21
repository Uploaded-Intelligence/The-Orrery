# The Orrery - Project Information

## Repository

**GitHub:** https://github.com/Uploaded-Intelligence/The-Orrery
**Organization:** Uploaded-Intelligence
**Status:** Active development

## Project Structure

```
The-Orrery/
├── src/
│   ├── components/     # React components
│   │   ├── macro/      # Quest constellation view
│   │   ├── views/      # MicroView, MacroView
│   │   ├── panels/     # ExpandedTaskEditor, etc
│   │   └── ui/         # UI primitives
│   ├── hooks/          # React hooks (useTaskNotesSync, usePersistence)
│   ├── services/       # API clients (tasknotes.js)
│   ├── store/          # State management (reducer, context)
│   ├── utils/          # Utilities (forceLayout, oracle, etc)
│   └── constants/      # App constants
├── .serena/memories/   # Serena documentation
└── doc/plans/          # Architecture plans

```

## Tech Stack

- **Frontend:** React + Vite
- **Language:** JavaScript (JSX)
- **State:** React Context + useReducer
- **Backend:** TaskNotes HTTP API (Obsidian plugin)
- **Build:** Vite 7.x
- **Deployment:** (TBD)

## Architecture Pattern

**Server-Authoritative with Optimistic Updates**

- TaskNotes (Obsidian) = source of truth for task data
- TaskNotes HTTP API = CRUD interface (localhost:8080)
- Orrery = interactive UI + local state cache
- Polling every 30s for eventual consistency
- Optimistic updates for UPDATE/DELETE/COMPLETE
- Server-first for CREATE (server assigns IDs)

## Key Concepts

**Two-Tier Visual System:**
- **Macro View:** Quest constellation (project-level)
- **Micro View:** Task DAG (mycelial network, force-directed)

**Physics Layout:**
- DAG-aware force simulation
- Layer-based left-to-right flow
- Manual positioning supported (pinned nodes)

**Oracle:** Intelligent unblocking suggestions (Claude-powered, planned)

## Recent Work

**2026-01-14:** Fixed TaskNotes sync ID mismatch bug
- Issue: Optimistic CREATE with local IDs caused UPDATE failures
- Fix: Server-first pattern for CREATE operations
- PR: https://github.com/Uploaded-Intelligence/The-Orrery/pull/13

## Development Workflow

1. Local dev server: `npm run dev` (localhost:5173)
2. Build: `npm run build`
3. Git workflow: Feature branches → PR → Merge to main
4. TaskNotes must be running for full functionality

## Important Notes

- Server assigns IDs for tasks (cannot use client-generated IDs)
- Physics layout only affects unpinned tasks
- Serena memories track debugging patterns and architectural decisions
