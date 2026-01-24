# The Orrery: DAG/Mycelium Network Activation Plan

## Problem Statement

The Orrery has 23 experiments but **0 edges**. Without edges:
- No DAG structure (no dependencies, no unlock gates)
- No self-organizing mycelium visualization
- No GAME mechanics (just a flat todo list)
- Physics engine has nothing to connect

**Root cause**: Migration script parses `blockedBy` but never creates edges.

---

## Current State Evidence

| Metric | Value | Impact |
|--------|-------|--------|
| Experiments | 23 | ✓ Migrated |
| Edges | **0** | ❌ No connections |
| Inquiries | 0 | No quest containers |
| Centrality | 0 (all nodes) | Everything peripheral |

**But the data exists!** TaskNotes files have `blockedBy` fields:
- "Chronicle automation prototype" → blocked by 2 tasks
- "Test handoff with another AI" → blocked by 1 task
- "Build Orrery macro view" → blocked by 1 task

---

## Solution: Enhance Migration to Create Edges

### Phase 1: Fix Migration Script

**File**: `scripts/migrate-from-tasknotes.mjs`

**Changes**:
1. After migrating all experiments, do a second pass
2. For each experiment with `blockedBy` array:
   - Resolve blocker names to experiment IDs
   - Create edge: `{source: blockerId, target: experimentId}`
   - POST to `/api/edges`

```javascript
// NEW: Create edges from blockedBy relationships
async function createEdges(experiments) {
  // Build name → id lookup
  const nameToId = new Map();
  for (const exp of experiments) {
    // Match by hypothesis (title) - normalize for comparison
    const normalized = exp.hypothesis.toLowerCase().replace(/\s+/g, '-');
    nameToId.set(normalized, exp.id);
    nameToId.set(exp.hypothesis.toLowerCase(), exp.id);
  }

  let edgesCreated = 0;
  for (const exp of experiments) {
    for (const blockerName of (exp.blockedBy || [])) {
      // Resolve blocker name to ID
      const normalized = blockerName.toLowerCase().replace(/\s+/g, '-');
      const blockerId = nameToId.get(normalized) || nameToId.get(blockerName.toLowerCase());

      if (blockerId && blockerId !== exp.id) {
        await postToApi('/api/edges', {
          source: blockerId,  // Blocker must complete first
          target: exp.id,      // This experiment is blocked
          condition: `Requires ${blockerName}`
        });
        edgesCreated++;
      }
    }
  }
  return edgesCreated;
}
```

### Phase 2: Re-run Migration (Edges Only)

Since experiments are already migrated, we need an **edge-only** mode:

```bash
VAULT_PATH="/mnt/c/Users/Tze Dean/OBSIDIAN_VAULTS/OUR-MYTHOS_the_spiral_flowers_of_becoming" \
API_URL="https://the-orrery.vercel.app" \
node scripts/migrate-from-tasknotes.mjs --edges-only
```

### Phase 3: Verify via Orrery MCP

```
mcp__orrery__get_ecosystem_structure → Should show non-zero centrality
mcp__orrery__get_dependency_graph → Should show edge connections
mcp__orrery__what_blocks("chronicle-automation-prototype") → Should list blockers
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `scripts/migrate-from-tasknotes.mjs` | Add edge creation pass, `--edges-only` flag |
| (No other files needed) | Edge API and UI already exist |

---

## Expected DAG After Fix

Based on TaskNotes `blockedBy` data:

```
Configure git layer for vault
    ├──→ Test handoff with another AI
    │         └──→ Chronicle automation prototype
    └──→ Chronicle automation prototype

TEST TASK FROM ORRERY -> OBSIDIAN
    └──→ Build Orrery macro view
```

This gives us **at least 4 edges** from existing data, enabling:
- Topological layer computation (roots vs downstream)
- Physics radial bloom (roots at center)
- Blocking/available status filtering
- Visual mycelium network

---

## Verification Checklist

- [ ] Migration script enhanced with edge creation
- [ ] `--edges-only` flag works for incremental runs
- [ ] Edges appear in `mcp__orrery__get_oracle_context`
- [ ] `get_ecosystem_structure` shows non-zero centrality
- [ ] Orrery UI shows connected nodes with S-curve edges
- [ ] Physics positions experiments based on DAG layers

---

## Future Considerations (Not This Plan)

1. **AI Decomposition Workflow**: Quest → Experiment tree generation
2. **Bidirectional Sync**: Orrery edge edits → TaskNotes frontmatter
3. **Inquiry/Quest Creation**: Currently 0 inquiries in system
4. **Semantic Edge Suggestions**: AI proposes edges based on content

---

## Command Sequence

```bash
# 1. Navigate to Orrery
cd /home/ungabunga/claude-workspace/The-Orrery

# 2. Run edge migration
VAULT_PATH="/mnt/c/Users/Tze Dean/OBSIDIAN_VAULTS/OUR-MYTHOS_the_spiral_flowers_of_becoming" \
API_URL="https://the-orrery.vercel.app" \
node scripts/migrate-from-tasknotes.mjs --edges-only --verbose

# 3. Verify via MCP
# (Use Orrery MCP tools to confirm edges exist)

# 4. Test in browser
# Visit https://the-orrery.vercel.app - should see connected graph
```
