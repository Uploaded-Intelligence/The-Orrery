---
name: change-impact-analyzer
description: Analyze the full impact of proposed changes before implementation. Invoke before making any non-trivial modification to trace dependencies, identify ripple effects, detect breaking changes, and assess risk. Prevents unintended consequences by making the invisible visible.
---

# Change Impact Analyzer

## Purpose

**Every change creates ripples. This skill makes those ripples visible before you create them.**

Most bugs come not from incorrect logic, but from unexpected interactions. A change that seems local often has systemic consequences. This skill provides a systematic way to trace those consequences before they become problems.

## When To Invoke

- Before modifying any function used by multiple callers
- Before changing data structures or interfaces
- Before adding/removing/renaming anything
- Before modifying reducer actions or state shape
- Before changes that touch persistence
- When a "simple change" starts feeling complicated

## The Impact Analysis Protocol

### Step 1: Define the Change Precisely

Before analyzing impact, be crystal clear about what you're changing:

```
CHANGE SPECIFICATION:
├── What exactly is being modified?
├── What is the old behavior?
├── What is the new behavior?
├── What files are directly touched?
└── What's the minimum change to achieve this?
```

**Write this down.** Vague changes lead to vague impact analysis.

### Step 2: Trace Direct Dependencies

**Upstream (What does this depend on?):**
- What functions/modules does this code call?
- What state does it read?
- What external APIs does it use?
- What assumptions does it make about inputs?

**Downstream (What depends on this?):**
- What functions/modules call this code?
- What reads the state this modifies?
- What UI renders from this data?
- What persistence is affected?

**Use grep to find all usages:**
```bash
# Find all usages of a function
grep -r "functionName" --include="*.jsx" --include="*.js"

# Find all usages of a state property
grep -r "state\.propertyName" --include="*.jsx"

# Find all reducer action dispatches
grep -r "type: 'ACTION_NAME'" --include="*.jsx"
```

### Step 3: Map Ripple Effects

For each direct dependency, ask:
1. If I change X, how does Y behave differently?
2. Is that different behavior acceptable?
3. Does Y's changed behavior affect Z?
4. Continue until you reach stable boundaries

**Ripple Map Template:**
```
Change: [what you're modifying]
    │
    ├── Direct Effect: [immediate consequence]
    │   │
    │   ├── Secondary Effect: [consequence of consequence]
    │   │   │
    │   │   └── Tertiary Effect: [and so on...]
    │   │
    │   └── Secondary Effect: [another branch]
    │
    └── Direct Effect: [another immediate consequence]
        │
        └── Secondary Effect: [consequence of that]
```

### Step 4: Identify Breaking Changes

A breaking change is one that:
- Changes the signature of a function others call
- Changes the shape of data structures
- Removes functionality others depend on
- Changes behavior others rely on

**Breaking Change Checklist:**
- [ ] Does this change any function signatures?
- [ ] Does this change any data structure shapes?
- [ ] Does this remove any functionality?
- [ ] Does this change any return values?
- [ ] Does this change any side effects?
- [ ] Does this affect persistence format?

If yes to any: **Find and update all dependents.**

### Step 5: Assess Risk Level

**Risk Matrix:**

| Impact Scope | Reversibility | Risk Level |
|--------------|---------------|------------|
| Single function | Easy to undo | Low |
| Single component | Easy to undo | Low-Medium |
| Multiple components | Easy to undo | Medium |
| State/Data model | Hard to undo | High |
| Persistence format | Very hard to undo | Critical |
| External APIs | May be impossible | Critical |

**High/Critical Risk Changes Require:**
- Extra verification steps
- Backup/rollback plan
- Possibly user confirmation
- Incremental rollout consideration

### Step 6: Create Impact Summary

Before proceeding, document:

```markdown
## Impact Analysis: [Change Description]

### Change Scope
- Files modified: [list]
- Functions modified: [list]
- State affected: [list]

### Direct Dependencies
- Upstream: [what this uses]
- Downstream: [what uses this]

### Ripple Effects
- [Effect 1]: [description and mitigation]
- [Effect 2]: [description and mitigation]

### Breaking Changes
- [None / List with migration plan]

### Risk Assessment
- Level: [Low/Medium/High/Critical]
- Reason: [why this risk level]
- Mitigation: [how to reduce risk]

### Verification Plan
- [ ] [Check 1]
- [ ] [Check 2]
- [ ] [Check n]
```

## The Orrery-Specific Impact Points

For this codebase, pay special attention to:

### State Shape Changes
The entire app uses a single state object managed by `useReducer`. Any change to state shape:
- Affects the reducer
- Affects all components that read that state
- Affects persistence (saved format may differ from new format)
- May require migration logic

### Reducer Action Changes
Reducer actions are the single source of state mutation:
- Changing action payload shape affects all dispatchers
- Removing actions breaks all call sites
- Renaming actions requires find/replace everywhere

### Persistence Format
State is saved to `window.storage` as JSON:
- Changing state shape may make old saved data incompatible
- Consider: Do I need migration logic?
- Consider: What happens if old format is loaded?

### Computed Properties
Functions like `isTaskLocked`, `getQuestProgress`, `getAvailableTasks`:
- Are called from multiple places
- Changes affect all dependent UI
- Performance changes may affect UX

### UI Component Props
If you change what props a component accepts:
- All parent components must be updated
- Type annotations (JSDoc) must be updated
- Example usages must be updated

## Impact Analysis Patterns

### Pattern: The Newspaper Test
Imagine this change makes the front page: "App Breaks After Update"
- What would the headline say went wrong?
- Work backward from that failure to prevent it

### Pattern: The Undo Test
Can you undo this change easily?
- If yes: Lower risk, proceed with confidence
- If no: Higher risk, proceed with extra care

### Pattern: The Stranger Test
If someone unfamiliar with the codebase saw this change:
- Would they understand why it was made?
- Would they be surprised by any effects?
- Surprises indicate under-analyzed impacts

### Pattern: The Time Machine Test
If you made this change and traveled 6 months forward:
- Would you remember why you made it?
- Would the ripple effects be obvious?
- What documentation would help future-you?

## Common Impact Blind Spots

1. **Persistence**: Changes to state shape affect stored data
2. **Derived State**: Computed properties may break with new shapes
3. **Edge Cases**: Rare paths through code that aren't immediately obvious
4. **Initialization**: What happens on first load with no data?
5. **Error Paths**: What happens when things fail?
6. **Async Timing**: What happens if operations complete in different order?

## Output Artifact

After completing impact analysis, you should have:

1. **Clear change specification** - Exactly what's changing
2. **Dependency map** - Everything upstream and downstream
3. **Ripple effects list** - All consequences, direct and indirect
4. **Breaking changes identified** - With migration plan if any
5. **Risk assessment** - With mitigation strategies
6. **Verification checklist** - How to confirm nothing broke

Only proceed to implementation after this analysis is complete.

## The Meta-Principle

**The goal is not to avoid change. The goal is to change with full awareness.**

Every system accumulates complexity. That complexity creates hidden dependencies. Impact analysis is how we make hidden dependencies visible, so we can work with them rather than against them.

Time spent on impact analysis is debugging time saved. Problems found before implementation are 10x cheaper to fix than problems found after.
