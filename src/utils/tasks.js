// ═══════════════════════════════════════════════════════════════
// utils/tasks.js
// Task-related utility functions
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a task is locked (any upstream dependency not completed)
 * @param {string} taskId
 * @param {import('@/types').OrreryState} state
 * @returns {boolean}
 */
export const isTaskLocked = (taskId, state) => {
  const upstreamEdges = state.edges.filter(e => e.target === taskId);
  if (upstreamEdges.length === 0) return false;

  return upstreamEdges.some(edge => {
    const upstreamTask = state.tasks.find(t => t.id === edge.source);
    return upstreamTask?.status !== 'completed';
  });
};

/**
 * Get computed task status (handles locked state and active session)
 * @param {import('@/types').Task} task
 * @param {import('@/types').OrreryState} state
 * @returns {import('@/types').TaskStatus}
 */
export const getComputedTaskStatus = (task, state) => {
  if (task.status === 'completed') return 'completed';
  // NOTE: We deliberately ignore task.status === 'blocked' here.
  // Blockedness is computed DYNAMICALLY from edges, not from static status.
  // This allows tasks to auto-unlock when dependencies complete.
  if (isTaskLocked(task.id, state)) return 'locked';
  // Check if this task is the active session - makes Play button work
  if (state.activeSession?.taskId === task.id) return 'in_progress';
  if (task.status === 'in_progress') return 'in_progress';
  return 'available';
};

/**
 * Get available tasks (not locked, not completed)
 * @param {string|null} questId
 * @param {import('@/types').OrreryState} state
 * @returns {import('@/types').Task[]}
 */
export const getAvailableTasks = (questId, state) => {
  let tasks = questId
    ? state.tasks.filter(t => t.questIds.includes(questId))
    : state.tasks;

  return tasks.filter(t => {
    const status = getComputedTaskStatus(t, state);
    return status === 'available' || status === 'in_progress';
  });
};
