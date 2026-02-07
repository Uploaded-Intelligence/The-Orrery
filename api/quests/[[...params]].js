// api/quests/[[...params]].js
// Campaign quest CRUD — optional catch-all route
// Handles both /api/quests (list/create) and /api/quests/:id (get/update/delete)
// Single file to stay within Vercel Hobby plan's 12 function limit.
import { redis } from '../_lib/redis.js';
import { KEYS, createQuest } from '../_lib/schema.js';

export default async function handler(req, res) {
  const id = req.query.params?.[0] || null;

  // ═══════════════════════════════════════════════════════════════
  // Collection routes: /api/quests
  // ═══════════════════════════════════════════════════════════════
  if (!id) {
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

    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ═══════════════════════════════════════════════════════════════
  // Single quest routes: /api/quests/:id
  // ═══════════════════════════════════════════════════════════════
  const quests = await redis.get(KEYS.QUESTS) || [];
  const index = quests.findIndex(q => q.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Quest not found' });
  }

  // GET - Single quest
  if (req.method === 'GET') {
    return res.json(quests[index]);
  }

  // PUT - Full update
  if (req.method === 'PUT') {
    quests[index] = {
      ...quests[index],
      ...req.body,
      id, // Prevent ID override
      updatedAt: new Date().toISOString(),
    };
    await redis.set(KEYS.QUESTS, quests);
    return res.json(quests[index]);
  }

  // PATCH - Partial update (handles touch_quest, momentum bumps, etc.)
  if (req.method === 'PATCH') {
    const { keyFindings, addExperiment, removeExperiment, ...updates } = req.body;

    // Handle adding experiments to quest
    if (addExperiment) {
      if (!quests[index].experimentIds.includes(addExperiment)) {
        quests[index].experimentIds.push(addExperiment);
      }
    }

    // Handle removing experiments from quest
    if (removeExperiment) {
      quests[index].experimentIds = quests[index].experimentIds.filter(
        eid => eid !== removeExperiment
      );
    }

    // Handle appending key findings (not replacing)
    if (keyFindings && Array.isArray(keyFindings)) {
      quests[index].keyFindings = [
        ...quests[index].keyFindings,
        ...keyFindings,
      ];
    }

    quests[index] = {
      ...quests[index],
      ...updates,
      id, // Prevent ID override
      updatedAt: new Date().toISOString(),
    };
    await redis.set(KEYS.QUESTS, quests);
    return res.json(quests[index]);
  }

  // DELETE - Remove quest
  if (req.method === 'DELETE') {
    quests.splice(index, 1);
    await redis.set(KEYS.QUESTS, quests);
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
