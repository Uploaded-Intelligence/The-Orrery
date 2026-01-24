# Orrery: Remaining Work

**Last updated:** 2026-01-23
**Context:** Phase 4.6 (Organic Physics) just completed. This extracts remaining work from the massive plan.

---

## Verification Needed (Visual Testing)

### Organic Physics (FIXED 2026-01-23)
```bash
cd /home/ungabunga/claude-workspace/The-Orrery && npm run dev
# Open http://localhost:5173
```

**Fixed issues:**
- ✅ Reset now triggers physics re-init (tracks `pinnedTaskCount` not just length)
- ✅ Dragging keeps physics running (other nodes react in real-time)
- ✅ Physics wakes up on drag start

**Test:**
- [ ] Reset button → tasks appear in random positions (NOT left-to-right)
- [ ] Drag a node → connected nodes follow/react
- [ ] Connected nodes pull together via physics
- [ ] Unconnected nodes spread apart
- [ ] Layout feels "Obsidian graph-like"

---

## Needs Verification (Code Exists)

### Gemini Party Member (Task 6.7-6.8)
**Files:** `api/oracle/quick.js`, `src/components/PartyMember/QuickOracle.jsx`

**Test:**
- [ ] Quick Oracle button visible in UI
- [ ] "What next?" returns response in <3 seconds
- [ ] Works on mobile (PWA)

**If broken:** Check `GOOGLE_AI_API_KEY` env var on Vercel

### Celestial Vines (Task 10.5)
**Files:** `src/components/edges/CelestialVine.jsx`

**Test:**
- [ ] Vines render between quests in MacroView
- [ ] Color gradients work
- [ ] Thickness varies by strength

---

## Deferred Enhancements

### Task 10.8: Semantic Affinity Clustering
**Prereqs:** ✅ Upstash Vector set up, env vars pulled, SDK installed

**What:** Experiments with similar hypotheses cluster together WITHOUT explicit edges.

**Where:** Add to `physicsStep()` in `forceLayout.js`:
```javascript
// After edge attraction, add semantic affinity:
for (const node of nodes) {
  const neighbors = semanticNeighborsCache.get(node.id) || [];
  for (const { id: neighborId, similarity } of neighbors) {
    const other = nodes.find(n => n.id === neighborId);
    if (!other) continue;
    const semanticForce = similarity * 0.02;
    node.vx += (other.x - node.x) * semanticForce;
    node.vy += (other.y - node.y) * semanticForce;
  }
}
```

**Needs:** API endpoint to fetch semantic neighbors, caching strategy

### Task 10.9: Centrality-Based Node Sizing
**What:** Nodes with more connections = larger/brighter

```javascript
const connectionCount = edges.filter(e =>
  e.source === node.id || e.target === node.id
).length;
node.radius = 20 + connectionCount * 5;
```

---

## Infrastructure Verification

Run these to confirm system health:

```bash
# API health
curl https://the-orrery.vercel.app/api/health

# Tasks CRUD
curl https://the-orrery.vercel.app/api/experiments

# Gemini endpoint
curl -X POST https://the-orrery.vercel.app/api/oracle/quick \
  -H "Content-Type: application/json" \
  -d '{"query":"test","context":{"availableTasks":[]}}'

# PWA audit
npx lighthouse https://the-orrery.vercel.app --only-categories=pwa
```

---

## Future: Phase 8 (Contiguity Substrate)

**Not started.** Full spec in old plan file.

**Goal:** Unified memory environment for Claude across sessions.

**Components:**
- Graphiti for temporal relationships
- Entity resolution across stores
- Contiguity MCP as unified interface

---

## MCP Server Status: ✅ COMPLETE

All tools working:
- `list_experiments`, `get_experiment`, `update_experiment`
- `get_oracle_context`, `log_finding`
- `get_dependency_graph`, `get_critical_paths`, `what_blocks`
- `impact_analysis`, `get_ecosystem_structure`
- `find_semantic_neighbors`, `get_affinity_map`
- `bulk_create_from_analysis`

Location: `~/.claude/plugins/local/orrery-mcp/`

---

## Quick Reference

| What | Status |
|------|--------|
| Organic physics | ✅ Just fixed, needs visual test |
| Gemini party member | Code exists, needs test |
| Celestial vines | Code exists, needs test |
| Semantic affinity | Deferred (prereqs ready) |
| Centrality sizing | Deferred |
| MCP server | ✅ Complete |
| PWA | Needs verification |
