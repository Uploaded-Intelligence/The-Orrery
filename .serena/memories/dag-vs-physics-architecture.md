# DAG vs Physics Architecture

**Critical distinction for The Orrery:**

## DAG (Directed Acyclic Graph)
- **Purpose:** Unlock logic / dependency tracking
- **Consumer:** Claude via MCP tools (`what_blocks`, `get_dependency_graph`, etc.)
- **Data:** Edges define what experiments must complete before others
- **NOT for:** Visual layout

## Physics (Force-Directed Layout)
- **Purpose:** Visual representation only
- **Consumer:** User interface
- **Behavior:** Obsidian graph-like — organic, reactive, no forced columns
- **Key principles:**
  - Nodes with edges attract
  - All nodes repel
  - Dragging one node → others react in real-time
  - Reset → random scatter → physics settles organically

## Previous Bug (Fixed 2026-01-23)
The implementation conflated these:
- Used DAG layers to constrain X positions (left-to-right columns)
- Paused physics entirely during drag

**Correct behavior:**
- DAG informs EDGES only (what's connected)
- Physics handles ALL positioning
- Physics runs continuously, even during drag
- Dragged node is pinned, others react

## Files
- `src/utils/forceLayout.js` — Physics simulation
- `src/components/views/MicroView/MicroView.jsx` — Integration (lines ~125-175)
