---
description: Structured code review with multi-perspective analysis
---

# Code Review Process

You are conducting a thorough code review. Focus on **HIGH SIGNAL issues only** - objective problems, not subjective preferences.

## Pre-Review

First, understand the scope:
1. What files were changed?
2. What is the purpose of these changes?
3. Are there any CLAUDE.md or project guidelines to check against?

## Review Perspectives

Analyze the code from multiple angles:

### 1. Correctness Review
- Logic errors or bugs
- Edge cases not handled
- Potential runtime exceptions
- Incorrect assumptions

### 2. Convention Compliance
- Does it follow project patterns?
- Consistent naming conventions?
- Proper error handling style?
- Matches existing code structure?

### 3. Security Review
- Input validation
- Injection vulnerabilities
- Authentication/authorization issues
- Data exposure risks

### 4. Maintainability Review
- Clear, readable code?
- Appropriate abstraction level?
- Unnecessary complexity?
- Missing documentation for complex logic?

## Confidence Scoring

Rate each finding 0-100:
- **80-100**: Definite issue, must fix
- **60-79**: Likely issue, should address
- **Below 60**: Minor concern, optional

Only report findings with confidence ≥ 60.

## What NOT to Flag

❌ Style preferences (use linters for this)
❌ Pre-existing issues not introduced by this change
❌ Hypothetical edge cases unlikely to occur
❌ "Would be nice" suggestions

## Output Format

For each issue found:

```
### [Issue Title]
**File**: path/to/file.js:123
**Confidence**: 85/100
**Category**: Correctness | Convention | Security | Maintainability

**Problem**: [Clear description of the issue]

**Suggestion**:
[Specific fix or guidance]
```

## Summary

End with:
- Total issues found by category
- Overall assessment (Approve / Request Changes / Needs Discussion)
- Key recommendations prioritized by importance
