import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Footer } from '@/components/layout/Footer';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { B2CLandingCMSView } from '@/components/dashboard/b2c/B2CLandingCMSView';
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages';
import { resolvePublicSiteSettings } from '@/lib/settings/public-settings';

// Mock router for Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en/dashboard/b2c/landing-page',
}));

describe('QF-33: B2C Universal Footer Multi-Media Engine & Landing Editor Integration', () => {

  describe('1. Universal Footer Media Formats & Rendering', () => {
    it('renders High-Res Image media backdrop with gradient overlay scrim', () => {
      const settings = {
        siteNameEn: 'E3 Qatar',
        footerMediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop',
        footerMediaType: 'IMAGE',
        footerDescriptionEn: 'Pioneering entertainment in Qatar.'
      };

      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <Footer portal="b2c" settings={settings} />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('img');
      expect(html).toContain('https://images.unsplash.com/photo-1514525253161-7a46d19cd819');
      expect(html).toContain('Pioneering entertainment in Qatar.');
      expect(html).toContain('Qatar PDPL Compliant');
    });

    it('renders Direct Video (MP4) backdrop with autoplay, loop, and muted controls', () => {
      const settings = {
        siteNameEn: 'E3 Qatar',
        footerMediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-in-motion-42589-large.mp4',
        footerMediaType: 'VIDEO',
        footerPosterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
      };

      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <Footer portal="b2c" settings={settings} />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('<video');
      expect(html).toContain('src="https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-in-motion-42589-large.mp4"');
      expect(html).toContain('poster="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&amp;w=1200&amp;auto=format&amp;fit=crop"');
    });

    it('renders YouTube / Vimeo Stream embed in iframe mode', () => {
      const settings = {
        siteNameEn: 'E3 Qatar',
        footerMediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        footerMediaType: 'YOUTUBE',
      };

      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <Footer portal="b2c" settings={settings} />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('<iframe');
      expect(html).toContain('youtube.com/embed/dQw4w9WgXcQ');
    });

    it('auto-detects video format when raw mp4 URL is provided without explicit mediaType', () => {
      const settings = {
        siteNameEn: 'E3 Qatar',
        footerMediaUrl: 'https://cdn.e3.qa/assets/laser-night.mp4',
      };

      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <Footer portal="b2c" settings={settings} />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('<video');
      expect(html).toContain('src="https://cdn.e3.qa/assets/laser-night.mp4"');
    });

    it('never passes a Spline iframe URL to an <img> and renders iframe or poster backdrop', () => {
      const settings = {
        siteNameEn: 'E3 Qatar',
        footerMediaUrl: 'https://my.spline.design/animatedpaperboat-ahi7E6PPIrYTnd679KdwEtKu/',
        footerMediaType: 'IFRAME',
        footerPosterUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg',
      };

      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <Footer portal="b2c" settings={settings} />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('<iframe');
      expect(html).toContain('src="https://my.spline.design/animatedpaperboat-ahi7E6PPIrYTnd679KdwEtKu/"');
      // Must not pass the spline iframe url to an img src
      expect(html).not.toContain('<img src="https://my.spline.design/animatedpaperboat-ahi7E6PPIrYTnd679KdwEtKu/"');
    });

    it('uses footerPosterUrl for image background when footerMediaType is IMAGE', () => {
      const settings = {
        siteNameEn: 'E3 Qatar',
        footerMediaUrl: 'https://my.spline.design/animatedpaperboat-ahi7E6PPIrYTnd679KdwEtKu/',
        footerMediaType: 'IMAGE',
        footerPosterUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg',
      };

      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ThemeProvider>
            <Footer portal="b2c" settings={settings} />
          </ThemeProvider>
        </LocaleProvider>
      );

      expect(html).toContain('<img');
      expect(html).toContain('src="https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg"');
      expect(html).not.toContain('src="https://my.spline.design');
    });
  });

  describe('2. B2C Landing Page Editor Section 8 Studio', () => {
    it('renders Section 8 tab label and studio in English mode', () => {
      const htmlEn = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <B2CLandingCMSView initialData={DEFAULT_B2C_LANDING_CONTENT} />
        </LocaleProvider>
      );

      expect(htmlEn).toContain('8. Footer Framing');
      expect(htmlEn).toContain('Universal Media');
    });

    it('renders Section 8 in Arabic mode with localized copy and PDPL labels', () => {
      const htmlAr = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <B2CLandingCMSView initialData={DEFAULT_B2C_LANDING_CONTENT} />
        </LocaleProvider>
      );

      expect(htmlAr).toContain('٨. خاتمة الصفحة');
      expect(htmlAr).toContain('وسائط الفوتر');
    });
  });

  describe('3. Public Settings DTO Serialization', () => {
    it('maps all universal footer media and description attributes cleanly', () => {
      const rawMap = {
        footerMediaUrl: 'https://cdn.e3.qa/media/footer-glow.mp4',
        footerMediaType: 'VIDEO',
        footerPosterUrl: 'https://cdn.e3.qa/media/footer-poster.webp',
        footerDescriptionEn: 'Pioneering entertainment.',
        footerDescriptionAr: 'ريادة الترفيه في قطر.',
      };

      const resolved = resolvePublicSiteSettings(rawMap);
      expect(resolved.footerMediaUrl).toBe('https://cdn.e3.qa/media/footer-glow.mp4');
      expect(resolved.footerMediaType).toBe('VIDEO');
      expect(resolved.footerPosterUrl).toBe('https://cdn.e3.qa/media/footer-poster.webp');
      expect(resolved.footerDescriptionEn).toBe('Pioneering entertainment.');
      expect(resolved.footerDescriptionAr).toBe('ريادة الترفيه في قطر.');
    });
  });
});
