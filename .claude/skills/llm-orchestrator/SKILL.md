---
name: llm-orchestrator
description: Strategic delegation across LLM systems for cost-effective, resilient workflows. Invoke when planning work to determine which LLM should handle which cognitive tasks. Prevents token burn on Claude for tasks other LLMs handle better or cheaper.
---

# LLM Orchestrator

## Core Principle

**No single LLM should be a centralized point of failure or cost.**

Distribute cognitive work across LLMs based on:
- Strengths (what each does best)
- Cost (token economics)
- Availability (rate limits, quotas)
- Resilience (if one fails, work continues)

## The LLM Landscape (Dec 2025)

### Claude (Anthropic)
**Use for:**
- Complex architectural reasoning
- Ambiguous requirement interpretation
- Novel problem-solving
- Orchestration decisions
- Understanding "why" and philosophy
- Multi-step planning with judgment

**Avoid for:**
- Routine code review (expensive)
- Pattern-matching tasks (overkill)
- Large-scale file exploration (token burn)
- Verification checklists (mechanical)

### GPT Codex (OpenAI)
**Use for:**
- Code review and critique
- Finding bugs and issues
- Pattern consistency checking
- Suggesting improvements
- Understanding existing code
- PR review workflows

**Handoff format:**
```
Review this code for:
- [ ] Pattern consistency with [pattern]
- [ ] Breaking changes
- [ ] Edge cases missed
- [ ] Security issues

Code:
[paste code]

Context:
[brief context]
```

### Gemini CLI (Google)
**Use for:**
- Large codebase exploration
- Finding all usages of X
- Broad search and discovery
- Documentation lookup
- When you need massive context window

**Handoff format:**
```
Explore this codebase to find:
- All files that [criteria]
- How [feature] is implemented
- Dependencies of [component]

Start from: [entry point]
```

### Local/Fast Models (Ollama, etc.)
**Use for:**
- Quick syntax checks
- Simple transformations
- Repetitive tasks
- Offline work
- Privacy-sensitive code

## The Rotation Protocol

### Before Starting Work

```
TASK ANALYSIS
├── What type of cognitive work?
│   ├── Reasoning/Planning → Claude
│   ├── Code Review → Codex
│   ├── Exploration → Gemini
│   └── Mechanical → Local/Fast
│
├── What's the cost profile?
│   ├── High-value decision → Worth Claude tokens
│   └── Routine verification → Delegate
│
└── What if primary LLM unavailable?
    └── Define fallback path
```

### During Work

```
CONTINUOUS EVALUATION
│
├── Am I doing mechanical work?
│   └── YES → Stop, delegate to appropriate LLM
│
├── Am I burning tokens on exploration?
│   └── YES → Hand off to Gemini
│
├── Am I reviewing code line-by-line?
│   └── YES → Hand off to Codex
│
└── Am I making architectural decisions?
    └── YES → This is Claude's job, continue
```

### Handoff Patterns

**Claude → Codex (Code Review)**
```
I've made these changes to [files].
Hand off to Codex for review:

"Review the following changes for:
1. Consistency with reducer pattern
2. Potential breaking changes
3. Edge cases in [specific areas]

[diff or code block]"
```

**Claude → Gemini (Exploration)**
```
I need to understand [X] before proceeding.
Hand off to Gemini:

"In this codebase, find:
1. All usages of [function/pattern]
2. How [feature] connects to [feature]
3. The data flow from [A] to [B]"
```

**Codex/Gemini → Claude (Decision)**
```
After review/exploration, return to Claude:

"Based on [findings from other LLM]:
- [Key insight 1]
- [Key insight 2]

Decision needed: [what Claude should decide]"
```

## Cost-Aware Task Mapping

| Task | Best LLM | Why |
|------|----------|-----|
| "Understand this codebase" | Gemini | Large context, exploration |
| "Review my changes" | Codex | Code review specialty |
| "Design the architecture" | Claude | Complex reasoning |
| "Find all usages of X" | Gemini | Search at scale |
| "Is this pattern correct?" | Codex | Pattern matching |
| "What should we build?" | Claude | Judgment, planning |
| "Check for bugs" | Codex | Bug detection |
| "Break this into tasks" | Claude | Decomposition |
| "Verify the implementation" | Codex | Verification |
| "Make the decision" | Claude | Final judgment |

## Resilience Patterns

### Primary/Fallback Chains

```
Code Review:
  Primary: Codex
  Fallback: Gemini
  Last resort: Claude (expensive but works)

Exploration:
  Primary: Gemini
  Fallback: Claude with Task agents
  Last resort: Manual grep/read

Reasoning:
  Primary: Claude
  Fallback: GPT-4 (if available)
  Last resort: Break into smaller Codex-friendly chunks
```

### When Rate Limited

```
Claude limited?
├── Shift review work to Codex
├── Shift exploration to Gemini
├── Queue reasoning tasks for later
└── Use local models for simple tasks

Codex limited?
├── Use Gemini for review (less specialized but works)
└── Queue review tasks

All limited?
├── Focus on planning (low token, high value)
├── Document decisions for later execution
└── Use local models for what's possible
```

## Integration with Other Skills

The other skills should trigger delegation:

**deep-context-builder**
> "Before building context, consider: Can Gemini explore the codebase faster?"

**change-impact-analyzer**
> "Impact analysis = exploration + review. Delegate exploration to Gemini, review to Codex."

**verification-loop**
> "Verification is Codex's strength. Hand off with specific checklist."

**pattern-guardian**
> "Pattern checking is mechanical. Codex excels here."

## The Meta-Principle

**Claude is the conductor, not the entire orchestra.**

Use Claude tokens for:
- Deciding WHAT to do
- Deciding WHO should do it
- Interpreting results
- Making final judgments

Delegate to other LLMs for:
- Doing the mechanical work
- Exploring at scale
- Reviewing in detail
- Verifying systematically

This is recursive systems thinking applied to the LLM ecosystem itself.
