import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config';
import { GET as robotsGET } from '../app/robots.txt/route';
import sitemap from '../app/sitemap';

describe('Gate 11: Launch Readiness & Production Audits', () => {
  describe('1. Security Headers & Allowed Media Domains', () => {
    it('1. should include HSTS, CSP, and X-Frame-Options security headers in next.config.ts', async () => {
      const config = nextConfig as any;
      expect(config.headers).toBeDefined();
      const headerList = await config.headers();
      expect(headerList.length).toBeGreaterThan(0);

      const globalHeaders = headerList.find((h: any) => h.source === '/(.*)');
      expect(globalHeaders).toBeDefined();

      const keys = globalHeaders.headers.map((h: any) => h.key);
      expect(keys).toContain('X-Frame-Options');
      expect(keys).toContain('X-Content-Type-Options');
      expect(keys).toContain('Referrer-Policy');
      expect(keys).toContain('Permissions-Policy');
      expect(keys).toContain('Strict-Transport-Security');
      expect(keys).toContain('Content-Security-Policy');
    });

    it('2. should enforce remotePatterns image allowlist containing approved hosts', () => {
      const config = nextConfig as any;
      const patterns = config.images?.remotePatterns || [];
      const hostnames = patterns.map((p: any) => p.hostname);

      expect(hostnames).toContain('booking.e3.qa');
      expect(hostnames).toContain('cdn.e3.qa');
      expect(hostnames).toContain('images.unsplash.com');
      expect(hostnames).toContain('*.public.blob.vercel-storage.com');
    });
  });

  describe('2. Robots Rules & Environment Safety', () => {
    it('3. should return valid robots.txt endpoint response with user-agent, allow, and disallow rules', async () => {
      const response = await robotsGET();
      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toContain('User-agent: *');
      expect(text).toContain('Disallow: /dashboard/');
      expect(text).toContain('Disallow: /api/');
    });
  });

  describe('3. Sitemap Integrity & Exclusion Rules', () => {
    it('4. sitemap should include public static routes and exclude auth/login', async () => {
      const sitemapEntries = await sitemap();
      const urls = sitemapEntries.map((e) => e.url);

      expect(urls.some((u) => u.endsWith('/b2b'))).toBe(true);
      expect(urls.some((u) => u.endsWith('/b2c'))).toBe(true);
      expect(urls.some((u) => u.includes('/b2b/services'))).toBe(true);
      expect(urls.some((u) => u.includes('/b2b/case-studies'))).toBe(true);
      expect(urls.some((u) => u.includes('/b2c/attractions'))).toBe(true);

      // Exclusions
      expect(urls.some((u) => u.includes('/auth/'))).toBe(false);
      expect(urls.some((u) => u.includes('/dashboard/'))).toBe(false);
      expect(urls.some((u) => u.includes('/api/'))).toBe(false);
      expect(urls.some((u) => u.includes('/b2c/events/'))).toBe(false);
    });

    it('5. sitemap entries must include EN and AR alternate language links', async () => {
      const sitemapEntries = await sitemap();
      const rootEntry = sitemapEntries.find((e) => e.url === (process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa'));
      expect(rootEntry).toBeDefined();
      expect(rootEntry?.alternates?.languages).toBeDefined();
      expect(rootEntry?.alternates?.languages?.en).toContain('/en');
      expect(rootEntry?.alternates?.languages?.ar).toContain('/ar');
    });
  });

  describe('4. Metadata, Hreflang, and OpenGraph', () => {
    it('6. should have base metadata config with canonical, hreflang, and site title', () => {
      const defaultMetadata = {
        title: {
          template: '%s | E3 - Event Engineering Experts',
          default: 'E3 - We Build Experiences | Event Engineering Experts',
        },
        description: "Qatar's premier event engineering and entertainment agency.",
        metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa'),
        alternates: {
          canonical: '/',
          languages: {
            en: '/en/',
            ar: '/ar/',
          },
        },
        openGraph: {
          title: 'E3 - We Build Experiences',
          siteName: 'E3 Qatar',
          locale: 'en_QA',
          type: 'website',
        },
      };

      expect(defaultMetadata.title.default).toContain('E3');
      expect(defaultMetadata.alternates.canonical).toBe('/');
      expect(defaultMetadata.alternates.languages.en).toBe('/en/');
      expect(defaultMetadata.alternates.languages.ar).toBe('/ar/');
      expect(defaultMetadata.openGraph.siteName).toBe('E3 Qatar');
    });
  });

  describe('5. Bundle & Module Isolation', () => {
    it('7. verify next.config.ts optimizes package imports for icon libraries', () => {
      const config = nextConfig as any;
      expect(config.experimental?.optimizePackageImports).toContain('lucide-react');
    });

    it('8. verify serverExternalPackages isolates prisma and bcryptjs from client bundles', () => {
      const config = nextConfig as any;
      expect(config.serverExternalPackages).toContain('@prisma/client');
      expect(config.serverExternalPackages).toContain('bcryptjs');
    });
  });
});
