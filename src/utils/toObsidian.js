// src/utils/toObsidian.js
// Convert Orrery state back to Obsidian TaskNote format

/**
 * Map Orrery status to Obsidian status
 * @param {import('@/types').TaskStatus} status
 * @param {boolean} isLocked - Whether task has incomplete dependencies
 * @returns {string}
 */
export function mapStatusToObsidian(status, isLocked) {
  if (status === 'completed') return 'completed';
  if (isLocked) return 'blocked';
  if (status === 'in_progress') return 'in-progress';
  return 'open';
}

/**
 * Map Orrery cognitive load to Obsidian priority
 * @param {number} cognitiveLoad - 1-5
 * @returns {string}
 */
export function mapCognitiveLoadToPriority(cognitiveLoad) {
  if (cognitiveLoad <= 1) return 'low';
  if (cognitiveLoad <= 2) return 'normal';
  if (cognitiveLoad <= 4) return 'high';
  return 'urgent';
}

/**
 * Convert task to TaskNote frontmatter object
 * @param {import('@/types').Task} task
 * @param {import('@/types').OrreryState} state
 * @returns {Object}
 */
export function taskToFrontmatter(task, state) {
  // Find blocking tasks (upstream edges where source is not completed)
  const blockedByIds = state.edges
    .filter(e => e.target === task.id)
    .map(e => e.source);

  const blockedByTasks = blockedByIds
    .map(id => state.tasks.find(t => t.id === id))
    .filter(Boolean);

  const isLocked = blockedByTasks.some(t => t.status !== 'completed');

  // Map quest IDs back to project names
  const projects = task.questIds
    .map(qid => state.quests.find(q => q.id === qid)?.title)
    .filter(Boolean);

  // Map blocker IDs to task titles (filenames)
  const blockedBy = blockedByTasks.map(t => t.title);

  return {
    status: mapStatusToObsidian(task.status, isLocked),
    priority: mapCognitiveLoadToPriority(task.cognitiveLoad || 3),
    timeEstimate: task.estimatedMinutes || null,
    dateCreated: task.createdAt,
    dateModified: new Date().toISOString(),
    tags: ['task'],
    projects,
    blockedBy,
  };
}

/**
 * Convert task to full TaskNote markdown
 * @param {import('@/types').Task} task
 * @param {import('@/types').OrreryState} state
 * @returns {string}
 */
export function taskToMarkdown(task, state) {
  const fm = taskToFrontmatter(task, state);

  // Build frontmatter YAML
  const fmLines = [
    '---',
    `status: ${fm.status}`,
    `priority: ${fm.priority}`,
  ];

  if (fm.timeEstimate) {
    fmLines.push(`timeEstimate: ${fm.timeEstimate}`);
  }

  fmLines.push(`dateCreated: ${fm.dateCreated}`);
  fmLines.push(`dateModified: ${fm.dateModified}`);
  fmLines.push(`tags: [${fm.tags.map(t => `"${t}"`).join(', ')}]`);

  if (fm.projects.length > 0) {
    fmLines.push(`projects: [${fm.projects.map(p => `"${p}"`).join(', ')}]`);
  }

  if (fm.blockedBy.length > 0) {
    fmLines.push(`blockedBy: [${fm.blockedBy.map(b => `"${b}"`).join(', ')}]`);
  }

  fmLines.push('---');
  fmLines.push('');
  fmLines.push(`# ${task.title}`);
  fmLines.push('');

  if (task.notes) {
    fmLines.push(task.notes);
  }

  return fmLines.join('\n');
}

/**
 * Generate sync manifest for writing back to Obsidian
 * @param {import('@/types').OrreryState} state
 * @returns {{tasks: Array<{filename: string, content: string}>}}
 */
export function stateToObsidianManifest(state) {
  return {
    generatedAt: new Date().toISOString(),
    generatedBy: 'orrery',
    tasks: state.tasks.map(task => ({
      filename: task.title,
      path: `TaskNotes/Tasks/${task.title}.md`,
      content: taskToMarkdown(task, state),
    })),
  };
}
