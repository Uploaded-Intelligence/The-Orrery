// ═══════════════════════════════════════════════════════════════
// utils/quests.js
// Quest-related utility functions
// ═══════════════════════════════════════════════════════════════

/**
 * Get quest progress (completed tasks / total tasks)
 * @param {string} questId
 * @param {import('@/types').OrreryState} state
 * @returns {number} Progress from 0 to 1
 */
export const getQuestProgress = (questId, state) => {
  const questTasks = state.tasks.filter(t => t.questIds.includes(questId));
  if (questTasks.length === 0) return 0;

  const completed = questTasks.filter(t => t.status === 'completed').length;
  return completed / questTasks.length;
};
