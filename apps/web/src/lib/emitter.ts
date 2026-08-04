import { Emitter } from '@socket.io/redis-emitter';
import { getRedisClient } from './redis';

const globalForEmitter = globalThis as unknown as {
  emitter: Emitter | null | undefined;
};

export function getEventEmitter(): Emitter | null {
  if (globalForEmitter.emitter !== undefined) {
    return globalForEmitter.emitter;
  }

  const redisClient = getRedisClient({ mode: 'optional' });
  if (!redisClient) {
    globalForEmitter.emitter = null;
    return null;
  }

  try {
    const emitter = new Emitter(redisClient);
    if (process.env.NODE_ENV !== 'production') {
      globalForEmitter.emitter = emitter;
    }
    return emitter;
  } catch (err) {
    console.warn('[EMITTER_ERROR] Failed to initialize socket.io-redis-emitter:', err);
    globalForEmitter.emitter = null;
    return null;
  }
}

/**
 * Proxy export for backwards-compatibility.
 * Importing emitter.ts creates ZERO Redis clients or Emitters.
 */
export const emitter = new Proxy({} as Emitter, {
  get(_target, prop) {
    const inst = getEventEmitter();
    if (!inst) {
      return () => {
        console.warn(`[EMITTER] Emitter method '${String(prop)}' called but Redis emitter is unavailable.`);
      };
    }
    const val = (inst as any)[prop];
    return typeof val === 'function' ? val.bind(inst) : val;
  }
});
