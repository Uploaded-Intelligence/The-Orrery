// api/webhook/github.js
// GitHub Webhook Handler for Vault → API Sync
// Receives push events when Obsidian vault is committed

import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature if secret is configured
  if (process.env.GITHUB_WEBHOOK_SECRET) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }

    const body = JSON.stringify(req.body);
    const expected = `sha256=${crypto
      .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')}`;

    if (signature !== expected) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  const { commits, repository } = req.body;

  if (!commits || commits.length === 0) {
    return res.json({ ok: true, message: 'No commits to process' });
  }

  // Log the push event
  console.log(`[Webhook] GitHub push received from ${repository?.full_name}`);
  console.log(`[Webhook] ${commits.length} commit(s) to process`);

  // Extract files that were added or modified
  const changedFiles = new Set();
  for (const commit of commits) {
    for (const file of [...(commit.added || []), ...(commit.modified || [])]) {
      changedFiles.add(file);
    }
  }

  // Filter for experiment/task markdown files
  // Expected paths: TaskNotes/Tasks/*.md or similar
  const experimentFiles = [...changedFiles].filter(
    (f) => f.endsWith('.md') && (f.includes('Tasks/') || f.includes('Experiments/'))
  );

  const inquiryFiles = [...changedFiles].filter(
    (f) => f.endsWith('.md') && (f.includes('Quests/') || f.includes('Inquiries/'))
  );

  console.log(`[Webhook] Found ${experimentFiles.length} experiment file(s)`);
  console.log(`[Webhook] Found ${inquiryFiles.length} inquiry file(s)`);

  // For now, just queue the sync request
  // The actual parsing will be done by vault-parser.js
  // TODO: Implement full sync (requires fetching file contents from GitHub API)

  await redis.set('webhook:last-push', {
    timestamp: new Date().toISOString(),
    repository: repository?.full_name,
    commitCount: commits.length,
    experimentFiles,
    inquiryFiles,
    status: 'queued',
  });

  res.json({
    ok: true,
    message: 'Push event received',
    filesDetected: {
      experiments: experimentFiles.length,
      inquiries: inquiryFiles.length,
    },
  });
}
