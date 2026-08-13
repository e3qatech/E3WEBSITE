import db from '@/lib/db';
import { getMergedCMSPageContent } from '@/lib/cms-default-pages';

export function isTemporaryUrl(url: any): boolean {
  if (typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  return clean.startsWith('blob:') || clean.startsWith('file:') || clean.includes('localhost:') || clean.startsWith('/tmp/');
}

export function validateCMSNoTempUrls(obj: any): void {
  if (!obj) return;
  if (typeof obj === 'string') {
    if (isTemporaryUrl(obj)) {
      throw new Error(`Temporary or local URL detected (${obj}). Only persistent public URLs are allowed.`);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(validateCMSNoTempUrls);
  } else if (typeof obj === 'object') {
    Object.values(obj).forEach(validateCMSNoTempUrls);
  }
}

export function deepMergeCMSContent(target: any, source: any): any {
  if (source === null || source === undefined) return target;
  if (target === null || target === undefined) {
    validateCMSNoTempUrls(source);
    return source;
  }

  validateCMSNoTempUrls(source);

  if (typeof target !== 'object' || typeof source !== 'object') {
    return source;
  }

  // Array handling: incoming array data replaces target array directly to support addition, reordering, and item editing
  if (Array.isArray(target) || Array.isArray(source)) {
    if (!Array.isArray(source)) return target;
    return source;
  }

  const result: Record<string, any> = { ...target };
  
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];

    // Explicit field omitted: preserve target
    if (srcVal === undefined) {
      continue;
    }

    // Explicit removal operation (null, '__REMOVE__', '__REMOVE_MEDIA__', 'REMOVE_MEDIA', or object with removeMedia: true)
    if (
      srcVal === null ||
      srcVal === '__REMOVE__' ||
      srcVal === '__REMOVE_MEDIA__' ||
      srcVal === 'REMOVE_MEDIA' ||
      (typeof srcVal === 'object' && srcVal !== null && srcVal.removeMedia === true)
    ) {
      result[key] = '';
      continue;
    }

    // Empty string produced by incomplete form hydration: preserve existing target value if present
    if (srcVal === '') {
      if (tgtVal !== undefined && tgtVal !== null && tgtVal !== '') {
        result[key] = tgtVal;
      } else {
        result[key] = '';
      }
      continue;
    }

    if (typeof srcVal === 'object' && typeof tgtVal === 'object' && srcVal !== null && tgtVal !== null) {
      result[key] = deepMergeCMSContent(tgtVal, srcVal);
    } else {
      result[key] = srcVal;
    }
  }

  return result;
}

export async function getCMSPageContentServer(slug: string): Promise<any> {
  let rawContent: any = null;

  // 1. Check Primary db.pages model in PostgreSQL FIRST (Real-time database source of truth)
  try {
    const pageRecord = await (db as any).pages?.findUnique({
      where: { slug }
    });
    if (pageRecord?.content) {
      rawContent = pageRecord.content;
    }
  } catch (err) {
    console.warn(`[DB WARN /getCMSPageContentServer] Primary database query failed for slug ${slug}. Attempting Vercel Blob fallback:`, err);
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const envName = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
        const { list } = await import('@vercel/blob');
        const blobs = await list({
          prefix: `cms/pages/${envName}/${slug}.json`,
          limit: 1
        });
        if (blobs && blobs.blobs && blobs.blobs.length > 0) {
          const url = blobs.blobs[0].url;
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            rawContent = await res.json();
            console.log(`[CMS BLOB FALLBACK] Recovered page ${slug} from Vercel Blob: ${url}`);
          }
        }
      }
    } catch (blobErr) {
      console.warn(`[CMS BLOB FALLBACK] Failed to read from Vercel Blob for ${slug}:`, blobErr);
    }

    if (!rawContent) {
      console.warn(`[CMS READ WARN] Primary database read failed for ${slug}, proceeding to secondary fallbacks.`);
    }
  }

  // 2. Fallback to Secondary db.siteSettings model in PostgreSQL
  if (!rawContent) {
    try {
      const settingRecord = await (db as any).siteSettings?.findUnique({
        where: { key: `cms_page_${slug}` }
      });
      if (settingRecord?.value) {
        rawContent = settingRecord.value;
      }
    } catch (_err) {
      rawContent = null;
    }
  }

  // 3. Fallback to Tertiary in-memory store
  if (!rawContent) {
    const globalStore = (globalThis as any).__globalCMSPagesStore;
    rawContent = globalStore?.[slug]?.content || null;
  }

  const mergedContent = getMergedCMSPageContent(slug, rawContent);

  if (slug === 'b2c-landing') {
    try {
      const { getLiveB2CBrandsFromDB } = await import('@/lib/cms-brands-db');
      const liveBrands = await getLiveB2CBrandsFromDB();
      if (liveBrands.length > 0) {
        if (!mergedContent.ourBrands) mergedContent.ourBrands = {};
        mergedContent.ourBrands.brands = liveBrands;
      }
    } catch (err) {
      console.error("[getCMSPageContentServer] Error merging live DB brands:", err);
    }
  }

  return mergedContent;
}

