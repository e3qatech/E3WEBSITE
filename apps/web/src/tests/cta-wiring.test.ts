import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { localizeHref, isExternalUrl } from '../lib/url-helper';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }),
  usePathname: () => '/en/b2c',
  useSearchParams: () => new URLSearchParams()
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' })
}));

// Import B2B components
import { B2BBrandPortfolio } from '../components/b2b/brands/B2BBrandPortfolio';
import { B2BHeader } from '../components/b2b/layout/B2BHeader';
import { B2BFooter } from '../components/b2b/layout/B2BFooter';

// Import B2C components
import { ExperienceWorldsStage } from '../components/b2c/story/ExperienceWorldsStage';
import { Act3AttractionWorlds } from '../components/b2c/story/Act3AttractionWorlds';
import { StoryTaxonomyPortals } from '../components/b2c/story/StoryTaxonomyPortals';
import { OurBrandsConstellation } from '../components/b2c/story/OurBrandsConstellation';
import { Act4LivingDayTimeline } from '../components/b2c/story/Act4LivingDayTimeline';
import { TactileDigitalTicket } from '../components/b2c/story/TactileDigitalTicket';
import { Act7TactileTicketScene } from '../components/b2c/story/Act7TactileTicketScene';
import { StoryTrailControl } from '../components/b2c/story/StoryTrailControl';
import { AttractionsDirectory } from '../components/b2c/AttractionsDirectory';
import { B2CAttractionCard, B2CEventCard, B2CThemeProvider } from '../components/ui/B2CThemeComponents';

function extractAllHrefs(html: string): string[] {
  const matches = html.matchAll(/href=["']([^"']+)["']/g);
  return Array.from(matches, m => m[1]);
}

function assertAllInternalHrefsLocalized(html: string, locale: 'en' | 'ar') {
  const hrefs = extractAllHrefs(html);
  expect(hrefs.length).toBeGreaterThan(0);

  for (const href of hrefs) {
    // Exclude external, fragment, mailto, tel, sms
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('sms:') ||
      isExternalUrl(href)
    ) {
      continue;
    }

    expect(href).toMatch(new RegExp(`^/${locale}(/|$)`));
  }
}

describe('QF-02-C: Semantic CTA Wiring & Destination Verification', () => {
  describe('1. B2B Semantic CTAs & Intent Routing', () => {
    it('wires Explore Services to /en/b2b/services and /ar/b2b/services', () => {
      const enHref = localizeHref('/b2b/services', 'en');
      const arHref = localizeHref('/b2b/services', 'ar');

      expect(enHref).toBe('/en/b2b/services');
      expect(arHref).toBe('/ar/b2b/services');
    });

    it('wires Start a Project to /en/b2b/contact and /ar/b2b/contact', () => {
      const enHref = localizeHref('/b2b/contact', 'en');
      const arHref = localizeHref('/b2b/contact', 'ar');

      expect(enHref).toBe('/en/b2b/contact');
      expect(arHref).toBe('/ar/b2b/contact');
    });

    it('preserves Request Proposal pointing to Contact route', () => {
      const enHref = localizeHref('/b2b/contact', 'en');
      const arHref = localizeHref('/b2b/contact', 'ar');

      expect(enHref).toBe('/en/b2b/contact');
      expect(arHref).toBe('/ar/b2b/contact');
    });

    it('preserves View All Case Studies pointing to Cases route', () => {
      const enHref = localizeHref('/b2b/cases', 'en');
      const arHref = localizeHref('/b2b/cases', 'ar');

      expect(enHref === '/en/b2b/case-studies' || enHref === '/en/b2b/cases').toBe(true);
      expect(arHref === '/ar/b2b/case-studies' || arHref === '/ar/b2b/cases').toBe(true);
    });

    it('renders B2BHeader with correct localized routes in English and Arabic', () => {
      const htmlEn = renderToString(React.createElement(B2BHeader, { locale: 'en' }));
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2b/services');
      expect(htmlEn.includes('/en/b2b/case-studies') || htmlEn.includes('/en/b2b/cases')).toBe(true);
      expect(htmlEn).toContain('/en/b2b/contact');

      const htmlAr = renderToString(React.createElement(B2BHeader, { locale: 'ar' }));
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2b/services');
      expect(htmlAr.includes('/ar/b2b/case-studies') || htmlAr.includes('/ar/b2b/cases')).toBe(true);
      expect(htmlAr).toContain('/ar/b2b/contact');
    });

    it('renders B2BFooter with correct localized routes in English and Arabic', () => {
      const htmlEn = renderToString(React.createElement(B2BFooter, { locale: 'en' }));
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2b/services');
      expect(htmlEn.includes('/en/b2b/case-studies') || htmlEn.includes('/en/b2b/cases')).toBe(true);
      expect(htmlEn).toContain('/en/b2b/contact');

      const htmlAr = renderToString(React.createElement(B2BFooter, { locale: 'ar' }));
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2b/services');
      expect(htmlAr.includes('/ar/b2b/case-studies') || htmlAr.includes('/ar/b2b/cases')).toBe(true);
      expect(htmlAr).toContain('/ar/b2b/contact');
    });

    it('renders B2BBrandPortfolio partnership link localized in English and Arabic', () => {
      const mockContent = {
        ourBrands: {
          brands: [
            {
              id: 'brand-1',
              slug: 'inflatarun',
              nameEn: 'InflataRUN',
              nameAr: 'إنفلاتاران',
              b2bInquiryUrl: '/b2b/contact?subject=InflataRUN',
              b2bCtaLabelEn: 'Inquire for Partnership',
              b2bCtaLabelAr: 'تواصل معنا للاستثمار'
            }
          ]
        }
      };

      const htmlEn = renderToString(React.createElement(B2BBrandPortfolio, { content: mockContent, locale: 'en' }));
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2b/contact?subject=InflataRUN');

      const htmlAr = renderToString(React.createElement(B2BBrandPortfolio, { content: mockContent, locale: 'ar' }));
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2b/contact?subject=InflataRUN');
    });
  });

  describe('2. B2C Landing Anchor Localization & Call Sites', () => {
    const mockAttractions = [
      {
        id: 'urban-arena',
        slug: 'urban-arena-doha',
        nameEn: 'Urban Arena Doha',
        nameAr: 'أوربان أرينا الدوحة',
        category: 'SPORTS_ARENA',
        heroMediaUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176',
        ticketingUrl: '/b2c/calendar',
        operations: { locationNameEn: 'Lusail', locationNameAr: 'لوسيل' }
      }
    ];

    const mockBrandContent = {
      ourBrands: {
        brands: [
          {
            id: 'brand-1',
            slug: 'inflatarun',
            nameEn: 'InflataRUN',
            nameAr: 'إنفلاتاران',
            internalRoute: '/b2c/brands/inflatarun',
            bookingUrl: '/b2c/calendar'
          }
        ]
      }
    };

    const mockTimelineContent = {
      livingDay: {
        titleEn: 'Day Schedule',
        scheduleNow: [
          {
            id: 'item-1',
            slug: 'urban-arena-doha',
            titleEn: 'Morning Jump',
            titleAr: 'قفز صباحي',
            venueEn: 'Lusail Arena',
            venueAr: 'صالة لوسيل',
            timeEn: '10:00 AM',
            timeAr: '10:00 ص',
            price: 65
          }
        ]
      }
    };

    const mockTaxonomyContent = {
      storyDiscovery: {
        storyTypes: [
          {
            id: 'adventure',
            nameEn: 'Adventure',
            nameAr: 'مغامرة',
            activations: [
              {
                id: 'act-1',
                attractionSlug: 'urban-arena-doha',
                titleEn: 'Urban Arena Activity',
                titleAr: 'نشاط أوربان أرينا'
              }
            ]
          }
        ]
      }
    };

    it('ExperienceWorldsStage renders strictly localized attraction URLs', () => {
      const htmlEn = renderToString(React.createElement(ExperienceWorldsStage, { content: {}, locale: 'en' }));
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2c/attractions/');

      const htmlAr = renderToString(React.createElement(ExperienceWorldsStage, { content: {}, locale: 'ar' }));
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2c/attractions/');
    });

    it('Act3AttractionWorlds renders strictly localized attraction URLs', () => {
      const htmlEn = renderToString(React.createElement(Act3AttractionWorlds, { content: {}, locale: 'en' }));
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2c/attractions/');

      const htmlAr = renderToString(React.createElement(Act3AttractionWorlds, { content: {}, locale: 'ar' }));
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2c/attractions/');
    });

    it('StoryTaxonomyPortals renders strictly localized attraction URLs', () => {
      const htmlEn = renderToString(React.createElement(StoryTaxonomyPortals, { content: mockTaxonomyContent, locale: 'en' }));
      assertAllInternalHrefsLocalized(htmlEn, 'en');

      const htmlAr = renderToString(React.createElement(StoryTaxonomyPortals, { content: mockTaxonomyContent, locale: 'ar' }));
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
    });

    it('OurBrandsConstellation renders strictly localized experience and booking URLs', () => {
      const htmlEn = renderToString(React.createElement(OurBrandsConstellation, { content: mockBrandContent, locale: 'en' }));
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2c/brands/');

      const htmlAr = renderToString(React.createElement(OurBrandsConstellation, { content: mockBrandContent, locale: 'ar' }));
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2c/brands/');
    });

    it('Act4LivingDayTimeline renders strictly localized attraction/ticket URLs', () => {
      const htmlEn = renderToString(React.createElement(Act4LivingDayTimeline, { content: mockTimelineContent, locale: 'en' }));
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2c/attractions/');

      const htmlAr = renderToString(React.createElement(Act4LivingDayTimeline, { content: mockTimelineContent, locale: 'ar' }));
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2c/attractions/');
    });

    it('TactileDigitalTicket renders strictly localized calendar and attractions URLs', () => {
      const htmlEn = renderToString(React.createElement(TactileDigitalTicket, { content: {}, locale: 'en' }));
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2c/calendar');
      expect(htmlEn).toContain('/en/b2c/attractions');

      const htmlAr = renderToString(React.createElement(TactileDigitalTicket, { content: {}, locale: 'ar' }));
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2c/calendar');
      expect(htmlAr).toContain('/ar/b2c/attractions');
    });

    it('Act7TactileTicketScene renders strictly localized ticket URLs', () => {
      const htmlEn = renderToString(React.createElement(Act7TactileTicketScene, { content: {}, locale: 'en' }));
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2c/calendar');

      const htmlAr = renderToString(React.createElement(Act7TactileTicketScene, { content: {}, locale: 'ar' }));
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2c/calendar');
    });

    it('StoryTrailControl renders strictly localized ticket URL', () => {
      const htmlEn = renderToString(React.createElement(StoryTrailControl, { locale: 'en' }));
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2c/calendar');

      const htmlAr = renderToString(React.createElement(StoryTrailControl, { locale: 'ar' }));
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2c/calendar');
    });

    it('AttractionsDirectory renders strictly localized ticketing URLs', () => {
      const htmlEn = renderToString(React.createElement(AttractionsDirectory, { initialAttractions: mockAttractions as any, locale: 'en' }));
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2c/calendar');

      const htmlAr = renderToString(React.createElement(AttractionsDirectory, { initialAttractions: mockAttractions as any, locale: 'ar' }));
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2c/calendar');
    });

    it('B2CAttractionCard renders strictly localized Explore Experience URL', () => {
      const mockAttr = {
        id: '1',
        slug: 'inflatarun-qatar',
        nameEn: 'InflataRUN',
        nameAr: 'إنفلاتاران',
        operations: { currentOccupancy: 50, maxCapacity: 100 }
      };

      const htmlEn = renderToString(
        React.createElement(
          B2CThemeProvider,
          { locale: 'en' },
          React.createElement(B2CAttractionCard, { attraction: mockAttr, locale: 'en' })
        )
      );
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2c/attractions/inflatarun-qatar');

      const htmlAr = renderToString(
        React.createElement(
          B2CThemeProvider,
          { locale: 'ar' },
          React.createElement(B2CAttractionCard, { attraction: mockAttr, locale: 'ar' })
        )
      );
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2c/attractions/inflatarun-qatar');
    });

    it('B2CEventCard renders strictly localized details URL', () => {
      const mockEvent = {
        id: 'event-101',
        titleEn: 'Karting Championship',
        titleAr: 'بطولة الكارتينج',
        startDate: new Date('2026-09-01T18:00:00Z')
      };

      const htmlEn = renderToString(
        React.createElement(
          B2CThemeProvider,
          { locale: 'en' },
          React.createElement(B2CEventCard, { event: mockEvent, locale: 'en' })
        )
      );
      assertAllInternalHrefsLocalized(htmlEn, 'en');
      expect(htmlEn).toContain('/en/b2c/calendar/event-101');

      const htmlAr = renderToString(
        React.createElement(
          B2CThemeProvider,
          { locale: 'ar' },
          React.createElement(B2CEventCard, { event: mockEvent, locale: 'ar' })
        )
      );
      assertAllInternalHrefsLocalized(htmlAr, 'ar');
      expect(htmlAr).toContain('/ar/b2c/calendar/event-101');
    });
  });

  describe('3. B2B Corporate Profile & Header CTA Resolution', () => {
    it('correctly maps and resolves B2B Corporate Profile public settings', async () => {
      const { resolvePublicSiteSettings, PUBLIC_SETTINGS_KEYS } = await import('../lib/settings/public-settings-dto');
      
      expect(PUBLIC_SETTINGS_KEYS.has('b2bProfileUrl')).toBe(true);
      expect(PUBLIC_SETTINGS_KEYS.has('b2bProfileLabelEn')).toBe(true);
      expect(PUBLIC_SETTINGS_KEYS.has('b2bProfileLabelAr')).toBe(true);
      expect(PUBLIC_SETTINGS_KEYS.has('b2bProfileEnabled')).toBe(true);
      expect(PUBLIC_SETTINGS_KEYS.has('b2bProfileExternal')).toBe(true);

      const resolved = resolvePublicSiteSettings({
        b2bProfileUrl: 'https://cdn.e3.qa/documents/e3-profile-2026.pdf',
        b2bProfileLabelEn: 'DOWNLOAD CORPORATE PROFILE',
        b2bProfileLabelAr: 'تحميل ملف الشركة',
        b2bProfileEnabled: 'true',
        b2bProfileExternal: 'true'
      });

      expect(resolved.b2bProfileUrl).toBe('https://cdn.e3.qa/documents/e3-profile-2026.pdf');
      expect(resolved.b2bProfileLabelEn).toBe('DOWNLOAD CORPORATE PROFILE');
      expect(resolved.b2bProfileLabelAr).toBe('تحميل ملف الشركة');
      expect(resolved.b2bProfileEnabled).toBe('true');
      expect(resolved.b2bProfileExternal).toBe('true');
    });
  });
});
