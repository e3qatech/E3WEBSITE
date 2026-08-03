import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRedisClient } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const attractionId = searchParams.get('attractionId');

    const cacheKey = `b2c:faqs:${attractionId || 'all'}`;
    const cached = await getRedisClient()?.get(cacheKey);
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

    await getRedisClient()?.set(cacheKey, JSON.stringify(faqs), 'EX', 3600);
    return NextResponse.json(faqs);
  } catch (error: any) {
    console.error('[CONTACT_B2C_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';

const b2cFeedbackSchema = z.object({
  actionType: z.literal('FEEDBACK'),
  name: z.string().max(100).optional(),
  email: z.string().email().max(100).optional().or(z.literal('')),
  message: z.string().min(2).max(2000),
  rating: z.union([z.number(), z.string()]).optional(),
  attractionId: z.string().max(100).optional(),
  website_hp: z.string().max(0, "Spam detected").optional()
});

const b2cSupportSchema = z.object({
  actionType: z.literal('SUPPORT_TICKET'),
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  phone: z.string().max(20).optional(),
  message: z.string().min(2).max(2000),
  website_hp: z.string().max(0, "Spam detected").optional()
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limitResult = await checkRateLimit(`rate_limit:contact_b2c:${ip}`, 10, 60);
    if (!limitResult.allowed) {
      if (limitResult.reason === 'redis_unavailable') {
        return NextResponse.json({ error: "Service Temporarily Unavailable" }, { status: 503, headers: { 'Retry-After': '60' } });
      }
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: limitResult.retryAfter ? { 'Retry-After': limitResult.retryAfter.toString() } : undefined });
    }

    const body = await req.json();
    const { actionType } = body;

    if (!actionType) {
      return NextResponse.json({ error: 'Missing actionType' }, { status: 400 });
    }

    if (actionType === 'FEEDBACK') {
      const parseResult = b2cFeedbackSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json({ error: 'Invalid data', details: parseResult.error.flatten().fieldErrors }, { status: 400 });
      }
      const { name, email, message, rating, attractionId } = parseResult.data;

      const feedback = await db.feedback.create({
        data: {
          name,
          email,
          message,
          rating: rating ? parseInt(String(rating), 10) : null,
          attractionId,
        }
      });

      return NextResponse.json(feedback, { status: 201 });
    }

    if (actionType === 'SUPPORT_TICKET') {
      const parseResult = b2cSupportSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json({ error: 'Invalid data', details: parseResult.error.flatten().fieldErrors }, { status: 400 });
      }
      const { name, email, phone, message } = parseResult.data;

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
