import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(async () => null),
}));
vi.mock('next-auth', () => ({
  default: vi.fn(),
}));
vi.mock('next/font/google', () => ({
  Manrope: () => ({ variable: '--font-manrope' }),
  IBM_Plex_Sans_Arabic: () => ({ variable: '--font-ibm-arabic' }),
}));

import sitemap from '../app/sitemap';
import { GET as getRobotsTxt } from '../app/robots.txt/route';
import { getBaseUrl, getCanonicalUrl, getSeoAlternates, buildLocalBusinessSchema } from '../lib/seo-helper';
import { generateMetadata as generateLayoutMetadata } from '../app/layout';
import { generateMetadata as generateB2BMetadata } from '../app/[locale]/b2b/page';
import { generateMetadata as generateB2CMetadata } from '../app/[locale]/b2c/page';
import { generateMetadata as generateServicesMetadata } from '../app/[locale]/b2b/services/page';
import { generateMetadata as generateAttractionsMetadata } from '../app/[locale]/b2c/attractions/page';
import { generateMetadata as generatePackagesMetadata } from '../app/[locale]/b2c/packages/page';
import { generateMetadata as generateCreatorsMetadata } from '../app/[locale]/creators/page';
import db from '@/lib/db';

// Mock DB
vi.mock('@/lib/db', () => ({
  default: {
    setting: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    attraction: {
      findMany: vi.fn().mockResolvedValue([
        { slug: 'inflata-park-city-center', updatedAt: new Date('2026-08-01') },
        { slug: 'urban-arena-doha-mall', updatedAt: new Date('2026-08-02') },
      ]),
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    service: {
      findMany: vi.fn().mockResolvedValue([
        { slug: 'spatial-design', updatedAt: new Date('2026-08-01') },
        { slug: 'kinetic-av', updatedAt: new Date('2026-08-02') },
      ]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    package: {
      findMany: vi.fn().mockResolvedValue([
        { slug: 'vip-birthday', updatedAt: new Date('2026-08-01') },
      ]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    employeeProfile: {
      findMany: vi.fn().mockResolvedValue([
        { slug: 'john-doe', isActive: true, updatedAt: new Date('2026-08-01') },
      ]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    pages: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
  db: {
    pages: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
}));

vi.mock('@/lib/case-studies', () => ({
  getPublicCaseStudies: vi.fn().mockResolvedValue([
    { slug: 'doha-balloon-parade-2022', updatedAt: new Date('2026-08-01') },
  ]),
}));

vi.mock('@/lib/cms-server', () => ({
  getCMSPageContentServer: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/influencer/influencer-service', () => ({
  getPublicFeaturedCreators: vi.fn().mockResolvedValue([]),
}));

describe('Comprehensive SEO, Indexation & Keyword Quality Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. SEO Helper & Canonical Engine', () => {
    it('getBaseUrl returns https://eeeqa.com without trailing slashes', () => {
      const base = getBaseUrl();
      expect(base).toBe('https://eeeqa.com');
      expect(base.endsWith('/')).toBe(false);
    });

    it('getCanonicalUrl builds absolute URLs for EN and AR', () => {
      expect(getCanonicalUrl('en', '/b2b')).toBe('https://eeeqa.com/en/b2b');
      expect(getCanonicalUrl('ar', '/b2b')).toBe('https://eeeqa.com/ar/b2b');
      expect(getCanonicalUrl('en', 'b2c/attractions')).toBe('https://eeeqa.com/en/b2c/attractions');
    });

    it('getSeoAlternates generates absolute canonical and complete language links', () => {
      const alternates = getSeoAlternates('/b2b/services', 'en');
      expect(alternates.canonical).toBe('https://eeeqa.com/en/b2b/services');
      expect(alternates.languages.en).toBe('https://eeeqa.com/en/b2b/services');
      expect(alternates.languages.ar).toBe('https://eeeqa.com/ar/b2b/services');
      expect(alternates.languages['x-default']).toBe('https://eeeqa.com/en/b2b/services');
    });

    it('buildLocalBusinessSchema outputs Google-compliant EntertainmentBusiness & LocalBusiness schema', () => {
      const schema = buildLocalBusinessSchema();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toContain('EntertainmentBusiness');
      expect(schema['@type']).toContain('LocalBusiness');
      expect(schema.name).toContain('Events & Entertainment Enterprises');
      expect(schema.telephone).toBe('+974 3048 9955');
      expect(schema.address.streetAddress).toContain('Palm Tower B');
      expect(schema.address.addressLocality).toBe('Doha');
      expect(schema.address.addressCountry).toBe('QA');
      expect(schema.geo.latitude).toBe(25.3217);
      expect(schema.geo.longitude).toBe(51.5310);
      expect(schema.areaServed.some((a) => a.name === 'Qatar')).toBe(true);
      expect(schema.sameAs).toContain('https://www.facebook.com/e3qatar');
    });
  });

  describe('2. Robots.txt Route', () => {
    it('serves Sitemap pointing to standard sitemap.xml', async () => {
      const res = await getRobotsTxt();
      const text = await res.text();
      expect(text).toContain('Sitemap: https://eeeqa.com/sitemap.xml');
      expect(text).toContain('Allow: /');
      expect(text).toContain('Disallow: /dashboard/');
    });
  });

  describe('3. XML Sitemap Zero-Redirect & Full Multilingual Coverage', () => {
    it('sitemap contains zero bare/unprefixed redirecting URLs', async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      // Verify NO bare URLs like https://eeeqa.com/b2b, https://eeeqa.com/b2c, https://eeeqa.com/b2b/services
      const bareRedirectingUrls = urls.filter((u) => {
        if (u === 'https://eeeqa.com') return false; // root is valid
        return !u.includes('/en') && !u.includes('/ar');
      });
      expect(bareRedirectingUrls).toEqual([]);
    });

    it('sitemap contains zero redirecting routes like /b2c/tickets', async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);
      expect(urls.some((u) => u.includes('/tickets'))).toBe(false);
    });

    it('sitemap outputs both EN and AR entries for every static route', async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      expect(urls).toContain('https://eeeqa.com/en/b2b');
      expect(urls).toContain('https://eeeqa.com/ar/b2b');
      expect(urls).toContain('https://eeeqa.com/en/b2c');
      expect(urls).toContain('https://eeeqa.com/ar/b2c');
      expect(urls).toContain('https://eeeqa.com/en/b2b/services');
      expect(urls).toContain('https://eeeqa.com/ar/b2b/services');
      expect(urls).toContain('https://eeeqa.com/en/b2c/attractions');
      expect(urls).toContain('https://eeeqa.com/ar/b2c/attractions');
      expect(urls).toContain('https://eeeqa.com/en/b2c/packages');
      expect(urls).toContain('https://eeeqa.com/ar/b2c/packages');
      expect(urls).toContain('https://eeeqa.com/en/creators');
      expect(urls).toContain('https://eeeqa.com/ar/creators');
      expect(urls).toContain('https://eeeqa.com/en/privacy');
      expect(urls).toContain('https://eeeqa.com/ar/privacy');
      expect(urls).toContain('https://eeeqa.com/en/terms');
      expect(urls).toContain('https://eeeqa.com/ar/terms');
    });

    it('sitemap outputs both EN and AR entries for dynamic routes', async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      expect(urls).toContain('https://eeeqa.com/en/b2c/attractions/inflata-park-city-center');
      expect(urls).toContain('https://eeeqa.com/ar/b2c/attractions/inflata-park-city-center');
      // Urban Arena canonical slug repair
      expect(urls).toContain('https://eeeqa.com/en/b2c/attractions/urban-arena');
      expect(urls).toContain('https://eeeqa.com/ar/b2c/attractions/urban-arena');

      expect(urls).toContain('https://eeeqa.com/en/b2b/services/spatial-design');
      expect(urls).toContain('https://eeeqa.com/ar/b2b/services/spatial-design');

      expect(urls).toContain('https://eeeqa.com/en/b2b/case-studies/doha-balloon-parade-2022');
      expect(urls).toContain('https://eeeqa.com/ar/b2b/case-studies/doha-balloon-parade-2022');

      expect(urls).toContain('https://eeeqa.com/en/b2c/packages/vip-birthday');
      expect(urls).toContain('https://eeeqa.com/ar/b2c/packages/vip-birthday');

      expect(urls).toContain('https://eeeqa.com/en/b2b/team/john-doe');
      expect(urls).toContain('https://eeeqa.com/ar/b2b/team/john-doe');
    });

    it('every sitemap entry includes bidirectional hreflang alternates with x-default', async () => {
      const entries = await sitemap();
      for (const entry of entries) {
        expect(entry.alternates).toBeDefined();
        expect(entry.alternates?.languages?.en).toBeDefined();
        expect(entry.alternates?.languages?.ar).toBeDefined();
        expect(entry.alternates?.languages?.['x-default']).toBeDefined();
        expect(entry.alternates?.languages?.en).toContain('https://eeeqa.com/en');
        expect(entry.alternates?.languages?.ar).toContain('https://eeeqa.com/ar');
      }
    });
  });

  describe('4. Metadata Quality & High-Volume Qatar Keywords (Anti-AI Fluff)', () => {
    it('root layout metadata contains commercial keywords and absolute canonical', async () => {
      const meta = await generateLayoutMetadata();
      const defaultTitle = typeof meta.title === 'object' && meta.title && 'default' in meta.title ? meta.title.default : '';
      expect(defaultTitle).toContain('Events & Entertainment Enterprises (E3 Qatar)');
      expect(meta.description).toContain('event management company');
      expect(meta.description).toContain('Doha');
      expect(meta.alternates?.canonical).toBe('https://eeeqa.com');
      expect((meta.alternates?.languages as any)?.['x-default']).toBe('https://eeeqa.com/en');
    });

    it('B2B page metadata contains targeted commercial terms and NO "Destination Atelier"', async () => {
      const metaEn = await generateB2BMetadata({ params: Promise.resolve({ locale: 'en' }) });
      const metaAr = await generateB2BMetadata({ params: Promise.resolve({ locale: 'ar' }) });

      // English
      expect(metaEn.title).toContain('Event Management Company in Qatar');
      expect(metaEn.title).not.toContain('Destination Atelier');
      expect(metaEn.description).toContain('event management');
      expect(metaEn.description).toContain('Doha, Qatar');
      expect(metaEn.alternates?.canonical).toBe('https://eeeqa.com/en/b2b');
      expect((metaEn.alternates?.languages as any)?.['x-default']).toBe('https://eeeqa.com/en/b2b');

      // Arabic
      expect(metaAr.title).toContain('شركة تنظيم فعاليات ومؤتمرات في قطر');
      expect(metaAr.description).toContain('تنظيم وإدارة الفعاليات');
      expect(metaAr.alternates?.canonical).toBe('https://eeeqa.com/ar/b2b');
    });

    it('B2C page metadata contains attractions keywords and NO generic "Experiences"', async () => {
      const metaEn = await generateB2CMetadata({ params: Promise.resolve({ locale: 'en' }) });
      const metaAr = await generateB2CMetadata({ params: Promise.resolve({ locale: 'ar' }) });

      // English
      expect(metaEn.title).toContain('Attractions, Theme Parks & Family Entertainment in Qatar');
      expect(metaEn.description).toContain('live attractions');
      expect(metaEn.description).toContain('InflataRUN');
      expect(metaEn.alternates?.canonical).toBe('https://eeeqa.com/en/b2c');

      // Arabic
      const arTitle = typeof metaAr.title === 'object' && metaAr.title && 'absolute' in metaAr.title ? metaAr.title.absolute : '';
      expect(arTitle).toContain('وجهات ترفيهية وفعاليات عائلية في قطر');
      expect(metaAr.description).toContain('أفضل الأماكن والوجهات الترفيهية في قطر');
      expect(metaAr.alternates?.canonical).toBe('https://eeeqa.com/ar/b2c');
    });

    it('B2B services page metadata has absolute canonical and eeeqa.com domain', async () => {
      const meta = await generateServicesMetadata({ params: Promise.resolve({ locale: 'en' }) });
      expect(meta.title).toContain('Event Production & Management Services in Qatar');
      expect(meta.alternates?.canonical).toBe('https://eeeqa.com/en/b2b/services');
    });

    it('B2C attractions page metadata has absolute localized canonical', async () => {
      const meta = await generateAttractionsMetadata({ params: Promise.resolve({ locale: 'en' }) });
      expect(meta.title).toContain('Top Attractions & Family Entertainment in Qatar');
      expect(meta.alternates?.canonical).toBe('https://eeeqa.com/en/b2c/attractions');
    });

    it('B2C packages page metadata has absolute localized canonical and commercial keywords', async () => {
      const meta = await generatePackagesMetadata({ params: Promise.resolve({ locale: 'en' }) });
      expect(meta.title).toContain('Group Entertainment Packages');
      expect(meta.alternates?.canonical).toBe('https://eeeqa.com/en/b2c/packages');
    });

    it('Creators page metadata exports high-intent creator network keywords and absolute canonical', async () => {
      const meta = await generateCreatorsMetadata({ params: Promise.resolve({ locale: 'en' }) });
      expect(meta.title).toContain('Creator Collective & Influencer Network in Qatar');
      expect(meta.alternates?.canonical).toBe('https://eeeqa.com/en/creators');
    });
  });
});
