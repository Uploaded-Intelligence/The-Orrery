// api/lib/schema.js
// LifeRPG Game State Schema
//
// ONTOLOGY: Experiments, not Tasks
// - An Experiment is a hypothesis you're testing about yourself
// - Failure = data, not shame
// - Curiosity-driven, not obligation-driven
// - The Orrery is a laboratory of life, not a task manager

/**
 * @typedef {Object} Experiment
 * @property {string} id - UUID
 * @property {string} hypothesis - What you're testing: "I can focus on X if Y"
 * @property {'designed'|'running'|'concluded'|'abandoned'} status
 * @property {string[]} conditions - What needs to be true to run: ["morning", "quiet"]
 * @property {number} energyRequired - 1-5, about YOUR capacity needed (not task importance)
 * @property {number} timeboxed - Minutes for this experiment (experiments have duration)
 * @property {number} actualMinutes - How long it actually took
 * @property {string} findings - What you learned: "This worked because..."
 * @property {string} nextExperiment - What this suggests trying next
 * @property {string} inquiryId - Parent research program
 * @property {string|null} questId - Parent campaign quest (optional reverse link)
 * @property {string} notes - Markdown content
 * @property {Object} position - {x, y} for Orrery layout (client-managed)
 * @property {boolean} pinned
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {Object} Inquiry
 * Research programs - ongoing questions you're exploring
 * Not "projects to complete" but inquiries to pursue
 *
 * @property {string} id
 * @property {string} question - The core inquiry: "What enables me to engage with finances?"
 * @property {string} description - Context and background
 * @property {'active'|'resting'|'integrated'} status - Never "completed" - only resting or integrated
 * @property {string[]} experimentIds - Experiments within this inquiry
 * @property {string[]} keyFindings - Accumulated learnings
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ConditionEdge
 * Links experiments that inform each other
 * "This experiment's findings enable that experiment's conditions"
 *
 * @property {string} id
 * @property {string} source - Experiment ID (provides condition)
 * @property {string} target - Experiment ID (requires condition)
 * @property {string} condition - What condition is provided/required
 */

/**
 * @typedef {Object} InquiryVine
 * Organic connections between research programs
 *
 * @property {string} id
 * @property {string} sourceInquiry - Inquiry ID
 * @property {string} targetInquiry - Inquiry ID
 * @property {number} strength - 0-1 affinity scale
 * @property {string} reason - Why these inquiries connect
 */

/**
 * @typedef {Object} CampaignQuest
 * Campaign-level projects spanning repos, weeks, and sessions.
 * NOT the same as the frontend Quest type (simple task-container with themeColor).
 * These represent strategic expedition arcs in the Beworlding System.
 *
 * @property {string} id - UUID
 * @property {string} name - Display name: "Build AIRI Companion"
 * @property {'active'|'planned'|'paused'|'blocked'|'completed'|'abandoned'} status
 * @property {string} description - What this campaign is about
 * @property {'airi'|'orrery'|'openclaw'|'infra'|'explore'|'vault'} domain
 * @property {'build'|'maintain'|'explore'|'infra'} kind
 * @property {'low'|'medium'|'high'} energy - Activation cost to start working
 * @property {'low'|'medium'|'high'} context_cost - "Reading back in" tax after time away
 * @property {string|null} last_context - Summary of where things left off
 * @property {string|null} blocked_reason - Why this is blocked (null if not)
 * @property {string|null} last_session - ISO timestamp of last work session
 * @property {string|null} last_commit - ISO timestamp of last git commit
 * @property {number} momentum - Consecutive days with activity
 * @property {string|null} plan_file - Path to plan document
 * @property {string|null} repo - Repository name
 * @property {string[]} experimentIds - Linked Orrery experiments
 * @property {string[]} keyFindings - Accumulated learnings
 * @property {Object} position - {x, y} for layout
 * @property {boolean} pinned
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {Object} GameState
 * @property {Experiment[]} experiments
 * @property {Inquiry[]} inquiries
 * @property {ConditionEdge[]} edges
 * @property {InquiryVine[]} vines
 * @property {CampaignQuest[]} quests
 * @property {Object} discoveries - Accumulated learnings across all inquiries
 */

export const SCHEMA_VERSION = 3;

// Redis key constants
export const KEYS = {
  EXPERIMENTS: 'liferpg:experiments',
  INQUIRIES: 'liferpg:inquiries',
  EDGES: 'liferpg:edges',
  VINES: 'liferpg:vines',
  DISCOVERIES: 'liferpg:discoveries',
  QUESTS: 'liferpg:quests',
};

// Experiment factory
export function createExperiment(data) {
  return {
    id: crypto.randomUUID(),
    hypothesis: data.hypothesis || 'What if I try...',
    status: data.status || 'designed',
    conditions: data.conditions || [],
    energyRequired: data.energyRequired || 3,
    timeboxed: data.timeboxed || 25,  // Default pomodoro
    actualMinutes: data.actualMinutes || 0,
    findings: data.findings || '',
    nextExperiment: data.nextExperiment || '',
    inquiryId: data.inquiryId || null,
    questId: data.questId || null,
    notes: data.notes || '',
    position: data.position || { x: 0, y: 0 },
    pinned: data.pinned || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Inquiry (research program) factory
export function createInquiry(data) {
  return {
    id: crypto.randomUUID(),
    question: data.question || 'What enables me to...?',
    description: data.description || '',
    status: data.status || 'active',
    experimentIds: data.experimentIds || [],
    keyFindings: data.keyFindings || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Condition edge factory
export function createConditionEdge(source, target, condition) {
  return {
    id: `edge-${source}-${target}`,
    source,
    target,
    condition: condition || '',
  };
}

// Inquiry vine factory
export function createInquiryVine(data) {
  return {
    id: `vine-${data.sourceInquiry}-${data.targetInquiry}`,
    sourceInquiry: data.sourceInquiry,
    targetInquiry: data.targetInquiry,
    strength: data.strength || 0.5,
    reason: data.reason || '',
  };
}

// Campaign quest factory
export function createQuest(data) {
  return {
    id: crypto.randomUUID(),
    name: data.name || 'Untitled Quest',
    status: data.status || 'planned',
    description: data.description || '',
    domain: data.domain || 'explore',
    kind: data.kind || 'explore',
    energy: data.energy || 'medium',
    context_cost: data.context_cost || 'medium',
    last_context: data.last_context || null,
    blocked_reason: data.blocked_reason || null,
    last_session: data.last_session || null,
    last_commit: data.last_commit || null,
    momentum: data.momentum || 0,
    plan_file: data.plan_file || null,
    repo: data.repo || null,
    experimentIds: data.experimentIds || [],
    keyFindings: data.keyFindings || [],
    position: data.position || { x: 0, y: 0 },
    pinned: data.pinned || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
