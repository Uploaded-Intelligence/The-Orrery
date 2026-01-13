// src/utils/obsidianSync.js
// Utilities for syncing between Obsidian TaskNotes and Orrery state

/**
 * Map Obsidian status to Orrery TaskStatus
 * @param {string} obsidianStatus
 * @returns {import('@/types').TaskStatus}
 */
export function mapStatus(obsidianStatus) {
  const statusMap = {
    'open': 'available',
    'in-progress': 'in_progress',
    'completed': 'completed',
    'blocked': 'blocked',
  };
  return statusMap[obsidianStatus] || 'available';
}

/**
 * Map Obsidian priority to Orrery CognitiveLoad
 * @param {string} priority
 * @returns {import('@/types').CognitiveLoad}
 */
export function mapPriorityToCognitiveLoad(priority) {
  const loadMap = {
    'low': 1,
    'normal': 3,
    'high': 4,
    'urgent': 5,
  };
  return loadMap[priority] || 3;
}

/**
 * Generate deterministic UUID from filename
 * @param {string} filename
 * @returns {string}
 */
export function filenameToId(filename) {
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `obs-${hex}-${filename.slice(0, 8).replace(/[^a-zA-Z0-9]/g, '')}`;
}

/**
 * Convert ObsidianTaskNote to Orrery Task
 * @param {import('@/types').ObsidianTaskNote} note
 * @param {Map<string, string>} questNameToId - Maps project name → quest ID
 * @returns {import('@/types').Task}
 */
export function taskNoteToTask(note, questNameToId) {
  const now = new Date().toISOString();
  const questIds = (note.fm.projects || [])
    .map(p => questNameToId.get(p))
    .filter(Boolean);

  return {
    id: filenameToId(note.filename),
    title: note.filename,
    notes: note.content,
    questIds,
    status: mapStatus(note.fm.status),
    estimatedMinutes: note.fm.timeEstimate || null,
    actualMinutes: null,
    cognitiveLoad: mapPriorityToCognitiveLoad(note.fm.priority),
    blockers: [],
    position: null,
    createdAt: note.fm.dateCreated || now,
    updatedAt: note.fm.dateModified || now,
    completedAt: note.fm.status === 'completed' ? now : null,
  };
}

/**
 * Convert SyncManifest to partial OrreryState
 * @param {import('@/types').SyncManifest} manifest
 * @returns {{tasks: import('@/types').Task[], quests: import('@/types').Quest[], edges: import('@/types').Edge[]}}
 */
export function manifestToState(manifest) {
  const questNameToId = new Map();
  const quests = manifest.quests.map((q) => {
    const id = `quest-${q.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    questNameToId.set(q.name, id);
    return {
      id,
      title: q.name,
      description: '',
      status: 'active',
      themeColor: q.color,
      position: null,
      createdAt: manifest.generatedAt,
      updatedAt: manifest.generatedAt,
    };
  });

  const tasks = manifest.tasks.map(note => taskNoteToTask(note, questNameToId));

  const taskFilenameToId = new Map(
    manifest.tasks.map(t => [t.filename, filenameToId(t.filename)])
  );

  const edges = [];
  for (const note of manifest.tasks) {
    const targetId = filenameToId(note.filename);
    for (const blockerFilename of (note.fm.blockedBy || [])) {
      const sourceId = taskFilenameToId.get(blockerFilename);
      if (sourceId) {
        edges.push({
          id: `edge-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
        });
      }
    }
  }

  return { tasks, quests, edges };
}
