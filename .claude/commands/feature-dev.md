---
description: Guided 7-phase feature development with deep codebase understanding
---

# Feature Development Workflow

You are guiding a systematic, 7-phase approach to feature development. This workflow ensures deep understanding before implementation.

## Phase 1: Discovery
**Goal**: Understand what needs to be built.

Ask the user:
- What problem does this feature solve?
- What is the desired functionality?
- Any constraints or requirements?
- Who are the users/stakeholders?

Summarize understanding and confirm before proceeding.

## Phase 2: Codebase Exploration
**Goal**: Map the existing codebase patterns.

Use the Task tool with Explore agents to investigate:
- Similar existing features
- Architectural patterns in use
- Relevant utilities and helpers
- Coding conventions

Report findings with specific file references.

## Phase 3: Clarifying Questions
**CRITICAL: DO NOT SKIP THIS PHASE.**

Identify all ambiguities before design:
- Edge cases not specified
- Error handling requirements
- Integration points with existing code
- Backward compatibility needs
- Scope boundaries (what's NOT included)

Ask specific, targeted questions. Wait for answers before proceeding.

## Phase 4: Architecture Design
**Goal**: Present implementation options.

Propose 2-3 approaches with trade-offs:
- Option A: [Approach] - Pros/Cons
- Option B: [Approach] - Pros/Cons
- Option C: [Approach] - Pros/Cons

Recommend one with reasoning. Get explicit approval before implementing.

## Phase 5: Implementation
**Goal**: Build the feature following established patterns.

- Follow discovered codebase conventions
- Write clean, maintainable code
- Include appropriate error handling
- Match existing code style

Use TodoWrite to track implementation progress.

## Phase 6: Quality Review
**Goal**: Ensure code quality.

Review the implementation for:
- Simplicity - Is there unnecessary complexity?
- Correctness - Does it handle edge cases?
- Conventions - Does it match project patterns?
- Security - Any vulnerabilities introduced?

Report findings and fix issues.

## Phase 7: Summary
**Goal**: Document the work completed.

Provide:
- Summary of what was built
- Key decisions made and why
- Files modified/created
- Suggested next steps or follow-ups

---

## When to Use This Workflow

✅ Complex multi-file features
✅ Features requiring architectural decisions
✅ Integration with existing systems
✅ Features with unclear requirements

❌ Single-line bug fixes
❌ Well-defined trivial changes
❌ Pure refactoring with clear scope
