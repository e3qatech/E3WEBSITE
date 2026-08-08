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
    const page = await db.pages.findUnique({
      where: { slug },
    });

    if (page) {
      const mergedContent = getMergedCMSPageContent(slug, page.content);
      return NextResponse.json({ data: { ...page, content: mergedContent } });
    }

    if (globalCMSPagesStore[slug]) {
      const mergedContent = getMergedCMSPageContent(slug, globalCMSPagesStore[slug].content);
      return NextResponse.json({ data: { ...globalCMSPagesStore[slug], content: mergedContent } });
    }

    // Default fallback if page is unseeded
    const defaultContent = getMergedCMSPageContent(slug);
    const fallbackPage = {
      slug,
      title: { en: slug, ar: slug },
      content: defaultContent,
      seo: {},
    };
    return NextResponse.json({ data: fallbackPage });
  } catch (error) {
    console.error(`[GET /api/cms/pages/${slug}] error:`, error);
    const defaultContent = getMergedCMSPageContent(slug, globalCMSPagesStore[slug]?.content);
    return NextResponse.json({
      data: {
        slug,
        title: { en: slug, ar: slug },
        content: defaultContent,
        seo: {},
      }
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
    // Allow local development mode saves or authenticated sessions
    if (!session?.user && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = pageUpdateSchema.parse(body);
    const mergedContent = getMergedCMSPageContent(slug, validatedData.content);

    let updatedPage: any = null;

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
        }
      });
    } catch (dbError) {
      console.warn(`[DB WARN /api/cms/pages/${slug}] Failed to persist to PostgreSQL, falling back to memory cache:`, dbError);
    }

    if (!updatedPage) {
      updatedPage = {
        slug,
        title: validatedData.title || globalCMSPagesStore[slug]?.title || { en: slug, ar: slug },
        content: mergedContent,
        seo: validatedData.seo || globalCMSPagesStore[slug]?.seo || {},
        updatedAt: new Date().toISOString()
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
      // Ignore revalidate errors in dev
    }

    return NextResponse.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error(`[PUT /api/cms/pages/${slug}] error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
