# Server-Authoritative CRUD Patterns

**Problem Domain:** When using server-authoritative patterns (server is source of truth for IDs), CRUD operations must distinguish between CREATE (server assigns ID) vs UPDATE/DELETE (ID already exists).

## Bugs Fixed (2026-01-14)

### Bug 1: Optimistic CREATE with Local ID → ID Mismatch

**Symptom:** Tasks created successfully, but UPDATE operations failed with "Task not found" error.

**Root Cause:** First fix (2026-01-14 AM) implemented optimistic updates with locally-generated IDs:
1. Generate local ID: `"orrery-abc123"`
2. Dispatch ADD_TASK with local ID
3. Send to TaskNotes API (ignores server response)
4. TaskNotes creates task with SERVER ID: `"tasknotes-xyz789"`
5. Local state has `abc123`, server has `xyz789`
6. User edits task → UPDATE with `abc123` → Server: "Task not found" ❌

**The Fix (2026-01-14 PM): Server-First Pattern for CREATE**

```javascript
// ✅ CORRECT - Server assigns ID, we use it
const createTask = useCallback(async (task) => {
  try {
    // 1. Send to server FIRST
    const tnTask = orreryToTaskNotes({
      cognitiveLoad: 3,
      status: 'available',
      ...task,
    });
    const created = await taskNotesClient.createTask(tnTask);

    // 2. Transform server response (includes SERVER ID)
    const orreryTask = taskNotesToOrrery(created);

    // 3. Dispatch with SERVER ID
    dispatch({
      type: 'ADD_TASK',
      payload: orreryTask
    });

    console.log('[TaskNotesSync] ✓ Created with server ID:', orreryTask.id);
    return orreryTask;
  } catch (e) {
    console.error('[TaskNotesSync] ✗ Create failed:', e);
    throw e;
  }
}, [dispatch]);
```

**Why This Pattern?**
- Server is source of truth for IDs → must use server ID
- Small delay (~100-300ms) but ensures consistency
- No ID mismatch → UPDATE/DELETE work correctly

### Bug 2: Physics Layout Passes Wrong Tasks

**Symptom:** All tasks collapsed to top-left corner in messy pile.

**Root Cause:** `MicroView.jsx` filtered for `unpinnedTasks` but passed ALL `visibleTasks` to physics layout:

```javascript
// ❌ BROKEN
const unpinnedTasks = visibleTasks.filter(...);  // Filter to 13 tasks
const result = computeLayout(visibleTasks, ...); // Pass ALL 16 tasks!
```

**Result:** Physics overrode manually positioned tasks, generating negative Y coordinates.

**The Fix:**

```javascript
// ✅ CORRECT - Pass ONLY unpinned tasks
const unpinnedTasks = visibleTasks.filter(...);
const result = computeLayout(unpinnedTasks, visibleEdges, bounds);
```

### Bug 3: Title Editor Lag (Symptom of Bug 1)

**Symptom:** 30-second delay between editing task title and seeing it reflected on task card.

**Root Cause:** Editor saves `onBlur` → `api.updateTask(id)` → "Task not found" (Bug 1) → `syncFromTaskNotes()` → wait for 30s polling.

**The Fix:** Auto-resolved by fixing Bug 1. Optional enhancement: add debounced auto-save.


## Pattern Checklist for Server-Authoritative CRUD

### When Server Assigns IDs (like TaskNotes)

- [ ] **Create (Server-First):** Send to API → get server response with ID → dispatch ADD with server ID
- [ ] **Update (Optimistic):** Dispatch UPDATE → send to API → revert on error
- [ ] **Delete (Optimistic):** Dispatch DELETE → send to API → revert on error  
- [ ] **Complete (Optimistic):** Dispatch COMPLETE → send to API → revert on error

**Key Rule:** CREATE is special because server assigns the canonical ID. You MUST wait for the response.

### When Client Assigns IDs (UUIDs)

- [ ] **Create (Optimistic):** Generate UUID → dispatch ADD → send to API → revert on error
- [ ] **Update (Optimistic):** Dispatch UPDATE → send to API → revert on error
- [ ] **Delete (Optimistic):** Dispatch DELETE → send to API → revert on error
- [ ] **Complete (Optimistic):** Dispatch COMPLETE → send to API → revert on error

**Key Rule:** If client generates canonical IDs, all operations can be optimistic.

** Wait for API response before updating local state in user-facing operations.

## Key Architectural Insights

1. **ID mismatch cascade:** Local ID != Server ID → All subsequent operations fail → Appears as "sync broken" to user
2. **Asymmetric CRUD patterns confuse users:** Even 300ms delay for CREATE is acceptable if UPDATE is ~0ms. Consistency matters more than absolute speed.
3. **Variable filtering bugs:** If you filter a list, pass the FILTERED list, not the original. Easy to miss in code review.
4. **Cascading symptoms:** Bug 3 (editor lag) was a SYMPTOM of Bug 1 (ID mismatch). Fix root cause, not symptoms.

## Files Changed

**Bug 1 Fix:**
- `src/hooks/useTaskNotesSync.js`
  - Removed `generateId` import (no longer needed)
  - Added `taskNotesToOrrery` import
  - Rewrote `createTask` to server-first pattern
  - Now waits for API response and uses server ID

**Bug 2 Fix:**
- `src/components/views/MicroView/MicroView.jsx` (line 132)
  - Changed `computeLayout(visibleTasks, ...)` → `computeLayout(unpinnedTasks, ...)`
  - Added comment explaining why

## Testing the Fixes

### Bug 1: TaskNotes Sync

1. **Create task:**
   - Click "+ Task" button
   - **Expected:** Task appears after ~100-300ms network delay (not instantly, not 30s)
   - **Before fix:** Task appeared after 30s polling OR "Task not found" errors on edit

2. **Edit task title:**
   - Create task → immediately edit title in ExpandedTaskEditor
   - **Expected:** Title updates appear within 1-2 seconds (onBlur save + network)
   - **Before fix:** 30-second delay (update failed → polling sync)

3. **Console logs:**
   - **Expected:** `[TaskNotesSync] ✓ Created task with server ID: [id]`
   - **Before fix:** `[TaskNotesSync] Update failed, reverting: Error: Task not found`

### Bug 2: Physics Layout

1. **View micro view:**
   - Switch to Micro view
   - **Expected:** Tasks spread out in DAG layers (left-to-right flow)
   - **Before fix:** All tasks collapsed to top-left corner (negative Y coordinates)

2. **Console logs:**
   - **Expected:** `[MicroView] Using physics position for [task]: { x: 200-600, y: 0-600 }`
   - **Before fix:** `[MicroView] Using physics position for [task]: { x: ..., y: -16 }` (negative!)

### Bug 3: Editor Lag (Auto-fixed via Bug 1)

1. **Edit task title:**
   - Select task → type in title field → click away (blur)
   - **Expected:** Title updates on card within 1-2 seconds
   - **Before fix:** 30-second delay until polling sync

