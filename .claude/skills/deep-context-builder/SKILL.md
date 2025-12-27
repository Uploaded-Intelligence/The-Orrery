---
name: deep-context-builder
description: Build comprehensive mental models before making changes. Invoke at the start of any significant task, when entering unfamiliar code, or when something unexpected happens. Systematically explores architecture, patterns, dependencies, and philosophy to prevent action without understanding.
---

# Deep Context Builder

## Purpose

**Never modify what you don't understand.**

This skill provides a systematic protocol for building sufficient mental models before taking action. It prevents the most common source of bugs and regressions: acting on incomplete understanding.

## When To Invoke

- Starting work on a new feature
- Entering an unfamiliar area of the codebase
- Something behaves unexpectedly
- About to make significant changes
- Feeling uncertain about how things connect
- Returning to a codebase after time away

## The Context Building Protocol

### Layer 1: Documentation Context

**Read in this order:**

1. **Philosophy/Soul** (`doc/soul-transmission.md`)
   - What is the deep purpose?
   - What are the success signals?
   - What failure modes exist?
   - What vocabulary has precise meaning?

2. **Architecture** (`CLAUDE.MD`, `doc/keystone-master-artifact-v2.md`)
   - What is the overall structure?
   - What design decisions were made and why?
   - What are the core principles?
   - What constraints exist?

3. **Technical Spec** (`doc/orrery-implementation-spec.md`)
   - What is the data model?
   - What are the phases?
   - What components exist?
   - What patterns are prescribed?

### Layer 2: Code Context

**Systematic exploration:**

1. **Entry Points**
   - Where does execution start? (`main.jsx`, `App.jsx`)
   - How does state flow?
   - What's the component hierarchy?

2. **Data Model**
   - What entities exist?
   - How do they relate?
   - What invariants exist?
   - How is state managed?

3. **Patterns in Use**
   - What patterns recur? (reducer, JSDoc, inline styles)
   - How are similar problems solved elsewhere?
   - What utilities exist?
   - What naming conventions are used?

4. **Boundaries**
   - What's in scope vs. out of scope?
   - What's stable vs. changing?
   - What's Phase 0 vs. future phases?

### Layer 3: Change Context

**For the specific change you're considering:**

1. **Scope Identification**
   - What files will be touched?
   - What functions will be modified?
   - What new code will be added?

2. **Dependency Mapping**
   - What does this code depend on?
   - What depends on this code?
   - What shared state is involved?

3. **Risk Assessment**
   - What could go wrong?
   - What's the blast radius of failure?
   - Are there irreversible consequences?

## Context Verification Checklist

Before proceeding, confirm:

- [ ] I understand WHY this system exists (philosophy)
- [ ] I understand HOW it's structured (architecture)
- [ ] I understand WHAT state it manages (data model)
- [ ] I understand WHERE my change fits (scope)
- [ ] I understand WHAT patterns to follow (consistency)
- [ ] I understand WHAT could break (risk)

If any checkbox is unclear, investigate before proceeding.

## Context Building Patterns

### Pattern: Concentric Circles

Start from the center and expand:

```
        ┌─────────────────────────────────────┐
        │     Ecosystem (related systems)     │
        │  ┌─────────────────────────────┐    │
        │  │    Project (The Orrery)     │    │
        │  │  ┌─────────────────────┐    │    │
        │  │  │  Module (App.jsx)   │    │    │
        │  │  │  ┌─────────────┐    │    │    │
        │  │  │  │  Function   │    │    │    │
        │  │  │  │  (target)   │    │    │    │
        │  │  │  └─────────────┘    │    │    │
        │  │  └─────────────────────┘    │    │
        │  └─────────────────────────────┘    │
        └─────────────────────────────────────┘
```

Understand each layer before diving deeper.

### Pattern: Trace the Data

Follow data through the system:

```
User Action → Event Handler → Dispatch → Reducer → New State → Re-render → Persistence
```

Understand each step for your specific change.

### Pattern: Find Three Examples

Before implementing something new:
1. Find how similar things are done elsewhere
2. Find at least three examples
3. Identify the common pattern
4. Apply that pattern to your case

## Common Context Gaps (And How To Fill Them)

| Gap | Sign | Solution |
|-----|------|----------|
| Missing philosophy | Changes feel arbitrary | Read soul-transmission.md |
| Missing architecture | Unsure where things belong | Read CLAUDE.MD and spec |
| Missing patterns | Unsure how to implement | Find 3 existing examples |
| Missing dependencies | Changes break unexpectedly | Trace all usages with grep |
| Missing scope | Changes sprawl | Re-read the original requirement |

## Integration With Project Structure

For The Orrery specifically:

```
Context Sources:
├── doc/soul-transmission.md      → Philosophy, "why", success signals
├── doc/keystone-master-artifact-v2.md → Architecture, 6-layer stack
├── doc/orrery-implementation-spec.md  → Technical spec, phases
├── CLAUDE.MD                     → Quick reference, current state
└── src/App.jsx                   → All current implementation

Key Questions for The Orrery:
1. What phase is this? (Phase 0 - Foundation)
2. What entities exist? (Quest, Task, Edge, Session, Preferences)
3. What patterns? (useReducer, JSDoc, inline styles, COLORS constant)
4. What's the success signal? ("I CAN SEE")
5. What's the failure cascade? (See soul-transmission.md §9)
```

## Output of Context Building

After completing this protocol, you should be able to articulate:

1. **The System**: "This project is [X] that does [Y] because [Z]"
2. **The Architecture**: "It's structured as [components] connected by [relationships]"
3. **The Current State**: "We're in [phase] with [capabilities] working"
4. **The Patterns**: "This codebase uses [pattern A, B, C]"
5. **My Change**: "I'm modifying [X] which connects to [Y, Z]"
6. **The Risks**: "This could break [A] if I'm not careful about [B]"

If you can't articulate these, continue building context.

## Anti-Patterns

1. **Skimming**: Reading quickly without understanding
2. **Assuming**: Guessing instead of verifying
3. **Tunnel Vision**: Only looking at the immediate change location
4. **Pattern Blindness**: Not noticing existing patterns
5. **Documentation Avoidance**: Jumping to code without reading docs

## The Meta-Principle

**Context building is not overhead - it's the work.**

The time spent understanding is not separate from the time spent implementing. Understanding IS implementing. Acting without understanding is just creating problems to solve later.

Every minute spent building context saves ten minutes of debugging later.
