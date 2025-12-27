---
name: recursive-systems-thinking
description: Master cognitive framework for complex coding projects. Invoke when starting significant work, facing architectural decisions, or when a task feels overwhelming. Orchestrates systematic thinking across scales (strategic/tactical/verification) to prevent cognitive collapse and ensure holistic understanding before action.
---

# Recursive Systems Thinking

## Core Philosophy

This skill embodies a fundamental truth: **Complex systems cannot be understood or modified effectively through linear thinking alone.** You must think recursively - understanding how parts relate to wholes, how changes propagate, and how patterns repeat at different scales.

### The Three Scales (Like The Orrery Itself)

```
STRATEGIC (Macro)     → Architecture, phases, long-term direction
    ↕ feedback
TACTICAL (Micro)      → Specific changes, implementations, code
    ↕ feedback
VERIFICATION (GPS)    → Am I on track? Does this align? Is it working?
```

## When To Invoke This Skill

Use this master framework when:
- Starting work on a new feature or significant change
- Feeling overwhelmed by complexity
- Uncertain about where to begin
- Making architectural decisions
- Something feels "off" but you can't articulate why
- After completing significant work (retrospective check)

## The Recursive Thinking Protocol

### Phase 1: ORIENT (Before Any Action)

**Goal:** Build sufficient mental model before touching code.

1. **Identify the Scale**
   - Is this strategic (architecture-level)?
   - Is this tactical (specific implementation)?
   - Is this a mix requiring both?

2. **Map the Context**
   - What documentation exists? (Read CLAUDE.MD, specs, philosophy docs)
   - What is the current state? (Phase 0? Phase 1?)
   - What patterns already exist in the codebase?
   - What invariants must be preserved?

3. **Understand the "Why"**
   - Why does this change/feature matter?
   - How does it connect to larger goals?
   - What problem is it actually solving?

### Phase 2: DECOMPOSE (Break Down Intelligently)

**Goal:** Transform complexity into manageable, self-similar pieces.

1. **Recursive Breakdown**
   - Can this be split into independent sub-tasks?
   - Do sub-tasks follow the same patterns as the whole?
   - What are the dependencies between sub-tasks?

2. **Boundary Identification**
   - Where are the natural boundaries in the system?
   - What can be changed in isolation?
   - What changes will ripple through?

3. **Sequencing**
   - What must happen first?
   - What can happen in parallel?
   - What creates a stable foundation for subsequent work?

### Phase 3: EXECUTE (Act with Awareness)

**Goal:** Make changes while maintaining systemic awareness.

1. **Pre-Flight Check**
   - Have I read the relevant code?
   - Do I understand what I'm modifying?
   - Have I identified potential ripple effects?

2. **Pattern Adherence**
   - Am I following existing patterns?
   - If creating new patterns, is there good reason?
   - Does this feel consistent with the codebase?

3. **Incremental Progress**
   - Make smallest meaningful change
   - Verify it works
   - Then proceed to next change

### Phase 4: VERIFY (Close the Feedback Loop)

**Goal:** Confirm understanding and correctness.

1. **Local Verification**
   - Does the change work as intended?
   - Does it break anything nearby?
   - Does it follow the patterns?

2. **Systemic Verification**
   - Does this align with the architecture?
   - Does it respect the project philosophy?
   - Does it advance the right phase?

3. **Meta-Verification**
   - Did I solve the right problem?
   - Would this change make sense to the next developer?
   - Is this the kind of code I'd want to maintain?

## The Failure Cascade (What We're Preventing)

```
Unclear understanding
         ↓
Rushed implementation
         ↓
Incorrect changes
         ↓
Ripple effects not anticipated
         ↓
System behavior diverges from intent
         ↓
More rushed fixes
         ↓
Technical debt accumulation
         ↓
System becomes unmaintainable
```

**This skill exists to interrupt this cascade at multiple points.**

## Integration With Other Skills

This master skill orchestrates the specialized skills:

| Situation | Invoke |
|-----------|--------|
| Need to understand before acting | `deep-context-builder` |
| Planning a change | `change-impact-analyzer` |
| Breaking down complex task | `recursive-decomposer` |
| Ensuring consistency | `pattern-guardian` |
| Checking correctness | `verification-loop` |
| Aligning with architecture | `architectural-compass` |
| Deciding which LLM should work | `llm-orchestrator` |

## Distributed Cognition Principle

**Recursive systems thinking extends beyond this conversation.**

The LLM ecosystem is itself a system. Apply the same principles:
- Distribute work across LLMs based on strengths
- Claude = reasoning, orchestration, judgment
- Codex = code review, verification, pattern checking
- Gemini = exploration, large-scale search

Before burning Claude tokens on mechanical work, ask:
> "Should another LLM handle this?"

See `llm-orchestrator` skill for delegation protocols.

## Anti-Patterns to Avoid

1. **Premature Action**: Starting to code before understanding
2. **Linear Thinking**: Treating complex systems as simple sequences
3. **Local Optimization**: Fixing one thing while breaking another
4. **Pattern Blindness**: Ignoring existing patterns in favor of new approaches
5. **Phase Skipping**: Building Phase 3 features during Phase 0
6. **Context Collapse**: Losing sight of the bigger picture

## The Meta-Pattern

Notice that this skill itself is recursive:
- It has phases (Orient → Decompose → Execute → Verify)
- Each phase can contain sub-phases
- The same pattern applies at every scale
- Verification loops back to Orient if needed

**This is intentional.** Systems thinking means thinking in patterns that work at multiple scales.

## Example Application

**Task:** "Add a new feature to The Orrery"

1. **ORIENT**
   - Read CLAUDE.MD - understand current state (Phase 0)
   - Read implementation spec - understand where this feature fits
   - Read soul-transmission - understand the philosophy
   - Identify: Is this feature appropriate for current phase?

2. **DECOMPOSE**
   - What components need to change?
   - What new components are needed?
   - What's the dependency order?
   - Can any parts be done in parallel?

3. **EXECUTE**
   - Start with data model changes (if any)
   - Then reducer actions
   - Then UI components
   - Follow existing patterns (reducer pattern, JSDoc, inline styles)

4. **VERIFY**
   - Does it work?
   - Does it persist correctly?
   - Does it match the spec?
   - Does it feel right in context?

## Invocation Reminder

When you feel:
- Overwhelmed → Start with ORIENT
- Stuck → Return to DECOMPOSE
- Uncertain → Engage VERIFY
- Lost → Return to this skill and restart the protocol

**The goal is not speed. The goal is correctness with awareness.**
