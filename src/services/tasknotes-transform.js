// src/services/tasknotes-transform.js

/**
 * Transform TaskNotes task to Orrery task format
 */
export function taskNotesToOrrery(tnTask) {
  return {
    id: tnTask.id,
    title: tnTask.title,
    notes: tnTask.details || '',
    status: mapStatus(tnTask.status),
    estimatedMinutes: tnTask.timeEstimate || null,
    cognitiveLoad: mapPriorityToCognitive(tnTask.priority),
    questIds: tnTask.projects || [],
    tags: tnTask.tags || [],
    contexts: tnTask.contexts || [],
    dueAt: tnTask.dueDate || null,
    scheduledAt: tnTask.scheduled || null,
    createdAt: tnTask.dateCreated,
    updatedAt: tnTask.dateModified,
    completedAt: tnTask.completedAt || null,
    // TaskNotes-specific
    _taskNotesId: tnTask.id,
    _filePath: tnTask.path,
  };
}

/**
 * Transform Orrery task to TaskNotes format for API calls
 */
export function orreryToTaskNotes(task) {
  return {
    title: task.title,
    details: task.notes || '',
    status: reverseMapStatus(task.status),
    timeEstimate: task.estimatedMinutes,
    priority: mapCognitiveToPriority(task.cognitiveLoad),
    projects: task.questIds || [],
    tags: task.tags || [],
    contexts: task.contexts || [],
    dueDate: task.dueAt,
    scheduledDate: task.scheduledAt,
  };
}

// Status mapping
function mapStatus(tnStatus) {
  const map = {
    'open': 'available',
    'completed': 'completed',
    'in_progress': 'in_progress',
  };
  return map[tnStatus] || 'available';
}

function reverseMapStatus(orreryStatus) {
  const map = {
    'available': 'open',
    'completed': 'completed',
    'in_progress': 'open', // TaskNotes might not have in_progress
  };
  return map[orreryStatus] || 'open';
}

// Priority <-> Cognitive load mapping (1-5 scale)
function mapPriorityToCognitive(priority) {
  const map = {
    'highest': 5,
    'high': 4,
    'medium': 3,
    'low': 2,
    'lowest': 1,
  };
  return map[priority] || 3;
}

function mapCognitiveToPriority(cognitive) {
  if (cognitive >= 5) return 'highest';
  if (cognitive >= 4) return 'high';
  if (cognitive >= 3) return 'medium';
  if (cognitive >= 2) return 'low';
  return 'lowest';
}

/**
 * Transform all tasks from TaskNotes response
 * API returns {tasks: [...]} not a flat array
 */
export function transformTasksFromAPI(response) {
  const tasks = response?.tasks || response || [];
  if (!Array.isArray(tasks)) {
    console.error('[Transform] Expected tasks array, got:', typeof tasks, tasks);
    return [];
  }
  return tasks.map(taskNotesToOrrery);
}
