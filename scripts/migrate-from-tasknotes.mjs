#!/usr/bin/env node
// scripts/migrate-from-tasknotes.mjs
// One-time migration from TaskNotes vault to LifeRPG API
//
// Usage:
//   VAULT_PATH="/path/to/vault" API_URL="http://localhost:3000" node scripts/migrate-from-tasknotes.mjs
//
// Options:
//   --dry-run    Preview migration without writing to API
//   --verbose    Show detailed output

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

// Configuration
const VAULT_PATH = process.env.VAULT_PATH;
const API_URL = process.env.API_URL || 'http://localhost:3000';
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Directories relative to vault
const TASKS_DIR = 'TaskNotes/Tasks';
const QUESTS_DIR = 'TaskNotes/Quests';

/**
 * Map old status values to new Experiments ontology
 */
function mapStatus(status) {
  const statusMap = {
    pending: 'designed',
    'in-progress': 'running',
    'in_progress': 'running',
    completed: 'concluded',
    done: 'concluded',
    archived: 'abandoned',
    abandoned: 'abandoned',
    // Pass through new values
    designed: 'designed',
    running: 'running',
    concluded: 'concluded',
  };
  return statusMap[status?.toLowerCase()] || 'designed';
}

/**
 * Parse a task/experiment markdown file
 */
function parseTaskFile(content, filename) {
  const { data, content: body } = matter(content);

  return {
    // Use filename without extension as ID (lowercase, dashes)
    id: filename.replace('.md', '').toLowerCase().replace(/\s+/g, '-'),

    // Core identity - support both old and new keys
    hypothesis: data.hypothesis || data.title || filename.replace('.md', ''),
    title: data.title || data.hypothesis || filename.replace('.md', ''), // Keep for backwards compat

    // Status mapping
    status: mapStatus(data.status),

    // Energy/priority
    energyRequired: data.energyRequired || data.priority || 3,
    priority: data.priority || data.energyRequired || 3, // Keep for backwards compat
    timeboxed: data.timeboxed || data.estimatedMinutes || data.timeEstimate || 0,

    // Conditions (new) or blockedBy (old)
    conditions: data.conditions || [],
    blockedBy: data.blockedBy || [],

    // Quest/Inquiry references
    inquiryIds: data.inquiryIds || data.questIds || data.projects || [],
    questIds: data.questIds || data.inquiryIds || data.projects || [], // Keep for backwards compat

    // Findings
    findings: data.findings || '',
    outcome: data.outcome || null,

    // Notes
    notes: body.trim(),

    // Metadata
    tags: data.tags || [],
    createdAt: data.createdAt || data.created || new Date().toISOString(),
    updatedAt: data.updatedAt || data.updated || new Date().toISOString(),

    // Position (if stored)
    position: data.position || { x: 0, y: 0 },
    pinned: data.pinned || false,
  };
}

/**
 * Parse a quest/inquiry markdown file
 */
function parseQuestFile(content, filename) {
  const { data, content: body } = matter(content);

  return {
    id: filename.replace('.md', '').toLowerCase().replace(/\s+/g, '-'),

    // Core identity
    question: data.question || data.title || filename.replace('.md', ''),
    title: data.title || data.question || filename.replace('.md', ''),
    description: data.description || body.trim(),

    // Status
    status: data.status || 'active',

    // Key findings
    keyFindings: data.keyFindings || [],

    // Related experiments/tasks
    experimentIds: data.experimentIds || data.taskIds || [],
    taskIds: data.taskIds || data.experimentIds || [],

    // Rewards
    xpReward: data.xpReward || 100,

    // Visual
    color: data.color || null,

    // Metadata
    tags: data.tags || [],
    createdAt: data.createdAt || data.created || new Date().toISOString(),
  };
}

/**
 * Read all markdown files from a directory
 */
async function readMarkdownFiles(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const results = [];
    for (const file of mdFiles) {
      const content = await fs.readFile(path.join(dirPath, file), 'utf-8');
      results.push({ filename: file, content });
    }
    return results;
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`Directory not found: ${dirPath}`);
      return [];
    }
    throw err;
  }
}

/**
 * POST data to API
 */
async function postToApi(endpoint, data) {
  if (DRY_RUN) {
    if (VERBOSE) {
      console.log(`[DRY RUN] Would POST to ${endpoint}:`, JSON.stringify(data, null, 2));
    }
    return { ok: true, dry: true };
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('='.repeat(60));
  console.log('TaskNotes → LifeRPG Migration');
  console.log('='.repeat(60));
  console.log(`Vault: ${VAULT_PATH}`);
  console.log(`API: ${API_URL}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log('');

  if (!VAULT_PATH) {
    console.error('ERROR: VAULT_PATH environment variable required');
    console.error('Usage: VAULT_PATH="/path/to/vault" node scripts/migrate-from-tasknotes.mjs');
    process.exit(1);
  }

  // Migrate Tasks → Experiments
  console.log('--- Migrating Tasks/Experiments ---');
  const tasksDir = path.join(VAULT_PATH, TASKS_DIR);
  const taskFiles = await readMarkdownFiles(tasksDir);
  console.log(`Found ${taskFiles.length} task files`);

  let tasksMigrated = 0;
  let tasksErrors = 0;

  for (const { filename, content } of taskFiles) {
    try {
      const task = parseTaskFile(content, filename);
      if (VERBOSE) {
        console.log(`  Migrating: ${filename} → ${task.hypothesis}`);
      }
      await postToApi('/api/experiments', task);
      tasksMigrated++;
    } catch (err) {
      console.error(`  ERROR: ${filename}: ${err.message}`);
      tasksErrors++;
    }
  }

  console.log(`Tasks: ${tasksMigrated} migrated, ${tasksErrors} errors`);
  console.log('');

  // Migrate Quests → Inquiries
  console.log('--- Migrating Quests/Inquiries ---');
  const questsDir = path.join(VAULT_PATH, QUESTS_DIR);
  const questFiles = await readMarkdownFiles(questsDir);
  console.log(`Found ${questFiles.length} quest files`);

  let questsMigrated = 0;
  let questsErrors = 0;

  for (const { filename, content } of questFiles) {
    try {
      const quest = parseQuestFile(content, filename);
      if (VERBOSE) {
        console.log(`  Migrating: ${filename} → ${quest.question || quest.title}`);
      }
      await postToApi('/api/inquiries', quest);
      questsMigrated++;
    } catch (err) {
      console.error(`  ERROR: ${filename}: ${err.message}`);
      questsErrors++;
    }
  }

  console.log(`Quests: ${questsMigrated} migrated, ${questsErrors} errors`);
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log('Migration Complete');
  console.log('='.repeat(60));
  console.log(`Tasks/Experiments: ${tasksMigrated}/${taskFiles.length}`);
  console.log(`Quests/Inquiries: ${questsMigrated}/${questFiles.length}`);

  if (DRY_RUN) {
    console.log('');
    console.log('This was a dry run. Run without --dry-run to actually migrate.');
  }
}

// Run migration
migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
