---
name: verification-loop
description: Define what needs verification and delegate to appropriate LLMs. Invoke to create verification specs for handoff to Codex or other review-capable LLMs. Claude defines WHAT to check; other LLMs DO the checking.
---

# Verification Loop

## Core Principle

**Claude defines. Codex verifies.**

Verification is pattern-matching and checklist-running - exactly what Codex excels at. Don't burn Claude tokens on mechanical verification. Instead:

1. Claude defines what needs verification
2. Hand off to Codex/Gemini with specific checklist
3. Return to Claude only for judgment calls

## Verification Spec Template

When verification is needed, generate this handoff spec:

```markdown
## Verification Request for Codex

### Context
[Brief description of what was changed and why]

### Files to Review
- [file1.jsx] - [what changed]
- [file2.jsx] - [what changed]

### Verification Checklist

**Syntactic**
- [ ] No syntax errors
- [ ] No undefined variables
- [ ] Types match (check JSDoc annotations)

**Logic**
- [ ] Function returns expected output
- [ ] Edge cases: null, undefined, empty arrays
- [ ] Error cases handled

**Integration**
- [ ] Call sites still work
- [ ] State updates propagate correctly
- [ ] No breaking changes to interfaces

**Patterns**
- [ ] Follows reducer pattern (dispatch, not direct mutation)
- [ ] Uses COLORS constant for styling
- [ ] Uses generateId() for IDs
- [ ] JSDoc annotations present

### Specific Concerns
- [Any particular areas of risk]
- [Specific things to look for]

### Expected Response
List any issues found with:
- File and line number
- What's wrong
- Suggested fix
```

## Quick Verification Handoffs

### After Small Change
```
Codex: Quick review of this diff.
Check: syntax, logic errors, pattern compliance.

[paste diff]
```

### After Feature Implementation
```
Codex: Review this feature implementation.

Files: [list]
Feature: [description]
Patterns to check: reducer, JSDoc, inline styles

Focus on: breaking changes, edge cases, consistency
```

### Before Commit
```
Codex: Pre-commit review.

Changes: [summary]
Diff: [paste or reference]

Verify:
- No debug code left
- No console.logs
- No commented-out code
- Patterns followed
```

## When Claude SHOULD Verify

Some verification requires judgment, not just checking:

| Verification Type | Who |
|-------------------|-----|
| Syntax correct? | Codex |
| Logic correct? | Codex |
| Patterns followed? | Codex |
| Architecture aligned? | Claude |
| Philosophy aligned? | Claude |
| Right problem solved? | Claude |

**Rule:** If it's a checklist → Codex. If it's a judgment → Claude.

## Verification Levels (For Handoff)

### Level 1: Lint-Level (Always Codex)
- Syntax
- Types
- Imports
- Formatting

### Level 2: Logic-Level (Codex)
- Function correctness
- Edge cases
- Error handling

### Level 3: Integration-Level (Codex + Context)
- Call site compatibility
- State flow
- Side effects

### Level 4: Architecture-Level (Claude)
- Does this belong here?
- Is this the right phase?
- Does it fit the design?

### Level 5: Philosophy-Level (Claude)
- Does this serve "I CAN SEE"?
- Does this reduce cognitive load?
- Is this how it should be?

## The Handoff Flow

```
┌─────────────────────────────────────────────────────────┐
│                      CLAUDE                              │
│  1. Define what was changed                              │
│  2. Generate verification spec                           │
│  3. Identify risk areas                                  │
└─────────────────────┬───────────────────────────────────┘
                      │ Handoff
                      ▼
┌─────────────────────────────────────────────────────────┐
│                      CODEX                               │
│  4. Run through checklist                                │
│  5. Identify issues                                      │
│  6. Suggest fixes                                        │
└─────────────────────┬───────────────────────────────────┘
                      │ Return
                      ▼
┌─────────────────────────────────────────────────────────┐
│                      CLAUDE                              │
│  7. Review Codex findings                                │
│  8. Make judgment calls                                  │
│  9. Decide on actions                                    │
└─────────────────────────────────────────────────────────┘
```

## Token Economics

| Approach | Claude Tokens | Result |
|----------|---------------|--------|
| Claude does all verification | HIGH | Expensive, slower |
| Claude specs → Codex verifies | LOW | Cost-effective |
| Skip verification | ZERO | Risky |

**Best practice:** Invest Claude tokens in DEFINING verification, not DOING verification.
