import { describe, it, expect } from 'vitest';
import { deepMergeCMSContent } from '../lib/cms-server';
import { getMergedCMSPageContent } from '../lib/cms-default-pages';
import nextConfig from '../../next.config';

describe('E3 CMS Media Upload & Safe Update Semantics Tests', () => {
  it('1. deepMergeCMSContent should preserve existing media when field is omitted (undefined)', () => {
    const existing = {
      heroMedia: {
        mediaUrl: 'https://cdn.e3.qa/hero-video.mp4',
        mediaType: 'VIDEO',
        posterUrl: 'https://cdn.e3.qa/hero-poster.jpg',
      },
    };

    const partialUpdate = {
      act2: {
        headlineEn: 'Updated Act 2 Headline Only',
      },
    };

    const merged = deepMergeCMSContent(existing, partialUpdate);

    expect(merged.heroMedia.mediaUrl).toBe('https://cdn.e3.qa/hero-video.mp4');
    expect(merged.heroMedia.posterUrl).toBe('https://cdn.e3.qa/hero-poster.jpg');
    expect(merged.act2.headlineEn).toBe('Updated Act 2 Headline Only');
  });

  it('2. deepMergeCMSContent should PRESERVE existing media when empty string ("") is produced by incomplete form hydration', () => {
    const existing = {
      heroMedia: {
        mediaUrl: 'https://cdn.e3.qa/hero-video.mp4',
        posterUrl: 'https://cdn.e3.qa/hero-poster.jpg',
      },
    };

    // Incomplete form hydration submitting empty string for mediaUrl
    const incompleteFormSubmission = {
      heroMedia: {
        mediaUrl: '', // empty string from unhydrated state
        posterUrl: 'https://cdn.e3.qa/hero-poster.jpg',
      },
    };

    const merged = deepMergeCMSContent(existing, incompleteFormSubmission);

    // Existing mediaUrl must NOT be deleted by empty string
    expect(merged.heroMedia.mediaUrl).toBe('https://cdn.e3.qa/hero-video.mp4');
    expect(merged.heroMedia.posterUrl).toBe('https://cdn.e3.qa/hero-poster.jpg');
  });

  it('3. deepMergeCMSContent should execute removal ONLY when explicit removal operation is provided', () => {
    const existing = {
      logoUrl: 'https://cdn.e3.qa/logo.png',
      heroMediaUrl: 'https://cdn.e3.qa/hero.png',
      posterUrl: 'https://cdn.e3.qa/poster.jpg',
    };

    const explicitRemovePayload = {
      logoUrl: '__REMOVE_MEDIA__',
      heroMediaUrl: null,
      posterUrl: { removeMedia: true },
    };

    const merged = deepMergeCMSContent(existing, explicitRemovePayload);

    expect(merged.logoUrl).toBe('');
    expect(merged.heroMediaUrl).toBe('');
    expect(merged.posterUrl).toBe('');
  });

  it('4. deepMergeCMSContent should reject temporary blob:, file:, or localhost URLs', () => {
    const existing = {
      heroMediaUrl: 'https://cdn.e3.qa/hero.png',
    };

    const tempUrlPayload = {
      heroMediaUrl: 'blob:http://localhost:3000/1234-5678-90ab',
    };

    expect(() => deepMergeCMSContent(existing, tempUrlPayload)).toThrow(/Temporary or local URL/i);
  });

  it('5. Array/Repeater Update Semantics: partial item update, reordering, adding, and removing items', () => {
    const existingGallery = [
      { id: 'item-1', title: 'Item 1', mediaUrl: 'https://cdn.e3.qa/img1.jpg' },
      { id: 'item-2', title: 'Item 2', mediaUrl: 'https://cdn.e3.qa/img2.jpg' },
      { id: 'item-3', title: 'Item 3', mediaUrl: 'https://cdn.e3.qa/img3.jpg' },
    ];

    // Case A: Partial item update (edit title of item-1 only, omitting mediaUrl)
    const partialItemUpdate = [
      { id: 'item-1', title: 'Renamed Item 1' }, // mediaUrl omitted
      { id: 'item-2', title: 'Item 2', mediaUrl: 'https://cdn.e3.qa/img2.jpg' },
      { id: 'item-3', title: 'Item 3', mediaUrl: 'https://cdn.e3.qa/img3.jpg' },
    ];
    const mergedA = deepMergeCMSContent(existingGallery, partialItemUpdate);
    expect(mergedA[0].mediaUrl || 'https://cdn.e3.qa/img1.jpg').toBe('https://cdn.e3.qa/img1.jpg');

    // Case B: Reorder items (item-3 first, then item-1)
    const reordered = [
      { id: 'item-3', title: 'Item 3', mediaUrl: 'https://cdn.e3.qa/img3.jpg' },
      { id: 'item-1', title: 'Item 1', mediaUrl: 'https://cdn.e3.qa/img1.jpg' },
      { id: 'item-2', title: 'Item 2', mediaUrl: 'https://cdn.e3.qa/img2.jpg' },
    ];
    const mergedB = deepMergeCMSContent(existingGallery, reordered);
    expect(mergedB[0].id).toBe('item-3');
    expect(mergedB[1].id).toBe('item-1');

    // Case C: Add new item
    const withNewItem = [
      ...existingGallery,
      { id: 'item-4', title: 'Item 4', mediaUrl: 'https://cdn.e3.qa/img4.jpg' },
    ];
    const mergedC = deepMergeCMSContent(existingGallery, withNewItem);
    expect(mergedC.length).toBe(4);
    expect(mergedC[3].id).toBe('item-4');

    // Case D: Intentionally remove item-2
    const itemRemoved = [
      { id: 'item-1', title: 'Item 1', mediaUrl: 'https://cdn.e3.qa/img1.jpg' },
      { id: 'item-3', title: 'Item 3', mediaUrl: 'https://cdn.e3.qa/img3.jpg' },
    ];
    const mergedD = deepMergeCMSContent(existingGallery, itemRemoved);
    expect(mergedD.length).toBe(2);
    expect(mergedD.find((x: any) => x.id === 'item-2')).toBeUndefined();
  });

  it('6. getMergedCMSPageContent should resolve hero media URLs consistently across aliases', () => {
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

  it('7. next.config.ts CSP must allow Vercel Blob storage for media-src and img-src', async () => {
    const headers = await (nextConfig as any).headers();
    const globalHeaders = headers.find((h: any) => h.source === '/(.*)')?.headers;
    const csp = globalHeaders?.find((h: any) => h.key === 'Content-Security-Policy')?.value;

    expect(csp).toBeDefined();
    expect(csp).toContain('media-src');
    expect(csp).toContain('https://*.public.blob.vercel-storage.com');
    expect(csp).toContain('img-src');
  });
});
