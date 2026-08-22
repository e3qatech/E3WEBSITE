import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Redis module for deterministic testing
const mockRedisIncr = vi.fn();
const mockRedisExpire = vi.fn();
vi.mock('@/lib/redis', () => ({
  redis: {
    incr: (...args: any[]) => mockRedisIncr(...args),
    expire: (...args: any[]) => mockRedisExpire(...args),
  },
}));

// Mock body limit to pass cleanly
vi.mock('@/lib/body-limit', () => ({
  enforceBodyLimit: vi.fn().mockReturnValue(null),
}));

import { rateLimit } from '@/lib/rate-limit';
import { POST as postChat } from '@/app/api/chat/route';

describe('Chat & Redis Rate Limiter VERCEL_ENV Preview Fix Suite', () => {
  const originalVercelEnv = process.env.VERCEL_ENV;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalGeminiKey = process.env.GEMINI_API_KEY;
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  const originalGoogleAiKey = process.env.GOOGLE_AI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VERCEL_ENV;
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GOOGLE_AI_API_KEY;
  });

  afterEach(() => {
    process.env.VERCEL_ENV = originalVercelEnv;
    (process.env as any).NODE_ENV = originalNodeEnv;
    if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey;
    if (originalOpenAiKey) process.env.OPENAI_API_KEY = originalOpenAiKey;
    if (originalGoogleAiKey) process.env.GOOGLE_AI_API_KEY = originalGoogleAiKey;
  });

  describe('1. Vercel Preview + Redis Unavailable', () => {
    it('uses bounded in-memory rate limiting in Vercel Preview even when NODE_ENV is production', async () => {
      process.env.VERCEL_ENV = 'preview';
      (process.env as any).NODE_ENV = 'production';

      // Simulate Redis being completely offline / throwing error
      mockRedisIncr.mockRejectedValue(new Error('Connection refused: Redis is offline'));

      const testIp = `test-preview-ip-${Date.now()}`;
      const limit = 3;

      // First 3 requests should be PERMITTED by bounded in-memory limiter
      for (let i = 1; i <= limit; i++) {
        const result = await rateLimit(`rate_limit:chat:${testIp}`, limit, 60, false);
        expect(result.success).toBe(true);
      }

      // 4th request exceeds the limit -> should be BLOCKED with RATE_LIMIT_EXCEEDED
      const blockedResult = await rateLimit(`rate_limit:chat:${testIp}`, limit, 60, false);
      expect(blockedResult.success).toBe(false);
      expect(blockedResult.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(blockedResult.error).toContain('Too many requests');
    });
  });

  describe('2. Actual Vercel Production + Redis Unavailable', () => {
    it('remains strictly fail-closed and returns RATE_LIMIT_SERVICE_UNAVAILABLE (503)', async () => {
      process.env.VERCEL_ENV = 'production';
      (process.env as any).NODE_ENV = 'production';

      // Simulate Redis being offline in real production
      mockRedisIncr.mockRejectedValue(new Error('Redis connection timeout in prod'));

      const testIp = `test-prod-ip-${Date.now()}`;
      const result = await rateLimit(`rate_limit:chat:${testIp}`, 15, 60, false);

      expect(result.success).toBe(false);
      expect(result.code).toBe('RATE_LIMIT_SERVICE_UNAVAILABLE');
      expect(result.isBackendUnavailable).toBe(true);
    });

    it('causes /api/chat to return HTTP 503 when rate-limit backend is unavailable in production', async () => {
      process.env.VERCEL_ENV = 'production';
      (process.env as any).NODE_ENV = 'production';
      mockRedisIncr.mockRejectedValue(new Error('Redis offline'));

      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.195',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'What attractions are open today?' }],
          locale: 'en',
        }),
      });

      const res = await postChat(req);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.code).toBe('RATE_LIMIT_SERVICE_UNAVAILABLE');
    });
  });

  describe('3. Redis Available Operation', () => {
    it('uses Redis incr and expire when Redis is healthy and available', async () => {
      process.env.VERCEL_ENV = 'production';
      (process.env as any).NODE_ENV = 'production';

      mockRedisIncr.mockResolvedValueOnce(1);
      mockRedisExpire.mockResolvedValueOnce('OK');

      const testKey = 'rate_limit:chat:healthy-ip';
      const result = await rateLimit(testKey, 15, 60, false);

      expect(mockRedisIncr).toHaveBeenCalledWith(testKey);
      expect(mockRedisExpire).toHaveBeenCalledWith(testKey, 60);
      expect(result.success).toBe(true);
    });

    it('returns RATE_LIMIT_EXCEEDED when Redis counter exceeds limit', async () => {
      process.env.VERCEL_ENV = 'production';
      (process.env as any).NODE_ENV = 'production';

      mockRedisIncr.mockResolvedValueOnce(16); // limit is 15

      const testKey = 'rate_limit:chat:exceeded-ip';
      const result = await rateLimit(testKey, 15, 60, false);

      expect(result.success).toBe(false);
      expect(result.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(result.error).toContain('Too many requests');
    });
  });

  describe('4. /api/chat Proceeding to Provider in Preview', () => {
    it('proceeds through limiter and contacts Gemini provider in Vercel Preview with offline Redis', async () => {
      process.env.VERCEL_ENV = 'preview';
      (process.env as any).NODE_ENV = 'production';
      process.env.GEMINI_API_KEY = 'test_gemini_api_key_mock';
      mockRedisIncr.mockRejectedValue(new Error('Redis offline in preview'));

      const mockGeminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Welcome to E3 Qatar! Our main attractions include InflataRUN and InflataCity.' }],
            },
          },
        ],
      };

      const originalFetch = globalThis.fetch;
      const fetchSpy = vi.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('generativelanguage.googleapis.com')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockGeminiResponse),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });
      globalThis.fetch = fetchSpy as any;

      try {
        const req = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '198.51.100.42',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'What are the main attractions in E3 Qatar?' }],
            locale: 'en',
          }),
        });

        const res = await postChat(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.available).toBe(true);
        expect(json.reply).toContain('InflataRUN');
        expect(fetchSpy).toHaveBeenCalled();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('returns HTTP 429 when preview in-memory rate limit is exceeded (>15 requests)', async () => {
      process.env.VERCEL_ENV = 'preview';
      (process.env as any).NODE_ENV = 'production';
      mockRedisIncr.mockRejectedValue(new Error('Redis offline in preview'));

      const spamIp = `spam-preview-ip-${Date.now()}`;

      for (let i = 0; i < 15; i++) {
        const req = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': spamIp,
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello' }],
            locale: 'en',
          }),
        });
        await postChat(req);
      }

      // 16th request should hit the 15 req/min in-memory limiter and return 429
      const reqBlocked = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': spamIp,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello again' }],
          locale: 'en',
        }),
      });

      const resBlocked = await postChat(reqBlocked);
      expect(resBlocked.status).toBe(429);
      const json = await resBlocked.json();
      expect(json.error).toContain('Too many requests');
    });
  });
});
