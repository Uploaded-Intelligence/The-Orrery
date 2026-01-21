// api/experiments/index.js
// List and create experiments
import { redis } from '../lib/redis.js';
import { KEYS, createExperiment } from '../lib/schema.js';

export default async function handler(req, res) {
  // GET - List all experiments
  if (req.method === 'GET') {
    const experiments = await redis.get(KEYS.EXPERIMENTS) || [];
    return res.json({ experiments });
  }

  // POST - Create new experiment
  if (req.method === 'POST') {
    const experiments = await redis.get(KEYS.EXPERIMENTS) || [];
    const newExperiment = createExperiment(req.body);

    experiments.push(newExperiment);
    await redis.set(KEYS.EXPERIMENTS, experiments);

    return res.status(201).json(newExperiment);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
