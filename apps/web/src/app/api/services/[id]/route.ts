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
    const cacheKey = `services:detail:${id}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const service = await db.service.findUnique({
      where: { id },
      include: {
        gallery: {
          orderBy: { orderIndex: 'asc' },
        },
        projects: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // 10-minute TTL
    await redis.set(cacheKey, JSON.stringify(service), 'EX', 600);

    return NextResponse.json(service);
  } catch (error: any) {
    console.error('[SERVICES_DETAIL_GET]', error);
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

    // Rate limiting comment: Add rate limiting here via Redis

    const updatedService = await db.service.update({
      where: { id },
      data: body,
      include: {
        gallery: true,
        projects: true,
      },
    });

    // Invalidate caches
    await redis.del(`services:detail:${id}`);
    const keys = await redis.keys('services:list:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    return NextResponse.json(updatedService);
  } catch (error: any) {
    console.error('[SERVICES_DETAIL_PUT]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
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

    // Rate limiting comment: Add rate limiting here via Redis

    // Soft delete: set isVisible = false (and isPublished = false for safety)
    const deletedService = await db.service.update({
      where: { id },
      data: { isVisible: false, isPublished: false },
    });

    // Invalidate caches
    await redis.del(`services:detail:${id}`);
    const keys = await redis.keys('services:list:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    return NextResponse.json({ message: 'Service soft deleted', id: deletedService.id });
  } catch (error: any) {
    console.error('[SERVICES_DETAIL_DELETE]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
