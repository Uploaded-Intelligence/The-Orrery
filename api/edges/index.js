// api/edges/index.js
// Condition edges between experiments
// "This experiment's findings enable that experiment's conditions"
import { redis } from '../lib/redis.js';
import { KEYS, createConditionEdge } from '../lib/schema.js';

export default async function handler(req, res) {
  // GET - List all edges
  if (req.method === 'GET') {
    const edges = await redis.get(KEYS.EDGES) || [];
    return res.json({ edges });
  }

  // POST - Create new edge
  if (req.method === 'POST') {
    const { source, target, condition } = req.body;

    if (!source || !target) {
      return res.status(400).json({
        error: 'Edge requires source and target experiment IDs',
      });
    }

    const edges = await redis.get(KEYS.EDGES) || [];
    const newEdge = createConditionEdge(source, target, condition);

    // Prevent duplicates
    if (!edges.find(e => e.id === newEdge.id)) {
      edges.push(newEdge);
      await redis.set(KEYS.EDGES, edges);
    }

    return res.status(201).json(newEdge);
  }

  // DELETE - Remove edge by source/target query params
  if (req.method === 'DELETE') {
    const { source, target } = req.query;

    if (!source || !target) {
      return res.status(400).json({
        error: 'Delete requires source and target query params',
      });
    }

    let edges = await redis.get(KEYS.EDGES) || [];
    const initialLength = edges.length;
    edges = edges.filter(e => !(e.source === source && e.target === target));

    if (edges.length === initialLength) {
      return res.status(404).json({ error: 'Edge not found' });
    }

    await redis.set(KEYS.EDGES, edges);
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
