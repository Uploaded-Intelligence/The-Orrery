// api/experiments/[id].js
// Get, update, delete single experiment
import { redis } from '../lib/redis.js';
import { KEYS } from '../lib/schema.js';

export default async function handler(req, res) {
  const { id } = req.query;
  const experiments = await redis.get(KEYS.EXPERIMENTS) || [];
  const index = experiments.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Experiment not found' });
  }

  // GET - Single experiment
  if (req.method === 'GET') {
    return res.json(experiments[index]);
  }

  // PUT - Update experiment
  if (req.method === 'PUT') {
    experiments[index] = {
      ...experiments[index],
      ...req.body,
      id, // Prevent ID override
      updatedAt: new Date().toISOString(),
    };
    await redis.set(KEYS.EXPERIMENTS, experiments);
    return res.json(experiments[index]);
  }

  // PATCH - Partial update (especially for status transitions)
  if (req.method === 'PATCH') {
    const { status, findings, nextExperiment } = req.body;

    // Status transition: running → concluded should prompt for findings
    if (status === 'concluded' && !experiments[index].findings && !findings) {
      return res.status(400).json({
        error: 'Concluding an experiment requires findings',
        hint: 'What did you learn?',
      });
    }

    experiments[index] = {
      ...experiments[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    await redis.set(KEYS.EXPERIMENTS, experiments);
    return res.json(experiments[index]);
  }

  // DELETE - Remove experiment
  if (req.method === 'DELETE') {
    experiments.splice(index, 1);
    await redis.set(KEYS.EXPERIMENTS, experiments);
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
