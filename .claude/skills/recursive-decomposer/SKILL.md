---
name: recursive-decomposer
description: Break complex problems into manageable, self-similar sub-problems. Invoke when facing a large feature, multi-step task, or feeling overwhelmed by scope. Applies recursive decomposition to transform complexity into composable pieces that respect system boundaries.
---

# Recursive Decomposer

## Purpose

**Complex problems are solved by reducing them to simpler problems of the same type.**

This is recursion applied to problem-solving itself. A complex feature is just a collection of simpler features. A complex bug is just a collection of simpler bugs. The skill is knowing how to decompose well.

## When To Invoke

- Facing a large feature or epic
- A task feels too big to start
- Unsure where to begin
- Need to estimate effort
- Parallelizing work
- Creating a phased implementation plan

## The Decomposition Protocol

### Step 1: State the Whole

Before decomposing, clearly state what you're decomposing:

```
WHOLE PROBLEM:
├── What is the complete goal?
├── What does "done" look like?
├── What are the boundaries?
└── What's explicitly out of scope?
```

**You cannot decompose what you cannot define.**

### Step 2: Identify Natural Boundaries

Every system has natural boundaries. Find them:

**Architectural Boundaries:**
- Data layer vs. UI layer
- State management vs. rendering
- Core logic vs. edge cases

**Functional Boundaries:**
- Distinct features
- Independent operations
- Separable concerns

**Temporal Boundaries:**
- What must happen first
- What can happen in parallel
- What can wait until later

### Step 3: Apply Recursive Decomposition

For each piece, ask: "Can this be further decomposed?"

**The Decomposition Tree:**
```
[Whole Problem]
    │
    ├── [Sub-problem A]
    │   ├── [Sub-sub-problem A.1]
    │   └── [Sub-sub-problem A.2]
    │
    ├── [Sub-problem B]
    │   ├── [Sub-sub-problem B.1]
    │   ├── [Sub-sub-problem B.2]
    │   └── [Sub-sub-problem B.3]
    │
    └── [Sub-problem C]
        └── [Sub-sub-problem C.1]
```

**Stop decomposing when:**
- The piece is small enough to implement in one focused session
- The piece is atomic (cannot be meaningfully split further)
- The piece matches an existing pattern in the codebase

### Step 4: Check Decomposition Quality

**Good Decomposition:**
- [ ] Each piece is self-contained (can be understood alone)
- [ ] Pieces have minimal coupling (changes to one don't cascade)
- [ ] Pieces can be tested independently
- [ ] Pieces compose back into the whole
- [ ] No piece is dramatically larger than others
- [ ] Dependencies between pieces are clear

**Bad Decomposition Signs:**
- One piece requires understanding all other pieces
- Changing one piece breaks many others
- Pieces can't be tested without the whole
- Some pieces are trivial while others are huge
- Circular dependencies between pieces

### Step 5: Establish Dependencies

Draw the dependency graph between pieces:

```
[A.1] ──→ [A.2] ──→ [B.1]
                      │
[B.2] ←──────────────┘
  │
  └──→ [C.1]
```

Identify:
- **Roots**: Pieces with no dependencies (start here)
- **Leaves**: Pieces nothing depends on (finish with these)
- **Parallel Paths**: Pieces that can happen simultaneously
- **Critical Path**: The longest chain of dependencies

### Step 6: Sequence the Work

Based on dependencies, create implementation order:

```
Phase 1 (Foundation):
  └── [A.1] - No dependencies, start here

Phase 2 (Core):
  ├── [A.2] - Depends on A.1
  └── [B.2] - Can parallel with A.2

Phase 3 (Integration):
  └── [B.1] - Depends on A.2

Phase 4 (Completion):
  └── [C.1] - Depends on B.2
```

## Decomposition Patterns

### Pattern: Data First

For features involving new data:
1. Define data structures
2. Add state management
3. Add persistence
4. Add UI to display
5. Add UI to modify
6. Add edge cases and polish

### Pattern: Skeleton First

For complex UI:
1. Create component structure (empty shells)
2. Add layout and positioning
3. Add static content
4. Add dynamic data binding
5. Add interactions
6. Add animations and polish

### Pattern: Happy Path First

For complex logic:
1. Handle the normal case
2. Add one error case
3. Add remaining error cases
4. Add edge cases
5. Add performance optimizations

### Pattern: Inside Out

For layered systems:
1. Core logic (pure functions)
2. State management (reducer)
3. Side effects (persistence, API)
4. UI layer (components)
5. Integration and glue

### Pattern: Outside In

For user-facing features:
1. UI mockup (static)
2. UI with fake data
3. Connect to real data
4. Add full functionality
5. Polish and edge cases

## The Orrery Decomposition Example

**Whole Problem:** Implement the Micro View (Task Engine)

**Decomposition:**
```
Micro View
├── Canvas System
│   ├── Pan functionality
│   ├── Zoom functionality
│   └── Coordinate system
├── Task Nodes
│   ├── Node component
│   ├── Visual states (locked/available/active/complete)
│   └── Click interactions
├── Dependency Edges
│   ├── Edge component
│   ├── Arrow rendering
│   └── Edge creation UI
├── Layout Algorithm
│   ├── DAG analysis
│   ├── Position calculation
│   └── Collision avoidance
└── Integration
    ├── Connect to state
    ├── Connect to reducer
    └── Connect to other views
```

**Dependencies:**
```
Canvas System ──→ Task Nodes ──→ Integration
                      │
Dependency Edges ←────┘
       │
Layout Algorithm (can parallel with Edges)
```

**Sequence:**
1. Canvas System (foundation)
2. Task Nodes (core functionality)
3. Dependency Edges + Layout Algorithm (parallel)
4. Integration (brings it together)

## Self-Similarity Check

The best decompositions are self-similar: each piece looks like a smaller version of the whole.

**Self-Similar Decomposition:**
- The whole is a React component with state → each piece is a React component with state
- The whole follows a pattern → each piece follows the same pattern
- The whole can be tested → each piece can be tested

**When decomposition isn't self-similar:**
- Consider: Am I decomposing along the wrong boundaries?
- Consider: Is there a different way to slice this?
- Consider: Am I mixing concerns that should be separate?

## Output Artifacts

After decomposition, you should have:

1. **Decomposition Tree**: Visual hierarchy of all pieces
2. **Piece Specifications**: What each piece does
3. **Dependency Graph**: How pieces relate
4. **Implementation Sequence**: Ordered list of work
5. **Effort Estimation**: Relative size of each piece
6. **Risk Identification**: Which pieces are highest risk

## The Meta-Principle

**Decomposition is not just about breaking things down - it's about finding the right structure.**

Bad decomposition creates more work than the original problem. Good decomposition makes the problem almost solve itself, because each piece is simple and the composition is natural.

The recursive insight: if your decomposition doesn't feel right, apply decomposition to the decomposition process itself. Ask: "What's making this hard to decompose? Can I decompose that problem?"
