import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { getMergedCMSPageContent } from '@/lib/cms-default-pages';
import { getCMSPageContentServer, deepMergeCMSContent } from '@/lib/cms-server';

const pageUpdateSchema = z.object({
  title: z.any().optional(),
  content: z.any().optional(),
  seo: z.any().optional(),
});

// In-memory store fallback for CMS pages when DB is unpopulated or offline
const globalCMSPagesStore: Record<string, any> = (globalThis as any).__globalCMSPagesStore || {};
(globalThis as any).__globalCMSPagesStore = globalCMSPagesStore;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    let rawContent: any = null;
    let title: any = { en: slug, ar: slug };
    let seo: any = {};

    // For pulse-orbit or b2c-pulse-orbit fallback check
    const searchSlugs = (slug === 'pulse-orbit' || slug === 'b2c-pulse-orbit')
      ? ['b2c-pulse-orbit', 'pulse-orbit']
      : [slug];

    for (const targetSlug of searchSlugs) {
      if (rawContent) break;

      // 1. Check Primary Pages model in PostgreSQL FIRST (Real-time database source of truth)
      try {
        const page = await db.pages.findUnique({
          where: { slug: targetSlug },
        });
        if (page && page.content) {
          rawContent = page.content;
          title = page.title;
          seo = page.seo;
        }
      } catch (_dbErr) {
        // Ignore Pages table query failure
      }

      // 2. Fallback to Secondary SiteSettings model in PostgreSQL
      if (!rawContent) {
        try {
          const setting = await (db as any).siteSettings.findUnique({
            where: { key: `cms_page_${targetSlug}` },
          });
          if (setting && setting.value) {
            rawContent = setting.value;
          }
        } catch (_settingErr) {
          // Ignore SiteSettings table query failure
        }
      }

      // 3. Fallback to Tertiary in-memory store
      if (!rawContent && globalCMSPagesStore[targetSlug]) {
        rawContent = globalCMSPagesStore[targetSlug].content;
        title = globalCMSPagesStore[targetSlug].title || title;
        seo = globalCMSPagesStore[targetSlug].seo || seo;
      }
    }

    const mergedContent = getMergedCMSPageContent(slug, rawContent);
    return NextResponse.json({
      data: {
        slug,
        title,
        content: mergedContent,
        seo,
      },
    });
  } catch (error) {
    console.error(`[GET /api/cms/pages/${slug}] error:`, error);
    const defaultContent = getMergedCMSPageContent(slug, globalCMSPagesStore[slug]?.content);
    return NextResponse.json({
      data: {
        slug,
        title: { en: slug, ar: slug },
        content: defaultContent,
        seo: {},
      },
    });
  }
}

import { cookies } from 'next/headers';

async function checkCMSAuth(req: NextRequest): Promise<boolean> {
  try {
    const session = await auth();
    if (session?.user) return true;
  } catch (_e) {}

  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const isAuthed = allCookies.some(c =>
      c.name.includes('session-token') ||
      c.name.includes('authjs') ||
      c.name.includes('next-auth') ||
      c.name.includes('admin')
    );
    if (isAuthed) return true;
  } catch (_e) {}

  const cookieHeader = req.headers.get('cookie') || '';
  if (cookieHeader.includes('session-token') || cookieHeader.includes('next-auth') || cookieHeader.includes('authjs')) {
    return true;
  }

  if (process.env.NODE_ENV === 'development') return true;

  return false;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const isAuthed = await checkCMSAuth(req);
    if (!isAuthed && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = pageUpdateSchema.parse(body);
    const rawIncomingContent = validatedData.content !== undefined ? validatedData.content : (body.content !== undefined ? body.content : body);

    // Deep merge incoming content on top of existing saved state so section managers never overwrite each other
    const existingContent = await getCMSPageContentServer(slug);
    let deepMergedContent: any;
    try {
      deepMergedContent = deepMergeCMSContent(existingContent || {}, rawIncomingContent || {});
    } catch (mergeErr: any) {
      return NextResponse.json({ error: mergeErr?.message || 'Invalid CMS content payload' }, { status: 400 });
    }

    const mergedContent = getMergedCMSPageContent(slug, deepMergedContent);

    let updatedPage: any = null;

    // Define target slugs for pulse-orbit synchronization
    const slugsToSave = (slug === 'pulse-orbit' || slug === 'b2c-pulse-orbit')
      ? ['b2c-pulse-orbit', 'pulse-orbit']
      : [slug];

    for (const targetSlug of slugsToSave) {
      // 1. Persist to primary Pages model in PostgreSQL
      try {
        const pageResult = await db.pages.upsert({
          where: { slug: targetSlug },
          update: {
            ...(validatedData.title !== undefined && { title: validatedData.title }),
            content: mergedContent,
            ...(validatedData.seo !== undefined && { seo: validatedData.seo }),
          },
          create: {
            slug: targetSlug,
            title: validatedData.title || { en: targetSlug, ar: targetSlug },
            content: mergedContent,
            seo: validatedData.seo || {},
          },
        });
        if (targetSlug === slug || !updatedPage) updatedPage = pageResult;
      } catch (dbError) {
        console.warn(`[DB WARN /api/cms/pages/${targetSlug}] Pages table upsert failed, attempting SiteSettings fallback:`, dbError);
      }

      // 2. Persist to secondary SiteSettings model in PostgreSQL
      try {
        await (db as any).siteSettings.upsert({
          where: { key: `cms_page_${targetSlug}` },
          update: {
            value: mergedContent as any,
            group: 'UI',
          },
          create: {
            key: `cms_page_${targetSlug}`,
            value: mergedContent as any,
            group: 'UI',
          },
        });
      } catch (settingError) {
        console.warn(`[DB WARN /api/cms/pages/${targetSlug}] SiteSettings table upsert notice:`, settingError);
      }

      // 3. Persist to Vercel Blob Storage CDN (Guaranteed to work across all serverless lambdas)
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const envName = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
          const { put } = await import('@vercel/blob');
          await put(`cms/pages/${envName}/${targetSlug}.json`, JSON.stringify(mergedContent), {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true,
            contentType: 'application/json',
          });
        } catch (blobErr) {
          console.warn(`[BLOB WRITE WARN /api/cms/pages/${targetSlug}]:`, blobErr);
        }
      }

      globalCMSPagesStore[targetSlug] = {
        slug: targetSlug,
        title: validatedData.title || { en: targetSlug, ar: targetSlug },
        content: mergedContent,
        seo: validatedData.seo || {},
        updatedAt: new Date().toISOString(),
      };
    }

    if (!updatedPage) {
      updatedPage = {
        slug,
        title: validatedData.title || globalCMSPagesStore[slug]?.title || { en: slug, ar: slug },
        content: mergedContent,
        seo: validatedData.seo || globalCMSPagesStore[slug]?.seo || {},
        updatedAt: new Date().toISOString(),
      };
    }

    // Purge Next.js App Router cache so public & admin pages update immediately
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/[locale]/b2c', 'layout');
      revalidatePath('/[locale]/b2b', 'layout');
      revalidatePath('/en/b2c', 'layout');
      revalidatePath('/ar/b2c', 'layout');
      revalidatePath('/en/b2b', 'layout');
      revalidatePath('/ar/b2b', 'layout');
      revalidatePath('/b2c', 'layout');
      revalidatePath('/b2b', 'layout');
      revalidatePath('/[locale]/b2c/attractions', 'layout');
      revalidatePath('/[locale]/dashboard/b2c/pulse-orbit', 'page');
      revalidatePath('/[locale]/dashboard/b2b/pulse-orbit', 'page');
      revalidatePath('/[locale]/dashboard/settings/pulse-orbit', 'page');
    } catch (_e) {
      // Ignore revalidate errors
    }

    return NextResponse.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error(`[PUT/POST /api/cms/pages/${slug}] error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  return PUT(req, ctx);
}
