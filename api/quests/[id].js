// api/quests/[id].js
// Get, update, delete single campaign quest
import { redis } from '../_lib/redis.js';
import { KEYS } from '../_lib/schema.js';

export default async function handler(req, res) {
  const { id } = req.query;
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
