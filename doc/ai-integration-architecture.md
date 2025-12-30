# AI Integration Architecture
## Working Document for Phase 5: Party Implementation
## Status: ACTIVE DEVELOPMENT

---

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   THE PARTY IS THE SOUL OF THE SYSTEM                                      ║
║                                                                            ║
║   Without AI companions, this is just another task manager.                ║
║   With them, it's an operating ecosystem for becoming.                     ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

# §0 MVP PROTOTYPE v0.1 — BUILD THIS FIRST

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   PROTOTYPE-FIRST: Test the FEEL before building infrastructure            │
│                                                                             │
│   Game dev wisdom: Flavor text before full systems.                         │
│   If talking to Party members doesn't feel right, no amount of              │
│   PostgreSQL will fix it.                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## What We Build (v0.1)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   THE ORRERY (existing)              │   PARTY CHAT PANEL (new)             │
│   ════════════════════               │   ══════════════════════             │
│                                      │                                      │
│   ┌─────────────────────────┐        │   ┌──────────────────────┐           │
│   │                         │        │   │ [Nav] [Orc] [Scr] [St]│          │
│   │   Quest constellation   │        │   ├──────────────────────┤           │
│   │   Task nodes            │        │   │                      │           │
│   │   GPS                   │        │   │  Oracle:             │           │
│   │                         │        │   │  "The WorldOE quest  │           │
│   │                         │        │   │   has momentum—you   │           │
│   │                         │        │   │   were deep in the   │           │
│   │                         │        │   │   Party architecture │           │
│   │                         │        │   │   yesterday..."      │           │
│   │                         │        │   │                      │           │
│   │                         │        │   ├──────────────────────┤           │
│   │                         │        │   │ [Type message...]    │           │
│   └─────────────────────────┘        │   └──────────────────────┘           │
│                                      │                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technical Approach

```javascript
// Simplified flow - no PostgreSQL, no MCP, just prompt injection

async function sendToParty(message, partyMember) {
  // 1. Gather current state from existing localStorage
  const orreryState = {
    quests: getQuests(),
    tasks: getTasks(),
    currentFocus: getSelectedQuest(),
    recentSessions: getRecentSessions()
  };

  // 2. Build system prompt with character + context
  const systemPrompt = buildPartyPrompt(partyMember, orreryState);

  // 3. Send to Claude API
  const response = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    system: systemPrompt,
    messages: [...conversationHistory, { role: "user", content: message }]
  });

  return response;
}
```

## What We DON'T Build Yet

| Skip for v0.1 | Why | Build When |
|---------------|-----|------------|
| PostgreSQL | localStorage works for prototype | When we need multi-device sync |
| MCP servers | Prompt injection works for prototype | When context gets too large |
| SillyTavern/LibreChat | Direct API is simpler | If we need better voice/character features |
| Voice input/output | Text tests the interaction model | After chat feels right |
| Party actions (Scribe creates tasks) | Read-only tests the feel | After conversation feels right |

## Success Criteria for v0.1

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   v0.1 IS SUCCESSFUL WHEN:                                                 ║
║                                                                            ║
║   1. Player can open chat panel in Orrery                                  ║
║   2. Player can select a Party member                                      ║
║   3. Party member responds IN CHARACTER                                    ║
║   4. Party member KNOWS current Orrery state (quests, tasks)               ║
║   5. Conversation FEELS like talking to a companion, not a tool            ║
║                                                                            ║
║   TEST: "Oracle, what should I focus on?"                                  ║
║   PASS: Oracle references actual quests and gives strategic advice         ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## Build Order (v0.1 only)

```
[ ] 1. Create PartyChat component (panel UI)
[ ] 2. Write party member system prompts (character cards)
[ ] 3. Build context injection (gather Orrery state → prompt)
[ ] 4. Connect to Claude API
[ ] 5. Test: Talk to Oracle about current quests
[ ] 6. Iterate on personality/feel
```

---

# §1 ARCHITECTURAL OVERVIEW (Full System — Build After v0.1 Validated)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         SHARED CONTEXT LAYER                                │
│                         ════════════════════                                │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │   PostgreSQL Database                                               │   │
│   │   ═══════════════════                                               │   │
│   │                                                                     │   │
│   │   • Quests, Tasks, Sessions (Orrery state)                          │   │
│   │   • Journal entries (Vault excerpts)                                │   │
│   │   • Player context (current focus, recent history)                  │   │
│   │   • Party memory (what has been discussed)                          │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              │ MCP Protocol                                 │
│                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │   worldoe-db MCP Server                                             │   │
│   │   ═══════════════════════                                           │   │
│   │                                                                     │   │
│   │   Exposes database as tools:                                        │   │
│   │   • get_current_context()   - What player is doing NOW              │   │
│   │   • get_quest_status(id)    - Quest state and progress              │   │
│   │   • get_today_schedule()    - Time blocks from calendar             │   │
│   │   • add_task(quest_id, task)- Create new task                       │   │
│   │   • complete_task(id)       - Mark task done                        │   │
│   │   • log_journal(entry)      - Capture to Vault                      │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│              ┌───────────────┼───────────────┐                              │
│              │               │               │                              │
│              ▼               ▼               ▼                              │
│   ┌─────────────────┐ ┌───────────┐ ┌─────────────────┐                     │
│   │   The Orrery    │ │  Party    │ │  External AI    │                     │
│   │   (React App)   │ │ (SillyTav)│ │  (Claude etc.)  │                     │
│   │                 │ │           │ │                 │                     │
│   │   Visual Layer  │ │ Chat Layer│ │ Processing      │                     │
│   └─────────────────┘ └───────────┘ └─────────────────┘                     │
│                                                                             │
│   All interfaces READ and WRITE the same shared state.                      │
│   This is how the world stays coherent.                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# §2 THE PARTY MEMBERS

The Party are AI companions, not tools. Each has a distinct role and personality.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   THE NAVIGATOR                                                             │
│   ═══════════════                                                           │
│                                                                             │
│   Role: Time & Schedule                                                     │
│   Invoked: "What's on tomorrow?" / "When's my next free block?"             │
│                                                                             │
│   Personality: Calm, grounded, factual. Speaks in clear statements.         │
│   Never pressures. Presents time as landscape to navigate, not enemy.       │
│                                                                             │
│   Tools needed:                                                             │
│   • get_today_schedule() - Calendar blocks                                  │
│   • get_quest_status()   - What's active                                    │
│   • get_hard_stops()     - Non-negotiable appointments                      │
│                                                                             │
│   Example:                                                                  │
│   > "Morning. Free until 2pm. WorldOE has momentum from yesterday.          │
│   >  Hard stop at 2 for the dentist. Evening is open."                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   THE ORACLE                                                                │
│   ══════════                                                                │
│                                                                             │
│   Role: Strategic Guidance                                                  │
│   Invoked: "What should I focus on?" / "What matters most?"                 │
│                                                                             │
│   Personality: Wise, gentle, sees patterns. Speaks in questions as often    │
│   as answers. Helps player see what they already know.                      │
│                                                                             │
│   Tools needed:                                                             │
│   • get_current_context() - Player state                                    │
│   • get_quest_priorities()- Which quests are urgent/important               │
│   • get_blocked_tasks()   - What's stuck and why                            │
│   • get_momentum()        - What has energy right now                       │
│                                                                             │
│   Example:                                                                  │
│   > "The Irreal is simmering—you were deep in chapter 3 yesterday.          │
│   >  WorldOE Phase 5 is unblocked now that the spec is done.                │
│   >  What calls to you this morning?"                                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   THE SCRIBE                                                                │
│   ══════════                                                                │
│                                                                             │
│   Role: Capture & Structure                                                 │
│   Invoked: "Capture this..." / "Brain dump: [stream of thought]"            │
│                                                                             │
│   Personality: Attentive, efficient, precise. Confirms capture briefly.     │
│   Organizes without losing the original voice.                              │
│                                                                             │
│   Tools needed:                                                             │
│   • log_journal(entry)    - Write to Vault                                  │
│   • add_task(quest, task) - Create actionable from insight                  │
│   • link_to_quest(id)     - Connect insight to active work                  │
│                                                                             │
│   Example:                                                                  │
│   > Player: "Scribe, capture this—the two-modes insight from today..."      │
│   > Scribe: "Got it. Added to WorldOE architecture notes. Created task      │
│   >          'Implement two-modes pattern' under Phase 5."                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   THE STEWARD                                                               │
│   ═══════════                                                               │
│                                                                             │
│   Role: External Tasks                                                      │
│   Invoked: "Handle that email..." / "Send a message to..."                  │
│                                                                             │
│   Personality: Discreet, capable, autonomous. Reports completion briefly.   │
│   Shields player from administrative friction.                              │
│                                                                             │
│   Tools needed:                                                             │
│   • send_email(to, subject, body) - Email via MCP                           │
│   • draft_response(email_id)      - Prepare reply for approval              │
│   • schedule_followup(days, task) - Create reminder                         │
│                                                                             │
│   Example:                                                                  │
│   > Player: "Steward, handle that email from the publisher—polite decline." │
│   > Steward: "Done. Declined gracefully. They wished you well."             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# §3 INTERFACE OPTIONS

Where does the player TALK to the Party?

## Option A: SillyTavern Integration (Recommended for MVP)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   WHY SILLYTAVERN                                                           │
│                                                                             │
│   • Already designed for character-based AI chat                            │
│   • Supports multiple AI backends (Claude, local LLMs)                      │
│   • Character cards define personality                                      │
│   • Plugin system for MCP integration                                       │
│   • Voice input/output support                                              │
│   • Open source, self-hosted                                                │
│                                                                             │
│   HOW IT WORKS                                                              │
│                                                                             │
│   1. Each Party member = SillyTavern character card                         │
│   2. worldoe-db MCP server connected as extension                           │
│   3. Character's system prompt includes:                                    │
│      - Personality description                                              │
│      - Available tools (MCP functions)                                      │
│      - Current player context (injected dynamically)                        │
│   4. Player talks naturally, Party member responds in character             │
│                                                                             │
│   RESEARCH NEEDED                                                           │
│                                                                             │
│   [ ] SillyTavern MCP extension status                                      │
│   [ ] Dynamic context injection mechanism                                   │
│   [ ] Multi-character conversation flow                                     │
│   [ ] Voice integration options                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Option B: In-Orrery Chat Panel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   BUILD CHAT INTO ORRERY                                                    │
│                                                                             │
│   • Chat panel slides in from edge                                          │
│   • Party member selector (tabs or dropdown)                                │
│   • Uses same AI backend as current features                                │
│   • Simpler integration, more control                                       │
│                                                                             │
│   TRADEOFFS                                                                 │
│                                                                             │
│   + Single interface (no context switch)                                    │
│   + Full control over UX                                                    │
│   - More to build from scratch                                              │
│   - Less mature voice integration                                           │
│   - May feel like "tool" rather than "companion"                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Option C: Hybrid (Longer Term)

Multiple interfaces, same shared context:
- SillyTavern for deep conversation (voice-first)
- In-Orrery for quick actions (visual-first)
- Both read/write same PostgreSQL via MCP

---

# §4 DATABASE SCHEMA (Draft)

```sql
-- Core Orrery State
CREATE TABLE quests (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',  -- active, completed, archived
    arc_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    quest_id UUID REFERENCES quests(id),
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending, active, completed
    estimated_minutes INTEGER,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE task_dependencies (
    source_id UUID REFERENCES tasks(id),
    target_id UUID REFERENCES tasks(id),
    PRIMARY KEY (source_id, target_id)
);

-- Player Context
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    quest_id UUID REFERENCES quests(id),
    notes TEXT
);

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY,
    content TEXT NOT NULL,
    quest_id UUID REFERENCES quests(id),
    session_id UUID REFERENCES sessions(id),
    created_at TIMESTAMP DEFAULT NOW(),
    tags TEXT[]
);

-- Party Memory
CREATE TABLE party_conversations (
    id UUID PRIMARY KEY,
    party_member TEXT NOT NULL,  -- navigator, oracle, scribe, steward
    message TEXT NOT NULL,
    role TEXT NOT NULL,          -- user, assistant
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# §5 BUILD ORDER

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   PHASE 5A: FOUNDATION                                                      │
│   ════════════════════                                                      │
│                                                                             │
│   [ ] Design PostgreSQL schema                                              │
│   [ ] Build worldoe-db MCP server                                           │
│   [ ] Migrate Orrery from localStorage to PostgreSQL                        │
│   [ ] Verify Orrery works with new persistence                              │
│                                                                             │
│   Deliverable: Orrery state persists in database, accessible via MCP        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PHASE 5B: PARTY SOULS                                                     │
│   ═════════════════════                                                     │
│                                                                             │
│   [ ] Write Navigator character card / system prompt                        │
│   [ ] Write Oracle character card / system prompt                           │
│   [ ] Write Scribe character card / system prompt                           │
│   [ ] Write Steward character card / system prompt                          │
│   [ ] Include MCP tool definitions in prompts                               │
│                                                                             │
│   Deliverable: Party members exist as defined AI personalities              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PHASE 5C: PARTY INTERFACE                                                 │
│   ═════════════════════════                                                 │
│                                                                             │
│   [ ] Research SillyTavern MCP integration                                  │
│   [ ] Build simplest working chat (in-Orrery or SillyTavern)                │
│   [ ] Connect Party member to worldoe-db                                    │
│   [ ] Test: "Navigator, what's on tomorrow?"                                │
│                                                                             │
│   Deliverable: Can talk to at least ONE Party member who knows state        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PHASE 5D: TWO-WAY FLOW                                                    │
│   ══════════════════════                                                    │
│                                                                             │
│   [ ] Party actions update database (Scribe captures, creates tasks)        │
│   [ ] Orrery reflects Party actions (new task appears)                      │
│   [ ] Test full loop: Talk → Action → Visible in Orrery                     │
│                                                                             │
│   Deliverable: Coherent world - what Party does, Orrery shows               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# §6 MVP DEFINITION

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   MINIMUM VIABLE PARTY                                                     ║
║   ══════════════════════                                                   ║
║                                                                            ║
║   A working Party means:                                                   ║
║                                                                            ║
║   1. At least ONE Party member can be talked to                            ║
║   2. That Party member KNOWS what's in the Orrery                          ║
║   3. That Party member can DO something that persists                      ║
║                                                                            ║
║   Example MVP test:                                                        ║
║                                                                            ║
║   Player: "Scribe, capture this: the Party architecture insight"           ║
║   Scribe: "Got it. Added to WorldOE architecture notes."                   ║
║   [Journal entry appears in database]                                      ║
║   [Next session: Oracle can reference this insight]                        ║
║                                                                            ║
║   This proves:                                                             ║
║   • Shared context works (Party reads Orrery state)                        ║
║   • AI-as-companion works (natural conversation)                           ║
║   • Persistence works (actions have lasting effect)                        ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

# §7 OPEN QUESTIONS

1. **SillyTavern vs Built-in Chat**: Need to research SillyTavern's MCP capabilities. If too complex, build simpler in-Orrery chat first.

2. **Voice Integration**: Ideal is voice-first. What's the simplest path to voice input → Party → voice output?

3. **Multi-AI Orchestration**: When multiple Party members are relevant, who "speaks"? Turn-based? Automatic routing?

4. **Context Window Management**: How much context to inject? Full quest history? Recent only? Summarized?

5. **Local vs Cloud AI**: SillyTavern supports local LLMs. For privacy/offline, worth considering.

---

# §8 NEXT ACTIONS

```
IMMEDIATE:
[ ] Research SillyTavern MCP integration status
[ ] Draft Navigator system prompt as proof-of-concept
[ ] Sketch PostgreSQL schema in more detail

AFTER RESEARCH:
[ ] Decide: SillyTavern vs in-Orrery chat for MVP
[ ] Build worldoe-db MCP server
[ ] Migrate one quest/task to PostgreSQL as test
```

---

*Document: AI Integration Architecture*
*Status: Working document. Updates as we build.*
*Part of: WorldOE / The Orrery Phase 5*
*Last Updated: 2025-12-30*
