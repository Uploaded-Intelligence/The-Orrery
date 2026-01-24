// ═══════════════════════════════════════════════════════════════
// utils/index.js
// Barrel export for utilities
// ═══════════════════════════════════════════════════════════════

export { generateId } from './ids.js';
export { isTaskLocked, getComputedTaskStatus, getAvailableTasks } from './tasks.js';
export { getQuestProgress } from './quests.js';
export { autoLayoutDAG, getLayoutPositions, getEdgePath, getCanvasBounds, LAYOUT } from './layout.js';
export { computeLayers } from './forceLayout.js';
// Physics moved to d3PhysicsEngine.js - import directly where needed
export { buildOracleRequest, copyOracleRequestToClipboard, parseOracleResponse } from './oracle.js';
