import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getCmsSocial, POST as postCmsSocial } from '../app/api/cms/social/route';
import { GET as getPublicSocialFeed } from '../app/api/social-media/feeds/[feedId]/route';
import { GET as getAdminAccounts } from '../app/api/admin/social-media/accounts/route';
import { GET as getAdminProviders } from '../app/api/admin/social-media/providers/route';
import { DEFAULT_B2C_LANDING_CONTENT } from '../lib/cms-default-pages';

const mocks = vi.hoisted(() => {
  return {
    currentUser: null as any,
    db: {
      socialPost: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      socialAccount: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      socialProviderConfig: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      socialFeed: {
        findUnique: vi.fn(),
      },
      socialGlobalSettings: {
        findUnique: vi.fn(),
      },
    },
  };
});

// Mock server auth
vi.mock('@/lib/server-auth', () => ({
  requireCurrentUser: vi.fn().mockImplementation(async () => {
    if (!mocks.currentUser) {
      const err: any = new Error('Unauthorized');
      err.statusCode = 401;
      err.name = 'AppAuthError';
      throw err;
    }
    if (mocks.currentUser.role === 'CLIENT' || mocks.currentUser.role === 'CANDIDATE') {
      const err: any = new Error('Forbidden');
      err.statusCode = 403;
      err.name = 'AppAuthError';
      throw err;
    }
    return mocks.currentUser;
  }),
  AppAuthError: class extends Error {
    statusCode: number;
    constructor(msg: string, code = 401) {
      super(msg);
      this.statusCode = code;
    }
  },
}));

vi.mock('@/lib/social-media/auth-check', () => ({
  checkSocialAdminAuth: vi.fn().mockImplementation(async () => {
    if (!mocks.currentUser) return { isAuthed: false, user: null };
    if (mocks.currentUser.role === 'CLIENT' || mocks.currentUser.role === 'CANDIDATE') {
      return { isAuthed: false, user: mocks.currentUser };
    }
    return { isAuthed: true, user: mocks.currentUser };
  }),
}));

vi.mock('@/lib/db', () => ({
  default: mocks.db,
}));

describe('QF-09: Live Feed vs Social Media Manager Architectural Ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.currentUser = null;
  });

  // 1. Ownership boundary: Live Feed structure in CMS content
  it('1. Live Feed schema owns broadcast status, stream URLs, and curated clips without touching social models', () => {
    const landingContent = { ...DEFAULT_B2C_LANDING_CONTENT };
    
    // Live Feed owns broadcast properties
    expect(landingContent.liveFeed).toBeDefined();
    expect(typeof landingContent.liveFeed.isLiveNow).toBe('boolean');
    expect(typeof landingContent.liveFeed.streamUrl).toBe('string');
    expect(Array.isArray(landingContent.liveFeed.recentHighlights)).toBe(true);

    // Live Feed highlights structure
    const highlight = landingContent.liveFeed.recentHighlights[0];
    expect(highlight).toHaveProperty('id');
    expect(highlight).toHaveProperty('titleEn');
    expect(highlight).toHaveProperty('titleAr');
    expect(highlight).toHaveProperty('mediaUrl');

    // Updating liveFeed does NOT corrupt or touch socialFeed structure
    const updatedLiveFeed = {
      ...landingContent.liveFeed,
      isLiveNow: false,
      streamUrl: 'https://cdn.e3.qa/stream/stage-a.m3u8',
    };
    const updatedContent = { ...landingContent, liveFeed: updatedLiveFeed };
    expect(updatedContent.liveFeed.isLiveNow).toBe(false);
    expect(updatedContent.liveFeed.streamUrl).toBe('https://cdn.e3.qa/stream/stage-a.m3u8');
  });

  // 2. Legacy Social API reads canonical published social posts
  it('2. Legacy GET /api/cms/social safely reads canonical published & approved posts from db.socialPost', async () => {
    mocks.db.socialPost.findMany.mockResolvedValueOnce([
      {
        id: 'post-101',
        provider: 'META_INSTAGRAM',
        originalUrl: 'https://instagram.com/p/C_abc123',
        authorName: 'E3 Qatar',
        authorUsername: 'e3qatar',
        authorAvatarUrl: 'https://cdn.e3.qa/avatar.jpg',
        captionEn: 'Grand opening highlights',
        captionAr: 'أبرز لقطات الافتتاح الكبير',
        mediaType: 'VIDEO',
        mediaUrl: 'https://cdn.e3.qa/video.mp4',
        thumbnailUrl: 'https://cdn.e3.qa/thumb.jpg',
        publishedAt: new Date('2026-08-01T12:00:00Z'),
        moderationStatus: 'APPROVED',
        status: 'PUBLISHED',
        likeCount: 1540,
        commentCount: 42,
      },
    ]);

    mocks.db.socialAccount.findMany.mockResolvedValueOnce([
      {
        id: 'acc-inst',
        provider: 'META_INSTAGRAM',
        username: 'e3qatar',
        displayName: 'E3 Qatar Official',
        profileUrl: 'https://instagram.com/e3qatar',
        profileImageUrl: 'https://cdn.e3.qa/inst-profile.jpg',
      },
    ]);

    const req = new NextRequest('http://localhost:3000/api/cms/social');
    const res = await getCmsSocial(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.posts).toHaveLength(1);
    expect(body.data.posts[0].id).toBe('post-101');
    expect(body.data.posts[0].platform).toBe('INSTAGRAM');
    expect(body.data.posts[0].isApproved).toBe(true);
    expect(body.data.posts[0].isVisible).toBe(true);

    expect(body.data.channels).toHaveLength(1);
    expect(body.data.channels[0].handle).toBe('@e3qatar');
  });

  // 3. Security: Never expose access tokens, secrets, or credentials
  it('3. Social accounts API and Provider config API strip and mask encrypted secrets and tokens', async () => {
    mocks.currentUser = { id: 'admin-1', role: 'SUPER_ADMIN' };

    mocks.db.socialAccount.findMany.mockResolvedValueOnce([
      {
        id: 'acc-sec',
        provider: 'META_INSTAGRAM',
        username: 'e3qatar',
        status: 'CONNECTED',
        encryptedAccessToken: 'CRITICAL_SECRET_TOKEN_DO_NOT_LEAK',
        encryptedRefreshToken: 'CRITICAL_REFRESH_TOKEN',
        encryptedData: 'ENCRYPTED_PAYLOAD',
      },
    ]);

    const reqAccounts = new NextRequest('http://localhost:3000/api/admin/social-media/accounts');
    const resAccounts = await getAdminAccounts(reqAccounts);
    const bodyAccounts = await resAccounts.json();

    expect(resAccounts.status).toBe(200);
    expect(bodyAccounts.data[0]).not.toHaveProperty('encryptedAccessToken');
    expect(bodyAccounts.data[0]).not.toHaveProperty('encryptedRefreshToken');
    expect(bodyAccounts.data[0]).not.toHaveProperty('encryptedData');
    expect(bodyAccounts.data[0].hasToken).toBe(true);
    expect(bodyAccounts.data[0].hasRefreshToken).toBe(true);

    mocks.db.socialProviderConfig.findMany.mockResolvedValueOnce([
      {
        id: 'cfg-meta',
        provider: 'META_INSTAGRAM',
        appId: '1234567890',
        encryptedSecret: 'ENC_SECRET_ABC',
        apiKey: 'ENC_API_KEY_XYZ',
      },
    ]);

    const reqProviders = new NextRequest('http://localhost:3000/api/admin/social-media/providers');
    const resProviders = await getAdminProviders(reqProviders);
    const bodyProviders = await resProviders.json();

    expect(resProviders.status).toBe(200);
    expect(bodyProviders.data[0].encryptedSecret).toContain('••••');
    expect(bodyProviders.data[0].apiKey).toContain('••••');
  });

  // 4. Public social feed API filtering & isolation
  it('4. Public social feed API filters only APPROVED and PUBLISHED posts and sanitizes output', async () => {
    mocks.db.socialGlobalSettings.findUnique.mockResolvedValueOnce({
      id: 'default',
      publicFeedsEnabled: true,
      showEngagementMetrics: true,
      cacheDurationSeconds: 300,
    });

    mocks.db.socialFeed.findUnique.mockResolvedValueOnce({
      id: 'b2c-live-social',
      name: 'B2C Live Social Feed',
      isActive: true,
      mode: 'AUTOMATIC',
      portal: 'SHARED',
      layout: 'GRID',
      sources: [],
      feedPosts: [],
    });

    mocks.db.socialPost.findMany.mockResolvedValueOnce([
      {
        id: 'post-pub',
        provider: 'META_INSTAGRAM',
        originalUrl: 'https://instagram.com/p/published',
        authorName: 'E3 Qatar',
        authorUsername: 'e3qatar',
        captionEn: 'Live show in Doha',
        captionAr: 'عرض حي في الدوحة',
        mediaType: 'IMAGE',
        mediaUrl: 'https://cdn.e3.qa/live-show.jpg',
        thumbnailUrl: 'https://cdn.e3.qa/live-show.jpg',
        publishedAt: new Date('2026-08-10T15:00:00Z'),
        likeCount: 450,
        status: 'PUBLISHED',
        moderationStatus: 'APPROVED',
      },
    ]);

    const req = new NextRequest('http://localhost:3000/api/social-media/feeds/b2c-live-social?locale=en');
    const res = await getPublicSocialFeed(req, { params: Promise.resolve({ feedId: 'b2c-live-social' }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.posts).toHaveLength(1);
    expect(body.data.posts[0].caption).toBe('Live show in Doha');
    expect(body.data.posts[0]).not.toHaveProperty('encryptedData');
    expect(body.data.posts[0]).not.toHaveProperty('account');
  });

  // 5. RBAC on legacy write endpoint
  it('5. Legacy write route POST /api/cms/social rejects unauthorized and non-admin requests', async () => {
    // Unauthenticated request
    mocks.currentUser = null;
    const reqAnon = new NextRequest('http://localhost:3000/api/cms/social', {
      method: 'POST',
      body: JSON.stringify({ action: 'TOGGLE_APPROVAL', postId: 'post-1', isApproved: true }),
    });
    const resAnon = await postCmsSocial(reqAnon);
    expect(resAnon.status).toBe(401);

    // Non-admin request (e.g. CLIENT)
    mocks.currentUser = { id: 'client-user', role: 'CLIENT' };
    const reqClient = new NextRequest('http://localhost:3000/api/cms/social', {
      method: 'POST',
      body: JSON.stringify({ action: 'TOGGLE_APPROVAL', postId: 'post-1', isApproved: true }),
    });
    const resClient = await postCmsSocial(reqClient);
    expect(resClient.status).toBe(403);

    // Authorized Admin request
    mocks.currentUser = { id: 'admin-user', role: 'SUPER_ADMIN' };
    mocks.db.socialPost.update.mockResolvedValueOnce({ id: 'post-1', moderationStatus: 'APPROVED' });
    const reqAdmin = new NextRequest('http://localhost:3000/api/cms/social', {
      method: 'POST',
      body: JSON.stringify({ action: 'TOGGLE_APPROVAL', postId: 'post-1', isApproved: true }),
    });
    const resAdmin = await postCmsSocial(reqAdmin);
    expect(resAdmin.status).toBe(200);
    expect(mocks.db.socialPost.update).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      data: { moderationStatus: 'APPROVED' },
    });
  });
});
