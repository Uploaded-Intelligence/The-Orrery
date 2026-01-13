# Wire TaskNotes API to UI Components

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect UI task operations (create, complete, delete) to TaskNotes HTTP API for true server-authoritative sync.

**Architecture:** App.jsx already has API functions from `useTaskNotesSync`. We add them to OrreryContext so any component can access. Components call API → API mutates TaskNotes → sync refreshes local state. No local dispatch for mutations.

**Tech Stack:** React Context, existing `useTaskNotesSync` hook, TaskNotes HTTP API (port 8080)

---

## Summary

| Task | Files | Delivers |
|------|-------|----------|
| **1** | App.jsx | API functions in context |
| **2** | AddTaskForm.jsx | Create via API |
| **3** | MicroView.jsx | Complete/delete via API |
| **4** | TaskDetailPanel.jsx | Complete/delete via API |
| **5** | TimeSpaceGPS.jsx | Complete via API |
| **6** | Verify | End-to-end test |

---

## Task 1: Add API Functions to Context

**Files:**
- Modify: `src/App.jsx:35-47`

**Step 1: Add deleteTask to destructuring**

Currently line 35-42:
```jsx
const {
  isConnected: taskNotesConnected,
  isLoading: taskNotesLoading,
  syncFromTaskNotes,
  createTask,
  updateTask,
  completeTask,
} = useTaskNotesSync(dispatch);
```

Change to:
```jsx
const {
  isConnected: taskNotesConnected,
  isLoading: taskNotesLoading,
  syncFromTaskNotes,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} = useTaskNotesSync(dispatch);
```

**Step 2: Create api object**

After the destructuring (around line 44), add:
```jsx
// API functions for components to use (server-authoritative)
const api = {
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  syncFromTaskNotes,
  isConnected: taskNotesConnected,
  isLoading: taskNotesLoading,
};
```

**Step 3: Add api to context value**

Change line 47:
```jsx
<OrreryContext.Provider value={{ state, dispatch }}>
```

To:
```jsx
<OrreryContext.Provider value={{ state, dispatch, api }}>
```

**Step 4: Verify build**

Run: `cd /home/ungabunga/claude-workspace/The-Orrery && npm run build`
Expected: Build succeeds (no breaking changes yet)

**Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: expose TaskNotes API functions via OrreryContext

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Wire AddTaskForm to API

**Files:**
- Modify: `src/components/forms/AddTaskForm.jsx:16,22-36`

**Step 1: Extract api from context**

Change line 16:
```jsx
const { state, dispatch } = useOrrery();
```

To:
```jsx
const { state, api } = useOrrery();
```

**Step 2: Replace dispatch with API call**

Change handleAdd function (lines 22-37):
```jsx
const handleAdd = () => {
  if (!title.trim()) return;

  dispatch({
    type: 'ADD_TASK',
    payload: {
      title: title.trim(),
      notes: notes.trim(),
      questIds,
      status: 'available',
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
      actualMinutes: null,
    },
  });
  onClose();
};
```

To:
```jsx
const handleAdd = async () => {
  if (!title.trim()) return;

  try {
    await api.createTask({
      title: title.trim(),
      notes: notes.trim(),
      questIds,
      status: 'available',
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
      actualMinutes: null,
    });
    onClose();
  } catch (e) {
    console.error('Failed to create task:', e);
    // Still close - sync will retry
    onClose();
  }
};
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/The-Orrery && npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/forms/AddTaskForm.jsx
git commit -m "feat: AddTaskForm creates tasks via TaskNotes API

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Wire MicroView to API

**Files:**
- Modify: `src/components/views/MicroView/MicroView.jsx:23,192,260,934,937`

**Step 1: Extract api from context**

Change line 23:
```jsx
const { state, dispatch } = useOrrery();
```

To:
```jsx
const { state, dispatch, api } = useOrrery();
```

**Step 2: Replace COMPLETE_TASK dispatch at line 192**

Change:
```jsx
dispatch({ type: 'COMPLETE_TASK', payload: task.id });
```

To:
```jsx
api.completeTask(task.id).catch(e => console.error('Complete failed:', e));
```

**Step 3: Replace DELETE_TASK dispatch at line 260**

Change:
```jsx
dispatch({ type: 'DELETE_TASK', payload: selectedTaskId });
```

To:
```jsx
api.deleteTask(selectedTaskId).catch(e => console.error('Delete failed:', e));
```

**Step 4: Replace onComplete callback at line 934**

Change:
```jsx
onComplete={() => dispatch({ type: 'COMPLETE_TASK', payload: task.id })}
```

To:
```jsx
onComplete={() => api.completeTask(task.id).catch(e => console.error('Complete failed:', e))}
```

**Step 5: Replace onDelete callback at line 937**

Change:
```jsx
dispatch({ type: 'DELETE_TASK', payload: task.id });
```

To:
```jsx
api.deleteTask(task.id).catch(e => console.error('Delete failed:', e));
```

**Step 6: Verify build**

Run: `cd /home/ungabunga/claude-workspace/The-Orrery && npm run build`
Expected: Build succeeds

**Step 7: Commit**

```bash
git add src/components/views/MicroView/MicroView.jsx
git commit -m "feat: MicroView complete/delete via TaskNotes API

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Wire TaskDetailPanel to API

**Files:**
- Modify: `src/components/panels/TaskDetailPanel.jsx`

**Step 1: Find and extract api from context**

Find the useOrrery() call and add api:
```jsx
const { state, dispatch, api } = useOrrery();
```

**Step 2: Replace DELETE_TASK at line 92**

Change:
```jsx
dispatch({ type: 'DELETE_TASK', payload: task.id });
```

To:
```jsx
api.deleteTask(task.id).catch(e => console.error('Delete failed:', e));
```

**Step 3: Replace COMPLETE_TASK at line 98**

Change:
```jsx
dispatch({ type: 'COMPLETE_TASK', payload: task.id });
```

To:
```jsx
api.completeTask(task.id).catch(e => console.error('Complete failed:', e));
```

**Step 4: Verify build**

Run: `cd /home/ungabunga/claude-workspace/The-Orrery && npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/panels/TaskDetailPanel.jsx
git commit -m "feat: TaskDetailPanel complete/delete via TaskNotes API

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Wire TimeSpaceGPS to API

**Files:**
- Modify: `src/components/gps/TimeSpaceGPS.jsx:119`

**Step 1: Find and extract api from context**

Find the useOrrery() call and add api:
```jsx
const { state, dispatch, api } = useOrrery();
```

**Step 2: Replace COMPLETE_TASK at line 119**

Change:
```jsx
dispatch({ type: 'COMPLETE_TASK', payload: currentTask.id });
```

To:
```jsx
api.completeTask(currentTask.id).catch(e => console.error('Complete failed:', e));
```

**Step 3: Verify build**

Run: `cd /home/ungabunga/claude-workspace/The-Orrery && npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/gps/TimeSpaceGPS.jsx
git commit -m "feat: TimeSpaceGPS completes tasks via TaskNotes API

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: End-to-End Verification

**Step 1: Start dev server**

Run: `cd /home/ungabunga/claude-workspace/The-Orrery && npm run dev`

**Step 2: Check TaskNotesStatus indicator**

Expected: Green dot if TaskNotes HTTP API is running on port 8080

**Step 3: Test task creation**

1. Click "+ Task" button
2. Enter task title
3. Click "Add Task"
4. Check Obsidian TaskNotes folder for new task file

**Step 4: Test task completion**

1. Click checkbox on a task
2. Check Obsidian shows task as completed

**Step 5: Test task deletion**

1. Select task
2. Click delete (trash icon)
3. Check task removed from Obsidian

**Step 6: Final commit**

If all tests pass, no commit needed (functionality complete).

If issues found, create fix commit.

---

## Architecture After This Plan

```
┌──────────────────────────────────────────────────────────┐
│                        App.jsx                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           OrreryContext.Provider                     │ │
│  │  value={{ state, dispatch, api }}                   │ │
│  │           │                                          │ │
│  │           ├── state: from useReducer                 │ │
│  │           ├── dispatch: local mutations (fallback)  │ │
│  │           └── api: { createTask, updateTask, ... }  │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                     Components                            │
│                                                           │
│  const { state, api } = useOrrery();                     │
│                                                           │
│  // CREATE                                                │
│  await api.createTask({ title: '...' })                  │
│                                                           │
│  // COMPLETE                                              │
│  await api.completeTask(taskId)                          │
│                                                           │
│  // DELETE                                                │
│  await api.deleteTask(taskId)                            │
│                                                           │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                 useTaskNotesSync hook                     │
│                                                           │
│  createTask() ──► POST /api/tasks ──► syncFromTaskNotes()│
│  completeTask() ► POST /tasks/:id/toggle-status ► sync() │
│  deleteTask() ──► DELETE /tasks/:id ──► sync()           │
│                                                           │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│              TaskNotes (Obsidian Plugin)                  │
│                                                           │
│  HTTP API on localhost:8080                               │
│  Source of truth for all tasks                           │
│  Files stored in vault                                    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**Key Insight:** dispatch is still available for:
- View state changes (SET_VIEW, SET_FOCUS_QUEST)
- Preferences (TOGGLE_ACTUAL_FILTER)
- Future offline fallback

But task CRUD goes through api → TaskNotes → sync.
