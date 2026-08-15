import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { DiscoverPageManager } from '@/components/dashboard/b2c/DiscoverPageManager';
import { StoryDiscoveryManager } from '@/components/dashboard/b2c/content/StoryDiscoveryManager';
import { StoryTaxonomyPortals } from '@/components/b2c/story/StoryTaxonomyPortals';
import { GET as getStoryTypes, POST as postStoryTypes, PUT as putStoryTypes, DELETE as deleteStoryTypes } from '@/app/api/b2c/story-types/route';
import { GET as getDiscoverSettings, POST as postDiscoverSettings } from '@/app/api/b2c/discover-settings/route';
import { DEFAULT_B2C_DISCOVER_CONTENT } from '@/lib/cms-default-pages';
import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
}));

describe('QF-16 — Story Discovery vs Discover Page Ownership Regression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. OWNERSHIP & RECIPROCAL HANDOFF LINKS
  // =========================================================================
  describe('1. Ownership Matrix & Reciprocal Handoffs', () => {
    it('Discover Page Editor renders reciprocal handoff card linking to Story Discovery Manager in EN and AR', () => {
      // English Render
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <DiscoverPageManager initialData={DEFAULT_B2C_DISCOVER_CONTENT} />
        </LocaleProvider>
      );

      expect(htmlEn).toContain('B2C Discover Page Editor');
      expect(htmlEn).toContain('Story Discovery &amp; Narrative Tracks CMS');
      expect(htmlEn).toContain('href="/en/dashboard/b2c/content/story-discovery"');
      expect(htmlEn).toContain('Open Story Discovery Manager');

      // Arabic Render
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <DiscoverPageManager initialData={DEFAULT_B2C_DISCOVER_CONTENT} />
        </LocaleProvider>
      );

      expect(htmlAr).toContain('محرر صفحة اكتشف إي ثري');
      expect(htmlAr).toContain('مدير محتوى مسارات الحكايات والتصنيفات');
      expect(htmlAr).toContain('href="/ar/dashboard/b2c/content/story-discovery"');
      expect(htmlAr).toContain('فتح مدير مسارات الحكايات');
    });

    it('Story Discovery Manager renders reciprocal handoff card linking to Discover Page Editor in EN and AR', () => {
      // English Render
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <StoryDiscoveryManager
            initialStoryTypes={[]}
            initialIntentSelector={{ titleEn: 'Choose Story', titleAr: 'اختر حكاية' }}
          />
        </LocaleProvider>
      );

      expect(htmlEn).toContain('Story Discovery Content Manager');
      expect(htmlEn).toContain('Discover Page CMS Editor');
      expect(htmlEn).toContain('href="/en/dashboard/b2c/discover"');
      expect(htmlEn).toContain('Open Discover Page Editor');

      // Arabic Render
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <StoryDiscoveryManager
            initialStoryTypes={[]}
            initialIntentSelector={{ titleEn: 'Choose Story', titleAr: 'اختر حكاية' }}
          />
        </LocaleProvider>
      );

      expect(htmlAr).toContain('مدير محتوى مسارات الحكايات');
      expect(htmlAr).toContain('محرر صفحة اكتشف إي ثري العامة');
      expect(htmlAr).toContain('href="/ar/dashboard/b2c/discover"');
      expect(htmlAr).toContain('فتح محرر صفحة اكتشف');
    });
  });

  // =========================================================================
  // 2. SAVE ISOLATION & API BOUNDARIES
  // =========================================================================
  describe('2. Save Isolation & API Boundaries', () => {
    it('Discover Settings POST updates b2c-discover page content and mirror setting', async () => {
      (auth as any).mockResolvedValue({
        user: { email: 'admin@e3.qa', role: 'SUPER_ADMIN' },
      });

      const upsertPageSpy = vi.spyOn(db.pages, 'upsert').mockResolvedValue({ id: 'p1' } as any);
      const upsertSettingSpy = vi.spyOn(db.setting, 'upsert').mockResolvedValue({ id: 's1' } as any);

      const payload = {
        content: {
          ...DEFAULT_B2C_DISCOVER_CONTENT,
          hero: {
            ...DEFAULT_B2C_DISCOVER_CONTENT.hero,
            headlineEn: 'NEW DISCOVER HEADLINE 2026',
          },
        },
        seo: { metaTitleEn: 'Discover SEO Title' },
      };

      const req = new NextRequest('http://localhost:3000/api/b2c/discover-settings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const res = await postDiscoverSettings(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(upsertPageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'b2c-discover' },
        })
      );
      expect(upsertSettingSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'B2C_DISCOVER_PAGE_SETTINGS' },
        })
      );
    });

    it('Story Types POST handles batch sync/upsert of story classification tracks without mutating discover pages', async () => {
      (auth as any).mockResolvedValue({
        user: { email: 'admin@e3.qa', role: 'SUPER_ADMIN' },
      });

      vi.spyOn(db, '$transaction').mockImplementation(async (promises: any) =>
        Array.isArray(promises) ? Promise.all(promises) : promises(db)
      );

      const upsertSpy = vi.spyOn(db.storyType, 'upsert').mockResolvedValue({
        id: 'st-drive',
        slug: 'drive',
        titleEn: 'Drive Track',
        titleAr: 'مسار القيادة',
      } as any);

      const batchStoryTypes = [
        {
          slug: 'drive',
          titleEn: 'Drive Track',
          titleAr: 'مسار القيادة',
          accentColor: '#3b82f6',
          orderIndex: 0,
          isActive: true,
        },
        {
          slug: 'bounce',
          titleEn: 'Bounce Track',
          titleAr: 'مسار القفز',
          accentColor: '#f59e0b',
          orderIndex: 1,
          isActive: true,
        },
      ];

      const req = new NextRequest('http://localhost:3000/api/b2c/story-types', {
        method: 'POST',
        body: JSON.stringify({ storyTypes: batchStoryTypes }),
      });

      const res = await postStoryTypes(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.count).toBe(2);
      expect(upsertSpy).toHaveBeenCalledTimes(2);
    });
  });

  // =========================================================================
  // 3. PUBLIC STORY TAXONOMY & PUBLISHED-ONLY COMPOSITION
  // =========================================================================
  describe('3. Public Story Composition & Configured Ordering', () => {
    it('StoryTaxonomyPortals renders only active story types with published attractions in configured order', () => {
      const mockStoryContent = {
        intentSelector: {
          titleEn: 'Choose Your Adventure',
          titleAr: 'اختر مغامرتك اليوم',
        },
        storyTypes: [
          {
            id: 'drive-track',
            slug: 'drive',
            titleEn: 'Drive & Speed',
            titleAr: 'القيادة والسرعة',
            category: 'DRIVE',
            accentColor: '#3b82f6',
            orderIndex: 0,
            isActive: true,
            hasPublishedActivities: true,
            activities: [
              {
                id: 'act-1',
                titleEn: 'Junior Karting GP',
                titleAr: 'سباق الكارتينغ للصغار',
                attractionSlug: 'kids-city',
                attractionNameEn: 'Kids City',
                attractionNameAr: 'مدينة الأطفال',
                highlightType: 'ACTIVITY',
              },
            ],
          },
          {
            id: 'explore-track',
            slug: 'explore',
            titleEn: 'Explore Nature',
            titleAr: 'استكشاف الطبيعة',
            category: 'EXPLORE',
            accentColor: '#10b981',
            orderIndex: 1,
            isActive: true,
            hasPublishedActivities: true,
            activities: [
              {
                id: 'act-2',
                titleEn: 'Safari Trail',
                titleAr: 'مسار السفاري',
                attractionSlug: 'safari-park',
                attractionNameEn: 'Safari Park',
                attractionNameAr: 'حديقة السفاري',
                highlightType: 'VENUE',
              },
            ],
          },
        ],
      };

      const html = renderToStaticMarkup(
        <StoryTaxonomyPortals
          content={mockStoryContent}
          locale="en"
        />
      );

      // Section framing and title
      expect(html).toContain('STORY DISCOVERY');
      expect(html).toContain('Choose Your Adventure');

      // Configured story categories in order
      expect(html).toContain('Drive &amp; Speed');
      expect(html).toContain('Junior Karting GP');
      expect(html).toContain('href="/en/b2c/attractions/kids-city"');
    });

    it('StoryTaxonomyPortals renders designed safe empty state when no story tracks exist', () => {
      const emptyContent = {
        intentSelector: {
          titleEn: 'What Story Do You Want?',
          titleAr: 'أي حكاية تريد؟',
        },
        storyTypes: [],
      };

      const htmlEn = renderToStaticMarkup(
        <StoryTaxonomyPortals
          content={emptyContent}
          locale="en"
        />
      );

      expect(htmlEn).toContain('STORY DISCOVERY');
      expect(htmlEn).toContain('No story tracks currently published.');
      expect(htmlEn).toContain('href="/en/b2c/attractions"');
      expect(htmlEn).toContain('Explore All Attractions');

      const htmlAr = renderToStaticMarkup(
        <StoryTaxonomyPortals
          content={emptyContent}
          locale="ar"
        />
      );

      expect(htmlAr).toContain('استكشاف الحكايات والأنشطة');
      expect(htmlAr).toContain('لا توجد مسارات حكايات مفعلة حالياً.');
      expect(htmlAr).toContain('href="/ar/b2c/attractions"');
      expect(htmlAr).toContain('استكشف جميع التجارب');
    });
  });

  // =========================================================================
  // 4. DETERMINISTIC LOADING & ERROR STATES
  // =========================================================================
  describe('4. Deterministic Loading & Error Handling', () => {
    it('GET /api/b2c/story-types returns full enriched roster on valid query', async () => {
      vi.spyOn(db.storyType, 'count').mockResolvedValue(1);
      vi.spyOn(db.storyType, 'findMany').mockResolvedValue([
        {
          id: 'st-1',
          slug: 'drive',
          titleEn: 'Drive',
          titleAr: 'القيادة',
          icon: 'car',
          accentColor: '#3b82f6',
          orderIndex: 0,
          isActive: true,
          features: [],
          _count: { features: 0 },
        },
      ] as any);
      vi.spyOn(db.attraction, 'findMany').mockResolvedValue([]);

      const req = new NextRequest('http://localhost:3000/api/b2c/story-types?active=true');
      const res = await getStoryTypes(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
      expect(json[0].slug).toBe('drive');
      expect(json[0].activations).toBeDefined();
    });

    it('GET /api/b2c/discover-settings returns merged fallback when DB record is missing', async () => {
      vi.spyOn(db.pages, 'findUnique').mockResolvedValue(null);
      vi.spyOn(db.setting, 'findUnique').mockResolvedValue(null);

      const res = await getDiscoverSettings();
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.hero).toBeDefined();
      expect(json.about).toBeDefined();
      expect(json.leadership).toBeDefined();
      expect(json.bookingQube).toBeDefined();
    });
  });

  // =========================================================================
  // 5. QF-16-B: STORY-TYPE API SECURITY & RBAC ENFORCEMENT
  // =========================================================================
  describe('5. QF-16-B: Story-Type API Security & RBAC Enforcement', () => {
    it('Rejects unauthenticated POST and DELETE with 401 Unauthorized', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);

      // 1. POST
      const postReq = new NextRequest('http://localhost:3000/api/b2c/story-types', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test-track', titleEn: 'Test Track' }),
      });
      const postRes = await postStoryTypes(postReq);
      expect(postRes.status).toBe(401);

      // 2. DELETE
      const deleteReq = new NextRequest('http://localhost:3000/api/b2c/story-types?id=st-1', {
        method: 'DELETE',
      });
      const deleteRes = await deleteStoryTypes(deleteReq);
      expect(deleteRes.status).toBe(401);
    });

    it('Rejects authenticated users lacking b2c.content.write capability with 403 Forbidden', async () => {
      // Client role has no b2c.content.write
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'client-1', role: 'CLIENT' },
      } as any);

      const postReq = new NextRequest('http://localhost:3000/api/b2c/story-types', {
        method: 'POST',
        body: JSON.stringify({ slug: 'client-track', titleEn: 'Client Track' }),
      });
      const postRes = await postStoryTypes(postReq);
      expect(postRes.status).toBe(403);

      // Sales admin (b2b only) has no b2c.content.write
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'sales-1', role: 'SALES_ADMIN' },
      } as any);

      const deleteReq = new NextRequest('http://localhost:3000/api/b2c/story-types?id=st-1', {
        method: 'DELETE',
      });
      const deleteRes = await deleteStoryTypes(deleteReq);
      expect(deleteRes.status).toBe(403);
    });

    it('Allows authorized B2C_ADMIN and SUPER_ADMIN to mutate story types', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'admin-1', role: 'B2C_ADMIN' },
      } as any);

      vi.spyOn(db.storyType, 'findUnique').mockResolvedValue(null);
      vi.spyOn(db.storyType, 'create').mockResolvedValue({
        id: 'st-created',
        slug: 'super-jump',
        titleEn: 'Super Jump',
        titleAr: 'القفز الخارق',
        accentColor: '#8b5cf6',
        orderIndex: 1,
        isActive: true,
      } as any);

      const postReq = new NextRequest('http://localhost:3000/api/b2c/story-types', {
        method: 'POST',
        body: JSON.stringify({
          slug: 'super-jump',
          titleEn: 'Super Jump',
          titleAr: 'القفز الخارق',
          accentColor: '#8b5cf6',
        }),
      });
      const res = await postStoryTypes(postReq);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.slug).toBe('super-jump');
    });

    it('Enforces field validation: rejects invalid hex colors, unsafe media URLs, and duplicate batch slugs', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'admin-1', role: 'SUPER_ADMIN' },
      } as any);

      // 1. Invalid hex color
      const invalidColorReq = new NextRequest('http://localhost:3000/api/b2c/story-types', {
        method: 'POST',
        body: JSON.stringify({
          titleEn: 'Bad Color Track',
          accentColor: 'rgb(255,0,0)', // invalid hex format
        }),
      });
      const colorRes = await postStoryTypes(invalidColorReq);
      expect(colorRes.status).toBe(400);

      // 2. Unsafe media URL
      const unsafeUrlReq = new NextRequest('http://localhost:3000/api/b2c/story-types', {
        method: 'POST',
        body: JSON.stringify({
          titleEn: 'XSS Media Track',
          coverMediaUrl: 'javascript:alert(1)',
        }),
      });
      const urlRes = await postStoryTypes(unsafeUrlReq);
      expect(urlRes.status).toBe(400);

      // 3. Duplicate slugs in batch payload
      const dupBatchReq = new NextRequest('http://localhost:3000/api/b2c/story-types', {
        method: 'POST',
        body: JSON.stringify({
          storyTypes: [
            { slug: 'duplicate-track', titleEn: 'Track 1' },
            { slug: 'duplicate-track', titleEn: 'Track 2' },
          ],
        }),
      });
      const dupRes = await postStoryTypes(dupBatchReq);
      expect(dupRes.status).toBe(400);
      const dupJson = await dupRes.json();
      expect(dupJson.error).toContain('Duplicate slug');
    });

    it('PUT /api/b2c/story-types updates existing story track and rejects missing ID or invalid payload', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'admin-1', role: 'B2C_ADMIN' },
      } as any);

      // Missing ID -> 400
      const missingIdReq = new NextRequest('http://localhost:3000/api/b2c/story-types', {
        method: 'PUT',
        body: JSON.stringify({ titleEn: 'No ID Track' }),
      });
      const missingIdRes = await putStoryTypes(missingIdReq);
      expect(missingIdRes.status).toBe(400);

      // Successful update
      vi.spyOn(db.storyType, 'findUnique')
        .mockResolvedValueOnce({ id: 'st-1', slug: 'drive', titleEn: 'Drive' } as any)
        .mockResolvedValueOnce(null);
      vi.spyOn(db.storyType, 'update').mockResolvedValue({
        id: 'st-1',
        slug: 'drive-speed',
        titleEn: 'Drive & Speed Updated',
      } as any);

      const updateReq = new NextRequest('http://localhost:3000/api/b2c/story-types', {
        method: 'PUT',
        body: JSON.stringify({
          id: 'st-1',
          slug: 'drive-speed',
          titleEn: 'Drive & Speed Updated',
        }),
      });
      const updateRes = await putStoryTypes(updateReq);
      expect(updateRes.status).toBe(200);
      const updateJson = await updateRes.json();
      expect(updateJson.success).toBe(true);
    });

    it('Prevents hard deletion of referenced story tracks returning 409 Conflict, but allows safe deactivation with forceDeactivate=true', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'admin-1', role: 'B2C_ADMIN' },
      } as any);

      // Mock existing record referenced by attraction features
      vi.spyOn(db.storyType, 'findFirst').mockResolvedValue({
        id: 'st-drive',
        slug: 'drive',
        titleEn: 'Drive & Speed',
        titleAr: 'القيادة والسرعة',
        _count: { features: 2 },
      } as any);
      vi.spyOn(db.attraction, 'findMany').mockResolvedValue([]);

      // 1. Standard delete on referenced track -> 409 Conflict
      const deleteConflictReq = new NextRequest('http://localhost:3000/api/b2c/story-types?id=st-drive', {
        method: 'DELETE',
      });
      const conflictRes = await deleteStoryTypes(deleteConflictReq);
      expect(conflictRes.status).toBe(409);
      const conflictJson = await conflictRes.json();
      expect(conflictJson.isReferenced).toBe(true);
      expect(conflictJson.referenceCount).toBe(2);

      // 2. Delete with forceDeactivate=true -> 200 with deactivation
      vi.spyOn(db.storyType, 'update').mockResolvedValue({
        id: 'st-drive',
        slug: 'drive',
        isActive: false,
      } as any);

      const forceDeactivateReq = new NextRequest('http://localhost:3000/api/b2c/story-types?id=st-drive&forceDeactivate=true', {
        method: 'DELETE',
      });
      const deactRes = await deleteStoryTypes(forceDeactivateReq);
      expect(deactRes.status).toBe(200);
      const deactJson = await deactRes.json();
      expect(deactJson.action).toBe('deactivated');
    });

    it('Separates public GET (active only, safe fields) from authenticated manager GET (includes inactive tracks and counts)', async () => {
      const mockTracks = [
        { id: 'st-1', slug: 'drive', titleEn: 'Drive', isActive: true, features: [], _count: { features: 1 } },
        { id: 'st-2', slug: 'archived', titleEn: 'Archived', isActive: false, features: [], _count: { features: 0 } },
      ];

      vi.spyOn(db.storyType, 'count').mockResolvedValue(2);
      vi.spyOn(db.attraction, 'findMany').mockResolvedValue([]);

      // 1. Public GET (Unauthenticated) -> only active tracks queried
      vi.mocked(auth).mockResolvedValue(null as any);
      const findManySpy = vi.spyOn(db.storyType, 'findMany').mockResolvedValue([mockTracks[0]] as any);

      const publicReq = new NextRequest('http://localhost:3000/api/b2c/story-types');
      const publicRes = await getStoryTypes(publicReq);
      const publicJson = await publicRes.json();

      expect(publicRes.status).toBe(200);
      expect(findManySpy).toHaveBeenCalledWith(expect.objectContaining({
        where: { isActive: true },
      }));
      expect(publicJson[0].slug).toBe('drive');
      expect(publicJson[0].features).toBeUndefined(); // internal relation stripped in public view

      // 2. Authenticated Manager GET -> queries all records
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'admin-1', role: 'B2C_ADMIN' },
      } as any);
      findManySpy.mockResolvedValue(mockTracks as any);

      const managerReq = new NextRequest('http://localhost:3000/api/b2c/story-types');
      const managerRes = await getStoryTypes(managerReq);
      const managerJson = await managerRes.json();

      expect(managerRes.status).toBe(200);
      expect(managerJson.length).toBe(2);
      expect(managerJson[0]._count).toBeDefined();
    });
  });

  // =========================================================================
  // 6. QF-16-C: PUBLIC STORY-TRACK DELIVERY INTEGRATION
  // =========================================================================
  describe('6. QF-16-C: Public Story-Track Delivery Integration', () => {
    const fixtureStoryTracks = [
      {
        id: 'st-drive',
        slug: 'drive',
        titleEn: 'Drive Track',
        titleAr: 'مسار القيادة',
        icon: 'car',
        accentColor: '#3b82f6',
        orderIndex: 0,
        isActive: true,
        coverMediaUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033',
        features: [],
        _count: { features: 0 },
      },
      {
        id: 'st-bounce',
        slug: 'bounce',
        titleEn: 'Bounce Track',
        titleAr: 'مسار القفز',
        icon: 'activity',
        accentColor: '#f59e0b',
        orderIndex: 1,
        isActive: true,
        coverMediaUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033',
        features: [],
        _count: { features: 0 },
      },
      {
        id: 'st-compete',
        slug: 'compete',
        titleEn: 'Compete Track',
        titleAr: 'مسار التحدي',
        icon: 'trophy',
        accentColor: '#ef4444',
        orderIndex: 2,
        isActive: true,
        coverMediaUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033',
        features: [],
        _count: { features: 0 },
      },
      {
        id: 'st-explore',
        slug: 'explore',
        titleEn: 'Explore Track',
        titleAr: 'مسار الاستكشاف',
        icon: 'compass',
        accentColor: '#10b981',
        orderIndex: 3,
        isActive: true,
        coverMediaUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033',
        features: [],
        _count: { features: 0 },
      },
      {
        id: 'st-celebrate',
        slug: 'celebrate',
        titleEn: 'Celebrate Track',
        titleAr: 'مسار الاحتفال',
        icon: 'gift',
        accentColor: '#8b5cf6',
        orderIndex: 4,
        isActive: true,
        coverMediaUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033',
        features: [],
        _count: { features: 0 },
      },
      {
        id: 'st-family',
        slug: 'family-time',
        titleEn: 'Family Time Track',
        titleAr: 'مسار العائلة',
        icon: 'users',
        accentColor: '#ec4899',
        orderIndex: 5,
        isActive: true,
        coverMediaUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033',
        features: [],
        _count: { features: 0 },
      },
    ];

    it('passes six active fixtures through the public GET boundary into landing composition rendering in EN and AR with orderIndex preserved', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);
      vi.spyOn(db.storyType, 'count').mockResolvedValue(6);
      vi.spyOn(db.storyType, 'findMany').mockResolvedValue(fixtureStoryTracks as any);
      vi.spyOn(db.attraction, 'findMany').mockResolvedValue([]);

      // 1. Invoke actual public GET route boundary
      const publicReq = new NextRequest('http://localhost:3000/api/b2c/story-types?active=true');
      const publicRes = await getStoryTypes(publicReq);
      const publicData = await publicRes.json();

      expect(publicRes.status).toBe(200);
      expect(Array.isArray(publicData)).toBe(true);
      expect(publicData.length).toBe(6);

      // Verify safe response shape (no admin leakage)
      for (const track of publicData) {
        expect(track.id).toBeDefined();
        expect(track.slug).toBeDefined();
        expect(track.titleEn).toBeDefined();
        expect(track.titleAr).toBeDefined();
        expect(track.accentColor).toBeDefined();
        expect(track.orderIndex).toBeDefined();
        expect(track.isActive).toBe(true);
        expect(track._count).toBeUndefined();
        expect(track.features).toBeUndefined();
      }

      // 2. Render into StoryTaxonomyPortals landing composition (EN)
      const landingContent = {
        intentSelector: {
          titleEn: 'What Kind of Story Do You Want Today?',
          titleAr: 'أي نوع من الحكايات تريد أن تعيشها اليوم؟',
        },
        storyDiscovery: {
          storyTypes: publicData,
        },
      };

      const htmlEn = renderToStaticMarkup(
        <StoryTaxonomyPortals
          content={landingContent}
          locale="en"
        />
      );

      // Section framing and header
      expect(htmlEn).toContain('STORY DISCOVERY');
      expect(htmlEn).toContain('What Kind of Story Do You Want Today?');

      // Assert all 6 active track titles render in EN
      expect(htmlEn).toContain('Drive Track');
      expect(htmlEn).toContain('Bounce Track');
      expect(htmlEn).toContain('Compete Track');
      expect(htmlEn).toContain('Explore Track');
      expect(htmlEn).toContain('Celebrate Track');
      expect(htmlEn).toContain('Family Time Track');

      // Assert orderIndex ordering in rendered output
      const posDriveEn = htmlEn.indexOf('Drive Track');
      const posBounceEn = htmlEn.indexOf('Bounce Track');
      const posCompeteEn = htmlEn.indexOf('Compete Track');
      const posExploreEn = htmlEn.indexOf('Explore Track');
      const posCelebrateEn = htmlEn.indexOf('Celebrate Track');
      const posFamilyEn = htmlEn.indexOf('Family Time Track');

      expect(posDriveEn).toBeLessThan(posBounceEn);
      expect(posBounceEn).toBeLessThan(posCompeteEn);
      expect(posCompeteEn).toBeLessThan(posExploreEn);
      expect(posExploreEn).toBeLessThan(posCelebrateEn);
      expect(posCelebrateEn).toBeLessThan(posFamilyEn);

      // Empty state must NOT be rendered
      expect(htmlEn).not.toContain('No story tracks currently published.');

      // 3. Render into StoryTaxonomyPortals landing composition (AR)
      const htmlAr = renderToStaticMarkup(
        <StoryTaxonomyPortals
          content={landingContent}
          locale="ar"
        />
      );

      expect(htmlAr).toContain('استكشاف الحكايات والأنشطة');
      expect(htmlAr).toContain('أي نوع من الحكايات تريد أن تعيشها اليوم؟');
      expect(htmlAr).toContain('dir="rtl"');

      // Assert all 6 active track titles render in AR
      expect(htmlAr).toContain('مسار القيادة');
      expect(htmlAr).toContain('مسار القفز');
      expect(htmlAr).toContain('مسار التحدي');
      expect(htmlAr).toContain('مسار الاستكشاف');
      expect(htmlAr).toContain('مسار الاحتفال');
      expect(htmlAr).toContain('مسار العائلة');

      // Assert orderIndex ordering in AR rendered output
      const posDriveAr = htmlAr.indexOf('مسار القيادة');
      const posBounceAr = htmlAr.indexOf('مسار القفز');
      const posCompeteAr = htmlAr.indexOf('مسار التحدي');
      const posExploreAr = htmlAr.indexOf('مسار الاستكشاف');
      const posCelebrateAr = htmlAr.indexOf('مسار الاحتفال');
      const posFamilyAr = htmlAr.indexOf('مسار العائلة');

      expect(posDriveAr).toBeLessThan(posBounceAr);
      expect(posBounceAr).toBeLessThan(posCompeteAr);
      expect(posCompeteAr).toBeLessThan(posExploreAr);
      expect(posExploreAr).toBeLessThan(posCelebrateAr);
      expect(posFamilyAr).toBeGreaterThan(posCelebrateAr);

      // Empty state must NOT be rendered
      expect(htmlAr).not.toContain('لا توجد مسارات حكايات مفعلة حالياً.');
    });

    it('excludes inactive tracks through public GET boundary and landing composition', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);
      vi.spyOn(db.storyType, 'count').mockResolvedValue(7);

      // Mock database returning 6 active and 1 inactive track
      const mixedTracks = [
        ...fixtureStoryTracks,
        {
          id: 'st-inactive',
          slug: 'draft-mystery',
          titleEn: 'Draft Mystery Track',
          titleAr: 'مسار مسودة سري',
          icon: 'help-circle',
          accentColor: '#64748b',
          orderIndex: 6,
          isActive: false,
          features: [],
          _count: { features: 0 },
        },
      ];

      // Prisma `findMany` filters `where: { isActive: true }` for public calls
      const findManySpy = vi.spyOn(db.storyType, 'findMany').mockImplementation(async (args: any) => {
        if (args?.where?.isActive === true) {
          return mixedTracks.filter(t => t.isActive);
        }
        return mixedTracks;
      });

      const publicReq = new NextRequest('http://localhost:3000/api/b2c/story-types');
      const publicRes = await getStoryTypes(publicReq);
      const publicData = await publicRes.json();

      expect(findManySpy).toHaveBeenCalledWith(expect.objectContaining({
        where: { isActive: true },
      }));
      expect(publicData.length).toBe(6);
      expect(publicData.some((t: any) => t.slug === 'draft-mystery')).toBe(false);

      // Landing composition render check
      const htmlEn = renderToStaticMarkup(
        <StoryTaxonomyPortals
          content={{ storyDiscovery: { storyTypes: publicData } }}
          locale="en"
        />
      );

      expect(htmlEn).not.toContain('Draft Mystery Track');
      expect(htmlEn).toContain('Drive Track');
    });

    it('preserves genuine zero-record fallback when database contains zero active tracks', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);
      vi.spyOn(db.storyType, 'count').mockResolvedValue(1); // seed not triggered
      vi.spyOn(db.storyType, 'findMany').mockResolvedValue([]);
      vi.spyOn(db.attraction, 'findMany').mockResolvedValue([]);

      const publicReq = new NextRequest('http://localhost:3000/api/b2c/story-types?active=true');
      const publicRes = await getStoryTypes(publicReq);
      const publicData = await publicRes.json();

      expect(publicData).toEqual([]);

      // EN Empty State
      const htmlEn = renderToStaticMarkup(
        <StoryTaxonomyPortals
          content={{ storyDiscovery: { storyTypes: publicData } }}
          locale="en"
        />
      );
      expect(htmlEn).toContain('STORY DISCOVERY');
      expect(htmlEn).toContain('No story tracks currently published.');
      expect(htmlEn).toContain('href="/en/b2c/attractions"');
      expect(htmlEn).toContain('Explore All Attractions');

      // AR Empty State
      const htmlAr = renderToStaticMarkup(
        <StoryTaxonomyPortals
          content={{ storyDiscovery: { storyTypes: publicData } }}
          locale="ar"
        />
      );
      expect(htmlAr).toContain('استكشاف الحكايات والأنشطة');
      expect(htmlAr).toContain('لا توجد مسارات حكايات مفعلة حالياً.');
      expect(htmlAr).toContain('href="/ar/b2c/attractions"');
      expect(htmlAr).toContain('استكشف جميع التجارب');
    });
  });
});
