import Redis from 'ioredis';

export class RedisUnavailableError extends Error {
  constructor(message: string = 'Redis service is unavailable') {
    super(message);
    this.name = 'RedisUnavailableError';
  }
}

export type RedisMode = 'disabled' | 'optional' | 'required';

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | null | undefined;
  redisErrorLogged: boolean | undefined;
};

export function isBuildMode(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.npm_lifecycle_event === 'build'
  );
}

export function getRedisClient(options?: { mode?: RedisMode }): Redis | null {
  const mode = options?.mode || 'optional';

  if (mode === 'disabled' || isBuildMode()) {
    if (mode === 'required') {
      throw new RedisUnavailableError('Redis is disabled or unavailable during build phase');
    }
    return null;
  }

  if (globalForRedis.redisClient !== undefined) {
    if (!globalForRedis.redisClient && mode === 'required') {
      throw new RedisUnavailableError('Redis connection is unavailable');
    }
    return globalForRedis.redisClient;
  }

  const rawUrl = process.env.REDIS_URL;
  if (!rawUrl) {
    globalForRedis.redisClient = null;
    if (mode === 'required') {
      throw new RedisUnavailableError('REDIS_URL environment variable is not configured');
    }
    return null;
  }

  let redisUrl = rawUrl
    .replace(/^REDIS_URL=/i, '')
    .replace(/^"|"$/g, '')
    .replace(/^'|'$/g, '');

  if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
    redisUrl = redisUrl.startsWith('//') ? 'rediss:' + redisUrl : 'rediss://' + redisUrl;
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 50, 2000);
      }
    });

    client.on('error', (err) => {
      if (!globalForRedis.redisErrorLogged) {
        console.warn('[REDIS_ERROR] Connection error:', err.message);
        globalForRedis.redisErrorLogged = true;
      }
    });

    globalForRedis.redisClient = client;
    return client;
  } catch (err: any) {
    globalForRedis.redisClient = null;
    if (!globalForRedis.redisErrorLogged) {
      console.warn('[REDIS_ERROR] Failed to construct Redis client:', err?.message);
      globalForRedis.redisErrorLogged = true;
    }
    if (mode === 'required') {
      throw new RedisUnavailableError(`Failed to connect to Redis: ${err?.message}`);
    }
    return null;
  }
}

/**
 * Proxy export for backwards-compatibility.
 * Accessing property methods lazily calls getRedisClient() on demand.
 * Importing redis.ts creates ZERO Redis instances.
 */
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getRedisClient({ mode: 'optional' });
    if (!client) {
      // If redis is unavailable and a method is called, throw or return no-op for safe handling
      if (prop === 'then') return undefined; // Promise check fallback
      return async () => {
        throw new RedisUnavailableError(`Cannot execute Redis operation '${String(prop)}': Redis client is not connected.`);
      };
    }
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  }
});
