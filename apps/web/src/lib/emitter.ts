import { Emitter } from '@socket.io/redis-emitter';
import Redis from 'ioredis';

let redisUrl = (process.env.REDIS_URL || 'redis://localhost:6379')
  .replace(/^REDIS_URL=/i, '')
  .replace(/^"|"$/g, '')
  .replace(/^'|'$/g, '');

if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
  redisUrl = redisUrl.startsWith('//') ? 'rediss:' + redisUrl : 'rediss://' + redisUrl;
}

const hasRedis = Boolean(process.env.REDIS_URL && !process.env.REDIS_URL.includes('localhost'));

const createMockEmitter = () => {
  return new Proxy({}, {
    get() {
      return () => createMockEmitter();
    }
  }) as unknown as Emitter;
};

let redisClient: any;
let emitterInstance: Emitter;

if (hasRedis) {
  redisClient = new Redis(redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });
  redisClient.on('error', () => {});
  emitterInstance = new Emitter(redisClient);
} else {
  emitterInstance = createMockEmitter();
}

// Global emitter instance for API routes
const globalForEmitter = globalThis as unknown as {
  emitter: Emitter | undefined;
};

export const emitter = globalForEmitter.emitter ?? emitterInstance;

if (process.env.NODE_ENV !== 'production') globalForEmitter.emitter = emitter;
