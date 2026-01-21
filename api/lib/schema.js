// api/lib/schema.js
// LifeRPG Game State Schema

/**
 * @typedef {Object} Task
 * @property {string} id - UUID
 * @property {string} title
 * @property {'pending'|'in-progress'|'completed'|'archived'} status
 * @property {number} priority - 1-5 (cognitiveLoad)
 * @property {number} estimatedMinutes
 * @property {number} actualMinutes
 * @property {string[]} questIds - Parent quest references
 * @property {string[]} blockedBy - Task IDs this is blocked by
 * @property {string} notes - Markdown content
 * @property {Object} position - {x, y} for Orrery layout (client-managed)
 * @property {boolean} pinned
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {Object} Quest
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'active'|'completed'|'abandoned'} status
 * @property {string[]} taskIds
 * @property {number} xpReward
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Edge
 * @property {string} id
 * @property {string} source - Task ID (blocker)
 * @property {string} target - Task ID (blocked by source)
 */

/**
 * @typedef {Object} QuestVine
 * @property {string} id
 * @property {string} sourceQuest - Quest ID
 * @property {string} targetQuest - Quest ID
 * @property {number} strength - 0-1 affinity scale
 * @property {string} reason - Why these quests are connected
 */

/**
 * @typedef {Object} GameState
 * @property {Task[]} tasks
 * @property {Quest[]} quests
 * @property {Edge[]} edges
 * @property {QuestVine[]} questVines
 * @property {number} totalXP
 * @property {Object} achievements
 */

export const SCHEMA_VERSION = 1;

// Redis key constants
export const KEYS = {
  TASKS: 'liferpg:tasks',
  QUESTS: 'liferpg:quests',
  EDGES: 'liferpg:edges',
  QUEST_VINES: 'liferpg:questvines',
  GAME_STATE: 'liferpg:state',
};

// Default task factory
export function createTask(data) {
  return {
    id: crypto.randomUUID(),
    title: data.title || 'Untitled Task',
    status: data.status || 'pending',
    priority: data.priority || 3,
    estimatedMinutes: data.estimatedMinutes || 0,
    actualMinutes: data.actualMinutes || 0,
    questIds: data.questIds || [],
    blockedBy: data.blockedBy || [],
    notes: data.notes || '',
    position: data.position || { x: 0, y: 0 },
    pinned: data.pinned || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Default quest factory
export function createQuest(data) {
  return {
    id: crypto.randomUUID(),
    title: data.title || 'Untitled Quest',
    description: data.description || '',
    status: data.status || 'active',
    taskIds: data.taskIds || [],
    xpReward: data.xpReward || 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Default edge factory
export function createEdge(source, target) {
  return {
    id: `edge-${source}-${target}`,
    source,
    target,
  };
}

// Default quest vine factory
export function createQuestVine(data) {
  return {
    id: `vine-${data.sourceQuest}-${data.targetQuest}`,
    sourceQuest: data.sourceQuest,
    targetQuest: data.targetQuest,
    strength: data.strength || 0.5,
    reason: data.reason || '',
  };
}
