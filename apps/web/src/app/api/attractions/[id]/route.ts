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
    const cacheKey = `attractions:detail:${id}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const attraction = await db.attraction.findFirst({
      where: { 
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        pricing: true,
        offers: true,
        faqs: { orderBy: { orderIndex: 'asc' } },
        gallery: { orderBy: { orderIndex: 'asc' } },
        socialLinks: true,
        temporalRules: true,
      },
    });

    if (!attraction || attraction.isHidden) {
      return NextResponse.json({ error: 'Attraction not found' }, { status: 404 });
    }

    await redis.set(cacheKey, JSON.stringify(attraction), 'EX', 600);

    return NextResponse.json(attraction);
  } catch (error: any) {
    console.error('[ATTRACTIONS_DETAIL_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      ((session.user as any).role !== 'SUPER_ADMIN' &&
        (session.user as any).role !== 'SALES_ADMIN')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updatedAttraction = await db.attraction.update({
      where: { id },
      data: body,
    });

    await redis.del(`attractions:detail:${id}`);
    const keys = await redis.keys('attractions:list:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    return NextResponse.json(updatedAttraction);
  } catch (error: any) {
    console.error('[ATTRACTIONS_DETAIL_PUT]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Attraction not found' }, { status: 404 });
    }
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

    const deletedAttraction = await db.attraction.update({
      where: { id },
      data: { isHidden: true, isPublished: false },
    });

    await redis.del(`attractions:detail:${id}`);
    const keys = await redis.keys('attractions:list:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    return NextResponse.json({ message: 'Attraction soft deleted', id: deletedAttraction.id });
  } catch (error: any) {
    console.error('[ATTRACTIONS_DETAIL_DELETE]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Attraction not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
