import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { toZonedTime } from 'date-fns-tz';

const QATAR_TZ = 'Asia/Qatar';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const attractionIds = searchParams.getAll('attractions');
    const availableNow = searchParams.get('availableNow') === 'true';
    const hasDiscount = searchParams.get('discount') === 'true';
    const eventType = searchParams.get('eventType');

    // Caching based on query
    const cacheKey = `calendar:list:${month}:${year}:${startDate}:${endDate}:${attractionIds.join(',')}:${availableNow}:${eventType}:${hasDiscount}`;
    
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (e: any) {
      console.warn('[REDIS_ERROR] Redis connection error: ', e.message);
    }
    
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const where: any = {};

    if (attractionIds && attractionIds.length > 0) {
      where.attractionId = { in: attractionIds };
    }
    
    if (eventType) {
      where.eventType = eventType;
    }

    if (hasDiscount) {
      where.attraction = {
        ...(where.attraction || {}),
        offers: { some: {} }
      };
    }

    if (availableNow) {
      const qatarNow = toZonedTime(new Date(), QATAR_TZ);
      where.startTime = { lte: qatarNow };
      where.endTime = { gte: qatarNow };
      // Also capacity check conceptually, but we'll fetch and filter
    } else if (startDate && endDate) {
      where.startTime = { gte: new Date(startDate) };
      where.endTime = { lte: new Date(endDate) };
    } else if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.startTime = { gte: startOfMonth };
      where.endTime = { lte: endOfMonth };
    }

    const events = await db.eventSchedule.findMany({
      where,
      include: {
        attraction: {
          select: {
            nameEn: true,
            nameAr: true,
            slug: true,
            ticketingUrl: true,
            offers: { select: { id: true } },
            // Assuming we use gallery[0] as thumbnail for B2C if a specific thumbnail doesn't exist
            gallery: { take: 1 },
            pricing: {
              orderBy: { price: 'asc' },
              take: 1
            }
          }
        }
      },
      orderBy: { startTime: 'asc' },
    });

    // Map output to include availability status and thumbnail
    const result = events.map(event => {
      const isAvailable = event.currentCount < event.capacityGate;
      const thumbnail = event.attraction?.gallery?.[0]?.url || null;
      const lowestPrice = event.attraction?.pricing?.[0] ? `${event.attraction.pricing[0].currency} ${event.attraction.pricing[0].price}` : null;

      return {
        id: event.id,
        attractionId: event.attractionId,
        attractionNameEn: event.attraction.nameEn,
        attractionNameAr: event.attraction.nameAr,
        attractionSlug: event.attraction.slug,
        ticketingUrl: event.attraction.ticketingUrl,
        title: event.title,
        description: event.description,
        thumbnail,
        startTime: event.startTime,
        endTime: event.endTime,
        eventType: event.eventType,
        price: lowestPrice,
        capacityGate: event.capacityGate,
        currentCount: event.currentCount,
        isAvailable,
        hasOffer: (event.attraction as any).offers?.length > 0
      };
    });

    if (availableNow) {
      // If asking for available now, strictly return those with capacity
      const filtered = result.filter(r => r.isAvailable);
      try {
        await redis.set(cacheKey, JSON.stringify(filtered), 'EX', 60); // 1 min cache for live availability
      } catch (e: any) {
        console.warn('[REDIS_ERROR] Failed to set cache:', e.message);
      }
      return NextResponse.json(filtered);
    }

    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300); // 5 min cache for generic calendars
    } catch (e: any) {
      console.warn('[REDIS_ERROR] Failed to set cache:', e.message);
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[CALENDAR_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
