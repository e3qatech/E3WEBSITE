import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

const ALLOWED_ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'SALES_ADMIN', 'B2C_ADMIN', 'OPERATIONS'];

export async function GET() {
  try {
    const offers = await db.attractionOffer.findMany({
      include: {
        attraction: {
          select: {
            nameEn: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error('[OFFERS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !ALLOWED_ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { attractionId, code, discount } = body;

    if (!attractionId || !code || !discount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const offer = await db.attractionOffer.create({
      data: {
        attractionId,
        code: code.toUpperCase(),
        discount: parseFloat(discount)
      },
      include: {
        attraction: {
          select: { nameEn: true }
        }
      }
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error('[OFFERS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !ALLOWED_ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing offer id' }, { status: 400 });
    }

    await db.attractionOffer.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[OFFERS_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
