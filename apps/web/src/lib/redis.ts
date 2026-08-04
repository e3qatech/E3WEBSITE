import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: any;
};

// Create a dummy no-op Redis proxy when REDIS_URL is absent or during build/offline phases
const createMockRedis = () => {
  const mock: any = new Proxy({}, {
    get(_target, prop) {
      if (prop === 'on' || prop === 'once' || prop === 'removeListener') {
        return () => mock;
      }
      if (prop === 'quit' || prop === 'disconnect') {
        return async () => 'OK';
      }
      if (prop === 'status') return 'end';
      return async () => null;
    }
  });
  return mock;
};

const hasRedisEnv = Boolean(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL);

let redisUrl = (process.env.REDIS_URL || '')
  .replace(/^REDIS_URL=/i, '')
  .replace(/^"|"$/g, '')
  .replace(/^'|'$/g, '');

if (redisUrl && !redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
  if (redisUrl.startsWith('//')) {
    redisUrl = 'rediss:' + redisUrl;
  } else {
    redisUrl = 'rediss://' + redisUrl;
  }
}

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
const isLocalhostRedis = redisUrl.includes('127.0.0.1') || redisUrl.includes('localhost');
const isProduction = process.env.NODE_ENV === 'production';

let redisClient: any;

// Use mock client during Next.js static build phase or if pointing to localhost in production build environment
if (hasRedisEnv && !isBuildPhase && !(isProduction && isLocalhostRedis)) {
  redisClient =
    globalForRedis.redis ??
    new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 2) return null;
        return Math.min(times * 50, 500);
      }
    });

  redisClient.on('error', (err: any) => {
    if (process.env.DEBUG) {
      console.warn('[REDIS_ERROR] Redis connection error:', err.message);
    }
  });
} else {
  redisClient = createMockRedis();
}

export const redis = redisClient;

if (process.env.NODE_ENV !== 'production' && hasRedisEnv && !isBuildPhase) {
  globalForRedis.redis = redisClient;
}
