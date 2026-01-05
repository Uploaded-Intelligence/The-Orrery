// ═══════════════════════════════════════════════════════════════
// types/index.js
// JSDoc type definitions for The Orrery
// ═══════════════════════════════════════════════════════════════

/**
 * @typedef {'active' | 'paused' | 'completed' | 'archived'} QuestStatus
 */

/**
 * @typedef {'locked' | 'available' | 'in_progress' | 'completed' | 'blocked'} TaskStatus
 */

/**
 * @typedef {'macro' | 'micro'} ViewMode
 */

/**
 * @typedef {Object} Quest
 * @property {string} id - UUID
 * @property {string} title - Display name
 * @property {string} description - What this quest is about
 * @property {QuestStatus} status
 * @property {string} themeColor - Hex color for visual identity
 * @property {{x: number, y: number}|null} position - Spatial position in macro view (null = auto-layout)
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {1 | 2 | 3 | 4 | 5} CognitiveLoad
 * 1 = Autopilot (routine, mindless)
 * 2 = Light focus
 * 3 = Focused attention (default)
 * 4 = Heavy (deep work)
 * 5 = Maximum cognitive load (consider decomposing)
 */

/**
 * @typedef {Object} Task
 * @property {string} id - UUID
 * @property {string} title - Display name
 * @property {string} notes - Markdown notes/details
 * @property {string[]} questIds - Many-to-many: task can serve multiple quests
 * @property {TaskStatus} status
 * @property {number|null} estimatedMinutes
 * @property {number|null} actualMinutes
 * @property {CognitiveLoad} cognitiveLoad - Mental effort required (1=light, 2=medium, 3=heavy)
 * @property {{x: number, y: number}|null} position - Manual position (null = auto-layout)
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 * @property {string|null} completedAt - ISO timestamp when done
 */

/**
 * @typedef {Object} Edge
 * @property {string} id - UUID
 * @property {string} source - Task ID (upstream)
 * @property {string} target - Task ID (downstream)
 */

/**
 * @typedef {Object} QuestVine
 * @property {string} id - UUID
 * @property {string} sourceQuestId - Origin quest
 * @property {string} targetQuestId - Destination quest
 * @property {number} strength - 0.0-1.0, affects visual thickness
 * @property {string} createdAt - ISO timestamp
 */

/**
 * @typedef {Object} ActiveSession
 * @property {string} taskId - Currently focused task
 * @property {string} startedAt - ISO timestamp
 * @property {number} plannedMinutes - How long planned
 * @property {string|null} hardStopAt - ISO timestamp of hard deadline
 */

/**
 * @typedef {Object} ViewPreferences
 * @property {ViewMode} currentView
 * @property {string|null} focusQuestId
 * @property {boolean} showActualOnly - Panic button
 * @property {{x: number, y: number}} microViewPosition
 * @property {number} microViewZoom
 * @property {{x: number, y: number}} macroViewPosition
 * @property {number} macroViewZoom
 */

/**
 * @typedef {Object} OrreryState
 * @property {Quest[]} quests
 * @property {Task[]} tasks
 * @property {Edge[]} edges
 * @property {QuestVine[]} questVines - Quest-to-quest connections (celestial vines)
 * @property {ActiveSession|null} activeSession
 * @property {ViewPreferences} preferences
 * @property {string} lastSyncedAt
 */

// Re-export nothing (types are documentation-only in JS)
// Import this file for JSDoc type hints:
// /** @type {import('@/types').Quest} */
