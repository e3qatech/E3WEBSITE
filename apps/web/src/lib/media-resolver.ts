/**
 * Unified Media Type Resolver
 *
 * Primary source of truth: Content-Type / MIME type returned by upload service.
 * Secondary source of truth: File extension & URL patterns.
 * Tertiary source of truth: Explicit CMS override.
 */

export type MediaType = 'IMAGE' | 'VIDEO' | 'MODEL_3D' | 'IFRAME';

export interface ResolveMediaTypeOptions {
  url?: string;
  mimeType?: string;
  contentType?: string;
  explicitType?: string;
}

/**
 * Browsers natively support playing MP4 (H.264/AAC) and WebM (VP8/VP9/AV1).
 * MOV, M4V, and MKV filenames are detected as VIDEO for compatibility, but may require H.264/AAC encoding for native HTML5 video element playback.
 */
export const NATIVE_BROWSER_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'application/x-mpegurl'];

export function resolveMediaType(options: ResolveMediaTypeOptions | string): MediaType {
  const opts: ResolveMediaTypeOptions = typeof options === 'string' ? { url: options } : (options || {});
  const rawUrl = (opts.url || '').trim();
  let hashMime = '';
  if (rawUrl.includes('#type=')) {
    hashMime = decodeURIComponent(rawUrl.split('#type=')[1].split('#')[0].split('&')[0]);
  }
  
  const rawMime = (opts.contentType || opts.mimeType || hashMime).trim().toLowerCase();
  const explicit = (opts.explicitType || '').trim().toUpperCase();

  // 1. Primary Source of Truth: Explicit MIME / Content-Type from upload service or HTTP headers
  if (rawMime) {
    if (
      rawMime.startsWith('video/') ||
      rawMime === 'application/x-mpegurl' ||
      rawMime === 'application/vnd.apple.mpegurl'
    ) {
      return 'VIDEO';
    }
    if (rawMime.startsWith('image/')) {
      return 'IMAGE';
    }
    if (
      rawMime.includes('model/gltf') ||
      rawMime.includes('model/glb') ||
      (rawMime.includes('application/octet-stream') && rawUrl.toLowerCase().includes('.glb'))
    ) {
      return 'MODEL_3D';
    }
    if (rawMime.includes('text/html')) {
      return 'IFRAME';
    }
  }

  // 2. Normalize URL by removing query strings and hash fragments for extension matching
  const cleanUrl = rawUrl.split('?')[0].split('#')[0].trim().toLowerCase();

  // Explicit extension matching (case-insensitive via cleanUrl)
  const isVideoExt = /\.(mp4|webm|mov|m4v|mkv|m3u8|ts|ogv)$/i.test(cleanUrl);
  const isImageExt = /\.(jpeg|jpg|png|webp|gif|svg|avif|bmp|tiff|ico)$/i.test(cleanUrl);
  const isModelExt = /\.(glb|gltf|usdz)$/i.test(cleanUrl);

  // Pattern matching for embed services and video streams
  const isIframePattern =
    rawUrl.toLowerCase().includes('<iframe') ||
    rawUrl.toLowerCase().includes('youtube.com/embed') ||
    rawUrl.toLowerCase().includes('youtube.com/watch') ||
    rawUrl.toLowerCase().includes('youtu.be/') ||
    rawUrl.toLowerCase().includes('vimeo.com/') ||
    rawUrl.toLowerCase().includes('spline.design');

  const isVideoPattern =
    isVideoExt ||
    rawUrl.toLowerCase().includes('assets.mixkit.co/videos') ||
    rawUrl.toLowerCase().includes('/video/upload/') ||
    rawUrl.toLowerCase().includes('player.vimeo.com/external');

  // 3. Fallback evaluation logic
  if (isIframePattern) return 'IFRAME';
  if (isModelExt) return 'MODEL_3D';
  if (isImageExt) return 'IMAGE'; // Image extension takes precedence over URL paths containing '/video/' (e.g. /video/assets/banner.jpg)
  if (isVideoPattern) return 'VIDEO';

  // 4. Honor explicit CMS type if valid and not superseded by clear video/image extension
  if (explicit === 'VIDEO' || explicit === 'IMAGE' || explicit === 'MODEL_3D' || explicit === 'IFRAME') {
    return explicit as MediaType;
  }

  return 'IMAGE';
}
