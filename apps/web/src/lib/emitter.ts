import { Emitter } from '@socket.io/redis-emitter';
import Redis from 'ioredis';

let redisUrl = (process.env.REDIS_URL || 'redis://localhost:6379')
  .replace(/^REDIS_URL=/i, '')
  .replace(/^"|"$/g, '')
  .replace(/^'|'$/g, '');

if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
  redisUrl = redisUrl.startsWith('//') ? 'rediss:' + redisUrl : 'rediss://' + redisUrl;
}

const redisClient = new Redis(redisUrl);

// Global emitter instance for API routes
const globalForEmitter = globalThis as unknown as {
  emitter: Emitter | undefined;
};

export const emitter = globalForEmitter.emitter ?? new Emitter(redisClient);

if (process.env.NODE_ENV !== 'production') globalForEmitter.emitter = emitter;
