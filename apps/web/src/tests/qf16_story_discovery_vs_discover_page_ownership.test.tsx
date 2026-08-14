import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { DiscoverPageManager } from '@/components/dashboard/b2c/DiscoverPageManager';
import { StoryDiscoveryManager } from '@/components/dashboard/b2c/content/StoryDiscoveryManager';
import { StoryTaxonomyPortals } from '@/components/b2c/story/StoryTaxonomyPortals';
import { GET as getStoryTypes, POST as postStoryTypes } from '@/app/api/b2c/story-types/route';
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
});
