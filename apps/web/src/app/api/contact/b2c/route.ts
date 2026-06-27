import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const attractionId = searchParams.get('attractionId');

    const cacheKey = `b2c:faqs:${attractionId || 'all'}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const faqs = await db.attractionFaq.findMany({
      where: attractionId ? { attractionId } : undefined,
      orderBy: { orderIndex: 'asc' },
      include: attractionId ? undefined : {
        attraction: {
          select: { nameEn: true, nameAr: true }
        }
      }
    });

    await redis.set(cacheKey, JSON.stringify(faqs), 'EX', 3600);
    return NextResponse.json(faqs);
  } catch (error: any) {
    console.error('[CONTACT_B2C_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionType } = body;

    if (!actionType) {
      return NextResponse.json({ error: 'Missing actionType' }, { status: 400 });
    }

    if (actionType === 'FEEDBACK') {
      const { name, email, message, rating, attractionId } = body;
      if (!message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      }

      const feedback = await db.feedback.create({
        data: {
          name,
          email,
          message,
          rating: rating ? parseInt(rating, 10) : null,
          attractionId,
        }
      });

      return NextResponse.json(feedback, { status: 201 });
    }

    if (actionType === 'SUPPORT_TICKET') {
      const { name, email, phone, message } = body;
      if (!name || !email || !message) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const inquiry = await db.inquiry.create({
        data: {
          type: 'SUPPORT',
          name,
          email,
          phone,
          message,
        }
      });

      return NextResponse.json(inquiry, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
  } catch (error: any) {
    console.error('[CONTACT_B2C_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
