---
name: architectural-compass
description: Navigate architectural decisions and maintain alignment with project vision. Invoke when making design decisions, choosing between approaches, or when unsure if something belongs in the current phase. Provides orientation using project documentation as north star, preventing drift from intended architecture.
---

# Architectural Compass

## Purpose

**Know where you are. Know where you're going. Know if you're on course.**

Architecture is the skeleton of a system. When architecture is respected, the system grows coherently. When architecture is ignored, the system becomes a patchwork of conflicting decisions that eventually collapses under its own weight.

This skill keeps you oriented - ensuring every decision aligns with the intended direction, belongs in the current phase, and serves the project's purpose.

## When To Invoke

- Making design decisions
- Choosing between implementation approaches
- Adding new features
- Refactoring existing code
- Feeling uncertain about where something belongs
- At the start of any significant work
- When someone asks "should we do X?"

## The Compass Points

### North Star: The Purpose

For The Orrery, the north star is:

> **"Create conditions for existence."**
>
> Not productivity. Not organization. EXISTENCE.
> The success signal: "I CAN SEE."

Every architectural decision should be tested against:
- Does this help the user SEE?
- Does this reduce cognitive load?
- Does this create conditions for existence?

If no, reconsider.

### East: The Phases

The project has defined phases. Know which phase you're in:

```
PHASE 0: Foundation (CURRENT)
├── Data layer with Quest, Task, Edge entities
├── Persistence via window.storage
├── Reducer-based state management
├── Basic UI scaffolding
└── Import/Export functionality

PHASE 1: Micro View Core
├── Task nodes on canvas
├── Dependency edges
├── Visual states
├── Basic auto-layout

PHASE 2: Micro View Enhanced
├── Pan/zoom
├── Actual filter
├── Quest focus overlay
├── Task detail panel

PHASE 3: Macro View
├── Quest constellation
├── Progress rings
├── View toggle

PHASE 4: Time-Space GPS
├── Always-visible HUD
├── Session management
├── Countdown timer

PHASE 5: AI Integration
├── Brain dump parsing
├── Task expansion
├── Oracle suggestions

PHASE 6: Polish
├── Animations
├── Sound cues
├── Celebrations
```

**The Phase Rule:** Don't build Phase N+1 features during Phase N.

Exceptions require explicit justification.

### South: The Principles

The Orrery is built on core principles:

1. **Visibility over hiding** - Everything that matters is visible
2. **Dependency gating** - Can't see what you can't do yet
3. **Quest-task nesting** - Local actions connect to epic arcs
4. **AI as party member** - Synthesize, don't just store
5. **Panic button exists** - "Actual" filter for overwhelm moments

Every architectural decision should support these principles.

### West: The Constraints

Technical constraints that shape decisions:

- **React + Vite** - Framework choice is fixed
- **JSDoc, not TypeScript** - Type annotations via comments
- **window.storage** - Persistence mechanism
- **window.claude.complete** - AI integration
- **lucide-react** - Icon library
- **Inline styles** - No CSS-in-JS libraries
- **Single file (currently)** - App.jsx contains everything

Don't fight the constraints. Work within them.

## The Navigation Protocol

### Step 1: Establish Current Position

Before making decisions, know where you are:

- What phase is the project in?
- What has been implemented?
- What patterns are established?
- What decisions have been made?

### Step 2: Determine Destination

Where does this decision lead?

- What capability does it add?
- What does "done" look like?
- How does it fit in the roadmap?

### Step 3: Check Alignment

Is this the right path?

- Does it serve the north star?
- Does it belong in the current phase?
- Does it respect the principles?
- Does it work within constraints?

### Step 4: Navigate Obstacles

When facing conflicts:

- **Phase conflict**: Is this really needed now, or can it wait?
- **Principle conflict**: Which principle takes priority?
- **Constraint conflict**: Is there a constraint-respecting alternative?
- **Resource conflict**: What's the minimum viable version?

## Architectural Decision Framework

For any significant decision, document:

```markdown
## Decision: [What's being decided]

### Context
- Current phase: [Phase N]
- Related features: [what this connects to]
- Constraints: [relevant limitations]

### Options Considered
1. [Option A]: [description]
   - Pros: [benefits]
   - Cons: [drawbacks]

2. [Option B]: [description]
   - Pros: [benefits]
   - Cons: [drawbacks]

### Decision
[Which option and why]

### Alignment Check
- [ ] Serves north star (I CAN SEE)
- [ ] Belongs in current phase
- [ ] Respects principles
- [ ] Works within constraints

### Consequences
- [What this decision enables]
- [What this decision prevents]
- [What must be true for this to work]
```

## Phase-Specific Guidance

### Currently: Phase 0 (Foundation)

**Focus on:**
- Data model correctness
- State management robustness
- Persistence reliability
- Basic UI that works

**Avoid:**
- Visual polish (Phase 6)
- Canvas/visualization (Phase 1-3)
- AI integration (Phase 5)
- Animations (Phase 6)

**Test with:**
- Add quest → refresh → quest persists?
- Add task → add dependency → dependency works?
- Export → reset → import → state restored?

### The 6-Layer Stack

The Keystone defines 6 architectural layers:

```
Layer 6: ECOSYSTEM & PORTALS (Signal Dock, public worlds)
Layer 5: COGNITIVE OPS (LLM integration, extended EF)
Layer 4: FLOW & CIRCULATION (Quest trees, teleology)
Layer 3: ARTIFACT LAYER (The Orrery lives here)
Layer 2: SPATIAL SUBSTRATE (VR, places)
Layer 1: EMBODIED INTERFACE (Voice, movement)
Layer 0: ONTOLOGICAL FOUNDATION (Experience, canon, being)
```

The Orrery is Layer 3-5, but must be built WITH AWARENESS of how it connects to other layers.

## Architectural Anti-Patterns

### Premature Optimization
Building for scale before basics work.
*Ask: Does the simple version work first?*

### Feature Creep
Adding capabilities beyond current phase.
*Ask: Is this Phase N or Phase N+1?*

### Principle Violation
Sacrificing principles for convenience.
*Ask: Am I hiding what should be visible?*

### Constraint Fighting
Trying to work around fixed constraints.
*Ask: Can I achieve this within constraints?*

### Island Architecture
Building isolated features that don't connect.
*Ask: How does this integrate with the whole?*

## Navigational Heuristics

### The 5 Whys
When unsure about a decision:
1. Why are we doing this?
2. Why does that matter?
3. Why is that important?
4. Why does the user need it?
5. Why now rather than later?

The answers reveal whether the decision is aligned.

### The Reversal Test
Imagine you made the opposite decision:
- What would happen?
- What would break?
- What would improve?

Sometimes the opposite is actually better.

### The Regret Minimization Test
Imagine it's 6 months later:
- Would you regret this decision?
- Would you regret NOT making it?

Regret reveals hidden priorities.

### The Outsider Test
Explain the decision to an imaginary new team member:
- Does it make sense?
- Can you justify it?
- Would they agree?

If you can't explain it, reconsider it.

## Recalibration Protocol

When you feel lost:

1. **Stop** - Don't make decisions when disoriented
2. **Re-read documentation**
   - soul-transmission.md (purpose)
   - CLAUDE.MD (current state)
   - orrery-implementation-spec.md (technical spec)
3. **Identify position** - What phase? What's done?
4. **Identify destination** - What are we trying to achieve?
5. **Chart course** - What's the aligned path?

## The Meta-Principle

**Architecture is not a constraint on creativity - it's a channel for it.**

Good architecture doesn't limit what you can build. It guides energy toward coherent outcomes. Without architecture, each decision fights with previous decisions. With architecture, decisions compound toward a unified vision.

The compass doesn't tell you exactly where to go. It tells you which direction is north. You still have to navigate the terrain. But with orientation, you can navigate with confidence.

Keep checking the compass. Stay oriented. Build coherently.
