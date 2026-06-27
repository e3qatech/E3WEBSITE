import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

// Initialize ioredis. Use REDIS_URL from env, or a fallback for local dev.
let redisUrl = (process.env.REDIS_URL || 'redis://localhost:6379')
  .replace(/^REDIS_URL=/i, '')
  .replace(/^"|"$/g, '')
  .replace(/^'|'$/g, '');

if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
  if (redisUrl.startsWith('//')) {
    redisUrl = 'rediss:' + redisUrl;
  } else {
    redisUrl = 'rediss://' + redisUrl;
  }
}

export const redis =
  globalForRedis.redis ??
  new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
