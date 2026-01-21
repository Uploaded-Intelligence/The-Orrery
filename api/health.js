// api/health.js
// Validate Upstash Redis connectivity
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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
