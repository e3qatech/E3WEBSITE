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
    retryStrategy(times) {
      if (times > 3) return null; // stop retrying after 3 times
      return Math.min(times * 50, 2000);
    }
  });

if (!globalForRedis.redis) {
  redis.on('error', (err) => {
    console.warn('[REDIS_ERROR] Redis connection error:', err.message);
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
