// api/inquiries/index.js
// List and create inquiries (research programs)
// Inquiries are ongoing questions you're exploring - never "completed", only resting or integrated
import { redis } from '../lib/redis.js';
import { KEYS, createInquiry } from '../lib/schema.js';

export default async function handler(req, res) {
  // GET - List all inquiries
  if (req.method === 'GET') {
    const inquiries = await redis.get(KEYS.INQUIRIES) || [];
    return res.json({ inquiries });
  }

  // POST - Create new inquiry
  if (req.method === 'POST') {
    const inquiries = await redis.get(KEYS.INQUIRIES) || [];
    const newInquiry = createInquiry(req.body);

    inquiries.push(newInquiry);
    await redis.set(KEYS.INQUIRIES, inquiries);

    return res.status(201).json(newInquiry);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
