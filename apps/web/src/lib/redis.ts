import Redis from 'ioredis';
import { Emitter } from '@socket.io/redis-emitter';

// Types for the central redis abstraction
interface E3RedisGlobal {
  commandClient: Redis | undefined;
  emitterClient: Emitter | undefined;
  adapterPubClient: Redis | undefined;
  adapterSubClient: Redis | undefined;
}

const globalForRedis = globalThis as unknown as {
  e3Redis: E3RedisGlobal | undefined;
};

if (!globalForRedis.e3Redis) {
  globalForRedis.e3Redis = {
    commandClient: undefined,
    emitterClient: undefined,
    adapterPubClient: undefined,
    adapterSubClient: undefined,
  };
}

const getRedisUrl = (): string => {
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
  return redisUrl;
};

// Check if we are in a build environment
export const isBuildEnvironment = (): boolean => {
  const phase = process.env.NEXT_PHASE || '';
  const lifecycle = process.env.npm_lifecycle_event || '';
  if (phase.includes('phase-production-build') || lifecycle === 'build') {
    return true;
  }
  if (process.env.REDIS_DISABLED === 'true') {
    return true;
  }
  return false;
};

const createRedisClient = (role: string): Redis | null => {
  if (isBuildEnvironment()) {
    return null;
  }
  let state = 'connecting';
  console.log(`[Redis:${role}] Transitioning to state: ${state}`);

  const client = new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        if (state !== 'failed') {
          state = 'failed';
          console.error(`[Redis:${role}] Transitioning to state: ${state} (Max retries reached)`);
        }
        return null; // stop retrying after 3 times
      }
      return Math.min(times * 50, 2000);
    }
  });

  client.on('connect', () => {
    if (state !== 'ready') {
      state = 'ready';
      console.log(`[Redis:${role}] Transitioning to state: ${state}`);
    }
  });

  client.on('error', (err) => {
    if (state !== 'degraded' && state !== 'failed') {
      state = 'degraded';
      console.warn(`[Redis:${role}] Transitioning to state: ${state} (${err.message})`);
    }
  });

  return client;
};

export class RedisUnavailableError extends Error {
  constructor(message: string = "Redis is required for this operation but is unavailable.") {
    super(message);
    this.name = "RedisUnavailableError";
  }
}

export type RedisPolicy = 'optional' | 'required';

/**
 * Gets the singleton command client for standard Redis operations.
 * @param policy 'optional' (default) returns null in build/disabled envs. 'required' throws RedisUnavailableError.
 */
export const getRedisClient = (policy: RedisPolicy = 'optional'): Redis | null => {
  if (isBuildEnvironment()) {
    if (policy === 'required') {
      throw new RedisUnavailableError("Redis is required but environment is set to build/disabled.");
    }
    return null;
  }

  const state = globalForRedis.e3Redis!;
  if (!state.commandClient) {
    state.commandClient = createRedisClient('Command') ?? undefined;
  }

  if (policy === 'required' && !state.commandClient) {
    throw new RedisUnavailableError("Redis client could not be initialized.");
  }

  return state.commandClient || null;
};

/**
 * Gets the singleton Socket.IO emitter.
 */
export const getEventEmitter = (): Emitter | null => {
  const state = globalForRedis.e3Redis!;
  if (!state.emitterClient && !isBuildEnvironment()) {
    const client = createRedisClient('Emitter');
    if (client) {
      state.emitterClient = new Emitter(client);
    }
  }
  return state.emitterClient || null;
};

/**
 * Gets the Pub/Sub clients for the Socket.IO adapter.
 */
export const getRedisAdapterClients = (): { pubClient: Redis; subClient: Redis } | null => {
  const state = globalForRedis.e3Redis!;
  if (isBuildEnvironment()) return null;

  if (!state.adapterPubClient) {
    state.adapterPubClient = createRedisClient('AdapterPub') ?? undefined;
  }
  if (!state.adapterSubClient) {
    state.adapterSubClient = createRedisClient('AdapterSub') ?? undefined;
  }

  if (state.adapterPubClient && state.adapterSubClient) {
    return {
      pubClient: state.adapterPubClient,
      subClient: state.adapterSubClient
    };
  }
  return null;
};

/**
 * Safely shuts down all Redis connections.
 */
export const shutdownRedis = () => {
  const state = globalForRedis.e3Redis;
  if (!state) return;
  
  if (state.commandClient) {
    state.commandClient.quit();
    state.commandClient = undefined;
  }
  if (state.adapterPubClient) {
    state.adapterPubClient.quit();
    state.adapterPubClient = undefined;
  }
  if (state.adapterSubClient) {
    state.adapterSubClient.quit();
    state.adapterSubClient = undefined;
  }
  if (state.emitterClient) {
    (state.emitterClient as any).redisClient?.quit?.();
    state.emitterClient = undefined;
  }
};
