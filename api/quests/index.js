// api/quests/index.js
// List and create campaign quests
import { redis } from '../_lib/redis.js';
import { KEYS, createQuest } from '../_lib/schema.js';

export default async function handler(req, res) {
  // GET - List all quests (with optional filters)
  if (req.method === 'GET') {
    let quests = await redis.get(KEYS.QUESTS) || [];

    const { status, domain, kind, pinned } = req.query;
    if (status) quests = quests.filter(q => q.status === status);
    if (domain) quests = quests.filter(q => q.domain === domain);
    if (kind) quests = quests.filter(q => q.kind === kind);
    if (pinned !== undefined) quests = quests.filter(q => q.pinned === (pinned === 'true'));

    return res.json({ quests });
  }

  // POST - Create new quest
  if (req.method === 'POST') {
    const quests = await redis.get(KEYS.QUESTS) || [];
    const newQuest = createQuest(req.body);

    quests.push(newQuest);
    await redis.set(KEYS.QUESTS, quests);

    return res.status(201).json(newQuest);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
