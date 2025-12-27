---
name: verification-loop
description: Systematic self-verification and correction protocol. Invoke after making changes, when something feels wrong, or when you need to validate your work. Catches errors before they propagate through checking at multiple levels from local correctness to systemic alignment.
---

# Verification Loop

## Purpose

**Trust, but verify. Then verify again.**

Even the most careful implementation can have errors. This skill provides a systematic protocol for catching errors at multiple levels - from syntax mistakes to architectural misalignment. The earlier errors are caught, the cheaper they are to fix.

## When To Invoke

- After completing any implementation
- Before considering a task "done"
- When something feels off
- When changes have unexpected effects
- Before committing code
- When returning to previous work

## The Verification Protocol

### Level 1: Syntactic Verification

**Does the code run at all?**

- [ ] No syntax errors
- [ ] No import errors
- [ ] No undefined variables
- [ ] No type mismatches (JSDoc)
- [ ] Linter passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

**Quick Check:**
```bash
npm run lint
npm run build
```

If these fail, fix before proceeding to deeper verification.

### Level 2: Local Correctness

**Does this code do what it's supposed to do?**

- [ ] Function returns expected output for expected input
- [ ] Edge cases handled (null, undefined, empty, etc.)
- [ ] Error cases handled gracefully
- [ ] Side effects are intentional and documented
- [ ] No obvious logical errors

**Verification Method:**
- Trace through the code mentally with sample inputs
- Check boundary conditions
- Consider: What if this is called with unexpected input?

### Level 3: Integration Correctness

**Does this code work with the rest of the system?**

- [ ] Interfaces match (function signatures, prop types)
- [ ] State changes propagate correctly
- [ ] Event handlers fire correctly
- [ ] Data flows as expected
- [ ] No breaking changes to existing functionality

**Verification Method:**
- Check all call sites of modified functions
- Verify state updates trigger expected re-renders
- Test the feature in the running application

### Level 4: Persistence Correctness

**Does data persist correctly?**

For The Orrery specifically:

- [ ] State saves to window.storage
- [ ] State loads correctly on refresh
- [ ] New fields have sensible defaults for old data
- [ ] No data loss scenarios
- [ ] Import/export works with new changes

**Verification Method:**
1. Make change
2. Refresh page
3. Verify data persisted
4. Export data
5. Reset
6. Import data
7. Verify data restored

### Level 5: Pattern Compliance

**Does this code follow established patterns?**

- [ ] Follows reducer pattern for state changes
- [ ] Uses JSDoc for type annotations
- [ ] Uses inline styles with COLORS constant
- [ ] Uses generateId() for IDs
- [ ] Follows naming conventions
- [ ] Matches structural patterns

**Verification Method:**
- Compare to similar existing code
- Check pattern-guardian skill catalog
- Look for inconsistencies

### Level 6: Architectural Alignment

**Does this code fit the architecture?**

- [ ] Belongs in current phase (Phase 0)
- [ ] Respects component boundaries
- [ ] Maintains separation of concerns
- [ ] Doesn't introduce unnecessary coupling
- [ ] Aligns with documented architecture

**Verification Method:**
- Review implementation spec
- Check CLAUDE.MD
- Consider: Does this belong here?

### Level 7: Philosophical Alignment

**Does this code serve the project's purpose?**

For The Orrery:

- [ ] Contributes to "I CAN SEE" success signal
- [ ] Doesn't add cognitive load
- [ ] Respects the design principles (visibility, dependency gating, etc.)
- [ ] Serves the user's existence, not just productivity

**Verification Method:**
- Review soul-transmission.md
- Ask: Would this help or hinder the user?
- Consider: Does this feel right?

## The Verification Checklist

Use this checklist for every significant change:

```markdown
## Verification: [Change Description]

### Level 1: Syntactic
- [ ] Lint passes
- [ ] Build passes
- [ ] No console errors

### Level 2: Local
- [ ] Logic is correct
- [ ] Edge cases handled
- [ ] Errors handled

### Level 3: Integration
- [ ] Call sites work
- [ ] State flows correctly
- [ ] UI updates correctly

### Level 4: Persistence
- [ ] Saves correctly
- [ ] Loads correctly
- [ ] Migration (if needed)

### Level 5: Patterns
- [ ] Follows reducer pattern
- [ ] Follows style patterns
- [ ] Follows naming patterns

### Level 6: Architecture
- [ ] Correct phase
- [ ] Correct location
- [ ] Correct coupling

### Level 7: Philosophy
- [ ] Serves "I CAN SEE"
- [ ] Reduces cognitive load
- [ ] Respects principles
```

## Verification Failure Protocol

When verification fails at any level:

1. **Stop** - Don't proceed to next level
2. **Diagnose** - What specifically failed?
3. **Fix** - Address the root cause
4. **Re-verify** - Start from Level 1 again

**Don't stack unverified changes.** Each layer of unverified code multiplies debugging complexity.

## Common Verification Failures

| Symptom | Likely Level | Common Cause |
|---------|--------------|--------------|
| Console errors | Level 1 | Syntax, imports |
| Wrong output | Level 2 | Logic error |
| Feature broken | Level 3 | Interface mismatch |
| Data lost on refresh | Level 4 | Persistence bug |
| Code looks different | Level 5 | Pattern violation |
| Feature feels wrong | Level 6-7 | Architectural/philosophical misalignment |

## The Feedback Loop

Verification should inform future implementation:

```
Implement → Verify → Find Issue → Understand Why → Prevent Next Time
                                        │
                                        └── Update mental model
                                        └── Update verification habits
                                        └── Update documentation if needed
```

Each verification failure is a learning opportunity. Ask:
- Why did I make this mistake?
- How can I catch it earlier next time?
- Is there a pattern I should follow?

## Verification Depths

**Quick Verification** (after small changes):
- Levels 1-3
- Takes: 2-5 minutes
- For: Minor modifications

**Standard Verification** (after feature implementation):
- Levels 1-5
- Takes: 10-15 minutes
- For: New features, significant changes

**Deep Verification** (before major milestones):
- Levels 1-7
- Takes: 20-30 minutes
- For: Phase completion, before commits

## The Verification Mindset

**Assume Errors Exist**
Don't ask "Did I make an error?" Ask "Where is my error?"
This mindset catches more bugs than optimistic checking.

**Verify What Matters**
Focus verification effort where failure is costly:
- Persistence (data loss is catastrophic)
- State management (bugs ripple everywhere)
- User-facing features (directly impacts experience)

**Verify Incrementally**
Don't write 500 lines then verify.
Write 50 lines, verify, write 50 more, verify.
Smaller batches = easier debugging.

## The Meta-Principle

**Verification is not the end of implementation - it's part of implementation.**

The code isn't written until it's verified. "Done" means "verified at all applicable levels." Unverified code is not complete code - it's a hypothesis waiting to be tested.

The verification loop closes the feedback cycle that allows learning. Without verification, errors accumulate silently until they become crises. With verification, errors are caught early when they're cheap to fix.
