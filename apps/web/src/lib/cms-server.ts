import db from '@/lib/db';
import { getMergedCMSPageContent } from '@/lib/cms-default-pages';

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
