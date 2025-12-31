# Claude Code Configuration

This directory contains Claude Code plugins, skills, commands, and agents for The Orrery project.

## Structure

```
.claude/
├── skills/           # Specialized knowledge/guidance
│   └── frontend-design/
├── commands/         # Slash commands (invoke with /command-name)
│   ├── feature-dev.md
│   └── code-review.md
├── agents/           # Specialized sub-agents
│   ├── code-explorer.md
│   ├── code-architect.md
│   └── code-reviewer.md
└── README.md
```

## Available Commands

### `/feature-dev`
Guided 7-phase feature development workflow:
1. Discovery - Understand requirements
2. Codebase Exploration - Map existing patterns
3. Clarifying Questions - Resolve ambiguities
4. Architecture Design - Present options with trade-offs
5. Implementation - Build following conventions
6. Quality Review - Check for issues
7. Summary - Document the work

**Use for**: Complex features, architectural decisions, unclear requirements.

### `/code-review`
Structured code review with multi-perspective analysis:
- Correctness (bugs, logic errors)
- Convention compliance
- Security vulnerabilities
- Maintainability

Only reports high-confidence issues (≥60/100). Avoids subjective nitpicks.

## Available Skills

### `frontend-design`
Production-grade UI design guidance. Creates distinctive interfaces that avoid generic "AI slop" aesthetics. Emphasizes:
- Bold aesthetic direction
- Thoughtful typography
- Cohesive color systems
- Meaningful motion
- Spatial composition

## Available Agents

### `code-explorer`
Explores codebases to understand patterns, architecture, and implementations. Use for reconnaissance before building features.

### `code-architect`
Designs features following discovered codebase patterns. Presents multiple options with trade-offs.

### `code-reviewer`
Reviews code for bugs, quality issues, and convention compliance. Uses confidence scoring to filter noise.

## Usage

```
# Start guided feature development
/feature-dev

# Review code changes
/code-review

# Invoke skill for UI work
(Claude will use frontend-design skill automatically for UI tasks)
```

## Adding More Plugins

See Anthropic's official plugins: https://github.com/anthropics/claude-code/tree/main/plugins
