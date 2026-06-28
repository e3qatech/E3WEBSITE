import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
