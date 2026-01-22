// api/lib/vault-parser.js
// Parses Obsidian vault markdown files into Experiments ontology

import matter from 'gray-matter';

/**
 * Parse an Experiment markdown file (formerly "task")
 * Supports both old task frontmatter and new experiment frontmatter
 *
 * @param {string} content - Raw markdown content with frontmatter
 * @param {string} filename - Filename (used as fallback for hypothesis)
 * @returns {Object} Experiment object
 */
export function parseExperimentMarkdown(content, filename) {
  const { data, content: body } = matter(content);

  // Support both old (task) and new (experiment) frontmatter keys
  return {
    // Core identity
    hypothesis: data.hypothesis || data.title || filename.replace('.md', ''),

    // Status mapping: pending → designed, completed → concluded
    status: mapStatus(data.status || 'designed'),

    // Energy/priority (about the player, not the task)
    energyRequired: data.energyRequired || data.priority || 3,
    timeboxed: data.timeboxed || data.estimatedMinutes || data.timeEstimate || 0,

    // Conditions (new) or blockedBy (old)
    conditions: data.conditions || [],
    blockedBy: data.blockedBy || [], // Legacy support

    // Inquiry references (new) or quest IDs (old)
    inquiryIds: data.inquiryIds || data.questIds || data.projects || [],

    // Findings (what was learned)
    findings: data.findings || '',
    outcome: data.outcome || null, // 'signal' | 'noise' | 'pivot' | null

    // Notes content (the markdown body)
    notes: body.trim(),

    // Metadata from frontmatter
    tags: data.tags || [],
    createdAt: data.createdAt || data.created || null,
    updatedAt: data.updatedAt || data.updated || null,
  };
}

/**
 * Parse an Inquiry markdown file (formerly "quest")
 *
 * @param {string} content - Raw markdown content with frontmatter
 * @param {string} filename - Filename (used as fallback for question)
 * @returns {Object} Inquiry object
 */
export function parseInquiryMarkdown(content, filename) {
  const { data, content: body } = matter(content);

  return {
    // Core identity
    question: data.question || data.title || filename.replace('.md', ''),
    description: data.description || body.trim(),

    // Status: active, resting, integrated (inquiries never "complete")
    status: data.status || 'active',

    // Key findings accumulated
    keyFindings: data.keyFindings || [],

    // Experiment IDs this inquiry contains
    experimentIds: data.experimentIds || data.taskIds || [],

    // Reward for integration
    xpReward: data.xpReward || 100,

    // Metadata
    tags: data.tags || [],
    createdAt: data.createdAt || data.created || null,
  };
}

/**
 * Map old status values to new Experiments ontology
 */
function mapStatus(status) {
  const statusMap = {
    // Old → New
    pending: 'designed',
    'in-progress': 'running',
    'in_progress': 'running',
    completed: 'concluded',
    done: 'concluded',
    archived: 'abandoned',
    abandoned: 'abandoned',
    // New (pass through)
    designed: 'designed',
    running: 'running',
    concluded: 'concluded',
  };

  return statusMap[status?.toLowerCase()] || 'designed';
}

/**
 * Generate markdown content from an Experiment object
 * Used for syncing API → Vault (reverse direction)
 *
 * @param {Object} experiment - Experiment object
 * @returns {string} Markdown content with frontmatter
 */
export function experimentToMarkdown(experiment) {
  const frontmatter = {
    hypothesis: experiment.hypothesis,
    status: experiment.status,
    energyRequired: experiment.energyRequired,
    timeboxed: experiment.timeboxed,
    conditions: experiment.conditions,
    inquiryIds: experiment.inquiryIds,
    findings: experiment.findings || undefined,
    outcome: experiment.outcome || undefined,
    tags: experiment.tags,
    createdAt: experiment.createdAt,
    updatedAt: experiment.updatedAt,
  };

  // Remove undefined values
  Object.keys(frontmatter).forEach(
    (key) => frontmatter[key] === undefined && delete frontmatter[key]
  );

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length === 0) return null;
        return `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    })
    .filter(Boolean)
    .join('\n');

  return `---\n${yaml}\n---\n\n${experiment.notes || ''}\n`;
}

/**
 * Generate markdown content from an Inquiry object
 *
 * @param {Object} inquiry - Inquiry object
 * @returns {string} Markdown content with frontmatter
 */
export function inquiryToMarkdown(inquiry) {
  const frontmatter = {
    question: inquiry.question,
    status: inquiry.status,
    keyFindings: inquiry.keyFindings,
    experimentIds: inquiry.experimentIds,
    xpReward: inquiry.xpReward,
    tags: inquiry.tags,
    createdAt: inquiry.createdAt,
  };

  Object.keys(frontmatter).forEach(
    (key) => frontmatter[key] === undefined && delete frontmatter[key]
  );

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length === 0) return null;
        return `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    })
    .filter(Boolean)
    .join('\n');

  return `---\n${yaml}\n---\n\n${inquiry.description || ''}\n`;
}
