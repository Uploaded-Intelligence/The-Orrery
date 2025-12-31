# Skills Arsenal

This document describes the skills library available to Claude for The-Orrery project.

## Important: Environment Isolation

**Claude Code runs in isolated containers per repository.** This means:
- `~/.claude/skills/` is ephemeral and NOT shared across repos
- Skills MUST live in `.claude/skills/` (repo level) to be portable
- When you clone this repo, these skills come with it

**Location:** `.claude/skills/` (project level, committed to git)

## How Skills Work

Skills are markdown files that teach Claude specialized workflows. They trigger **on-demand** based on task context:

1. **Metadata scan** (~100 tokens per skill) - Claude reads skill names/descriptions
2. **Match detection** - Claude identifies relevant skills for the current task
3. **Full load** - Only matched skills load completely (<5k tokens each)
4. **Progressive disclosure** - Supporting files load only when needed

---

## The Arsenal (49 Skills)

### Core Development Workflow (obra/superpowers)

These form the backbone of disciplined development:

| Skill | When It Triggers | What It Does |
|-------|------------------|--------------|
| **brainstorming** | "Let's build X", "I want to add Y" | Socratic questioning → design spec before code |
| **writing-plans** | After design approved | Creates bite-sized implementation tasks |
| **executing-plans** | Have a plan, need to run it | Batch execution with review checkpoints |
| **subagent-driven-development** | Independent tasks in current session | Fresh subagent per task + 2-stage review |
| **dispatching-parallel-agents** | Multiple independent problems | Concurrent investigation/fixes |
| **finishing-a-development-branch** | Implementation complete | Merge, PR, or cleanup decision tree |
| **using-git-worktrees** | Need isolated workspace | Safe worktree creation |

### Debugging & Quality

| Skill | When It Triggers | What It Does |
|-------|------------------|--------------|
| **systematic-debugging** | Any bug, test failure, unexpected behavior | 4-phase root cause process (NO fixes without investigation) |
| **root-cause-tracing** | Error deep in stack, unclear origin | Trace backward through call chain to source |
| **defense-in-depth** | After finding root cause | Add validation at every layer |
| **verification-before-completion** | About to claim "done" | Run verification commands, confirm output |

### Testing

| Skill | When It Triggers | What It Does |
|-------|------------------|--------------|
| **test-driven-development** | Implementing any feature/fix | Write test first → watch fail → minimal code to pass |
| **testing-anti-patterns** | Writing tests | Avoid common mistakes (testing mocks, test-only methods) |
| **condition-based-waiting** | Async test flakiness | Replace timeouts with condition polling |

### Problem-Solving (When Stuck)

Use **when-stuck** first - it dispatches to the right technique:

| Skill | Stuck Symptom | Technique |
|-------|---------------|-----------|
| **simplification-cascades** | Same thing 5+ ways, growing special cases | Find unifying insight that eliminates 10 things |
| **collision-zone-thinking** | Need innovation, conventional solutions fail | Force unrelated concepts together |
| **meta-pattern-recognition** | Same issue in different places | Spot patterns across 3+ domains |
| **inversion-exercise** | Solution feels forced, stuck on assumptions | Flip assumptions to reveal alternatives |
| **scale-game** | Will it work at scale? Edge cases unclear? | Test at 1000x bigger/smaller extremes |

### Code Review

| Skill | When It Triggers | What It Does |
|-------|------------------|--------------|
| **requesting-code-review** | Before merge/PR | Dispatch reviewer subagent |
| **receiving-code-review** | Got feedback | Technical rigor, not blind agreement |
| **pair-programming** | Collaborative coding session | Driver/navigator modes with verification |

### Visualization (Critical for The-Orrery)

| Skill | When It Triggers | What It Does |
|-------|------------------|--------------|
| **d3js-visualization** | Charts, graphs, network diagrams, DAGs | D3.js patterns for force-directed layouts |
| **flowchart-creator** | Process diagrams, decision trees | HTML flowcharts with swimlanes |
| **architecture-diagram-creator** | System architecture, data flows | Comprehensive HTML architecture diagrams |
| **algorithmic-art** | Generative visuals, particle effects | p5.js with seeded randomness |
| **canvas-design** | Static visual art, posters | PNG/PDF design philosophy |

### Frontend Development

| Skill | When It Triggers | What It Does |
|-------|------------------|--------------|
| **frontend-design** | Building web UI, React components | Distinctive, production-grade interfaces |
| **senior-frontend** | Complex React/Next.js/TypeScript work | Component scaffolding, performance, bundle analysis |
| **senior-fullstack** | Complete web apps | React + Node + GraphQL + PostgreSQL patterns |
| **web-artifacts-builder** | Complex multi-component artifacts | React + Tailwind + shadcn/ui |
| **webapp-testing** | UI verification | Playwright automation |

### Documentation

| Skill | When It Triggers | What It Does |
|-------|------------------|--------------|
| **doc-coauthoring** | Writing docs, proposals, specs | Structured documentation workflow |

### Research & Architecture

| Skill | When It Triggers | What It Does |
|-------|------------------|--------------|
| **project-context** | Starting work on any project | Load conventions and patterns |
| **tracing-knowledge-lineages** | Need historical context | How ideas evolved over time |
| **preserving-productive-tensions** | Disagreements in design | Preserve multiple valid approaches |
| **remembering-conversations** | Need prior context | Search previous Claude conversations |

### Meta (Skill Development)

| Skill | When It Triggers | What It Does |
|-------|------------------|--------------|
| **using-superpowers** | Every conversation start | Establishes skill usage discipline |
| **writing-skills** | Creating new skills | TDD for process documentation |
| **testing-skills-with-subagents** | Validating skills | RED-GREEN-REFACTOR for skills |
| **sharing-skills** | Contributing upstream | Branch and PR workflow |
| **gardening-skills-wiki** | Maintaining skills | Check links, naming, coverage |
| **pulling-updates-from-skills-repository** | Updating skills | Sync with upstream obra/superpowers-skills |

### Tools & Utilities

| Skill | When It Triggers | What It Does |
|-------|------------------|--------------|
| **mcp-builder** | Building MCP servers | Guide for creating MCP servers |
| **mcp-cli** | Using MCP servers on-demand | Discover tools without polluting context |
| **using-tmux-for-interactive-commands** | Interactive CLI tools (vim, repl) | Run interactive commands in tmux |
| **ux-researcher-designer** | UX research tasks | Persona generation, user research |
| **theme-factory** | Need consistent styling | Theme/styling generation toolkit |

---

## Skill Hierarchy

When multiple skills could apply:

```
1. PROCESS skills first (brainstorming, systematic-debugging)
   ↓ These determine HOW to approach
2. IMPLEMENTATION skills second (frontend-design, d3js-visualization)
   ↓ These guide execution
```

**Examples:**
- "Build a feature" → brainstorming first, then frontend-design
- "Fix this bug" → systematic-debugging first, then domain skills

---

## The Iron Laws

From **systematic-debugging**:
```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

From **using-superpowers**:
```
IF A SKILL APPLIES TO YOUR TASK, YOU MUST USE IT.
Even 1% chance = invoke the skill.
```

From **verification-before-completion**:
```
NEVER claim "done" without running verification commands.
```

---

## For The-Orrery Specifically

This project is a React 19 + Vite visual operating system with:
- Constellation macro view (force-directed graphs) → **d3js-visualization**
- DAG micro view (task dependencies) → **d3js-visualization**, **flowchart-creator**
- Complex useReducer state → **systematic-debugging**, **root-cause-tracing**
- AI integration → **mcp-builder**

**Most-used skills for this project:**
1. d3js-visualization (constellation/DAG)
2. systematic-debugging (state management bugs)
3. test-driven-development (reducer logic)
4. frontend-design (React UI)
5. verification-before-completion (quality gates)

---

## Sources

- [obra/superpowers](https://github.com/obra/superpowers) (12.9k stars) - Core workflow
- [obra/superpowers-skills](https://github.com/obra/superpowers-skills) - Extended techniques
- [anthropics/skills](https://github.com/anthropics/skills) - Official Anthropic skills
- [chrisvoncsefalvay/claude-d3js-skill](https://github.com/chrisvoncsefalvay/claude-d3js-skill) - D3.js visualization

---

## Excluded Skills (and Why)

These were intentionally NOT included:

| Skill | Reason |
|-------|--------|
| **docx, pdf, pptx, xlsx** | Document processing - not relevant for The-Orrery |
| **brand-guidelines** | Anthropic-specific branding |
| **internal-comms** | Enterprise communications templates |
| **slack-gif-creator** | Not relevant |
| **vibe-coding** | Philosophy without actionable workflow |
| **feature-planning** | Redundant with `brainstorming` + `writing-plans` chain |
| **session-start-hook** | Environment-specific, not portable |

---

## Skill Overlap Analysis

These skill groups are **complementary, not duplicates**:

### Frontend Skills (3 skills, different focus)
- **frontend-design**: Visual aesthetics, bold design choices
- **senior-frontend**: Technical tooling, scripts, performance
- **senior-fullstack**: Full stack including backend

### Debugging Skills (3 skills, workflow stages)
- **systematic-debugging**: Overall 4-phase framework
- **root-cause-tracing**: Trace backward to source
- **defense-in-depth**: Post-fix validation layers

### Planning Skills (2 skills, sequential)
- **brainstorming**: Requirements → Design spec
- **writing-plans**: Design → Detailed implementation tasks

### Visualization Skills (3 skills, different outputs)
- **d3js-visualization**: Data visualizations (charts, DAGs)
- **algorithmic-art**: Generative art (p5.js)
- **canvas-design**: Static art (posters, PDFs)
