// src/utils/exportState.js

/**
 * Convert Orrery state to downloadable JSON
 * @param {import('@/types').OrreryState} state
 * @returns {string} JSON string
 */
export function stateToExportJson(state) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    tasks: state.tasks,
    quests: state.quests,
    edges: state.edges,
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Trigger file download
 * @param {string} content
 * @param {string} filename
 */
export function downloadJson(content, filename) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
