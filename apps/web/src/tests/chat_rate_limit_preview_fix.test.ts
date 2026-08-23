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
import { POST as postChat, resolveGeminiTextModel } from '@/app/api/chat/route';

describe('Chat & Redis Rate Limiter VERCEL_ENV Preview Fix Suite', () => {
  const originalVercelEnv = process.env.VERCEL_ENV;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalGeminiKey = process.env.GEMINI_API_KEY;
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  const originalGoogleAiKey = process.env.GOOGLE_AI_API_KEY;
  const originalGeminiModel = process.env.GEMINI_MODEL;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VERCEL_ENV;
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GOOGLE_AI_API_KEY;
    delete process.env.GEMINI_MODEL;
  });

  afterEach(() => {
    process.env.VERCEL_ENV = originalVercelEnv;
    (process.env as any).NODE_ENV = originalNodeEnv;
    if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey;
    if (originalOpenAiKey) process.env.OPENAI_API_KEY = originalOpenAiKey;
    if (originalGoogleAiKey) process.env.GOOGLE_AI_API_KEY = originalGoogleAiKey;
    if (originalGeminiModel) process.env.GEMINI_MODEL = originalGeminiModel;
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
        expect(fetchSpy).toHaveBeenCalledTimes(1);
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

  describe('5. Gemini Model Selection & Resilient Fallback Enforcement', () => {
    it('defaults model to gemini-2.0-flash when GEMINI_MODEL is unset', () => {
      expect(resolveGeminiTextModel()).toBe('gemini-2.0-flash');
      expect(resolveGeminiTextModel(undefined)).toBe('gemini-2.0-flash');
      expect(resolveGeminiTextModel('')).toBe('gemini-2.0-flash');
    });

    it('rejects TTS, live, audio, image, embedding, and non-existent version models and falls back to gemini-2.0-flash', () => {
      expect(resolveGeminiTextModel('gemini-2.5-flash-preview-tts')).toBe('gemini-2.0-flash');
      expect(resolveGeminiTextModel('gemini-2.5-flash-tts')).toBe('gemini-2.0-flash');
      expect(resolveGeminiTextModel('gemini-2.5-flash')).toBe('gemini-2.0-flash');
      expect(resolveGeminiTextModel('gemini-3.6-flash')).toBe('gemini-2.0-flash');
      expect(resolveGeminiTextModel('gemini-live-2.0')).toBe('gemini-2.0-flash');
      expect(resolveGeminiTextModel('gemini-audio-preview')).toBe('gemini-2.0-flash');
      expect(resolveGeminiTextModel('imagen-3.0-generate')).toBe('gemini-2.0-flash');
      expect(resolveGeminiTextModel('text-embedding-004')).toBe('gemini-2.0-flash');
    });

    it('makes upstream fetch with sanitized model string and returns candidate reply', async () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.GEMINI_API_KEY = 'test_gemini_api_key_mock';
      process.env.GEMINI_MODEL = 'gemini-2.5-flash-preview-tts'; // Should be sanitized to gemini-2.0-flash

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'E3 Qatar has amazing attractions.' }] } }],
        }),
      });
      const originalFetch = globalThis.fetch;
      globalThis.fetch = fetchSpy as any;

      try {
        const req = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '198.51.100.99',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Tell me about E3' }],
            locale: 'en',
          }),
        });

        const res = await postChat(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.available).toBe(true);
        expect(json.reply).toBe('E3 Qatar has amazing attractions.');

        // Upstream fetch called with sanitized model
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const calledUrl = fetchSpy.mock.calls[0][0];
        expect(calledUrl).toContain('/models/gemini-2.0-flash:generateContent');
        expect(calledUrl).not.toContain('tts');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('falls back to next candidate model if first model returns 404 or 400', async () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.GEMINI_API_KEY = 'test_gemini_api_key_mock';
      process.env.GEMINI_MODEL = 'gemini-custom-experiment';

      let callCount = 0;
      const fetchSpy = vi.fn().mockImplementation((url: string) => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: { message: 'Model not found' } }),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Fallback model response.' }] } }],
          }),
        });
      });
      const originalFetch = globalThis.fetch;
      globalThis.fetch = fetchSpy as any;

      try {
        const req = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '198.51.100.101',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello' }],
            locale: 'en',
          }),
        });

        const res = await postChat(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.available).toBe(true);
        expect(json.reply).toBe('Fallback model response.');
        expect(callCount).toBeGreaterThanOrEqual(2);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('returns clean generic fallback without exposing providerError or internal details to browser on 429/500', async () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.GEMINI_API_KEY = 'test_gemini_api_key_mock';

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({
          error: { message: 'Quota exceeded for project 123456789. Rate limit reached.' },
        }),
      });
      const originalFetch = globalThis.fetch;
      globalThis.fetch = fetchSpy as any;

      try {
        const req = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '198.51.100.100',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello' }],
            locale: 'en',
          }),
        });

        const res = await postChat(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.available).toBe(false);
        expect(json.message).toBe('Chat is temporarily unavailable. Please use our contact form.');
        expect(json.escalationUrl).toBe('/en/b2c/contact');
        // Crucial security/cleanliness assertions:
        expect(json.providerError).toBeUndefined();
        expect(json.upstreamStatus).toBeUndefined();
        expect(json.error).toBeUndefined();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
