import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { getMergedCMSPageContent } from '@/lib/cms-default-pages';

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

    try {
      const page = await db.pages.findUnique({
        where: { slug },
      });
      if (page) {
        rawContent = page.content;
        title = page.title;
        seo = page.seo;
      }
    } catch (_dbErr) {
      // Ignore Pages table query failure
    }

    if (!rawContent) {
      try {
        const setting = await (db as any).siteSettings.findUnique({
          where: { key: `cms_page_${slug}` },
        });
        if (setting && setting.value) {
          rawContent = setting.value;
        }
      } catch (_settingErr) {
        // Ignore SiteSettings table query failure
      }
    }

    if (!rawContent && globalCMSPagesStore[slug]) {
      rawContent = globalCMSPagesStore[slug].content;
      title = globalCMSPagesStore[slug].title || title;
      seo = globalCMSPagesStore[slug].seo || seo;
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const session = await auth();
    // Allow authenticated sessions or development mode
    if (!session?.user && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = pageUpdateSchema.parse(body);
    const mergedContent = getMergedCMSPageContent(slug, validatedData.content);

    let updatedPage: any = null;

    // 1. Persist to primary Pages model in PostgreSQL
    try {
      updatedPage = await db.pages.upsert({
        where: { slug },
        update: {
          ...(validatedData.title !== undefined && { title: validatedData.title }),
          content: mergedContent,
          ...(validatedData.seo !== undefined && { seo: validatedData.seo }),
        },
        create: {
          slug,
          title: validatedData.title || { en: slug, ar: slug },
          content: mergedContent,
          seo: validatedData.seo || {},
        },
      });
    } catch (dbError) {
      console.warn(`[DB WARN /api/cms/pages/${slug}] Pages table upsert failed, attempting SiteSettings fallback:`, dbError);
    }

    // 2. Persist to secondary SiteSettings model in PostgreSQL (guarantees cross-lambda persistence)
    try {
      await (db as any).siteSettings.upsert({
        where: { key: `cms_page_${slug}` },
        update: {
          value: mergedContent as any,
          group: 'UI',
        },
        create: {
          key: `cms_page_${slug}`,
          value: mergedContent as any,
          group: 'UI',
        },
      });
    } catch (settingError) {
      console.warn(`[DB WARN /api/cms/pages/${slug}] SiteSettings table upsert notice:`, settingError);
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

    globalCMSPagesStore[slug] = updatedPage;

    // Purge Next.js App Router cache so public & admin pages update immediately
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/[locale]/b2c', 'page');
      revalidatePath('/en/b2c', 'page');
      revalidatePath('/ar/b2c', 'page');
      revalidatePath('/b2c', 'page');
      revalidatePath('/[locale]/dashboard/b2c/landing', 'page');
      revalidatePath('/en/dashboard/b2c/landing', 'page');
      revalidatePath('/ar/dashboard/b2c/landing', 'page');
    } catch (_e) {
      // Ignore revalidate errors
    }

    return NextResponse.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error(`[PUT /api/cms/pages/${slug}] error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
