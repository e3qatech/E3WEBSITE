import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attractionId } = await params;
    const items = await db.attractionOffer.findMany({
      where: { attractionId },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('[ATTRACTIONS_OFFERS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== 'SUPER_ADMIN' && (session.user as any).role !== 'SALES_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { id: attractionId } = await params;
    const body = await req.json();

    const missing = ["code","discount"].find(f => body[f] === undefined);
    if (missing) return NextResponse.json({ error: 'Missing required field: ' + missing }, { status: 400 });

    const newItem = await db.attractionOffer.create({
      data: {
        attractionId,
        ...body
      },
    });

    await redis.del(`attractions:detail:${attractionId}`);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error('[ATTRACTIONS_OFFERS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== 'SUPER_ADMIN' && (session.user as any).role !== 'SALES_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { id: attractionId } = await params;
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    if (!itemId) return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });

    await db.attractionOffer.delete({
      where: { id: itemId, attractionId },
    });

    await redis.del(`attractions:detail:${attractionId}`);
    return NextResponse.json({ message: 'Item deleted' });
  } catch (error: any) {
    console.error('[ATTRACTIONS_OFFERS_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
