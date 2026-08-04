import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock ioredis constructor to count instantiations
let redisConstructorCount = 0;

vi.mock('ioredis', () => {
  class MockRedis {
    on = vi.fn();
    incr = vi.fn().mockResolvedValue(1);
    expire = vi.fn().mockResolvedValue(true);
    get = vi.fn().mockResolvedValue(null);
    set = vi.fn().mockResolvedValue('OK');
    del = vi.fn().mockResolvedValue(1);

    constructor() {
      redisConstructorCount++;
    }

    duplicate() {
      redisConstructorCount++;
      return new MockRedis();
    }
  }
  return { default: MockRedis };
});

describe('Gate 02: Redis Build & Runtime Isolation', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    redisConstructorCount = 0;
    delete (globalThis as any).redisClient;
    delete (globalThis as any).redisErrorLogged;
    process.env = { ...origEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  it('1. Importing redis.ts, socket.ts, emitter.ts, and rate-limit.ts creates ZERO Redis clients at import time', async () => {
    delete process.env.REDIS_URL;

    await import('../lib/redis');
    await import('../lib/socket');
    await import('../lib/emitter');
    await import('../lib/rate-limit');

    expect(redisConstructorCount).toBe(0);
  });

  it('2. Build mode creates zero clients and throws RedisUnavailableError in required mode', async () => {
    process.env.NEXT_PHASE = 'phase-production-build';

    const { getRedisClient, RedisUnavailableError } = await import('../lib/redis');

    const clientOptional = getRedisClient({ mode: 'optional' });
    expect(clientOptional).toBeNull();
    expect(redisConstructorCount).toBe(0);

    expect(() => getRedisClient({ mode: 'required' })).toThrow(RedisUnavailableError);
    expect(redisConstructorCount).toBe(0);
  });

  it('3. Optional mode degrades safely to null when REDIS_URL is not set', async () => {
    delete process.env.REDIS_URL;

    const { getRedisClient } = await import('../lib/redis');
    const client = getRedisClient({ mode: 'optional' });

    expect(client).toBeNull();
    expect(redisConstructorCount).toBe(0);
  });

  it('4. Required mode returns typed failure (RedisUnavailableError) when Redis is unconfigured or unavailable', async () => {
    delete process.env.REDIS_URL;

    const { getRedisClient, RedisUnavailableError } = await import('../lib/redis');

    expect(() => getRedisClient({ mode: 'required' })).toThrow(RedisUnavailableError);
  });

  it('5. Singleton creates at most one client when REDIS_URL is set', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';

    const { getRedisClient } = await import('../lib/redis');

    const client1 = getRedisClient({ mode: 'optional' });
    const client2 = getRedisClient({ mode: 'optional' });

    expect(client1).not.toBeNull();
    expect(client1).toBe(client2);
    expect(redisConstructorCount).toBe(1);
  });

  it('6. Rate limiting fails closed (returns redis_unavailable) in Production when Redis is unconfigured', async () => {
    delete process.env.REDIS_URL;
    (process.env as any).NODE_ENV = 'production';
    delete process.env.VERCEL_ENV;

    const { checkRateLimit } = await import('../lib/rate-limit');
    const res = await checkRateLimit('rate_limit:test:ip', 5, 60);

    expect(res.allowed).toBe(false);
    expect(res.reason).toBe('redis_unavailable');
    expect(res.retryAfter).toBe(60);
  });

  it('7. Rate limiting allows memory fallback in Development mode', async () => {
    delete process.env.REDIS_URL;
    (process.env as any).NODE_ENV = 'development';

    const { checkRateLimit } = await import('../lib/rate-limit');
    const res1 = await checkRateLimit('rate_limit:dev_test:ip', 2, 60);
    expect(res1.allowed).toBe(true);

    const res2 = await checkRateLimit('rate_limit:dev_test:ip', 2, 60);
    expect(res2.allowed).toBe(true);

    const res3 = await checkRateLimit('rate_limit:dev_test:ip', 2, 60);
    expect(res3.allowed).toBe(false);
    expect(res3.reason).toBe('rate_limit_exceeded');
  });

  it('8. Emitter lazily gets client without import side effects', async () => {
    delete process.env.REDIS_URL;

    const { getEventEmitter } = await import('../lib/emitter');
    expect(redisConstructorCount).toBe(0);

    const emitter = getEventEmitter();
    expect(emitter).toBeNull();
  });

  it('9. Error messages do not expose raw secrets', async () => {
    process.env.REDIS_URL = 'redis://user:SECRET_PASSWORD_123@redis.local:6379';

    const { getRedisClient } = await import('../lib/redis');
    const client = getRedisClient({ mode: 'optional' });

    expect(client).not.toBeNull();
  });
});
