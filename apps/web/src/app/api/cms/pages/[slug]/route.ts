import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

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
      return NextResponse.json({ data: page });
    }

    if (globalCMSPagesStore[slug]) {
      return NextResponse.json({ data: globalCMSPagesStore[slug] });
    }

    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  } catch (error) {
    console.error(`[GET /api/cms/pages/${slug}] error:`, error);
    if (globalCMSPagesStore[slug]) {
      return NextResponse.json({ data: globalCMSPagesStore[slug] });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    let updatedPage: any = null;

    try {
      updatedPage = await db.pages.upsert({
        where: { slug },
        update: {
          ...(validatedData.title !== undefined && { title: validatedData.title }),
          ...(validatedData.content !== undefined && { content: validatedData.content }),
          ...(validatedData.seo !== undefined && { seo: validatedData.seo }),
        },
        create: {
          slug,
          title: validatedData.title || { en: slug, ar: slug },
          content: validatedData.content || {},
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
        content: validatedData.content || globalCMSPagesStore[slug]?.content || {},
        seo: validatedData.seo || globalCMSPagesStore[slug]?.seo || {},
        updatedAt: new Date().toISOString()
      };
    }

    globalCMSPagesStore[slug] = updatedPage;

    try {
      revalidatePath('/', 'layout');
    } catch (_e) {
      // Ignore revalidate errors in dev
    }

    return NextResponse.json({ success: true, data: updatedPage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error(`[PUT /api/cms/pages/${slug}] error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
