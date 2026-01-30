# CLAUDE.MD - The Orrery Project Guide

## ⚠️ FOUNDATIONAL TRUTH — READ FIRST

```
╔══════════════════════════════════════════════════════════════════════════╗
║  LIFE IS THE GAME.                                                       ║
║                                                                          ║
║  Not: "Life with game mechanics added"                                   ║
║  Not: "Productivity gamified"                                            ║
║  But: Life IS the game. You ARE the player. WorldOE IS the interface.    ║
║                                                                          ║
║  The Orrery is Layer 1 of this game - the GAME WORLD you see and inhabit.║
╚══════════════════════════════════════════════════════════════════════════╝
```

**If you lose sight of this, you will build the wrong thing.**

---

## 🎮 THE THREE LAYERS (Memorize This)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  LAYER 1: GAME WORLD (Diegetic)                                         │
│  ══════════════════════════════                                         │
│  What the player SEES and INHABITS                                      │
│                                                                         │
│  • The Orrery (quest constellation, task DAG, GPS)                      │
│  • Creative artifacts (documents, projects, worlds)                     │
│  • The Vault (explorable lore, accumulated canon)                       │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  LAYER 2: THE PARTY (Diegetic)                                          │
│  ═════════════════════════════                                          │
│  Who the player TALKS TO                                                │
│                                                                         │
│  • The Navigator ("What's on tomorrow?")                                │
│  • The Oracle ("What should I focus on?")                               │
│  • The Scribe ("Capture this insight...")                               │
│  • The Steward ("Handle that email...")                                 │
│                                                                         │
│  AI as COMPANION, not tool. Conversational interface.                   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  LAYER 3: GAME ENGINE (Non-Diegetic)                                    │
│  ═══════════════════════════════════                                    │
│  What RUNS but player NEVER SEES                                        │
│                                                                         │
│  • Calendar sync, email processing                                      │
│  • File persistence, state management                                   │
│  • MCP servers, database operations                                     │
│                                                                         │
│  INVISIBLE. AUTOMATIC. Player doesn't manage it.                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Design Heuristic**: For every feature, ask "Does the player need to see this?"
- YES + WORLD → Layer 1 (Orrery, artifacts)
- YES + INTERACTION → Layer 2 (Party conversation)
- NO → Layer 3 (Engine - make it invisible)

---

## 🔄 Documentation Triggers

| Change Type | Document to Update |
|-------------|-------------------|
| New interaction pattern (e.g., actions bloom from objects) | `orrery-implementation-spec.md` §0.6 |
| New UI terminology decision | `orrery-implementation-spec.md` §0.6 |
| Architecture decision (AI, data flow) | `doc/ai-integration-architecture.md` |
| Phase progress or blockers | Relevant working doc |
| New component pattern | `orrery-implementation-spec.md` |
| Paradigm clarification | `CLAUDE.MD` + relevant doc |

**Documentation IS part of the change.** If you complete implementation without updating docs, THE WORK IS INCOMPLETE.

---

## 📚 Required Reading

| Priority | Document | Purpose |
|----------|----------|---------|
| 1 | `doc/soul-transmission.md` | Who this Being is |
| 2 | `doc/the-ultimate-diegetic-rpg.md` | Three-layer paradigm |
| 3 | `doc/orrery-implementation-spec.md` | Technical spec |
| 4 | `doc/worldoe-multi-ai-reference.md` | AI orchestration |

**The soul docs ARE the spec.**

---

## 🚀 Current Implementation Status

- **Phase 1-4**: Core functionality complete (views, state, interactions)
- **Phase 5**: AI Integration (IN PROGRESS - Party paradigm)
- **Phase 6**: Polish & Game-Feel (ONGOING)
- **Phase 7**: Macro View Enhanced (COMPLETE)

### Phase 5: AI as Party Members

The AI integration is NOT buttons and features. It's **Party members**:

| Old Framing (WRONG) | New Framing (RIGHT) |
|---------------------|---------------------|
| "Synthesize button" | The Scribe captures and structures |
| "Oracle action" | The Oracle suggests what to focus on |
| "Brain dump interface" | Talking to your Party |
| "AI features" | Companions in your campaign |

---

## 🎯 Key Interaction Design Principles

| Principle | Wrong | Right |
|-----------|-------|-------|
| Actions at Objects | Select → toolbar → click | Touch → actions bloom FROM it |
| Terminology | "Add Dependency", "Blocks" | "Unlocks...", "Requires" |
| Touch First | Click handlers | Hit areas 44px+, touch end actions |
| AI Is Party | "Click AI button to process" | "Tell the Scribe to capture" |

---

## 📁 Project Structure

```
/The-Orrery
├── doc/
│   ├── soul-transmission.md             # Who this Being is
│   ├── the-ultimate-diegetic-rpg.md     # Three-layer paradigm
│   ├── keystone-master-artifact-v2.md   # Full architecture
│   ├── orrery-implementation-spec.md    # Technical spec (§0!)
│   └── worldoe-multi-ai-reference.md    # AI orchestration
├── src/
│   ├── components/
│   │   ├── views/          # MacroView, MicroView (Layer 1)
│   │   ├── tasks/          # TaskNode (Layer 1)
│   │   ├── quests/         # QuestOrb, QuestCard (Layer 1)
│   │   ├── gps/            # TimeSpaceGPS (Layer 1)
│   │   ├── party/          # AI Party members (Layer 2) [TO BUILD]
│   │   └── panels/         # Detail panels
│   ├── store/              # State management (Layer 3)
│   ├── hooks/              # useAI, useTimer, etc.
│   └── constants/          # Colors, config
└── package.json
```

## API Layer (`/api/`)

| Endpoint | Purpose |
|----------|---------|
| `edges/` | DAG edge CRUD, dependency management |
| `experiments/` | Experiment lifecycle |
| `inquiries/` | Inquiry capture and processing |
| `oracle/` | Oracle AI synthesis |
| `vines/` | Graph traversal queries |
| `webhook/` | External integrations |
| `health.js` | Health check endpoint |

## State Management (`/src/store/`)

Uses custom store pattern (not Redux/Zustand). Key stores:
- Experiment state
- Edge/dependency state
- View state (macro/micro)

---

## 🔧 Tech Stack

- **Framework**: React 19 + Vite
- **Icons**: lucide-react
- **Language**: JSDoc-typed JavaScript (.jsx)
- **Current Persistence**: `window.storage` API
- **Target Persistence**: PostgreSQL via worldoe-db MCP server
- **AI Integration**: `window.claude.complete` API → evolving to multi-AI via MCP

---

## ✅ The Test

```
ASK: "Does the player need to see this?"
ASK: "Is this WORLD or PARTY or ENGINE?"
ASK: "Would a game designer approve, or say 'where's the juice?'"
ASK: "Is the AI a tool or a companion?"
```

---

## 🛠️ Development Commands

```bash
npm install
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
```

---

**Current Focus**: AI Integration as Party Members (Phase 5)
