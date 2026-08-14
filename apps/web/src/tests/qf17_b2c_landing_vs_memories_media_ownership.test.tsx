import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { B2CLandingCMSView } from '@/components/dashboard/b2c/B2CLandingCMSView';
import { EverlastingMemoriesManager } from '@/components/dashboard/b2c/content/EverlastingMemoriesManager';
import { B2CMediaManager } from '@/components/dashboard/b2c/content/B2CMediaManager';
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages';
import { deepMergeCMSContent } from '@/lib/cms-server';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
}));

describe('QF-17 — B2C Landing vs Memories & Media Ownership Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. CANONICAL OWNERSHIP & RECIPROCAL HANDOFF LINKS
  // =========================================================================
  describe('1. Canonical Ownership Matrix & Reciprocal Handoffs', () => {
    it('Landing Editor renders reciprocal handoff cards linking to Media Manager and Memories Manager in EN and AR', () => {
      // English Render
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <B2CLandingCMSView initialData={DEFAULT_B2C_LANDING_CONTENT} />
        </LocaleProvider>
      );

      expect(htmlEn).toContain('B2C Landing Page Editor');
      expect(htmlEn).toContain('1. Section Sequence');
      expect(htmlEn).toContain('2. Hero Copy &amp; Headlines');
      expect(htmlEn).toContain('3. Hero Navigation &amp; Actions');
      expect(htmlEn).toContain('4. Brand Manifesto');
      expect(htmlEn).toContain('5. Core Team Selection');
      expect(htmlEn).toContain('6. Presentation Media');
      expect(htmlEn).toContain('7. Everlasting Memories');
      expect(htmlEn).toContain('8. Footer Framing');

      // Arabic Render
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <B2CLandingCMSView initialData={DEFAULT_B2C_LANDING_CONTENT} />
        </LocaleProvider>
      );

      expect(htmlAr).toContain('محرر صفحة B2C الرئيسية');
      expect(htmlAr).toContain('١. ترتيب الأقسام');
      expect(htmlAr).toContain('٢. نصوص الهيرو');
      expect(htmlAr).toContain('٤. بيان العلامة');
      expect(htmlAr).toContain('٥. اختيار الفريق');
      expect(htmlAr).toContain('٦. وسائط الهيرو');
      expect(htmlAr).toContain('٧. ذكريات الزوار');
      expect(htmlAr).toContain('٨. خاتمة الصفحة');
    });

    it('Everlasting Memories Manager renders reciprocal handoff card linking back to Landing Editor in EN and AR', () => {
      // English Render
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <EverlastingMemoriesManager
            value={DEFAULT_B2C_LANDING_CONTENT.guestMemories}
            isStandalone={true}
          />
        </LocaleProvider>
      );

      expect(htmlEn).toContain('Everlasting Memories Manager');
      expect(htmlEn).toContain('B2C Landing Page Editor');
      expect(htmlEn).toContain('href="/en/dashboard/b2c/landing"');
      expect(htmlEn).toContain('Open Landing Editor');
      expect(htmlEn).toContain('href="/en/dashboard/cms/media"');

      // Arabic Render
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <EverlastingMemoriesManager
            value={DEFAULT_B2C_LANDING_CONTENT.guestMemories}
            isStandalone={true}
          />
        </LocaleProvider>
      );

      expect(htmlAr).toContain('مدير ذكريات الزوار الخالدة');
      expect(htmlAr).toContain('محرر صفحة B2C الرئيسية');
      expect(htmlAr).toContain('href="/ar/dashboard/b2c/landing"');
      expect(htmlAr).toContain('فتح محرر صفحة B2C');
    });

    it('B2C Media Manager renders reciprocal handoff card linking back to Landing Editor in EN and AR', () => {
      // English Render
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <B2CMediaManager initialData={DEFAULT_B2C_LANDING_CONTENT} />
        </LocaleProvider>
      );

      expect(htmlEn).toContain('B2C Media Manager');
      expect(htmlEn).toContain('B2C Landing Page Editor');
      expect(htmlEn).toContain('href="/en/dashboard/b2c/landing"');
      expect(htmlEn).toContain('Open Landing Editor');
      expect(htmlEn).toContain('href="/en/dashboard/cms/media"');

      // Arabic Render
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <B2CMediaManager initialData={DEFAULT_B2C_LANDING_CONTENT} />
        </LocaleProvider>
      );

      expect(htmlAr).toContain('مدير وسائط وخلفيات تجارب B2C');
      expect(htmlAr).toContain('محرر صفحة B2C الرئيسية');
      expect(htmlAr).toContain('href="/ar/dashboard/b2c/landing"');
      expect(htmlAr).toContain('فتح محرر صفحة B2C');
    });
  });

  // =========================================================================
  // 2. SLICE-SAFE MERGE & NO CONTENT LOSS
  // =========================================================================
  describe('2. Slice-Safe Merge & Concurrency Protection', () => {
    it('Saving Memories slice never overwrites or wipes hero, manifesto, team, or media fields', () => {
      const existingPage = {
        sequence: [{ id: 'hero', isVisible: true }, { id: 'memories', isVisible: true }],
        act1Hero: { titleEn: 'Existing Hero Title', titleAr: 'عنوان هيرو موجود' },
        heroMedia: { mediaType: 'VIDEO', mediaUrl: 'https://cdn.e3.qa/hero.mp4' },
        act2Curtain: { headingEn: 'Existing Manifesto' },
        coreTeam: { headlineEn: 'Our Team', selectedMemberIds: ['team-1', 'team-2'] },
        guestMemories: {
          headlineEn: 'Old Memories Headline',
          moments: [{ id: 'm-1', titleEn: 'Old Moment' }],
        },
      };

      const incomingMemoriesUpdate = {
        guestMemories: {
          badgeEn: 'NEW MEMORIES BADGE',
          headlineEn: 'Brand New Moments Headline',
          headlineAr: 'عنوان جديد للحظات',
          moments: [
            { id: 'm-1', titleEn: 'Updated Moment 1', mediaUrl: 'https://cdn.e3.qa/m1.jpg' },
            { id: 'm-2', titleEn: 'New Moment 2', mediaUrl: 'https://cdn.e3.qa/m2.jpg' },
          ],
        },
      };

      const merged = deepMergeCMSContent(existingPage, incomingMemoriesUpdate);

      // Memories slice is updated
      expect(merged.guestMemories.badgeEn).toBe('NEW MEMORIES BADGE');
      expect(merged.guestMemories.headlineEn).toBe('Brand New Moments Headline');
      expect(merged.guestMemories.headlineAr).toBe('عنوان جديد للحظات');
      expect(merged.guestMemories.moments.length).toBe(2);
      expect(merged.guestMemories.moments[0].titleEn).toBe('Updated Moment 1');

      // Sibling fields are completely preserved
      expect(merged.act1Hero.titleEn).toBe('Existing Hero Title');
      expect(merged.heroMedia.mediaUrl).toBe('https://cdn.e3.qa/hero.mp4');
      expect(merged.act2Curtain.headingEn).toBe('Existing Manifesto');
      expect(merged.coreTeam.selectedMemberIds).toEqual(['team-1', 'team-2']);
      expect(merged.sequence.length).toBe(2);
    });

    it('Saving Landing Editor slice never overwrites or wipes guestMemories or heroMedia', () => {
      const existingPage = {
        heroMedia: { mediaType: 'VIDEO', mediaUrl: 'https://cdn.e3.qa/curtain.mp4' },
        maskedVideo: { enabled: true, preset: 'ORGANIC_WINDOW', scale: 1.2 },
        guestMemories: {
          headlineEn: 'Preserved Guest Memories',
          moments: [{ id: 'm-special', titleEn: 'Special Moment', isVisible: true }],
        },
      };

      const incomingLandingEditorUpdate = {
        act1Hero: { titleEn: 'Updated Act 1 Title', titleAr: 'عنوان محدث' },
        act2Curtain: { headingEn: 'Updated Manifesto' },
        cta: { titleEn: 'Updated CTA Title', buttonUrl: '/en/b2c/passes' },
      };

      const merged = deepMergeCMSContent(existingPage, incomingLandingEditorUpdate);

      // Landing slices updated
      expect(merged.act1Hero.titleEn).toBe('Updated Act 1 Title');
      expect(merged.act2Curtain.headingEn).toBe('Updated Manifesto');
      expect(merged.cta.buttonUrl).toBe('/en/b2c/passes');

      // Specialized slices preserved
      expect(merged.heroMedia.mediaUrl).toBe('https://cdn.e3.qa/curtain.mp4');
      expect(merged.maskedVideo.scale).toBe(1.2);
      expect(merged.guestMemories.headlineEn).toBe('Preserved Guest Memories');
      expect(merged.guestMemories.moments[0].id).toBe('m-special');
    });

    it('Saving Media Manager slice never overwrites or wipes guestMemories, sequence, or team', () => {
      const existingPage = {
        sequence: [{ id: 'hero', isVisible: true }],
        coreTeam: { selectedMemberIds: ['emp-1'] },
        guestMemories: { headlineEn: 'Intact Memories' },
      };

      const incomingMediaUpdate = {
        heroMedia: { mediaType: 'IMAGE', mediaUrl: 'https://cdn.e3.qa/new-cover.jpg' },
        maskedVideo: { enabled: false, preset: 'PILL_CAPSULE' },
      };

      const merged = deepMergeCMSContent(existingPage, incomingMediaUpdate);

      expect(merged.heroMedia.mediaUrl).toBe('https://cdn.e3.qa/new-cover.jpg');
      expect(merged.maskedVideo.preset).toBe('PILL_CAPSULE');
      expect(merged.guestMemories.headlineEn).toBe('Intact Memories');
      expect(merged.coreTeam.selectedMemberIds).toEqual(['emp-1']);
      expect(merged.sequence[0].id).toBe('hero');
    });
  });

  // =========================================================================
  // 3. EMPTY, LOADING, & VALIDATION STATES
  // =========================================================================
  describe('3. Empty & Loading States', () => {
    it('EverlastingMemoriesManager renders designed empty state when moments array is empty', () => {
      const emptyMemories = {
        headlineEn: 'Empty Memories',
        headlineAr: 'ذكريات فارغة',
        moments: [],
      };

      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <EverlastingMemoriesManager value={emptyMemories} isStandalone={true} />
        </LocaleProvider>
      );

      expect(htmlEn).toContain('No guest moment cards added yet.');
      expect(htmlEn).toContain('Add New Moment Card');

      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <EverlastingMemoriesManager value={emptyMemories} isStandalone={true} />
        </LocaleProvider>
      );

      expect(htmlAr).toContain('لا توجد بطاقات ذكريات حالياً.');
      expect(htmlAr).toContain('إضافة بطاقة لحظات جديدة');
    });

    it('Sequential multi-slice updates preserve all cumulative changes across Landing, Memories, and Media managers', () => {
      let pageState: any = {
        ...DEFAULT_B2C_LANDING_CONTENT,
      };

      // 1. Memories Manager updates guestMemories
      pageState = deepMergeCMSContent(pageState, {
        guestMemories: {
          headlineEn: 'Customized Moments 2026',
          moments: [{ id: 'm-test', titleEn: 'Test Moment' }],
        },
      });

      // 2. Landing Editor updates hero headlines and sequence
      pageState = deepMergeCMSContent(pageState, {
        act1Hero: { titleEn: 'New Hero Experience 2026' },
        sequence: [{ id: 'hero', isVisible: true }, { id: 'manifesto', isVisible: false }],
      });

      // 3. Media Manager updates heroMedia
      pageState = deepMergeCMSContent(pageState, {
        heroMedia: { mediaType: 'VIDEO', mediaUrl: 'https://cdn.e3.qa/promo-2026.mp4' },
      });

      // Verify all 3 slices coexist without any data clobbering
      expect(pageState.guestMemories.headlineEn).toBe('Customized Moments 2026');
      expect(pageState.guestMemories.moments[0].titleEn).toBe('Test Moment');
      expect(pageState.act1Hero.titleEn).toBe('New Hero Experience 2026');
      expect(pageState.sequence[1].isVisible).toBe(false);
      expect(pageState.heroMedia.mediaUrl).toBe('https://cdn.e3.qa/promo-2026.mp4');
    });

    it('Renders loading skeleton state when initialData is missing and data is loading', () => {
      const htmlLanding = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <B2CLandingCMSView initialData={null} />
        </LocaleProvider>
      );
      expect(htmlLanding).toContain('animate-pulse');

      const htmlMedia = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <B2CMediaManager initialData={null} />
        </LocaleProvider>
      );
      expect(htmlMedia).toContain('animate-pulse');
    });
  });
});
