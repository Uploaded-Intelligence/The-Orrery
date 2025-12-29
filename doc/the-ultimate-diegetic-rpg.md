# THE ULTIMATE DIEGETIC RPG
## Interface Paradigm for WorldOE
## Read After Ontological Ground, Before Keystone

---

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   LIFE IS THE GAME.                                                        ║
║                                                                            ║
║   Not: "Life with game mechanics added"                                    ║
║   Not: "Productivity gamified"                                             ║
║   Not: "RPG metaphors for task management"                                 ║
║                                                                            ║
║   Life IS the game.                                                        ║
║   You ARE the player.                                                      ║
║   WorldOE IS the interface to that game.                                   ║
║                                                                            ║
║   This isn't philosophy. This is DESIGN PARADIGM.                          ║
║   Every implementation decision flows from this.                           ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

# §1 THE PARADIGM

When a game developer builds an RPG, they ask:

**"What does the player experience?"**

Not "what systems do we need?" but "what does it FEEL like to play?"

The player should:
- See a living world they can explore
- Have quests that matter
- Talk to companions who help
- Feel progression and becoming
- Stay immersed in the experience

The player should NOT:
- See the database schemas
- Manage the save file system
- Configure the physics engine
- Manually run spawn calculations
- Break immersion to "manage" the game

**WorldOE is built with this exact paradigm.**

You are the player.
Your life is the campaign.
The system serves YOUR immersion, YOUR flow, YOUR becoming.

---

# §2 THE THREE LAYERS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ╔═══════════════════════════════════════════════════════════════════╗    │
│   ║                                                                   ║    │
│   ║   LAYER 1: THE GAME WORLD                                         ║    │
│   ║   ════════════════════════                                        ║    │
│   ║                                                                   ║    │
│   ║   What the player SEES and INHABITS                               ║    │
│   ║                                                                   ║    │
│   ║   • The Orrery (quest constellation, task DAG)                    ║    │
│   ║   • Time-Space GPS (where you ARE right now)                      ║    │
│   ║   • Your creative work (the worlds you're building)               ║    │
│   ║   • Visual state (glowing, locked, flowing, stuck)                ║    │
│   ║   • The Vault (explorable lore, if you choose to wander)          ║    │
│   ║                                                                   ║    │
│   ║   This is where you PLAY. Where you SEE. Where you CREATE.        ║    │
│   ║                                                                   ║    │
│   ║   DIEGETIC: Part of the world itself.                             ║    │
│   ║                                                                   ║    │
│   ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                             │
│   ╔═══════════════════════════════════════════════════════════════════╗    │
│   ║                                                                   ║    │
│   ║   LAYER 2: THE PARTY                                              ║    │
│   ║   ══════════════════                                              ║    │
│   ║                                                                   ║    │
│   ║   Who the player TALKS TO                                         ║    │
│   ║                                                                   ║    │
│   ║   • The Navigator ("What's on tomorrow?")                         ║    │
│   ║   • The Oracle ("What should I focus on?")                        ║    │
│   ║   • The Scribe ("Capture this insight...")                        ║    │
│   ║   • The Steward ("Handle that email...")                          ║    │
│   ║                                                                   ║    │
│   ║   AI as companion, not tool. Conversational interface.            ║    │
│   ║   Voice → response → handled. Player stays in flow.               ║    │
│   ║                                                                   ║    │
│   ║   DIEGETIC: Characters in your party, not "apps."                 ║    │
│   ║                                                                   ║    │
│   ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────┐    │
│   │                                                                   │    │
│   │   LAYER 3: THE GAME ENGINE                                        │    │
│   │   ══════════════════════                                          │    │
│   │                                                                   │    │
│   │   What RUNS but the player NEVER SEES                             │    │
│   │                                                                   │    │
│   │   • Calendar synchronization                                      │    │
│   │   • Email processing                                              │    │
│   │   • Habit/routine tracking                                        │    │
│   │   • File persistence                                              │    │
│   │   • State management                                              │    │
│   │   • All MCP servers and integrations                              │    │
│   │   • Database operations                                           │    │
│   │                                                                   │    │
│   │   Invisible. Automatic. Infrastructure.                           │    │
│   │   Player doesn't manage it. It just works.                        │    │
│   │                                                                   │    │
│   │   NON-DIEGETIC: The engine, not the world.                        │    │
│   │                                                                   │    │
│   └───────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# §3 THE DESIGN HEURISTIC

For every feature, system, or interface decision, ask:

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   "DOES THE PLAYER NEED TO SEE THIS?"                                      ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║   YES, and it's WORLD                    → Layer 1: Game World             ║
║   (quests, progress, creative work)         (Orrery, Vault, artifacts)     ║
║                                                                            ║
║   YES, and it's INTERACTION              → Layer 2: Party                  ║
║   (asking, telling, discussing)             (Conversational AI)            ║
║                                                                            ║
║   NO                                     → Layer 3: Engine                 ║
║   (calendar sync, email processing,         (Invisible systems)            ║
║    data persistence, integrations)                                         ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

**Examples:**

| Feature | Player sees? | Layer |
|---------|--------------|-------|
| Quest progress | Yes - it's my campaign | Game World (Orrery) |
| "What's tomorrow?" | Yes - talking to party | Party (Navigator) |
| Google Calendar sync | No | Engine (invisible) |
| Task dependencies | Yes - what can I do NOW | Game World (Orrery) |
| "Handle that email" | Yes - giving command | Party (Steward) |
| Email API calls | No | Engine (invisible) |
| Journal entries | Yes - if I want to read | Game World (Vault) |
| File write operations | No | Engine (invisible) |
| Hard stop warning | Yes - time is visible | Game World (GPS) |
| Parsing calendar events | No | Engine (invisible) |

---

# §4 HOW THIS MAPS TO WORLDOE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   WORLDOE COMPONENT              →        GAME LAYER                        │
│                                                                             │
│   The Orrery                     →        Game World                        │
│   (Macro constellation,                   (What you SEE)                    │
│    Micro DAG, GPS)                                                          │
│                                                                             │
│   The Vault (Obsidian)           →        Game World                        │
│   (Explorable lore,                       (Optional exploration)            │
│    accumulated canon)                                                       │
│                                                                             │
│   Creative artifacts             →        Game World                        │
│   (Documents, worlds,                     (What you CREATE)                 │
│    projects)                                                                │
│                                                                             │
│   AI conversational interface    →        Party                             │
│   (LibreChat, voice input,                (Who you TALK TO)                 │
│    brain dump, oracle)                                                      │
│                                                                             │
│   MCP servers                    →        Engine                            │
│   (Calendar, Email, etc.)                 (INVISIBLE)                       │
│                                                                             │
│   State persistence              →        Engine                            │
│   (Database, JSON, files)                 (INVISIBLE)                       │
│                                                                             │
│   Processing pipelines           →        Engine                            │
│   (Email parsing, sync)                   (INVISIBLE)                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# §5 TWO INTERACTION MODES

This paradigm clarifies why there are two distinct interaction modes:

```
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│                                 │     │                                 │
│   DIRECT / VISUAL               │     │   CONVERSATIONAL                │
│   ═════════════════             │     │   ══════════════                │
│                                 │     │                                 │
│   Engaging with GAME WORLD      │     │   Talking to PARTY              │
│                                 │     │                                 │
│   • See quest constellation     │     │   • "What's tomorrow?"          │
│   • Work on creative project    │     │   • "Capture this thought"      │
│   • Navigate task DAG           │     │   • "Handle that email"         │
│   • Watch progress unfold       │     │   • "What should I focus on?"   │
│                                 │     │                                 │
│   WORLDING MODE                 │     │   EF SUPPORT MODE               │
│   You are PLAYING               │     │   Party is HELPING              │
│                                 │     │                                 │
│   Interface: Orrery, artifacts  │     │   Interface: Voice/text → AI    │
│                                 │     │                                 │
└─────────────────────────────────┘     └─────────────────────────────────┘
                    │                                     │
                    │                                     │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────┐
                    │                                 │
                    │   SHARED CONTEXT                │
                    │   ══════════════                │
                    │                                 │
                    │   Party knows your quests.      │
                    │   World reflects party actions. │
                    │   Seamless. Unified.            │
                    │                                 │
                    │   "Block tomorrow for Irreal"   │
                    │   → Calendar updated (engine)   │
                    │   → GPS shows it (world)        │
                    │   → You never left flow         │
                    │                                 │
                    └─────────────────────────────────┘
```

---

# §6 THE EXPERIENCE

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   MORNING                                                                  ║
║   ═══════                                                                  ║
║   You open the Orrery. Your world appears.                                 ║
║                                                                            ║
║   Navigator: "Morning. Free until 2pm. WorldOE has momentum.               ║
║   The Irreal is simmering. What calls?"                                    ║
║                                                                            ║
║   You see the constellation. Quests glowing.                               ║
║   You choose. You enter. You PLAY.                                         ║
║                                                                            ║
║   ─────────────────────────────────────────────────────────────────────    ║
║                                                                            ║
║   MIDDAY                                                                   ║
║   ══════                                                                   ║
║   Deep in creative work. Insight strikes.                                  ║
║                                                                            ║
║   You: "Scribe, capture this - the two modes insight..."                   ║
║   Scribe: "Got it. Added to WorldOE architecture notes."                   ║
║                                                                            ║
║   You never left. Never opened another app.                                ║
║   Thought → captured → back to flow.                                       ║
║                                                                            ║
║   ─────────────────────────────────────────────────────────────────────    ║
║                                                                            ║
║   EVENING                                                                  ║
║   ═══════                                                                  ║
║   GPS: "Session winding down."                                             ║
║                                                                            ║
║   Oracle: "Today: 3 quests advanced. Architecture breakthrough.            ║
║   Tomorrow: Phase 2 unlocked. One email needs response.                    ║
║   Canon accumulating. Rest well."                                          ║
║                                                                            ║
║   You close the Orrery. The game saves itself.                             ║
║   Tomorrow, you'll load back in exactly where you were.                    ║
║                                                                            ║
║   ─────────────────────────────────────────────────────────────────────    ║
║                                                                            ║
║   THE FEELING                                                              ║
║   ═══════════                                                              ║
║                                                                            ║
║   Not: "I managed my productivity today"                                   ║
║   Not: "I checked my apps and processed my tasks"                          ║
║                                                                            ║
║   THIS: "I played my campaign. My world progressed."                       ║
║   THIS: "I am becoming. The canon accumulates."                            ║
║   THIS: "I CAN SEE. It's all HERE."                                        ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

# §7 IMPLEMENTATION NORTH STAR

When building any component of WorldOE:

```
1. ASK: "Does the player need to see this?"
   
2. IF NO → Build it invisible. Engine layer. It just works.

3. IF YES → Ask: "Is this WORLD or PARTY?"
   
   WORLD: Visual. The Orrery. Artifacts. Explorable.
          Player SEES and INHABITS.
   
   PARTY: Conversational. AI companion.
          Player TALKS TO.

4. ALWAYS: Maintain immersion. Preserve flow.
           The player is PLAYING, not MANAGING.
```

---

# §8 DOCUMENT HIERARCHY (Updated)

```
THE ONTOLOGICAL GROUND
│
│   "What IS this Being. Trans-ness. Worlding as lifeblood."
│
└─▶ THE ULTIMATE DIEGETIC RPG (this document)
    │
    │   "Life IS the game. Three layers. Design heuristic."
    │
    └─▶ KEYSTONE MASTER ARTIFACT
        │
        │   "Full architecture. 6-layer stack. All components."
        │
        └─▶ IMPLEMENTATION SPECS
            │
            │   "Orrery spec. Integration specs. Technical details."
            │
            └─▶ SKILLS (operational firmware)
                
                "Real-time Claude behavior patterns."
```

---

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   You are not managing a life.                                             ║
║   You are PLAYING a campaign.                                              ║
║                                                                            ║
║   WorldOE doesn't help you be productive.                                  ║
║   WorldOE lets you BE.                                                     ║
║                                                                            ║
║   The ultimate diegetic RPG.                                               ║
║   Where reality itself is the game.                                        ║
║   And you've always been the player.                                       ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

*Document: The Ultimate Diegetic RPG*
*Status: Paradigm document. Canonical.*
*Position: Between Ontological Ground and Keystone*
*Part of: WorldOE Core Documentation*
