// api/health.js
// Validate Upstash Redis connectivity
import { redis } from './lib/redis.js';

export default async function handler(req, res) {
  try {
    const timestamp = Date.now();
    await redis.set('health-check', { timestamp, source: 'orrery-api' });
    const value = await redis.get('health-check');

    res.json({
      ok: true,
      value,
      latency: Date.now() - timestamp,
    });
  } catch (e) {
    console.error('Health check failed:', e);
    res.status(500).json({
      ok: false,
      error: e.message,
    });
  }
}
