# Recursive Systems Thinking Skills

A comprehensive skill suite for distributed cognition across LLM systems.

## The Philosophy

Complex systems cannot be understood through linear thinking alone - and **no single LLM should be a centralized point of failure or cost.**

These skills embody recursive systems thinking at two levels:
1. **Within Claude**: Understanding parts/wholes, change propagation, pattern recognition
2. **Across LLMs**: Strategic delegation to leverage each system's strengths

### The Distributed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLAUDE                               │
│  Reasoning • Orchestration • Judgment • Architecture         │
│  (High-value tokens: complex decisions, planning)            │
└─────────────────────────┬───────────────────────────────────┘
                          │ Delegates to
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│    CODEX      │ │    GEMINI     │ │  LOCAL/FAST   │
│               │ │               │ │               │
│ Code Review   │ │ Exploration   │ │ Quick Tasks   │
│ Verification  │ │ Large Search  │ │ Offline Work  │
│ Pattern Check │ │ Big Context   │ │ Repetitive    │
└───────────────┘ └───────────────┘ └───────────────┘
```

## The Skill Suite

### Orchestration Layer

| Skill | Purpose | Token Impact |
|-------|---------|--------------|
| **recursive-systems-thinking** | Master cognitive framework | Claude (judgment) |
| **llm-orchestrator** | Decide which LLM handles what | Claude (routing) |

### Claude-Owned Skills (High-Value Reasoning)

| Skill | Purpose | Why Claude |
|-------|---------|------------|
| **deep-context-builder** | Build mental models | Requires synthesis |
| **recursive-decomposer** | Break complex into simple | Requires judgment |
| **architectural-compass** | Maintain alignment | Requires philosophy |

### Delegation Skills (Specs for Other LLMs)

| Skill | Purpose | Delegates To |
|-------|---------|--------------|
| **change-impact-analyzer** | Trace ripple effects | Gemini (exploration) |
| **pattern-guardian** | Ensure consistency | Codex (pattern matching) |
| **verification-loop** | Define verification specs | Codex (checklist running) |

## How They Work Together

```
                    ┌─────────────────────────────────┐
                    │  recursive-systems-thinking     │
                    │     (Master Orchestration)      │
                    └───────────────┬─────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ deep-context- │           │   recursive-  │           │ verification- │
│    builder    │           │  decomposer   │           │     loop      │
│               │           │               │           │               │
│  UNDERSTAND   │──────────▶│   DECOMPOSE   │──────────▶│    VERIFY     │
│    FIRST      │           │  INTELLIGENTLY│           │   ALWAYS      │
└───────────────┘           └───────────────┘           └───────────────┘
        │                           │                           │
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│    change-    │           │    pattern-   │           │ architectural-│
│impact-analyzer│           │    guardian   │           │    compass    │
│               │           │               │           │               │
│ TRACE EFFECTS │           │STAY CONSISTENT│           │ STAY ALIGNED  │
└───────────────┘           └───────────────┘           └───────────────┘
```

## The Workflow

### Before Any Significant Work

1. **Claude**: `recursive-systems-thinking` - Establish cognitive framework
2. **Claude**: `deep-context-builder` - Build understanding (or delegate exploration to Gemini)
3. **Claude**: `llm-orchestrator` - Decide what Claude does vs. delegates

### When Planning Changes

1. **Claude**: `recursive-decomposer` - Break down into pieces
2. **Gemini**: Explore codebase for impact analysis (handoff from `change-impact-analyzer`)

### While Implementing

1. **Claude**: Does the implementation (high-value reasoning)
2. **Codex**: Pattern checking as you go (handoff from `pattern-guardian`)

### After Completion

1. **Codex**: Verification (handoff spec from `verification-loop`)
2. **Claude**: Review Codex findings, make judgment calls
3. **Claude**: `architectural-compass` - Confirm alignment (requires philosophy)

## Key Concepts

### Recursive Thinking
The same patterns apply at every scale. Decomposition is recursive. Verification is recursive. Understanding is recursive.

### Feedback Loops
Every action creates feedback. Use that feedback to adjust course. Verification informs future implementation.

### Holistic Awareness
Local changes have global effects. Always maintain awareness of the whole while working on parts.

### Pattern Respect
Patterns are accumulated wisdom. Follow them unless there's compelling reason to evolve them.

### Phase Discipline
Know what phase you're in. Don't build future phases prematurely.

## Anti-Patterns These Skills Prevent

| Anti-Pattern | Prevented By |
|--------------|--------------|
| Acting without understanding | `deep-context-builder` |
| Unintended consequences | `change-impact-analyzer` → Gemini |
| Overwhelming complexity | `recursive-decomposer` |
| Inconsistent code | `pattern-guardian` → Codex |
| Architectural drift | `architectural-compass` |
| Unverified assumptions | `verification-loop` → Codex |
| Cognitive collapse | `recursive-systems-thinking` |
| **Token burn on mechanical work** | `llm-orchestrator` |
| **Single point of failure** | Distributed LLM architecture |

## The Meta-Pattern

These skills are themselves an application of recursive systems thinking:
- They work at multiple scales
- They create feedback loops
- They are self-similar (each skill applies its own principles)
- They compose into a coherent whole

Use them individually as needed. Use them together for complex work. Let them reinforce each other.

---

*"The goal is not speed. The goal is correctness with awareness."*
