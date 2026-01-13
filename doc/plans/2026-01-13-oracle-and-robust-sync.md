# Orrery → TaskNotes Integration (Server-Authoritative Architecture)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect Orrery directly to TaskNotes HTTP API for CRUD. Use Claude for ALL intelligence.

**Architecture:** Server-authoritative pattern (game dev standard)
- **TaskNotes** = Data Store (CRUD only, dumb persistence)
- **Orrery** = View (display with optimistic updates)
- **Claude** = Intelligence (brain dump, decomposition, oracle - ALL smart work)

**Key Insight:** TaskNotes NLP is just regex. Claude is state-of-the-art reasoning. Use the right tool.

**Tech Stack:** React, Vite, TaskNotes HTTP API (localhost:8080)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TASKNOTES (Obsidian)                         │
│                    DATA STORE ONLY                              │
│                                                                 │
│  HTTP API (:8080)        Webhooks                               │
│  ─────────────────       ────────                               │
│  GET /api/tasks          task.created                           │
│  POST /api/tasks         task.updated                           │
│  PUT /api/tasks/{id}     task.completed                         │
│  DELETE /api/tasks/{id}  task.deleted                           │
│                                                                 │
│  (NLP API exists but we DON'T use it - Claude is smarter)       │
└───────────────────────────────────────────────────────────────────┘
         │                      │
         │ CRUD only            │ Push notifications
         ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ORRERY                                   │
│                        (Pure View)                              │
│                                                                 │
│  TaskNotesClient         Poll on Focus       Brain Dump Input   │
│  ────────────────        ─────────────       ────────────────   │
│  fetchTasks()            Auto-refresh        → Claude parses    │
│  createTask()            every 30s           → Tasks created    │
│  updateTask()                                   via API         │
│  completeTask()                                                 │
└─────────────────────────────────────────────────────────────────┘
         │
         │ ALL intelligence
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CLAUDE                                   │
│                     (ALL INTELLIGENCE)                          │
│                                                                 │
│  Brain Dump Parsing      Task Decomposition   Oracle Questions  │
│  ─────────────────       ─────────────────    ────────────────  │
│  "I need to refactor     Complex idea →       "How do I solve   │
│   auth tomorrow @work"   Multiple tasks       this blocker?"    │
│   → structured task(s)   with dependencies                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## What This Removes

```diff
- "Sync from Obsidian" button
- "Export to Obsidian" button
- Manual JSON copy/paste workflow
- Claude as data ferry
- Import/export JSON files
- Manifest parsing in Orrery
- UUID migration (TaskNotes has stable IDs)
- Backup system (TaskNotes has the files)
```

## What This Adds

```diff
+ TaskNotesClient service (API wrapper)
+ Direct API calls on every user action
+ Poll-based refresh (or webhook listener)
+ NLP-powered brain dump input
+ Oracle stays (Claude for intelligence)
```

---

## Phase 0: TaskNotes API Client

### Task 0a: Create TaskNotes API Client

**Files:**
- Create: `src/services/tasknotes.js`

**Reference Docs:** https://tasknotes.dev/HTTP_API/

**Step 1: Create the API client**

```javascript
// src/services/tasknotes.js

/**
 * TaskNotes HTTP API Client
 * Connects Orrery directly to TaskNotes (server-authoritative)
 *
 * API runs on localhost:8080 by default
 * All task operations go through TaskNotes, which is source of truth
 */

const DEFAULT_BASE_URL = 'http://localhost:8080/api';

class TaskNotesClient {
  constructor(baseUrl = DEFAULT_BASE_URL, apiKey = null) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'TaskNotes API error');
    }

    return data.data;
  }

  // ─── Health ─────────────────────────────────────────────────────

  async health() {
    return this.request('/health');
  }

  // ─── Tasks ──────────────────────────────────────────────────────

  async getTasks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.project) params.append('project', filters.project);
    if (filters.tag) params.append('tag', filters.tag);

    const query = params.toString();
    return this.request(`/tasks${query ? `?${query}` : ''}`);
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(task) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id, updates) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTaskStatus(id) {
    return this.request(`/tasks/${id}/toggle-status`, {
      method: 'POST',
    });
  }

  // ─── NLP (NOT USED - Claude handles all intelligence) ──────────
  // TaskNotes NLP exists but we use Claude Opus 4.5 instead because:
  // - Claude can decompose complex ideas into task graphs
  // - Claude understands project context
  // - TaskNotes NLP is just regex pattern matching

  // ─── Stats ──────────────────────────────────────────────────────

  async getStats() {
    return this.request('/stats');
  }

  async getFilterOptions() {
    return this.request('/filter-options');
  }
}

// Singleton instance
export const taskNotesClient = new TaskNotesClient();

// Export class for testing/custom instances
export { TaskNotesClient };
```

**Step 2: Add configuration component**

```javascript
// Add to bottom of src/services/tasknotes.js

/**
 * Configure the TaskNotes client
 * Call this on app startup with user settings
 */
export function configureTaskNotes(baseUrl, apiKey = null) {
  taskNotesClient.baseUrl = baseUrl || DEFAULT_BASE_URL;
  taskNotesClient.apiKey = apiKey;
}

/**
 * Test connection to TaskNotes
 */
export async function testConnection() {
  try {
    await taskNotesClient.health();
    return { connected: true, error: null };
  } catch (e) {
    return { connected: false, error: e.message };
  }
}
```

**Step 3: Verify syntax**

Run: `cd /home/ungabunga/claude-workspace/The-Orrery && npm run build`
Expected: Build succeeds (file not imported yet)

**Step 4: Commit**

```bash
git add src/services/tasknotes.js
git commit -m "feat: add TaskNotes HTTP API client"
```

---

### Task 0b: Add Connection Status Indicator

**Files:**
- Create: `src/components/ui/TaskNotesStatus.jsx`
- Modify: `src/App.jsx` (add status indicator)

**Step 1: Create status component**

```jsx
// src/components/ui/TaskNotesStatus.jsx

import { useState, useEffect } from 'react';
import { testConnection } from '@/services/tasknotes';
import { COLORS } from '@/constants';

export function TaskNotesStatus() {
  const [status, setStatus] = useState({ connected: null, error: null });

  useEffect(() => {
    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    const result = await testConnection();
    setStatus(result);
  };

  const color = status.connected === null
    ? COLORS.textMuted
    : status.connected
      ? COLORS.accentSuccess
      : COLORS.accentDanger;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        borderRadius: '4px',
        background: `${color}20`,
        fontSize: '11px',
        color,
      }}
      title={status.error || 'Connected to TaskNotes'}
    >
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
      }} />
      TaskNotes
    </div>
  );
}
```

**Step 2: Add to App.jsx header**

Find the header section and add:
```jsx
import { TaskNotesStatus } from '@/components/ui/TaskNotesStatus';

// In header, add:
<TaskNotesStatus />
```

**Step 3: Build and test visually**

Run: `npm run dev`
Expected: See connection indicator in header

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add TaskNotes connection status indicator"
```

---

## Phase 1: Replace State Management with API Calls

### Task 1a: Transform Data Between TaskNotes and Orrery Format

**Files:**
- Create: `src/services/tasknotes-transform.js`

TaskNotes and Orrery have different data shapes. We need transforms.

**Step 1: Create transform functions**

```javascript
// src/services/tasknotes-transform.js

/**
 * Transform TaskNotes task to Orrery task format
 */
export function taskNotesToOrrery(tnTask) {
  return {
    id: tnTask.id,
    title: tnTask.title,
    notes: tnTask.details || '',
    status: mapStatus(tnTask.status),
    estimatedMinutes: tnTask.timeEstimate || null,
    cognitiveLoad: mapPriorityToCognitive(tnTask.priority),
    questIds: tnTask.projects || [],
    tags: tnTask.tags || [],
    contexts: tnTask.contexts || [],
    dueAt: tnTask.dueDate || null,
    scheduledAt: tnTask.scheduledDate || null,
    createdAt: tnTask.createdAt,
    updatedAt: tnTask.modifiedAt,
    completedAt: tnTask.completedAt || null,
    // TaskNotes-specific
    _taskNotesId: tnTask.id,
    _filePath: tnTask.filePath,
  };
}

/**
 * Transform Orrery task to TaskNotes format for API calls
 */
export function orreryToTaskNotes(task) {
  return {
    title: task.title,
    details: task.notes || '',
    status: reverseMapStatus(task.status),
    timeEstimate: task.estimatedMinutes,
    priority: mapCognitiveToPriority(task.cognitiveLoad),
    projects: task.questIds || [],
    tags: task.tags || [],
    contexts: task.contexts || [],
    dueDate: task.dueAt,
    scheduledDate: task.scheduledAt,
  };
}

// Status mapping
function mapStatus(tnStatus) {
  const map = {
    'open': 'available',
    'completed': 'completed',
    'in_progress': 'in_progress',
  };
  return map[tnStatus] || 'available';
}

function reverseMapStatus(orreryStatus) {
  const map = {
    'available': 'open',
    'completed': 'completed',
    'in_progress': 'open', // TaskNotes might not have in_progress
  };
  return map[orreryStatus] || 'open';
}

// Priority <-> Cognitive load mapping (1-5 scale)
function mapPriorityToCognitive(priority) {
  const map = {
    'highest': 5,
    'high': 4,
    'medium': 3,
    'low': 2,
    'lowest': 1,
  };
  return map[priority] || 3;
}

function mapCognitiveToPriority(cognitive) {
  if (cognitive >= 5) return 'highest';
  if (cognitive >= 4) return 'high';
  if (cognitive >= 3) return 'medium';
  if (cognitive >= 2) return 'low';
  return 'lowest';
}

/**
 * Transform all tasks from TaskNotes response
 */
export function transformTasksFromAPI(tnTasks) {
  return tnTasks.map(taskNotesToOrrery);
}
```

**Step 2: Commit**

```bash
git add src/services/tasknotes-transform.js
git commit -m "feat: add TaskNotes <-> Orrery data transforms"
```

---

### Task 1b: Create Sync Hook

**Files:**
- Create: `src/hooks/useTaskNotesSync.js`

This hook replaces manual sync with automatic API integration.

**Step 1: Create the sync hook**

```javascript
// src/hooks/useTaskNotesSync.js

import { useState, useEffect, useCallback } from 'react';
import { taskNotesClient } from '@/services/tasknotes';
import { transformTasksFromAPI, orreryToTaskNotes } from '@/services/tasknotes-transform';

/**
 * Hook for syncing Orrery state with TaskNotes API
 *
 * Implements server-authoritative pattern:
 * - TaskNotes is source of truth
 * - Orrery optimistically updates, then syncs
 * - Poll on focus or interval for updates
 */
export function useTaskNotesSync(dispatch) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Fetch all tasks from TaskNotes and update Orrery state
  const syncFromTaskNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tasks = await taskNotesClient.getTasks();
      const transformed = transformTasksFromAPI(tasks);

      dispatch({
        type: 'LOAD_FROM_TASKNOTES',
        payload: { tasks: transformed }
      });

      setLastSync(new Date());
      setIsConnected(true);
    } catch (e) {
      setError(e.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Create task via API, then update local state
  const createTask = useCallback(async (task) => {
    const tnTask = orreryToTaskNotes(task);
    const created = await taskNotesClient.createTask(tnTask);
    await syncFromTaskNotes(); // Re-sync to get server state
    return created;
  }, [syncFromTaskNotes]);

  // Update task via API
  const updateTask = useCallback(async (id, updates) => {
    const tnUpdates = orreryToTaskNotes(updates);
    await taskNotesClient.updateTask(id, tnUpdates);
    await syncFromTaskNotes();
  }, [syncFromTaskNotes]);

  // Complete task via API
  const completeTask = useCallback(async (id) => {
    await taskNotesClient.toggleTaskStatus(id);
    await syncFromTaskNotes();
  }, [syncFromTaskNotes]);

  // Delete task via API
  const deleteTask = useCallback(async (id) => {
    await taskNotesClient.deleteTask(id);
    await syncFromTaskNotes();
  }, [syncFromTaskNotes]);

  // Initial sync on mount
  useEffect(() => {
    syncFromTaskNotes();
  }, [syncFromTaskNotes]);

  // Re-sync when window gains focus
  useEffect(() => {
    const handleFocus = () => syncFromTaskNotes();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncFromTaskNotes]);

  // Poll every 30 seconds as backup
  useEffect(() => {
    const interval = setInterval(syncFromTaskNotes, 30000);
    return () => clearInterval(interval);
  }, [syncFromTaskNotes]);

  return {
    isConnected,
    isLoading,
    error,
    lastSync,
    syncFromTaskNotes,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
  };
}
```

**Step 2: Add LOAD_FROM_TASKNOTES action to reducer**

Add to `src/store/reducer.js`:

```javascript
case 'LOAD_FROM_TASKNOTES':
  return {
    ...state,
    tasks: action.payload.tasks,
    lastSyncedAt: now,
    _syncSource: 'tasknotes',
  };
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add useTaskNotesSync hook for API integration"
```

---

### Task 1c: Wire Up App to Use Sync Hook

**Files:**
- Modify: `src/App.jsx`
- Modify: Task creation/update components

**Step 1: Replace manual sync with hook**

In App.jsx:
```javascript
import { useTaskNotesSync } from '@/hooks/useTaskNotesSync';

// Inside component:
const {
  isConnected,
  isLoading,
  createTask,
  updateTask,
  completeTask,
  syncFromTaskNotes
} = useTaskNotesSync(dispatch);
```

**Step 2: Remove old sync buttons**

Find and remove:
- SyncButton component
- ExportButton component
- ExportToObsidianButton component
- ImportExportControls component

**Step 3: Update task operations to use API**

Replace `dispatch({ type: 'ADD_TASK' })` with `createTask(taskData)`
Replace `dispatch({ type: 'COMPLETE_TASK' })` with `completeTask(id)`
etc.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: wire up TaskNotes API sync, remove manual sync buttons"
```

---

## Phase 2: Claude-Powered Brain Dump

### Task 2a: Create Brain Dump Input Component

**Files:**
- Create: `src/components/ui/BrainDumpInput.jsx`

**Why Claude, not TaskNotes NLP:**
- TaskNotes NLP = regex pattern matching (can handle "Buy milk tomorrow #shopping")
- Claude = state-of-the-art reasoning (can handle "I have this vague idea about refactoring auth...")
- Claude can decompose complex ideas into multiple tasks with dependencies
- Claude understands project context, cognitive load, relationships

**UX Flow:**
1. User types brain dump text
2. Click "Parse with Claude" → copies structured request to clipboard
3. User pastes to Claude Code, gets response
4. Paste response back → preview shows parsed tasks
5. Accept → tasks created via TaskNotes API

**Step 1: Create component**

```jsx
// src/components/ui/BrainDumpInput.jsx

import { useState } from 'react';
import { COLORS } from '@/constants';

/**
 * Brain dump input that uses Claude for intelligent parsing
 * Type natural language → Claude parses → structured tasks → TaskNotes API
 */
export function BrainDumpInput({ onTasksCreated, existingQuests = [] }) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  // Build request for Claude
  const buildClaudeRequest = () => {
    return {
      type: 'brain_dump_parse',
      input: input.trim(),
      context: {
        existingQuests: existingQuests.map(q => ({ id: q.id, title: q.title })),
      },
      instructions: `
Parse this brain dump into structured tasks.

BRAIN DUMP: "${input.trim()}"

Respond with JSON:
{
  "tasks": [
    {
      "title": "Clear, actionable task title",
      "notes": "Optional details",
      "estimatedMinutes": 30,
      "cognitiveLoad": 3,
      "questIds": [],
      "tags": [],
      "dueAt": null
    }
  ],
  "edges": [
    { "sourceIndex": 0, "targetIndex": 1 }
  ]
}

Rules:
- Create 1-5 tasks depending on complexity
- If simple ("buy milk tomorrow") → 1 task
- If complex ("refactor auth system") → multiple tasks with dependencies
- cognitiveLoad: 1=autopilot, 2=casual, 3=focused, 4=deep, 5=peak
- edges: sourceIndex must complete before targetIndex
      `.trim(),
    };
  };

  const handleCopyRequest = async () => {
    const request = buildClaudeRequest();
    const text = \`## Brain Dump Parse Request\n\n\\\`\\\`\\\`json\n\${JSON.stringify(request, null, 2)}\n\\\`\\\`\\\`\`;
    await navigator.clipboard.writeText(text);
    setError(null);
  };

  const handleParseResponse = () => {
    try {
      // Try to extract JSON from markdown code block or raw JSON
      let jsonStr = response.trim();
      const match = jsonStr.match(/\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/);
      if (match) jsonStr = match[1].trim();

      const data = JSON.parse(jsonStr);
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Response must have tasks array');
      }
      setPreview(data);
      setError(null);
    } catch (e) {
      setError(\`Parse error: \${e.message}\`);
      setPreview(null);
    }
  };

  const handleAccept = () => {
    if (preview?.tasks) {
      onTasksCreated?.(preview.tasks, preview.edges || []);
      setInput('');
      setResponse('');
      setPreview(null);
    }
  };

  return (
    <div style={{
      padding: '12px',
      background: COLORS.bgPanel,
      borderRadius: '8px',
      marginBottom: '16px',
    }}>
      <div style={{ marginBottom: '8px', fontSize: '12px', color: COLORS.textMuted }}>
        Brain Dump → Claude → Tasks
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Dump your thoughts here... Claude will parse them into structured tasks.

Examples:
- 'Buy groceries tomorrow'
- 'I need to refactor the auth system - it's getting messy and we need better error handling'
- 'Prepare for Monday meeting: review slides, gather metrics, practice presentation'"
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '10px 12px',
          background: COLORS.bgDark,
          border: \`1px solid \${COLORS.textMuted}40\`,
          borderRadius: '4px',
          color: COLORS.textPrimary,
          fontSize: '14px',
          resize: 'vertical',
        }}
      />

      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
        <button
          onClick={handleCopyRequest}
          disabled={!input.trim()}
          style={{
            padding: '6px 12px',
            background: COLORS.accentPrimary,
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            opacity: input.trim() ? 1 : 0.5,
          }}
        >
          1. Copy for Claude
        </button>
      </div>

      {/* Response input */}
      <div style={{ marginTop: '12px' }}>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="2. Paste Claude's response here..."
          style={{
            width: '100%',
            minHeight: '60px',
            padding: '10px 12px',
            background: COLORS.bgDark,
            border: \`1px solid \${COLORS.textMuted}40\`,
            borderRadius: '4px',
            color: COLORS.textPrimary,
            fontSize: '12px',
            fontFamily: 'monospace',
            resize: 'vertical',
          }}
        />
        <button
          onClick={handleParseResponse}
          disabled={!response.trim()}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            background: 'transparent',
            border: \`1px solid \${COLORS.textMuted}40\`,
            borderRadius: '4px',
            color: COLORS.textMuted,
            fontSize: '12px',
            cursor: 'pointer',
            opacity: response.trim() ? 1 : 0.5,
          }}
        >
          3. Parse Response
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: COLORS.accentDanger + '20',
          borderRadius: '4px',
          fontSize: '12px',
          color: COLORS.accentDanger,
        }}>
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: COLORS.bgDark,
          borderRadius: '4px',
        }}>
          <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '8px' }}>
            Preview: {preview.tasks.length} task(s)
          </div>
          {preview.tasks.map((task, i) => (
            <div key={i} style={{
              padding: '8px',
              marginBottom: '4px',
              background: COLORS.bgPanel,
              borderRadius: '4px',
              fontSize: '13px',
            }}>
              <strong style={{ color: COLORS.textPrimary }}>{task.title}</strong>
              {task.estimatedMinutes && (
                <span style={{ color: COLORS.textMuted, marginLeft: '8px' }}>
                  ~{task.estimatedMinutes}m
                </span>
              )}
              {task.cognitiveLoad && (
                <span style={{ color: COLORS.accentWarning, marginLeft: '8px' }}>
                  CL:{task.cognitiveLoad}
                </span>
              )}
            </div>
          ))}
          <button
            onClick={handleAccept}
            style={{
              marginTop: '8px',
              padding: '8px 16px',
              background: COLORS.accentSuccess,
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ✓ Create {preview.tasks.length} Task(s)
          </button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Wire to App with TaskNotes API**

When user clicks "Create Tasks", call TaskNotes API for each:

```javascript
const handleTasksCreated = async (tasks, edges) => {
  for (const task of tasks) {
    await taskNotesClient.createTask(orreryToTaskNotes(task));
  }
  // Edges would need local state since TaskNotes doesn't have edges
  // For now, edges stay in Orrery local state (position-only data)
  await syncFromTaskNotes();
};
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Claude-powered brain dump input"
```

---

## Phase 3: Oracle (Claude for Intelligence Only)

### Task 3a: Simplify Oracle to Pure Intelligence

**Files:**
- Modify: `src/utils/oracle.js` (simplify)
- Keep: OracleResponseModal

Oracle now ONLY handles intelligent suggestions. All CRUD goes through TaskNotes API.

**Step 1: Simplify oracle.js**

The oracle no longer needs to create tasks—it just suggests. After user accepts suggestion, we call TaskNotes API to create tasks.

```javascript
// src/utils/oracle.js (simplified)

/**
 * Oracle: Claude-powered intelligence for unblocking
 *
 * Flow:
 * 1. User clicks "Ask Oracle" on a blocker
 * 2. Request copied to clipboard (for Claude Code)
 * 3. Claude responds with suggestions
 * 4. User pastes response, previews, accepts
 * 5. Tasks created via TaskNotes API (not local state)
 */

export function buildOracleRequest(blocker, task, relatedTasks) {
  return {
    version: '1.0',
    type: 'unblock_request',
    blocker: {
      id: blocker.id,
      text: blocker.text,
    },
    task: {
      title: task.title,
      notes: task.notes,
    },
    context: {
      relatedTasks: relatedTasks.map(t => ({ title: t.title, status: t.status })),
    },
    instructions: `
Help unblock this task. Suggest 1-3 sub-tasks.

BLOCKER: "${blocker.text}"
TASK: "${task.title}"

Respond with JSON:
{
  "analysis": "Why this is blocking",
  "suggestedTasks": [
    { "title": "...", "details": "...", "timeEstimate": 30 }
  ]
}
    `.trim(),
  };
}

export async function copyOracleRequestToClipboard(request) {
  const text = `## Oracle Request\n\n\`\`\`json\n${JSON.stringify(request, null, 2)}\n\`\`\``;
  await navigator.clipboard.writeText(text);
}

export function parseOracleResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.suggestedTasks) return { valid: false, error: 'Missing suggestedTasks' };
    return { valid: true, data };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}
```

**Step 2: Update modal to create via API**

When user accepts oracle suggestions, call `taskNotesClient.createTask()` for each suggested task.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: simplify oracle to pure intelligence, tasks created via API"
```

---

## Phase 4: Cleanup

### Task 4a: Remove Obsolete Code

**Files to DELETE:**
- `src/utils/fromObsidian.js` (manifest parsing)
- `src/utils/toObsidian.js` (markdown export)
- `src/components/ui/SyncButton.jsx`
- `src/components/ui/ExportButton.jsx`
- `src/components/ui/ExportToObsidianButton.jsx`
- `src/utils/backup.js` (TaskNotes has files)
- `src/utils/validate.js` (API validates)

**Files to UPDATE:**
- `src/utils/index.js` (remove obsolete exports)
- `src/App.jsx` (remove obsolete imports)

**Step 1: Delete obsolete files**

**Step 2: Update imports**

**Step 3: Build and verify**

Run: `npm run build`
Expected: Success, no broken imports

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove obsolete sync code, TaskNotes API is now source of truth"
```

---

### Task 4b: Final Verification

**Manual Testing Checklist:**

1. **Connection**
   - [ ] TaskNotesStatus shows green when Obsidian + TaskNotes running
   - [ ] Shows red when disconnected

2. **Sync**
   - [ ] Tasks load from TaskNotes on app start
   - [ ] Tasks refresh when window gains focus
   - [ ] New tasks appear after 30s poll

3. **CRUD Operations**
   - [ ] Create task → appears in Obsidian immediately
   - [ ] Update task → changes in Obsidian
   - [ ] Complete task → marked complete in Obsidian
   - [ ] Delete task → removed from Obsidian

4. **Brain Dump**
   - [ ] Type natural language → NLP parses correctly
   - [ ] Create Task → task appears in both systems

5. **Oracle**
   - [ ] Ask Oracle → copies to clipboard
   - [ ] Paste response → preview shows
   - [ ] Accept → tasks created via API

**Commit:**

```bash
git commit --allow-empty -m "chore: TaskNotes integration complete"
```

---

## Summary

| Phase | What It Does | Claude Involvement |
|-------|--------------|-------------------|
| **0: API Client** | Connect Orrery to TaskNotes HTTP API | None |
| **1: Replace State** | All CRUD via API, remove manual sync | None |
| **2: Brain Dump** | Claude-powered parsing → API creation | **Yes** (parsing) |
| **3: Oracle** | Claude for intelligent unblocking | **Yes** (unblocking) |
| **4: Cleanup** | Remove obsolete code | None |

**Key Insight:** Use each tool for what it's best at.
- TaskNotes = dumb data store (CRUD only)
- Claude = all intelligence (parsing, decomposition, oracle)

**Why NOT TaskNotes NLP?**
- TaskNotes NLP is regex pattern matching
- Claude Opus 4.5 is state-of-the-art reasoning
- Claude can decompose complex ideas into task graphs with dependencies
- Claude understands project context
- Don't use a hammer when you have a precision tool

**Result:**
- Orrery is a pure view of TaskNotes data
- Changes are instant (API calls, not manual sync)
- Claude handles ALL intelligent work (brain dump, oracle)
- No sync buttons, no export/import, no copy/paste for basic operations
