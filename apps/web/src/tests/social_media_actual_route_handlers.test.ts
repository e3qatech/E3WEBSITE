import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock auth module dynamically
let mockSession: any = null;
vi.mock('@/lib/auth', () => ({
  auth: () => Promise.resolve(mockSession),
}));

// Mock db module
vi.mock('@/lib/db', () => ({
  default: {
    socialAccount: {
      findMany: vi.fn().mockResolvedValue([{ id: 'acc_1', provider: 'META_INSTAGRAM', status: 'CONNECTED', encryptedData: 'SECRET_DATA_RAW' }]),
      findUnique: vi.fn().mockResolvedValue({ id: 'acc_1', provider: 'META_INSTAGRAM', status: 'CONNECTED', encryptedData: 'SECRET_DATA_RAW' }),
      create: vi.fn().mockResolvedValue({ id: 'acc_1' }),
      delete: vi.fn().mockResolvedValue({ id: 'acc_1' }),
      count: vi.fn().mockResolvedValue(1),
    },
    socialProviderConfig: {
      findMany: vi.fn().mockResolvedValue([{ id: 'prov_1', provider: 'META_INSTAGRAM', enabled: true, appId: 'app_1', apiVersion: 'v21.0', updatedAt: new Date(), appSecret: 'SECRET_APP_KEY' }]),
      findUnique: vi.fn().mockResolvedValue({ id: 'prov_1', provider: 'META_INSTAGRAM', enabled: true, appId: 'app_1', apiVersion: 'v21.0', updatedAt: new Date(), appSecret: 'SECRET_APP_KEY' }),
      upsert: vi.fn().mockResolvedValue({ id: 'prov_1' }),
    },
    socialFeed: {
      findMany: vi.fn().mockResolvedValue([{ id: 'feed_1', name: 'Main Feed' }]),
      findUnique: vi.fn().mockResolvedValue({ id: 'feed_1', name: 'Main Feed', isEnabled: true }),
      create: vi.fn().mockResolvedValue({ id: 'feed_1' }),
      update: vi.fn().mockResolvedValue({ id: 'feed_1' }),
      delete: vi.fn().mockResolvedValue({ id: 'feed_1' }),
      count: vi.fn().mockResolvedValue(1),
    },
    socialPost: {
      findMany: vi.fn().mockResolvedValue([{ id: 'post_1', captionEn: 'Test Post' }]),
      findUnique: vi.fn().mockResolvedValue({ id: 'post_1', captionEn: 'Test Post' }),
      update: vi.fn().mockResolvedValue({ id: 'post_1' }),
      count: vi.fn().mockResolvedValue(1),
    },
    socialPlacement: {
      findMany: vi.fn().mockResolvedValue([{ id: 'place_1', location: 'B2C_HERO' }]),
      upsert: vi.fn().mockResolvedValue({ id: 'place_1' }),
      delete: vi.fn().mockResolvedValue({ id: 'place_1' }),
    },
    socialGlobalSettings: {
      findUnique: vi.fn().mockResolvedValue({ id: 'default', autoApprove: false }),
      findFirst: vi.fn().mockResolvedValue({ id: 'default', autoApprove: false }),
      create: vi.fn().mockResolvedValue({ id: 'default', autoApprove: false }),
      upsert: vi.fn().mockResolvedValue({ id: 'default', autoApprove: false }),
    },
    socialAuditLog: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 'log_1' }),
      count: vi.fn().mockResolvedValue(0),
    },
    socialSyncJob: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    socialSyncError: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    socialSyncLock: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'lock_1' }),
      delete: vi.fn().mockResolvedValue({ id: 'lock_1' }),
    },
  },
}));

// Import actual route handlers
import { GET as getAccounts, POST as postAccounts, DELETE as deleteAccounts } from '../app/api/admin/social-media/accounts/route';
import { GET as getProviders, POST as postProviders } from '../app/api/admin/social-media/providers/route';
import { GET as getFeeds, POST as postFeeds, PUT as putFeeds, DELETE as deleteFeeds } from '../app/api/admin/social-media/feeds/route';
import { GET as getPosts, POST as postPosts, PATCH as patchPosts } from '../app/api/admin/social-media/posts/route';
import { POST as fetchLinkPost } from '../app/api/admin/social-media/posts/fetch-link/route';
import { GET as getPlacements, POST as postPlacements, DELETE as deletePlacements } from '../app/api/admin/social-media/placements/route';
import { POST as runSync } from '../app/api/admin/social-media/sync/route';
import { GET as getSettings, PUT as putSettings } from '../app/api/admin/social-media/settings/route';
import { GET as getDiagnostics } from '../app/api/admin/social-media/diagnostics/route';
import { GET as getCronSync } from '../app/api/cron/social-sync/route';
import { GET as getPublicFeed } from '../app/api/social-media/feeds/[feedId]/route';

describe('Actual Social Media Manager Route Handlers Verification', () => {

  const testRoles = [
    { role: 'UNAUTHENTICATED', session: null },
    { role: 'SUPER_ADMIN', session: { user: { id: 'u1', role: 'SUPER_ADMIN' } } },
    { role: 'CONTENT_MANAGER', session: { user: { id: 'u2', role: 'CONTENT_MANAGER' } } },
    { role: 'INTEGRATION_MANAGER', session: { user: { id: 'u3', role: 'INTEGRATION_MANAGER' } } },
    { role: 'EDITOR', session: { user: { id: 'u4', role: 'EDITOR' } } },
    { role: 'STAFF', session: { user: { id: 'u5', role: 'STAFF' } } },
    { role: 'VIEWER', session: { user: { id: 'u6', role: 'VIEWER' } } },
  ];

  function buildReq(url: string, method = 'GET', body?: any, headers?: Record<string, string>) {
    return new NextRequest(new URL(url, 'http://localhost'), {
      method,
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async function assertNoSecretsInResponse(res: Response) {
    const text = await res.text();
    expect(text).not.toContain('SECRET_DATA_RAW');
    expect(text).not.toContain('SECRET_APP_KEY');
    expect(text).not.toContain('DATABASE_URL');
    expect(text).not.toContain('SOCIAL_CREDENTIALS_ENCRYPTION_KEY');
  }

  describe('Route: /api/admin/social-media/accounts', () => {
    for (const { role, session } of testRoles) {
      it(`GET /accounts handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/accounts');
        const res = await getAccounts(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else expect(res.status).toBe(200);
        await assertNoSecretsInResponse(res);
      });

      it(`POST /accounts handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/accounts', 'POST', { provider: 'META_INSTAGRAM', authCode: 'test_code' });
        const res = await postAccounts(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (['SUPER_ADMIN', 'INTEGRATION_MANAGER'].includes(role)) expect([200, 201, 400, 500]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });

      it(`DELETE /accounts handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/accounts?id=acc_1', 'DELETE');
        const res = await deleteAccounts(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (['SUPER_ADMIN', 'INTEGRATION_MANAGER'].includes(role)) expect([200, 400, 500]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });
    }
  });

  describe('Route: /api/admin/social-media/providers', () => {
    for (const { role, session } of testRoles) {
      it(`GET /providers handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/providers');
        const res = await getProviders(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else expect(res.status).toBe(200);
        await assertNoSecretsInResponse(res);
      });

      it(`POST /providers handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/providers', 'POST', { provider: 'META_INSTAGRAM', appId: 'app_123' });
        const res = await postProviders(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (['SUPER_ADMIN', 'INTEGRATION_MANAGER'].includes(role)) expect([200, 400]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });
    }
  });

  describe('Route: /api/admin/social-media/feeds', () => {
    for (const { role, session } of testRoles) {
      it(`GET /feeds handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/feeds');
        const res = await getFeeds(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else expect(res.status).toBe(200);
        await assertNoSecretsInResponse(res);
      });

      it(`POST /feeds handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/feeds', 'POST', { name: 'Test Feed', mode: 'AUTOMATIC' });
        const res = await postFeeds(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(role)) expect([200, 201, 400]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });

      it(`PUT /feeds handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/feeds', 'PUT', { id: 'feed_1', name: 'Updated Feed' });
        const res = await putFeeds(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(role)) expect([200, 400]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });

      it(`DELETE /feeds handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/feeds?id=feed_1', 'DELETE');
        const res = await deleteFeeds(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(role)) expect([200, 400]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });
    }
  });

  describe('Route: /api/admin/social-media/posts', () => {
    for (const { role, session } of testRoles) {
      it(`GET /posts handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/posts');
        const res = await getPosts(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else expect(res.status).toBe(200);
        await assertNoSecretsInResponse(res);
      });

      it(`POST /posts handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/posts', 'POST', { postId: 'post_1', moderationStatus: 'APPROVED' });
        const res = await postPosts(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (['SUPER_ADMIN', 'CONTENT_MANAGER', 'EDITOR'].includes(role)) expect([200, 400]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });

      it(`PATCH /posts handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/posts', 'PATCH', { postId: 'post_1', isPinned: true });
        const res = await patchPosts(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (['SUPER_ADMIN', 'CONTENT_MANAGER', 'EDITOR'].includes(role)) expect([200, 400]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });
    }
  });

  describe('Route: /api/admin/social-media/posts/fetch-link', () => {
    for (const { role, session } of testRoles) {
      it(`POST /posts/fetch-link handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/posts/fetch-link', 'POST', { url: 'https://instagram.com/p/123' });
        const res = await fetchLinkPost(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (['SUPER_ADMIN', 'CONTENT_MANAGER', 'EDITOR'].includes(role)) expect([200, 400, 500]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });
    }
  });

  describe('Route: /api/admin/social-media/placements', () => {
    for (const { role, session } of testRoles) {
      it(`GET /placements handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/placements');
        const res = await getPlacements(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else expect(res.status).toBe(200);
        await assertNoSecretsInResponse(res);
      });

      it(`POST /placements handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/placements', 'POST', { location: 'B2C_HERO', feedId: 'feed_1' });
        const res = await postPlacements(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(role)) expect([200, 400]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });

      it(`DELETE /placements handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/placements?location=B2C_HERO', 'DELETE');
        const res = await deletePlacements(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(role)) expect([200, 400]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });
    }
  });

  describe('Route: /api/admin/social-media/sync', () => {
    for (const { role, session } of testRoles) {
      it(`POST /sync handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/sync', 'POST', { accountId: 'acc_1' });
        const res = await runSync(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (['SUPER_ADMIN', 'CONTENT_MANAGER', 'EDITOR'].includes(role)) expect([200, 400, 409, 500]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });
    }
  });

  describe('Route: /api/admin/social-media/settings', () => {
    for (const { role, session } of testRoles) {
      it(`GET /settings handler for role: ${role}`, async () => {
        mockSession = session;
        const res = await getSettings(buildReq('/api/admin/social-media/settings'));
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else expect(res.status).toBe(200);
        await assertNoSecretsInResponse(res);
      });

      it(`PUT /settings handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/settings', 'PUT', { autoApprove: true });
        const res = await putSettings(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else if (role === 'SUPER_ADMIN') expect([200, 400]).toContain(res.status);
        else expect(res.status).toBe(403);
        await assertNoSecretsInResponse(res);
      });
    }
  });

  describe('Route: /api/admin/social-media/diagnostics', () => {
    for (const { role, session } of testRoles) {
      it(`GET /diagnostics handler for role: ${role}`, async () => {
        mockSession = session;
        const req = buildReq('/api/admin/social-media/diagnostics');
        const res = await getDiagnostics(req);
        if (role === 'UNAUTHENTICATED') expect(res.status).toBe(401);
        else expect(res.status).toBe(200);
        await assertNoSecretsInResponse(res);
      });
    }
  });

  describe('Public Route: /api/social-media/feeds/[feedId]', () => {
    it('GET /api/social-media/feeds/feed_1 allows unauthenticated public access', async () => {
      mockSession = null;
      const req = buildReq('/api/social-media/feeds/feed_1');
      const res = await getPublicFeed(req, { params: Promise.resolve({ feedId: 'feed_1' }) });
      expect(res.status).toBe(200);
      await assertNoSecretsInResponse(res);
    });
  });

  describe('Cron Route: /api/cron/social-sync', () => {
    it('GET /api/cron/social-sync rejects request without Authorization header', async () => {
      process.env.CRON_SECRET = 'test_cron_secret_key_123';
      const req = buildReq('/api/cron/social-sync');
      const res = await getCronSync(req);
      expect(res.status).toBe(401);
      await assertNoSecretsInResponse(res);
    });

    it('GET /api/cron/social-sync accepts request with valid Bearer CRON_SECRET header', async () => {
      process.env.CRON_SECRET = 'test_cron_secret_key_123';
      const req = buildReq('/api/cron/social-sync', 'GET', undefined, { authorization: 'Bearer test_cron_secret_key_123' });
      const res = await getCronSync(req);
      expect(res.status).toBe(200);
      await assertNoSecretsInResponse(res);
    });
  });

});
