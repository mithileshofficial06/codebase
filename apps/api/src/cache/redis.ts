import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('Redis not configured — caching disabled');
    return null;
  }

  try {
    redis = new Redis({ url, token });
    return redis;
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    return null;
  }
}

const KEY_PREFIX = 'codemap:repo:';
const DEFAULT_TTL = 3600; // 1 hour

export async function getCache(repoUrl: string): Promise<any | null> {
  const client = getRedis();
  if (!client) return null;

  try {
    const key = KEY_PREFIX + encodeURIComponent(repoUrl);
    const data = await client.get(key);
    return data || null;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
}

export async function setCache(repoUrl: string, value: any, ttl = DEFAULT_TTL): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    const key = KEY_PREFIX + encodeURIComponent(repoUrl);
    await client.set(key, value, { ex: ttl });
  } catch (error) {
    console.error('Redis SET error:', error);
  }
}
