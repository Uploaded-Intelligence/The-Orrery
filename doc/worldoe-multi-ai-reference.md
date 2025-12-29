# WorldOE Multi-AI Orchestration
## Living Reference Document
## Last Updated: 2025-12-29

---

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   CONTEXT: This document captures research on multi-AI orchestration       ║
║   for WorldOE. It survives context compression.                            ║
║                                                                            ║
║   DECISION PENDING: Capacities vs Obsidian for shared context layer        ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

# §1 THE ARCHITECTURE

## 1.1 Two-Layer ADHD PKM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   LAYER 1: EF (Executive Function) LAYER                                    │
│   ════════════════════════════════════                                      │
│   Owner: AI-managed                                                         │
│   Storage: PostgreSQL                                                       │
│   Contains: Quests, Tasks, Sessions, CRM, Routines                          │
│   Access: Full CRUD via custom MCP server                                   │
│   UI: The Orrery (visual quest/task system)                                 │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   LAYER 2: CONTENT LAYER                                                    │
│   ══════════════════════                                                    │
│   Owner: Human-owned                                                        │
│   Storage: Capacities OR Obsidian (decision pending)                        │
│   Contains: Ideas, notes, lore, learnings, manual writing                   │
│   Access: Read-heavy, human-writes                                          │
│   Offline: Must work without internet                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 1.2 The Context Silo Problem

```
CURRENT STATE:
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│    Claude.ai     │    │     Gemini       │    │      GPT         │
│                  │    │                  │    │                  │
│  Knows project   │    │  Doesn't know    │    │  Doesn't know    │
│  context deeply  │    │  the project     │    │  anything        │
│                  │    │                  │    │                  │
│  Has soul docs   │    │  No soul docs    │    │  No soul docs    │
│  in this project │    │                  │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
        │                       │                       │
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                    NO SHARED CONTEXT
                    Each AI is isolated
```

## 1.3 Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              YOU                                            │
│                               │                                             │
│    ┌──────────────────────────┼──────────────────────────┐                  │
│    │                          │                          │                  │
│    ▼                          ▼                          ▼                  │
│                                                                             │
│  ┌─────────────┐      ┌─────────────────┐      ┌─────────────┐             │
│  │ Claude.ai   │      │   LibreChat     │      │   Gemini    │             │
│  │ (Projects)  │      │   (self-host)   │      │ (Google)    │             │
│  │             │      │                 │      │             │             │
│  │ MCP ✓       │      │ Claude/GPT/     │      │ Native      │             │
│  │             │      │ Gemini/Local    │      │ Google      │             │
│  │             │      │ + Full MCP      │      │ Suite       │             │
│  └──────┬──────┘      └────────┬────────┘      └──────┬──────┘             │
│         │                      │                      │                     │
│         └──────────────────────┼──────────────────────┘                     │
│                                │                                            │
│                     ALL connect via MCP to:                                 │
│                                │                                            │
│         ┌──────────────────────┼──────────────────────┐                     │
│         │                      │                      │                     │
│         ▼                      ▼                      ▼                     │
│  ┌─────────────┐      ┌─────────────────┐      ┌─────────────┐             │
│  │ PKM Layer   │      │   WorldOE-DB    │      │   Google    │             │
│  │ (Obsidian)  │      │   MCP Server    │      │  Calendar   │             │
│  │             │      │   (PostgreSQL)  │      │   MCP       │             │
│  │ Ideas/Notes │      │                 │      │             │             │
│  │ Lore        │      │ Quests/Tasks    │      │ Time        │             │
│  │ Learnings   │      │ Sessions        │      │ Events      │             │
│  │             │      │ CRM             │      │             │             │
│  │ FULL CRUD   │      │ FULL CRUD       │      │ Read        │             │
│  └─────────────┘      └─────────────────┘      └─────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# §2 PKM DECISION: CAPACITIES vs OBSIDIAN

## 2.1 Capacities API Limitations

```
CAPACITIES API STATUS (Dec 2025):
┌────────────────────┬────────┬──────────────────────────────────────────────┐
│ Operation          │ Status │ Notes                                        │
├────────────────────┼────────┼──────────────────────────────────────────────┤
│ List Spaces        │ ✅     │ Can see workspaces                           │
│ Get Space Info     │ ✅     │ Can see structures, collections              │
│ Search Content     │ ✅     │ Full-text search across spaces               │
│ Save Weblink       │ ✅     │ CREATE new weblink objects with metadata     │
│ Append Daily Note  │ ✅     │ APPEND markdown to daily notes               │
├────────────────────┼────────┼──────────────────────────────────────────────┤
│ Update Object      │ ❌     │ Cannot modify existing content               │
│ Delete Object      │ ❌     │ Cannot remove anything                       │
│ Create Page/Note   │ ❌     │ Cannot create arbitrary object types         │
│ Edit Properties    │ ❌     │ Cannot change tags, relations, etc.          │
└────────────────────┴────────┴──────────────────────────────────────────────┘

VERDICT: READ + APPEND-ONLY, NOT FULL CRUD
```

## 2.2 Obsidian Capabilities

```
OBSIDIAN (via filesystem + MCP):
┌────────────────────┬────────┬──────────────────────────────────────────────┐
│ Operation          │ Status │ Notes                                        │
├────────────────────┼────────┼──────────────────────────────────────────────┤
│ Create files       │ ✅     │ Any markdown file, any location              │
│ Read files         │ ✅     │ Full content access                          │
│ Update files       │ ✅     │ Modify any part of any file                  │
│ Delete files       │ ✅     │ Remove files                                 │
│ Search content     │ ✅     │ Full-text search                             │
│ Manage frontmatter │ ✅     │ Update YAML properties                       │
├────────────────────┼────────┼──────────────────────────────────────────────┤
│ Knowledge graph    │ ⚠️     │ Manual via [[links]], not object-based       │
│ Sync              │ ⚠️     │ Requires iCloud/Obsidian Sync/Git            │
│ Mobile            │ ⚠️     │ Obsidian app required                        │
└────────────────────┴────────┴──────────────────────────────────────────────┘

VERDICT: FULL CRUD, but more setup required
```

## 2.3 Decision Matrix

```
┌────────────────────────────┬─────────────┬─────────────┐
│ Requirement                │ Capacities  │ Obsidian    │
├────────────────────────────┼─────────────┼─────────────┤
│ AI can READ knowledge base │ ✅          │ ✅          │
│ AI can CREATE new notes    │ ❌ (weblinks)│ ✅          │
│ AI can UPDATE existing     │ ❌          │ ✅          │
│ AI can DELETE              │ ❌          │ ✅          │
│ Human-friendly UI          │ ✅ Excellent│ ✅ Good     │
│ Knowledge graph visual     │ ✅ Native   │ ⚠️ Plugins  │
│ Object-based thinking      │ ✅ Native   │ ❌ Files    │
│ Offline access             │ ✅          │ ✅          │
│ Sync across devices        │ ✅ Built-in │ ⚠️ Setup    │
│ MCP server exists          │ ✅          │ ✅          │
│ API maturity               │ ⚠️ Beta     │ ✅ (files)  │
└────────────────────────────┴─────────────┴─────────────┘
```

## 2.4 Hybrid Approach (Recommended)

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   USE BOTH - DIFFERENT PURPOSES:                                           ║
║                                                                            ║
║   CAPACITIES (Human-Primary):                                              ║
║   • Manual note-taking, idea capture                                       ║
║   • Knowledge graph exploration                                            ║
║   • Object-based organization (People, Projects, Books, etc.)              ║
║   • AI can SEARCH and READ for context                                     ║
║   • AI can APPEND to daily notes as session log                            ║
║                                                                            ║
║   OBSIDIAN (AI-Accessible):                                                ║
║   • Soul documents (AI needs to read + potentially update)                 ║
║   • Session logs (AI writes, human reads)                                  ║
║   • Working documents (AI generates drafts)                                ║
║   • Lore/worldbuilding (AI assists, human curates)                         ║
║   • Full CRUD when needed                                                  ║
║                                                                            ║
║   POSTGRESQL (EF Layer):                                                   ║
║   • Quests, Tasks, Sessions - ALWAYS PostgreSQL                            ║
║   • This is the Orrery backend                                             ║
║   • Full CRUD required, high-frequency state changes                       ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

# §3 EXISTING TOOLS EVALUATION

## 3.1 Multi-Model Chat Interfaces

```
┌─────────────────┬──────────┬──────────┬───────────────┬────────────────────┐
│ Tool            │ Multi-AI │ MCP      │ Shared Memory │ Notes              │
├─────────────────┼──────────┼──────────┼───────────────┼────────────────────┤
│ LibreChat       │ ✅       │ ✅ Full  │ ⚠️ Via MCP    │ Best option        │
│ Open WebUI      │ ✅       │ ✅ v0.6+ │ ⚠️ Via MCP    │ Needs MCPO proxy   │
│ Multiple.chat   │ ✅       │ ❌       │ ❌            │ Commercial, limited│
│ Clarifai        │ ✅       │ ❌       │ ❌            │ Enterprise routing │
└─────────────────┴──────────┴──────────┴───────────────┴────────────────────┘
```

## 3.2 Critical Gap

```
WHAT EXISTS:
✅ Multi-model access in one UI
✅ Tool use via MCP per-session
✅ Cost optimization through routing

WHAT DOESN'T EXIST (we must build):
❌ Cross-AI context persistence
❌ "What did I discuss with Gemini?" asked to Claude
❌ Shared conversation log across all AIs
❌ Automatic soul context injection
❌ Output capture and routing (AI decides where output goes)
```

## 3.3 MCP Servers Available

```
EXISTING MCP SERVERS WE CAN USE:
┌─────────────────────┬─────────────────────────────────────────────────────┐
│ Server              │ Purpose                                             │
├─────────────────────┼─────────────────────────────────────────────────────┤
│ capacities-mcp      │ Search Capacities, save weblinks, append daily notes│
│ obsidian-mcp        │ Full CRUD on Obsidian vault                         │
│ google-calendar-mcp │ Read/write calendar events                          │
│ gmail-mcp           │ Read/draft emails                                   │
│ notion-mcp          │ If switching to Notion                              │
│ filesystem-mcp      │ Generic file operations                             │
└─────────────────────┴─────────────────────────────────────────────────────┘

NEED TO BUILD:
┌─────────────────────┬─────────────────────────────────────────────────────┐
│ worldoe-db-mcp      │ PostgreSQL for Quests/Tasks/Sessions/CRM            │
└─────────────────────┴─────────────────────────────────────────────────────┘
```

---

# §4 GEMINI GOOGLE SUITE ADVANTAGE

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   GEMINI has NATIVE integration with Google Workspace:                     ║
║                                                                            ║
║   ✅ Google Drive    → Reads/writes docs directly (no API needed)          ║
║   ✅ Google Calendar → Native scheduling (no MCP needed)                   ║
║   ✅ Gmail           → Read/draft emails natively                          ║
║   ✅ Google Tasks    → Native todo integration                             ║
║   ✅ YouTube         → Analyze videos                                      ║
║                                                                            ║
║   STRATEGIC IMPLICATION:                                                   ║
║   For Google-ecosystem tasks, Gemini may be BETTER than Claude+MCP         ║
║   because it's native, not through API bridges.                            ║
║                                                                            ║
║   WORKFLOW SPLIT:                                                          ║
║   • Gemini → Google Suite tasks (calendar, email, docs)                    ║
║   • Claude → Deep thinking, coding, PKM, WorldOE building                  ║
║   • GPT    → Specific strengths (image gen, certain reasoning)             ║
║                                                                            ║
║   STILL NEED: Shared context layer so they know what each other did        ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

# §5 IMPLEMENTATION PATH

## 5.1 Minimum Viable Path

```
WEEK 1: INFRASTRUCTURE
├── Deploy LibreChat (Docker)
├── Configure Claude + Gemini + GPT API keys  
├── Add Obsidian MCP server (for soul docs)
├── Add Google Calendar MCP
└── TEST: Can all AIs read soul context from Obsidian?

WEEK 2: EF LAYER
├── PostgreSQL schema (quests/tasks/sessions)
├── worldoe-db MCP server (fork ArnOS pattern)
├── Add to LibreChat config
└── TEST: Can all AIs manage quests/tasks?

WEEK 3: SOUL CONTEXT INJECTION
├── Create soul-context system prompt
├── Configure LibreChat to prepend it
├── Add current-state retrieval from PostgreSQL
└── TEST: Does Gemini "know you" like Claude does?

WEEK 4+: VISUAL LAYER
├── Basic Orrery reading from PostgreSQL
├── Integrate with Capacities for knowledge graph view
└── Iterate based on actual usage
```

## 5.2 Alternative: Simpler Start

```
MINIMAL MANUAL APPROACH (if above is too much):

1. Keep soul docs in Obsidian
2. Manually copy-paste relevant context when switching AIs
3. Use Capacities for human note-taking (AI reads only)
4. Use this Claude Project for deep work (keeps context)
5. Use Gemini for Google Suite stuff (native integration)
6. Add orchestration layer later when patterns clear
```

---

# §6 OPEN DECISIONS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   DECISION 1: Primary PKM Tool                                              │
│   ───────────────────────────                                               │
│   Options:                                                                  │
│   A) Capacities only (accept API limitations)                               │
│   B) Obsidian only (more setup, full CRUD)                                  │
│   C) Hybrid: Capacities for human, Obsidian for AI-accessible [RECOMMENDED]│
│                                                                             │
│   Current lean: C (Hybrid)                                                  │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   DECISION 2: Unified Interface                                             │
│   ─────────────────────────────                                             │
│   Options:                                                                  │
│   A) LibreChat (self-hosted, full MCP, multi-model)                         │
│   B) Continue native apps (Claude.ai, Gemini, ChatGPT) + manual context     │
│   C) LibreChat for some tasks, native apps for others                       │
│                                                                             │
│   Current lean: A or C (LibreChat primary)                                  │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   DECISION 3: Build Scope                                                   │
│   ──────────────────────                                                    │
│   Options:                                                                  │
│   A) Full orchestration layer now                                           │
│   B) Minimal: just shared Obsidian + PostgreSQL MCP servers                 │
│   C) Manual workflow first, automate based on friction points              │
│                                                                             │
│   Current lean: B or C (start minimal, grow organically)                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# §7 KEY INSIGHT

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   THE GAP IN THE MARKET:                                                   ║
║                                                                            ║
║   Power users have built multi-model INTERFACES                            ║
║   but NOT multi-AI ORCHESTRATION with shared memory.                       ║
║                                                                            ║
║   The missing piece is the "context injection + output capture" layer      ║
║   that sits BETWEEN the user and each AI platform.                         ║
║                                                                            ║
║   This is what we need to build (or work around manually).                 ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

# §8 QUICK REFERENCE: MCP SERVER CONFIGS

## Capacities MCP

```json
{
  "mcpServers": {
    "capacities": {
      "command": "npx",
      "args": ["-y", "capacities-mcp"],
      "env": {
        "CAPACITIES_API_KEY": "your_key_here"
      }
    }
  }
}
```

## Obsidian MCP (example)

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "@anthropic/obsidian-mcp"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/path/to/vault"
      }
    }
  }
}
```

## Google Calendar MCP

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@anthropic/google-calendar-mcp"],
      "env": {
        "GOOGLE_CREDENTIALS_PATH": "/path/to/credentials.json"
      }
    }
  }
}
```

---

*Document Status: Living Reference*
*Last Updated: 2025-12-29*
*Purpose: Survives context compression for WorldOE project*
