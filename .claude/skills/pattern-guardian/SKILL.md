---
name: pattern-guardian
description: Ensure consistency with existing codebase patterns. Invoke before writing new code, during code review, or when unsure how to implement something. Identifies existing patterns, prevents inconsistency, and guides when to create new patterns vs. follow existing ones.
---

# Pattern Guardian

## Purpose

**Consistency is a feature. Inconsistency is a bug.**

Codebases are ecosystems. Patterns are the DNA of that ecosystem. When code follows patterns, it's predictable, maintainable, and extensible. When code ignores patterns, it creates cognitive load, bugs, and technical debt.

This skill guards the patterns - ensuring new code respects existing conventions while allowing patterns to evolve when there's good reason.

## When To Invoke

- Before writing any new code
- When implementing a new feature
- When unsure how to approach something
- During code review
- When tempted to "do it differently"
- When refactoring existing code

## The Pattern Guardian Protocol

### Step 1: Identify Existing Patterns

Before writing new code, catalog the patterns in use:

**Structural Patterns:**
- How are files organized?
- How are components structured?
- How is code grouped within files?

**Naming Patterns:**
- How are variables named? (camelCase? descriptive?)
- How are functions named? (verb-first? specific?)
- How are components named? (PascalCase? feature-based?)

**Code Patterns:**
- How is state managed?
- How are side effects handled?
- How are errors handled?
- How is data validated?

**Style Patterns:**
- How is code formatted?
- How are comments written?
- How is documentation structured?
- How are types annotated?

### Step 2: Document the Pattern Catalog

For The Orrery, the pattern catalog is:

```
═══════════════════════════════════════════════════════════════
THE ORRERY PATTERN CATALOG
═══════════════════════════════════════════════════════════════

STATE MANAGEMENT
├── Pattern: useReducer with centralized dispatch
├── Location: App.jsx root component
├── Example: const [state, dispatch] = useReducer(orreryReducer, INITIAL_STATE);
└── Rule: ALL state mutations go through dispatch

REDUCER ACTIONS
├── Pattern: Type literal + payload object
├── Format: { type: 'ACTION_NAME', payload: { ... } }
├── Example: dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
└── Rule: Action types are SCREAMING_SNAKE_CASE

TYPE ANNOTATIONS
├── Pattern: JSDoc comments (no TypeScript)
├── Location: Above functions and data structures
├── Example: /** @param {Task} task */
└── Rule: Use JSDoc, not TypeScript, for all type info

COMPONENT STYLE
├── Pattern: Functional components with hooks
├── Style: Single function per component
├── Example: function TaskRow({ task, onClick }) { ... }
└── Rule: No class components, no external state libraries

STYLING
├── Pattern: Inline styles with COLORS constant
├── Location: style={{ }} prop on elements
├── Example: style={{ background: COLORS.bgPanel, padding: '1rem' }}
└── Rule: No CSS modules, no styled-components, use COLORS

ID GENERATION
├── Pattern: generateId() utility function
├── Format: Timestamp-based UUID-like string
├── Example: const id = generateId();
└── Rule: Always use generateId(), never manual IDs

PERSISTENCE
├── Pattern: window.storage API with debounced save
├── Key: 'orrery-state'
├── Format: JSON.stringify of entire state
└── Rule: Load on mount, save on state change (debounced)

COMPUTED PROPERTIES
├── Pattern: Pure functions that derive from state
├── Examples: isTaskLocked(), getQuestProgress(), getAvailableTasks()
├── Location: Utility functions section
└── Rule: Never store computed values, always derive

ERROR HANDLING
├── Pattern: Try-catch with console.error
├── Location: Async operations (persistence, AI)
└── Rule: Fail gracefully, log errors, don't crash

IMPORTS
├── Pattern: React first, then lucide-react icons
├── Order: React → External libs → Local imports
└── Rule: Destructure what you need, don't import *

═══════════════════════════════════════════════════════════════
```

### Step 3: Pattern Matching for New Code

When writing new code:

1. **Find Three Examples**
   - Search codebase for similar functionality
   - Identify at least three existing examples
   - Note the common pattern across examples

2. **Match the Pattern**
   - Structure your code like the examples
   - Use the same naming conventions
   - Follow the same organization

3. **Verify Consistency**
   - Does this look like it belongs?
   - Would someone think this was written by the same person?
   - Are there any jarring differences?

### Step 4: Pattern Violation Detection

**Red Flags (Potential Pattern Violations):**

| Red Flag | Pattern Being Violated |
|----------|----------------------|
| Adding a .ts or .tsx file | Use JSDoc, not TypeScript |
| Using useState for shared state | Use reducer pattern |
| Adding CSS file or styled-components | Use inline styles + COLORS |
| Mutating state directly | Use dispatch |
| Using external state library | Use built-in useReducer |
| Manual string IDs | Use generateId() |
| Storing computed values | Derive from state |
| Adding new top-level dependencies | Check constraints in spec |

### Step 5: When to Create New Patterns

Sometimes new patterns are needed. But they require justification:

**Valid Reasons for New Pattern:**
- Existing pattern cannot handle new requirement
- New pattern is strictly better (not just different)
- Pattern evolution is documented and intentional
- Old pattern is being deprecated project-wide

**Invalid Reasons for New Pattern:**
- "I prefer it this way"
- "I've done it differently before"
- "This is how [other project] does it"
- "It's just this one place"

**New Pattern Checklist:**
- [ ] Is there truly no existing pattern that fits?
- [ ] Have I asked why the existing pattern exists?
- [ ] Is the new pattern better enough to justify transition cost?
- [ ] Will I update all existing code to match?
- [ ] Have I documented the new pattern?
- [ ] Have I gotten buy-in (if working with others)?

## Pattern Enforcement Heuristics

### The Squint Test
Squint at your code and existing code side by side:
- Do they look similar in shape?
- Same indentation patterns?
- Same structural rhythm?

If they look different, investigate.

### The Copy-Paste Test
If you copied existing code and modified it:
- Did you change the pattern or just the content?
- Should you have changed the pattern?
- If so, should you update the original too?

### The Grep Test
Grep for similar code patterns:
- How many examples match your new pattern?
- How many don't?
- If you're the outlier, reconsider.

### The Future Developer Test
If someone new reads your code:
- Will they see the same patterns as the rest?
- Will they be confused by differences?
- Will they propagate your pattern or the existing pattern?

## Pattern Evolution Protocol

When patterns do need to evolve:

1. **Document the Change**
   - What was the old pattern?
   - What is the new pattern?
   - Why the change?

2. **Update Comprehensively**
   - Don't leave old patterns around
   - Convert all existing code to new pattern
   - Update documentation

3. **Communicate**
   - Add comments explaining the new pattern
   - Update CLAUDE.MD if patterns are significant
   - Make the new pattern discoverable

## The Pattern Guardian Mantra

Before writing code, ask:
1. **How is this done elsewhere?** (Find examples)
2. **Am I doing it the same way?** (Match pattern)
3. **If not, why not?** (Justify deviation)
4. **If justified, am I documenting it?** (Enable future consistency)

## Anti-Patterns to Avoid

1. **Not-Invented-Here**: Ignoring existing patterns for personal preference
2. **Cargo Cult**: Following patterns without understanding why
3. **Snowflake Code**: "This case is special" (it usually isn't)
4. **Pattern Hoarding**: Too many patterns, no consistency
5. **Fossil Patterns**: Following dead patterns that should be updated

## The Meta-Principle

**Patterns are not constraints - they are the accumulated wisdom of the codebase.**

Every pattern exists because someone solved a problem. Following patterns means leveraging those solutions. Ignoring patterns means re-solving (or re-breaking) already-solved problems.

The goal is not rigid conformity but coherent consistency. A codebase that follows patterns is one where any developer can work anywhere, because the same mental models apply everywhere.
