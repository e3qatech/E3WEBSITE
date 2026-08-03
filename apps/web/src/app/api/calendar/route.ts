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

    // We are now fetching directly from attractions instead of eventSchedules
    // to populate the calendar with the main attractions
    const attractionsWhere: any = { isPublished: true, isHidden: false };
    
    if (attractionIds && attractionIds.length > 0) {
      attractionsWhere.id = { in: attractionIds };
    }
    
    if (hasDiscount) {
      attractionsWhere.offers = { some: {} };
    }

    const attractions = await db.attraction.findMany({
      where: attractionsWhere,
      include: {
        offers: { select: { id: true } },
        gallery: { take: 1 },
        pricing: {
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = attractions.map(attraction => {
      const thumbnail = attraction.gallery?.[0]?.url || attraction.heroThumbnailUrl || attraction.heroMediaUrl || null;
      const lowestPrice = attraction.pricing?.[0] ? `${attraction.pricing[0].currency} ${attraction.pricing[0].price}` : null;
      
      const temporalRules = attraction.temporalStatus as any;
      let startTime = new Date();
      let endTime = new Date();
      endTime.setMonth(endTime.getMonth() + 1); // default 1 month long if permanent

      if (temporalRules?.startDate) {
        startTime = new Date(temporalRules.startDate);
      }
      if (temporalRules?.endDate) {
        endTime = new Date(temporalRules.endDate);
      }

      // Filter by requested dates if not "availableNow"
      if (!availableNow && startDate && endDate) {
         // simple overlap check: event starts before requested end AND ends after requested start
         const reqStart = new Date(startDate);
         const reqEnd = new Date(endDate);
         // If it doesn't overlap, we could skip it, but for B2C calendar we'll let the frontend filter if needed,
         // or we can just return it if it's a permanent attraction.
      }

      return {
        id: attraction.id,
        attractionId: attraction.id,
        attractionNameEn: attraction.nameEn,
        attractionNameAr: attraction.nameAr,
        attractionSlug: attraction.slug,
        ticketingUrl: attraction.ticketingUrl,
        title: attraction.nameEn,
        description: attraction.descriptionEn,
        thumbnail,
        startTime,
        endTime,
        eventType: "REGULAR",
        price: lowestPrice,
        capacityGate: 100,
        currentCount: 0,
        isAvailable: true,
        hasOffer: attraction.offers?.length > 0
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
