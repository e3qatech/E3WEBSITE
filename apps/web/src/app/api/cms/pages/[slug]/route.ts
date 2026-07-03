import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const pageUpdateSchema = z.object({
  title: z.any().optional(),
  content: z.any().optional(),
  seo: z.any().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const page = await db.pages.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ data: page });
  } catch (error) {
    const { slug } = await params;
    console.error(`[GET /api/cms/pages/${slug}] error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    // In a real scenario, check for SuperAdmin or Content Editor permissions
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json();
    const validatedData = pageUpdateSchema.parse(body);

    const updatedPage = await db.pages.update({
      where: { slug },
      data: {
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(validatedData.content !== undefined && { content: validatedData.content }),
        ...(validatedData.seo !== undefined && { seo: validatedData.seo }),
      },
    });

    return NextResponse.json({ data: updatedPage });
  } catch (error) {
    const { slug } = await params;
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error(`[PUT /api/cms/pages/${slug}] error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
