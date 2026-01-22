// api/lib/redis.js
// Shared Redis client for all API endpoints

import { Redis } from '@upstash/redis';

// Redis.fromEnv() auto-detects either:
// - KV_REST_API_URL / KV_REST_API_TOKEN (Vercel Marketplace)
// - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (direct)
export const redis = Redis.fromEnv();
