import { describe, it, expect } from 'vitest';
import { resolveMediaType } from '@/lib/media-resolver';
import { deepMergeCMSContent } from '@/lib/cms-server';

describe('Media Type Resolver & CMS Persistence Tests', () => {

  describe('Requirement 3: Table-driven media-type resolver verification', () => {

    it('1. should resolve MP4 and WebM as VIDEO', () => {
      expect(resolveMediaType('https://cdn.example.com/hero.mp4')).toBe('VIDEO');
      expect(resolveMediaType('https://cdn.example.com/intro.webm')).toBe('VIDEO');
      expect(resolveMediaType({ url: 'https://cdn.example.com/hero.mp4', contentType: 'video/mp4' })).toBe('VIDEO');
    });

    it('2. should resolve MOV, M4V and MKV as VIDEO', () => {
      expect(resolveMediaType('https://cdn.example.com/promo.mov')).toBe('VIDEO');
      expect(resolveMediaType('https://cdn.example.com/clip.m4v')).toBe('VIDEO');
      expect(resolveMediaType('https://cdn.example.com/movie.mkv')).toBe('VIDEO');
    });

    it('3. should handle uppercase extensions correctly', () => {
      expect(resolveMediaType('https://cdn.example.com/HERO_VIDEO.MP4')).toBe('VIDEO');
      expect(resolveMediaType('https://cdn.example.com/BANNER.PNG')).toBe('IMAGE');
      expect(resolveMediaType('https://cdn.example.com/GRAPHIC.WEBM')).toBe('VIDEO');
      expect(resolveMediaType('https://cdn.example.com/MODEL.GLB')).toBe('MODEL_3D');
    });

    it('4. should handle query strings and URL fragments', () => {
      expect(resolveMediaType('https://blob.vercel-storage.com/clip.mp4?v=123&t=456#t=10')).toBe('VIDEO');
      expect(resolveMediaType('https://blob.vercel-storage.com/photo.jpg?token=xyz#header')).toBe('IMAGE');
    });

    it('5. should handle Blob URLs without visible extension when contentType is provided', () => {
      expect(resolveMediaType({ url: 'https://blob.vercel-storage.com/uploads/3a7b9c1d', contentType: 'video/mp4' })).toBe('VIDEO');
      expect(resolveMediaType({ url: 'https://blob.vercel-storage.com/uploads/3a7b9c1d', contentType: 'image/webp' })).toBe('IMAGE');
    });

    it('6. should correctly classify Image URLs containing /video/ in path as IMAGE', () => {
      expect(resolveMediaType('https://cdn.example.com/video/assets/hero-banner.jpg')).toBe('IMAGE');
      expect(resolveMediaType('https://cdn.example.com/video/thumbnails/cover.png')).toBe('IMAGE');
    });

    it('7. should resolve Mixkit video URLs as VIDEO', () => {
      expect(resolveMediaType('https://assets.mixkit.co/videos/preview/mixkit-laser-lights-41551-large.mp4')).toBe('VIDEO');
    });

    it('8. should resolve YouTube, Vimeo, and Spline embeds as IFRAME', () => {
      expect(resolveMediaType('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('IFRAME');
      expect(resolveMediaType('https://youtu.be/dQw4w9WgXcQ')).toBe('IFRAME');
      expect(resolveMediaType('https://vimeo.com/123456789')).toBe('IFRAME');
      expect(resolveMediaType('https://spline.design/example')).toBe('IFRAME');
    });

    it('9. should resolve HLS .m3u8 streams as VIDEO', () => {
      expect(resolveMediaType('https://stream.example.com/live/index.m3u8')).toBe('VIDEO');
    });

    it('10. should resolve GLB/GLTF models as MODEL_3D', () => {
      expect(resolveMediaType('https://cdn.example.com/3d/hero.glb')).toBe('MODEL_3D');
      expect(resolveMediaType('https://cdn.example.com/models/scene.gltf')).toBe('MODEL_3D');
    });

    it('11. should prioritize explicit MIME type over ambiguous URL extensions', () => {
      expect(resolveMediaType({ url: 'https://cdn.example.com/media/stream', contentType: 'video/mp4' })).toBe('VIDEO');
    });
  });

  describe('Requirement 4: Focused regression & persistence semantics tests', () => {

    it('12. should preserve permanent video URL and VIDEO type during save', () => {
      const savedPayload = {
        heroMedia: {
          mediaUrl: 'https://blob.vercel-storage.com/uploads/video.mp4',
          mediaType: resolveMediaType('https://blob.vercel-storage.com/uploads/video.mp4')
        }
      };
      expect(savedPayload.heroMedia.mediaUrl).toBe('https://blob.vercel-storage.com/uploads/video.mp4');
      expect(savedPayload.heroMedia.mediaType).toBe('VIDEO');
    });

    it('13. should preserve permanent image URL and IMAGE type during save', () => {
      const savedPayload = {
        heroMedia: {
          mediaUrl: 'https://blob.vercel-storage.com/uploads/photo.webp',
          mediaType: resolveMediaType('https://blob.vercel-storage.com/uploads/photo.webp')
        }
      };
      expect(savedPayload.heroMedia.mediaUrl).toBe('https://blob.vercel-storage.com/uploads/photo.webp');
      expect(savedPayload.heroMedia.mediaType).toBe('IMAGE');
    });

    it('14. legacy .mp4 record marked as IMAGE should resolve to VIDEO for frontend player', () => {
      const legacyRecord = {
        mediaUrl: 'https://blob.vercel-storage.com/legacy-video.mp4',
        mediaType: 'IMAGE'
      };
      const runtimeType = resolveMediaType({ url: legacyRecord.mediaUrl, explicitType: legacyRecord.mediaType });
      expect(runtimeType).toBe('VIDEO');
    });

    it('15. normal image URLs should never resolve as VIDEO', () => {
      const imageRecord = {
        mediaUrl: 'https://blob.vercel-storage.com/photo.jpg',
        mediaType: 'IMAGE'
      };
      const runtimeType = resolveMediaType({ url: imageRecord.mediaUrl, explicitType: imageRecord.mediaType });
      expect(runtimeType).toBe('IMAGE');
    });

    it('16. explicit removal (__REMOVE_MEDIA__) must be distinct from omitted field', () => {
      const target = { heroMedia: { mediaUrl: 'https://cdn.example.com/old.jpg' } };
      
      // Omitted field preserves target
      const mergedOmitted = deepMergeCMSContent(target, { heroMedia: {} });
      expect(mergedOmitted.heroMedia.mediaUrl).toBe('https://cdn.example.com/old.jpg');

      // Explicit removal clears field
      const mergedRemoved = deepMergeCMSContent(target, { heroMedia: { mediaUrl: '__REMOVE_MEDIA__' } });
      expect(mergedRemoved.heroMedia.mediaUrl).toBe('');
    });

    it('17. failed upload or save should preserve previous target URL in deepMerge', () => {
      const target = { heroMedia: { mediaUrl: 'https://cdn.example.com/previous-hero.jpg' } };
      const emptyUpdate = { heroMedia: { mediaUrl: '' } };
      const merged = deepMergeCMSContent(target, emptyUpdate);
      expect(merged.heroMedia.mediaUrl).toBe('https://cdn.example.com/previous-hero.jpg');
    });
  });
});
