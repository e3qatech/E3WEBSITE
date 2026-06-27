import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cacheKey = `case-studies:detail:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const caseStudy = await db.caseStudy.findUnique({
      where: { id },
    });

    if (!caseStudy || !caseStudy.isPublished) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }

    await redis.set(cacheKey, JSON.stringify(caseStudy), 'EX', 600); // 10 min cache
    return NextResponse.json(caseStudy);
  } catch (error: any) {
    console.error('[CASE_STUDIES_DETAIL_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== 'SUPER_ADMIN' && (session.user as any).role !== 'SALES_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await db.caseStudy.update({
      where: { id },
      data: body,
    });

    await redis.del(`case-studies:detail:${id}`);
    const keys = await redis.keys('case-studies:list:*');
    if (keys.length > 0) await redis.del(...keys);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[CASE_STUDIES_DETAIL_PUT]', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    
    // Soft delete (unpublish)
    await db.caseStudy.update({
      where: { id },
      data: { isPublished: false },
    });

    await redis.del(`case-studies:detail:${id}`);
    const keys = await redis.keys('case-studies:list:*');
    if (keys.length > 0) await redis.del(...keys);

    return NextResponse.json({ message: 'Soft deleted successfully' });
  } catch (error: any) {
    console.error('[CASE_STUDIES_DETAIL_DELETE]', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
