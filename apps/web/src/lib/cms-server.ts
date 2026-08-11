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

  // Array handling: preserve item content by stable ID, support deliberate removal & reordering
  if (Array.isArray(target) || Array.isArray(source)) {
    if (!Array.isArray(source)) return target;
    if (!Array.isArray(target)) return source;
    
    // If source array items have stable IDs, merge matching items by ID while respecting source order
    const hasStableIds = source.some((item: any) => item && typeof item === 'object' && item.id !== undefined);
    if (hasStableIds) {
      return source.map((srcItem: any) => {
        if (srcItem && typeof srcItem === 'object' && srcItem.id !== undefined) {
          const matchingTarget = target.find((t: any) => t && t.id === srcItem.id);
          return matchingTarget ? deepMergeCMSContent(matchingTarget, srcItem) : srcItem;
        }
        return srcItem;
      });
    }
    
    // Fallback for arrays without IDs
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

    // Explicit remove action (null, '__REMOVE__', 'REMOVE_MEDIA')
    if (srcVal === null || srcVal === '__REMOVE__' || srcVal === 'REMOVE_MEDIA') {
      result[key] = '';
      continue;
    }

    // If source provides an empty string, determine if it's intentional removal
    if (srcVal === '') {
      result[key] = '';
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

  // 1. Check Vercel Blob Storage CDN FIRST (Source of truth when active)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: `cms/pages/${slug}.json` });
      if (blobs && blobs.length > 0) {
        const blobUrl = blobs[0].url;
        const res = await fetch(`${blobUrl}?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          rawContent = await res.json();
        }
      }
    } catch (_blobErr) {
      console.warn(`[CMS SERVER BLOB READ NOTICE] ${slug}:`, _blobErr);
    }
  }

  // 2. Fallback to Primary db.pages model in PostgreSQL
  if (!rawContent) {
    try {
      const pageRecord = await (db as any).pages?.findUnique({
        where: { slug }
      });
      if (pageRecord?.content) {
        rawContent = pageRecord.content;
      }
    } catch (_err) {
      rawContent = null;
    }
  }

  // 3. Fallback to Secondary db.siteSettings model in PostgreSQL
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

  // 4. Fallback to Tertiary in-memory store
  if (!rawContent) {
    const globalStore = (globalThis as any).__globalCMSPagesStore;
    rawContent = globalStore?.[slug]?.content || null;
  }

  return getMergedCMSPageContent(slug, rawContent);
}
