// api/vines/index.js
// Inquiry vines - organic connections between research programs
// These represent affinities between different lines of inquiry
import { redis } from '../lib/redis.js';
import { KEYS, createInquiryVine } from '../lib/schema.js';

export default async function handler(req, res) {
  // GET - List all vines
  if (req.method === 'GET') {
    const vines = await redis.get(KEYS.VINES) || [];
    return res.json({ vines });
  }

  // POST - Create new vine
  if (req.method === 'POST') {
    const { sourceInquiry, targetInquiry, strength, reason } = req.body;

    if (!sourceInquiry || !targetInquiry) {
      return res.status(400).json({
        error: 'Vine requires sourceInquiry and targetInquiry IDs',
      });
    }

    const vines = await redis.get(KEYS.VINES) || [];
    const newVine = createInquiryVine({
      sourceInquiry,
      targetInquiry,
      strength,
      reason,
    });

    // Prevent duplicates (vines are bidirectional conceptually)
    const existingVine = vines.find(
      v =>
        (v.sourceInquiry === sourceInquiry && v.targetInquiry === targetInquiry) ||
        (v.sourceInquiry === targetInquiry && v.targetInquiry === sourceInquiry)
    );

    if (!existingVine) {
      vines.push(newVine);
      await redis.set(KEYS.VINES, vines);
      return res.status(201).json(newVine);
    }

    // Return existing if already connected
    return res.json(existingVine);
  }

  // PATCH - Update vine strength/reason
  if (req.method === 'PATCH') {
    const { sourceInquiry, targetInquiry, strength, reason } = req.body;

    const vines = await redis.get(KEYS.VINES) || [];
    const index = vines.findIndex(
      v =>
        (v.sourceInquiry === sourceInquiry && v.targetInquiry === targetInquiry) ||
        (v.sourceInquiry === targetInquiry && v.targetInquiry === sourceInquiry)
    );

    if (index === -1) {
      return res.status(404).json({ error: 'Vine not found' });
    }

    if (strength !== undefined) vines[index].strength = strength;
    if (reason !== undefined) vines[index].reason = reason;

    await redis.set(KEYS.VINES, vines);
    return res.json(vines[index]);
  }

  // DELETE - Remove vine
  if (req.method === 'DELETE') {
    const { sourceInquiry, targetInquiry } = req.query;

    if (!sourceInquiry || !targetInquiry) {
      return res.status(400).json({
        error: 'Delete requires sourceInquiry and targetInquiry query params',
      });
    }

    let vines = await redis.get(KEYS.VINES) || [];
    const initialLength = vines.length;
    vines = vines.filter(
      v =>
        !(
          (v.sourceInquiry === sourceInquiry && v.targetInquiry === targetInquiry) ||
          (v.sourceInquiry === targetInquiry && v.targetInquiry === sourceInquiry)
        )
    );

    if (vines.length === initialLength) {
      return res.status(404).json({ error: 'Vine not found' });
    }

    await redis.set(KEYS.VINES, vines);
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
