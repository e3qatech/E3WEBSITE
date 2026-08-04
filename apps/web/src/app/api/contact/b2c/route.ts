import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { enforceBodyLimit } from '@/lib/body-limit';

const feedbackSchema = z.object({
  actionType: z.literal('FEEDBACK'),
  website_hp: z.string().optional(),
  name: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().min(1).max(2000),
  rating: z.union([z.string(), z.number()]).optional(),
  attractionId: z.string().optional(),
}).strict();

const supportTicketSchema = z.object({
  actionType: z.literal('SUPPORT_TICKET'),
  website_hp: z.string().optional(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  message: z.string().min(1).max(2000),
}).strict();

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
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';

    // Body limit: 16KB for JSON form submissions
    const limitResp = enforceBodyLimit(req, 16 * 1024);
    if (limitResp) return limitResp;

    const rl = await rateLimit(`rate_limit:b2c:${ip}`, 5, 60, false);
    if (!rl.success) {
      return NextResponse.json({ error: rl.error }, { status: 429 });
    }

    const body = await req.json();
    const { actionType, website_hp } = body;

    // Honeypot check
    if (website_hp) {
      return NextResponse.json({ success: true, status: 'ignored' }, { status: 201 });
    }

    if (!actionType) {
      return NextResponse.json({ error: 'Missing actionType' }, { status: 400 });
    }

    if (actionType === 'FEEDBACK') {
      const parsed = feedbackSchema.parse(body);
      const feedback = await db.feedback.create({
        data: {
          name: parsed.name,
          email: parsed.email || undefined,
          message: parsed.message,
          rating: parsed.rating ? parseInt(String(parsed.rating), 10) : null,
          attractionId: parsed.attractionId,
        }
      });
      return NextResponse.json(feedback, { status: 201 });
    }

    if (actionType === 'SUPPORT_TICKET') {
      const parsed = supportTicketSchema.parse(body);
      const inquiry = await db.inquiry.create({
        data: {
          type: 'SUPPORT',
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          message: parsed.message,
        }
      });
      return NextResponse.json(inquiry, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    console.error('[CONTACT_B2C_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
