// ═══════════════════════════════════════════════════════════════
// store/reducer.js
// Orrery state reducer with all actions
// ═══════════════════════════════════════════════════════════════

import { generateId } from '@/utils';

/**
 * @param {import('@/types').OrreryState} state
 * @param {Object} action
 * @returns {import('@/types').OrreryState}
 */
export function orreryReducer(state, action) {
  const now = new Date().toISOString();

  switch (action.type) {
    // ─── State Management ───────────────────────────────────────────────────
    case 'LOAD_STATE':
      return {
        ...action.payload,
        lastSyncedAt: now,
      };

    case 'LOAD_FROM_TASKNOTES':
      // Load tasks from TaskNotes API (server-authoritative)
      // Merge with existing Orrery-local data (positions, blockers)
      const existingById = new Map(state.tasks.map(t => [t.id, t]));
      const mergedTasks = action.payload.tasks.map(newTask => {
        const existing = existingById.get(newTask.id);
        return {
          ...newTask,
          // Preserve Orrery-local fields (not in TaskNotes)
          position: existing?.position || newTask.position,
          blockers: existing?.blockers || [],
        };
      });

      return {
        ...state,
        tasks: mergedTasks,
        lastSyncedAt: now,
        _syncSource: 'tasknotes',
      };

    case 'RESET_STATE':
      return {
        quests: [],
        tasks: [],
        edges: [],
        questVines: [],
        activeSession: null,
        preferences: {
          currentView: 'macro',
          focusQuestId: null,
          showActualOnly: false,
          microViewPosition: { x: 0, y: 0 },
          microViewZoom: 1.0,
          macroViewPosition: { x: 0, y: 0 },
          macroViewZoom: 1.0,
        },
        lastSyncedAt: now,
      };

    // ─── Quest CRUD ─────────────────────────────────────────────────────────
    case 'ADD_QUEST':
      return {
        ...state,
        quests: [...state.quests, {
          id: generateId(),
          ...action.payload,
          createdAt: now,
          updatedAt: now,
        }],
        lastSyncedAt: now,
      };

    case 'UPDATE_QUEST':
      return {
        ...state,
        quests: state.quests.map(q =>
          q.id === action.payload.id
            ? { ...q, ...action.payload.updates, updatedAt: now }
            : q
        ),
        lastSyncedAt: now,
      };

    case 'DELETE_QUEST':
      return {
        ...state,
        quests: state.quests.filter(q => q.id !== action.payload),
        // Also remove quest from all tasks
        tasks: state.tasks.map(t => ({
          ...t,
          questIds: t.questIds.filter(qid => qid !== action.payload),
        })),
        // Also remove any vines involving this quest
        questVines: (state.questVines || []).filter(v =>
          v.sourceQuestId !== action.payload && v.targetQuestId !== action.payload
        ),
        // Clear focus if this quest was focused
        preferences: {
          ...state.preferences,
          focusQuestId: state.preferences.focusQuestId === action.payload
            ? null
            : state.preferences.focusQuestId,
        },
        lastSyncedAt: now,
      };

    case 'UPDATE_QUEST_POSITION':
      // Update quest position for macro view dragging
      return {
        ...state,
        quests: state.quests.map(q =>
          q.id === action.payload.id
            ? { ...q, position: action.payload.position, updatedAt: now }
            : q
        ),
        lastSyncedAt: now,
      };

    // ─── Task CRUD ──────────────────────────────────────────────────────────
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, {
          id: generateId(),
          cognitiveLoad: 3, // Default to focused attention (middle of 1-5 scale)
          ...action.payload,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
        }],
        lastSyncedAt: now,
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id
            ? { ...t, ...action.payload.updates, updatedAt: now }
            : t
        ),
        lastSyncedAt: now,
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
        // Also remove edges involving this task
        edges: state.edges.filter(e =>
          e.source !== action.payload && e.target !== action.payload
        ),
        lastSyncedAt: now,
      };

    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload
            ? { ...t, status: 'completed', completedAt: now, updatedAt: now }
            : t
        ),
        // End session if completing the active task
        activeSession: state.activeSession?.taskId === action.payload
          ? null
          : state.activeSession,
        lastSyncedAt: now,
      };

    case 'REOPEN_TASK':
      // Undo completion - set task back to available
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload
            ? { ...t, status: 'available', completedAt: null, updatedAt: now }
            : t
        ),
        lastSyncedAt: now,
      };

    // ─── Edge CRUD ──────────────────────────────────────────────────────────
    case 'ADD_EDGE': {
      // Prevent duplicate edges
      const existingEdge = state.edges.find(
        e => e.source === action.payload.source && e.target === action.payload.target
      );
      if (existingEdge) return state;

      return {
        ...state,
        edges: [...state.edges, {
          id: generateId(),
          source: action.payload.source,
          target: action.payload.target,
        }],
        lastSyncedAt: now,
      };
    }

    case 'DELETE_EDGE':
      return {
        ...state,
        edges: state.edges.filter(e => e.id !== action.payload),
        lastSyncedAt: now,
      };

    // ─── Session ────────────────────────────────────────────────────────────
    case 'START_SESSION':
      return {
        ...state,
        activeSession: {
          taskId: action.payload.taskId,
          startedAt: now,
          plannedMinutes: action.payload.plannedMinutes,
          hardStopAt: action.payload.hardStopAt || null,
        },
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? { ...t, status: 'in_progress', updatedAt: now }
            : t
        ),
        lastSyncedAt: now,
      };

    case 'END_SESSION':
      return {
        ...state,
        activeSession: null,
        tasks: state.tasks.map(t =>
          t.status === 'in_progress'
            ? { ...t, status: 'available', updatedAt: now }
            : t
        ),
        lastSyncedAt: now,
      };

    case 'PAUSE_SESSION': {
      // Pause session - preserve elapsed time, don't lose progress
      if (!state.activeSession) return state;
      const startedAt = new Date(state.activeSession.startedAt);
      const elapsedMs = Date.now() - startedAt.getTime();
      const elapsedMinutes = elapsedMs / 1000 / 60;
      const previousElapsed = state.activeSession.pausedElapsedMinutes || 0;
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          isPaused: true,
          pausedAt: now,
          pausedElapsedMinutes: previousElapsed + elapsedMinutes,
        },
        lastSyncedAt: now,
      };
    }

    case 'RESUME_SESSION':
      // Resume paused session - reset startedAt to now
      if (!state.activeSession?.isPaused) return state;
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          isPaused: false,
          pausedAt: null,
          startedAt: now,
        },
        lastSyncedAt: now,
      };

    // ─── View Preferences ───────────────────────────────────────────────────
    case 'SET_VIEW':
      return {
        ...state,
        preferences: { ...state.preferences, currentView: action.payload },
      };

    case 'SET_FOCUS_QUEST':
      return {
        ...state,
        preferences: { ...state.preferences, focusQuestId: action.payload },
      };

    case 'TOGGLE_ACTUAL_FILTER':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          showActualOnly: !state.preferences.showActualOnly
        },
      };

    case 'SET_MICRO_POSITION':
      return {
        ...state,
        preferences: { ...state.preferences, microViewPosition: action.payload },
      };

    case 'SET_MICRO_ZOOM':
      return {
        ...state,
        preferences: { ...state.preferences, microViewZoom: action.payload },
      };

    case 'SET_MACRO_POSITION':
      return {
        ...state,
        preferences: { ...state.preferences, macroViewPosition: action.payload },
      };

    case 'SET_MACRO_ZOOM':
      return {
        ...state,
        preferences: { ...state.preferences, macroViewZoom: action.payload },
      };

    // ─── Quest Vines (Celestial Connections) ───────────────────────────────
    case 'ADD_QUEST_VINE': {
      // Prevent duplicate vines
      const existingVine = (state.questVines || []).find(
        v => v.sourceQuestId === action.payload.sourceQuestId &&
             v.targetQuestId === action.payload.targetQuestId
      );
      if (existingVine) return state;

      return {
        ...state,
        questVines: [...(state.questVines || []), {
          id: generateId(),
          sourceQuestId: action.payload.sourceQuestId,
          targetQuestId: action.payload.targetQuestId,
          strength: action.payload.strength || 0.5,
          createdAt: now,
        }],
        lastSyncedAt: now,
      };
    }

    case 'DELETE_QUEST_VINE':
      return {
        ...state,
        questVines: (state.questVines || []).filter(v => v.id !== action.payload),
        lastSyncedAt: now,
      };

    case 'UPDATE_QUEST_VINE':
      return {
        ...state,
        questVines: (state.questVines || []).map(v =>
          v.id === action.payload.id
            ? { ...v, ...action.payload.updates }
            : v
        ),
        lastSyncedAt: now,
      };

    // ─── Bulk Operations ────────────────────────────────────────────────────
    case 'MERGE_AI_RESULT':
      // Merge AI-generated quests, tasks, edges with existing state
      return {
        ...state,
        quests: [
          ...state.quests,
          ...action.payload.quests.map(q => ({
            ...q,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          })),
        ],
        tasks: [
          ...state.tasks,
          ...action.payload.tasks.map(t => ({
            ...t,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
            completedAt: null,
          })),
        ],
        edges: [
          ...state.edges,
          ...action.payload.edges.map(e => ({
            ...e,
            id: generateId(),
          })),
        ],
        lastSyncedAt: now,
      };

    case 'IMPORT_FROM_OBSIDIAN': {
      // payload: { tasks, quests, edges } from manifestToState()
      const { tasks: newTasks, quests: newQuests, edges: newEdges } = action.payload;

      // Merge strategy: Add new, update existing (by ID), preserve positions
      const existingTaskMap = new Map(state.tasks.map(t => [t.id, t]));
      const existingQuestMap = new Map(state.quests.map(q => [q.id, q]));

      const mergedTasks = newTasks.map(newTask => {
        const existing = existingTaskMap.get(newTask.id);
        if (existing) {
          // Preserve position and actual minutes, update content
          return {
            ...newTask,
            position: existing.position,
            actualMinutes: existing.actualMinutes,
          };
        }
        return newTask;
      });

      const mergedQuests = newQuests.map(newQuest => {
        const existing = existingQuestMap.get(newQuest.id);
        if (existing) {
          return { ...newQuest, position: existing.position };
        }
        return newQuest;
      });

      // Merge edges (add new, keep existing)
      const existingEdgeIds = new Set(state.edges.map(e => e.id));
      const mergedEdges = [
        ...state.edges,
        ...newEdges.filter(e => !existingEdgeIds.has(e.id)),
      ];

      return {
        ...state,
        tasks: mergedTasks,
        quests: mergedQuests,
        edges: mergedEdges,
        lastSyncedAt: new Date().toISOString(),
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // BLOCKER ACTIONS
    // ═══════════════════════════════════════════════════════════════
    case 'ADD_BLOCKER':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? {
                ...t,
                blockers: [
                  ...(t.blockers || []),
                  {
                    id: generateId(),
                    text: action.payload.text,
                    oracleSuggestion: null,
                    status: 'pending',
                    createdAt: now,
                  }
                ],
                updatedAt: now,
              }
            : t
        ),
        lastSyncedAt: now,
      };

    case 'UPDATE_BLOCKER':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? {
                ...t,
                blockers: (t.blockers || []).map(b =>
                  b.id === action.payload.blockerId
                    ? { ...b, ...action.payload.updates }
                    : b
                ),
                updatedAt: now,
              }
            : t
        ),
        lastSyncedAt: now,
      };

    case 'REMOVE_BLOCKER':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? {
                ...t,
                blockers: (t.blockers || []).filter(b => b.id !== action.payload.blockerId),
                updatedAt: now,
              }
            : t
        ),
        lastSyncedAt: now,
      };

    // ─── Layout Actions ──────────────────────────────────────────────────────
    case 'RESET_LAYOUT':
      // Store current positions for undo, then clear all positions
      return {
        ...state,
        _previousTaskPositions: state.tasks.reduce((acc, t) => {
          if (t.position) acc[t.id] = t.position;
          return acc;
        }, {}),
        tasks: state.tasks.map(t => ({ ...t, position: null })),
        lastSyncedAt: now,
      };

    case 'UNDO_LAYOUT':
      // Restore previous positions if available
      if (!state._previousTaskPositions) return state;
      return {
        ...state,
        tasks: state.tasks.map(t => ({
          ...t,
          position: state._previousTaskPositions[t.id] || t.position,
        })),
        _previousTaskPositions: null,
        lastSyncedAt: now,
      };

    default:
      return state;
  }
}
