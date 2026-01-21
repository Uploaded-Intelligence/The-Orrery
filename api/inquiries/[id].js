// api/inquiries/[id].js
// Get, update, delete single inquiry (research program)
import { redis } from '../lib/redis.js';
import { KEYS } from '../lib/schema.js';

export default async function handler(req, res) {
  const { id } = req.query;
  const inquiries = await redis.get(KEYS.INQUIRIES) || [];
  const index = inquiries.findIndex(i => i.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  // GET - Single inquiry with its experiments
  if (req.method === 'GET') {
    const inquiry = inquiries[index];

    // Optionally include full experiment data
    if (req.query.includeExperiments === 'true') {
      const experiments = await redis.get(KEYS.EXPERIMENTS) || [];
      const inquiryExperiments = experiments.filter(e => e.inquiryId === id);
      return res.json({ ...inquiry, experiments: inquiryExperiments });
    }

    return res.json(inquiry);
  }

  // PUT - Update inquiry
  if (req.method === 'PUT') {
    inquiries[index] = {
      ...inquiries[index],
      ...req.body,
      id, // Prevent ID override
      updatedAt: new Date().toISOString(),
    };
    await redis.set(KEYS.INQUIRIES, inquiries);
    return res.json(inquiries[index]);
  }

  // PATCH - Partial update (especially for status transitions and adding findings)
  if (req.method === 'PATCH') {
    const { status, keyFindings, addExperiment, removeExperiment } = req.body;

    // Handle adding/removing experiments from inquiry
    if (addExperiment) {
      if (!inquiries[index].experimentIds.includes(addExperiment)) {
        inquiries[index].experimentIds.push(addExperiment);
      }
    }

    if (removeExperiment) {
      inquiries[index].experimentIds = inquiries[index].experimentIds.filter(
        eid => eid !== removeExperiment
      );
    }

    // Handle adding key findings (accumulated learnings)
    if (keyFindings && Array.isArray(keyFindings)) {
      inquiries[index].keyFindings = [
        ...inquiries[index].keyFindings,
        ...keyFindings,
      ];
    }

    // Status transition: active → integrated should have key findings
    if (status === 'integrated' && inquiries[index].keyFindings.length === 0) {
      return res.status(400).json({
        error: 'Integrating an inquiry requires at least one key finding',
        hint: 'What wisdom emerged from this line of inquiry?',
      });
    }

    inquiries[index] = {
      ...inquiries[index],
      ...req.body,
      // Don't override keyFindings if we just added to them
      keyFindings: inquiries[index].keyFindings,
      updatedAt: new Date().toISOString(),
    };
    await redis.set(KEYS.INQUIRIES, inquiries);
    return res.json(inquiries[index]);
  }

  // DELETE - Remove inquiry (orphans experiments, they keep their inquiryId as historical reference)
  if (req.method === 'DELETE') {
    inquiries.splice(index, 1);
    await redis.set(KEYS.INQUIRIES, inquiries);
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
