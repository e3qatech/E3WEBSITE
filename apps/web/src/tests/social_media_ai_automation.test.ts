import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/social-media/auth-check', () => ({
  checkSocialAdminAuth: vi.fn(),
}));

vi.mock('@/lib/social-media/sync-engine', () => ({
  runGlobalSocialSync: vi.fn(),
}));

import { checkSocialAdminAuth } from '@/lib/social-media/auth-check';
import { runGlobalSocialSync } from '@/lib/social-media/sync-engine';
import { POST as aiCaptionPost } from '@/app/api/admin/social-media/posts/ai-caption/route';
import { GET as cronSocialSyncGet } from '@/app/api/cron/social-sync/route';

describe('Social Media Automation & AI Captions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  describe('POST /api/admin/social-media/posts/ai-caption', () => {
    it('returns 401 if unauthenticated', async () => {
      (checkSocialAdminAuth as any).mockResolvedValue({ isAuthed: false, user: null });

      const req = new NextRequest('http://localhost/api/admin/social-media/posts/ai-caption', {
        method: 'POST',
        body: JSON.stringify({ topic: 'Luxury Gala Lighting' }),
      });

      const res = await aiCaptionPost(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
    });

    it('returns 403 if user lacks MODERATE_POSTS permission', async () => {
      (checkSocialAdminAuth as any).mockResolvedValue({
        isAuthed: false,
        user: { id: 'u1', role: 'USER' },
      });

      const req = new NextRequest('http://localhost/api/admin/social-media/posts/ai-caption', {
        method: 'POST',
        body: JSON.stringify({ topic: 'Luxury Gala Lighting' }),
      });

      const res = await aiCaptionPost(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
    });

    it('returns 400 if topic is empty or under 3 characters', async () => {
      (checkSocialAdminAuth as any).mockResolvedValue({
        isAuthed: true,
        user: { id: 'admin1', role: 'SUPER_ADMIN' },
      });

      const req = new NextRequest('http://localhost/api/admin/social-media/posts/ai-caption', {
        method: 'POST',
        body: JSON.stringify({ topic: 'hi' }),
      });

      const res = await aiCaptionPost(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toMatch(/at least 3 characters/i);
    });

    it('returns high-quality bilingual captions with fallback if no Gemini key', async () => {
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_API_KEY;

      (checkSocialAdminAuth as any).mockResolvedValue({
        isAuthed: true,
        user: { id: 'admin1', role: 'ADMIN' },
      });

      const req = new NextRequest('http://localhost/api/admin/social-media/posts/ai-caption', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'National Day Drone Show Katara',
          platform: 'INSTAGRAM',
        }),
      });

      const res = await aiCaptionPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.captionEn).toContain('E3 Qatar');
      expect(json.data.captionAr).toContain('إي ثري');
      expect(Array.isArray(json.data.hashtags)).toBe(true);
      expect(json.data.hashtags.length).toBeGreaterThan(0);
    });

    it('uses Gemini API when GEMINI_API_KEY is configured', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      (checkSocialAdminAuth as any).mockResolvedValue({
        isAuthed: true,
        user: { id: 'admin1', role: 'ADMIN' },
      });

      const mockAiResponse = {
        captionEn: 'Spectacular drone swarm over Katara Cultural Village! #E3Qatar',
        captionAr: 'عرض طائرات الدرون المبهر في كتارا! #إي_ثري_قطر',
        hashtags: ['#E3Qatar', '#Katara', '#DroneShow'],
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(mockAiResponse) }],
              },
            },
          ],
        }),
      } as any);

      const req = new NextRequest('http://localhost/api/admin/social-media/posts/ai-caption', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'Spectacular drone swarm in Katara',
          platform: 'INSTAGRAM',
        }),
      });

      const res = await aiCaptionPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.captionEn).toBe(mockAiResponse.captionEn);
      expect(json.data.captionAr).toBe(mockAiResponse.captionAr);
      expect(json.data.hashtags).toEqual(mockAiResponse.hashtags);

      fetchSpy.mockRestore();
    });
  });

  describe('GET /api/cron/social-sync', () => {
    it('returns 503 if CRON_SECRET is not configured (fail closed)', async () => {
      delete process.env.CRON_SECRET;

      const req = new NextRequest('http://localhost/api/cron/social-sync', {
        method: 'GET',
      });

      const res = await cronSocialSyncGet(req);
      const json = await res.json();

      expect(res.status).toBe(503);
      expect(json.error).toMatch(/Service not configured/i);
    });

    it('returns 401 if Authorization header is missing or incorrect', async () => {
      process.env.CRON_SECRET = 'secret_cron_token_123';

      const reqNoAuth = new NextRequest('http://localhost/api/cron/social-sync', {
        method: 'GET',
      });
      const resNoAuth = await cronSocialSyncGet(reqNoAuth);
      expect(resNoAuth.status).toBe(401);

      const reqWrongAuth = new NextRequest('http://localhost/api/cron/social-sync', {
        method: 'GET',
        headers: { authorization: 'Bearer wrong_token_999' },
      });
      const resWrongAuth = await cronSocialSyncGet(reqWrongAuth);
      expect(resWrongAuth.status).toBe(401);
    });

    it('returns 200 and triggers runGlobalSocialSync with correct bearer token', async () => {
      process.env.CRON_SECRET = 'super_secret_cron_token';

      (runGlobalSocialSync as any).mockResolvedValueOnce([
        {
          accountId: 'acc-1',
          provider: 'INSTAGRAM',
          status: 'SUCCESS',
          recordsCreated: 5,
          recordsUpdated: 2,
          recordsFailed: 0,
          durationMs: 450,
        },
      ]);

      const req = new NextRequest('http://localhost/api/cron/social-sync', {
        method: 'GET',
        headers: { authorization: 'Bearer super_secret_cron_token' },
      });

      const res = await cronSocialSyncGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.summary.total).toBe(1);
      expect(json.summary.success).toBe(1);
      expect(runGlobalSocialSync).toHaveBeenCalledWith('CRON');
    });
  });
});
