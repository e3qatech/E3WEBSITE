import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

// Initialize ioredis. Use REDIS_URL from env, or a fallback for local dev.
const envRedisUrl = process.env.REDIS_URL;

let redisUrl = (envRedisUrl || 'redis://127.0.0.1:6379')
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
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy(times) {
      if (!process.env.REDIS_URL || times > 2) return null; // stop retrying if no REDIS_URL or after 2 tries
      return Math.min(times * 50, 500);
    }
  });

redis.on('error', (err) => {
  // Silent error handler to prevent unhandled node error events in build / offline environments
  if (process.env.DEBUG) {
    console.warn('[REDIS_ERROR] Redis connection error:', err.message);
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
