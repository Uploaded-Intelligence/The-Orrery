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

    case 'RESET_STATE':
      return {
        quests: [],
        tasks: [],
        edges: [],
        activeSession: null,
        preferences: {
          currentView: 'macro',
          focusQuestId: null,
          showActualOnly: false,
          microViewPosition: { x: 0, y: 0 },
          microViewZoom: 1.0,
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
        // Clear focus if this quest was focused
        preferences: {
          ...state.preferences,
          focusQuestId: state.preferences.focusQuestId === action.payload
            ? null
            : state.preferences.focusQuestId,
        },
        lastSyncedAt: now,
      };

    // ─── Task CRUD ──────────────────────────────────────────────────────────
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, {
          id: generateId(),
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

    default:
      return state;
  }
}
