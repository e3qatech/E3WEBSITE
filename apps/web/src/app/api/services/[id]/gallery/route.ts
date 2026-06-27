import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params;

    const gallery = await db.serviceGalleryItem.findMany({
      where: { serviceId },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json(gallery);
  } catch (error: any) {
    console.error('[SERVICES_GALLERY_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
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

    const { id: serviceId } = await params;
    const body = await req.json();
    const { url, captionEn, captionAr, orderIndex } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const newItem = await db.serviceGalleryItem.create({
      data: {
        serviceId,
        url,
        captionEn,
        captionAr,
        orderIndex: orderIndex ?? 0,
      },
    });

    // Invalidate service detail cache
    await redis.del(`services:detail:${serviceId}`);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error('[SERVICES_GALLERY_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
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

    const { id: serviceId } = await params;
    const { searchParams } = new URL(req.url);
    const galleryItemId = searchParams.get('itemId');

    if (!galleryItemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await db.serviceGalleryItem.delete({
      where: { id: galleryItemId, serviceId },
    });

    // Invalidate service detail cache
    await redis.del(`services:detail:${serviceId}`);

    return NextResponse.json({ message: 'Gallery item deleted' });
  } catch (error: any) {
    console.error('[SERVICES_GALLERY_DELETE]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
