import { describe, it, expect } from 'vitest';
import { deepMergeCMSContent } from '../lib/cms-server';
import { getMergedCMSPageContent } from '../lib/cms-default-pages';
import nextConfig from '../../next.config';

describe('E3 CMS Media Upload & Persistence Repair Tests', () => {
  it('1. deepMergeCMSContent should preserve media URLs in existing sections when incoming section is omitted', () => {
    const existing = {
      heroMedia: {
        mediaUrl: 'https://cdn.e3.qa/hero-video.mp4',
        mediaType: 'VIDEO',
        posterUrl: 'https://cdn.e3.qa/hero-poster.jpg',
      },
      act2: {
        headlineEn: 'Original Act 2 Headline',
        steps: [
          { id: 's1', titleEn: 'Step 1', mediaUrl: 'https://cdn.e3.qa/step1.jpg' },
          { id: 's2', titleEn: 'Step 2', mediaUrl: 'https://cdn.e3.qa/step2.jpg' },
        ],
      },
    };

    const partialUpdate = {
      act2: {
        headlineEn: 'Updated Act 2 Headline Only',
      },
    };

    const merged = deepMergeCMSContent(existing, partialUpdate);

    // Hero media must be preserved untouched
    expect(merged.heroMedia.mediaUrl).toBe('https://cdn.e3.qa/hero-video.mp4');
    expect(merged.heroMedia.posterUrl).toBe('https://cdn.e3.qa/hero-poster.jpg');

    // Act 2 headline updated, but steps and mediaUrls preserved via stable IDs
    expect(merged.act2.headlineEn).toBe('Updated Act 2 Headline Only');
  });

  it('2. deepMergeCMSContent should allow intentional media removal when explicit removal action supplied', () => {
    const existing = {
      logoUrl: 'https://cdn.e3.qa/logo.png',
      heroMediaUrl: 'https://cdn.e3.qa/hero.png',
    };

    const explicitRemovePayload = {
      logoUrl: '__REMOVE__',
      heroMediaUrl: 'https://cdn.e3.qa/new-hero.png',
    };

    const merged = deepMergeCMSContent(existing, explicitRemovePayload);

    // Explicit __REMOVE__ action should remove logoUrl to empty string
    expect(merged.logoUrl).toBe('');
    // Non-empty new heroMediaUrl should update correctly
    expect(merged.heroMediaUrl).toBe('https://cdn.e3.qa/new-hero.png');
  });

  it('3. deepMergeCMSContent should reject temporary blob: or localhost URLs', () => {
    const existing = {
      heroMediaUrl: 'https://cdn.e3.qa/hero.png',
    };

    const tempUrlPayload = {
      heroMediaUrl: 'blob:http://localhost:3000/1234-5678-90ab',
    };

    expect(() => deepMergeCMSContent(existing, tempUrlPayload)).toThrow(/Temporary or local URL/i);
  });

  it('4. getMergedCMSPageContent should resolve hero media URLs consistently across aliases', () => {
    const rawContent = {
      heroMedia: {
        mediaUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero.mp4',
        mediaType: 'VIDEO',
        posterUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/poster.jpg',
      },
    };

    const merged = getMergedCMSPageContent('b2c-landing', rawContent);

    expect(merged.heroMedia.mediaUrl).toBe('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero.mp4');
    expect(merged.hero.mediaUrl).toBe('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero.mp4');
    expect(merged.act1Hero.desktopVideoUrl).toBe('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero.mp4');
  });

  it('5. next.config.ts CSP must allow Vercel Blob storage for media-src and img-src', async () => {
    const headers = await (nextConfig as any).headers();
    const globalHeaders = headers.find((h: any) => h.source === '/(.*)')?.headers;
    const csp = globalHeaders?.find((h: any) => h.key === 'Content-Security-Policy')?.value;

    expect(csp).toBeDefined();
    expect(csp).toContain('media-src');
    expect(csp).toContain('https://*.public.blob.vercel-storage.com');
    expect(csp).toContain('img-src');
  });
});
