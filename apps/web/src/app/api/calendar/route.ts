import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import {
  getQatarDayBoundaries,
  resolveBookingAction,
} from '@/lib/qatar-calendar';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const attractionIds = searchParams.getAll('attractions').filter(Boolean);
    const eventTypes = searchParams.getAll('types').filter(Boolean);
    const hasDiscount = searchParams.get('discount') === 'true';
    const locale = searchParams.get('locale') || 'en';

    // 1. Calculate precise Qatar day boundaries (Asia/Qatar, UTC+3)
    const startBounds = getQatarDayBoundaries(startDateParam);
    const endBounds = endDateParam
      ? getQatarDayBoundaries(endDateParam)
      : startBounds;

    const cacheKey = `calendar:v2:${startBounds.qatarDateString}:${endBounds.qatarDateString}:${attractionIds.join(',')}:${eventTypes.join(',')}:${hasDiscount}:${locale}`;

    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (e: any) {
      console.warn('[REDIS_ERROR] Redis read notice:', e.message);
    }

    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // 2. Query published CalendarEvent records covering the date range
    const calEventsWhere: any = {
      status: 'PUBLISHED',
      startDate: { lte: endBounds.endUtc },
      endDate: { gte: startBounds.startUtc },
    };

    if (attractionIds.length > 0) {
      calEventsWhere.attractionId = { in: attractionIds };
    }

    const calEvents = await db.calendarEvent.findMany({
      where: calEventsWhere,
      include: {
        attraction: {
          include: {
            pricing: { orderBy: { price: 'asc' }, take: 1 },
            offers: true,
            gallery: { orderBy: { orderIndex: 'asc' }, take: 1 },
          },
        },
        timeSlots: true,
      },
      orderBy: { startDate: 'asc' },
    });

    // 3. Query EventSchedule records covering the date range
    const scheduleWhere: any = {
      startTime: { lte: endBounds.endUtc },
      endTime: { gte: startBounds.startUtc },
    };

    if (attractionIds.length > 0) {
      scheduleWhere.attractionId = { in: attractionIds };
    }

    if (eventTypes.length > 0) {
      scheduleWhere.eventType = { in: eventTypes };
    }

    const schedules = await db.eventSchedule.findMany({
      where: scheduleWhere,
      include: {
        attraction: {
          include: {
            pricing: { orderBy: { price: 'asc' }, take: 1 },
            offers: true,
            gallery: { orderBy: { orderIndex: 'asc' }, take: 1 },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const results: any[] = [];
    const DEFAULT_COVER = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop';

    // 4. Map CalendarEvent records
    for (const event of calEvents) {
      const attr = event.attraction;
      // Skip if attached attraction is unpublished or hidden
      if (attr && (attr.isPublished === false || attr.isHidden === true)) {
        continue;
      }

      if (hasDiscount && attr && (!attr.offers || attr.offers.length === 0)) {
        continue;
      }

      const ops = (attr?.operations as any) || {};
      const thumbnail =
        attr?.heroMediaUrl ||
        attr?.heroThumbnailUrl ||
        attr?.gallery?.[0]?.url ||
        attr?.logoUrl ||
        DEFAULT_COVER;

      const lowestPrice = attr?.pricing?.[0]
        ? `${attr.pricing[0].currency || 'QAR'} ${attr.pricing[0].price}`
        : null;

      const inferredType = event.timeSlots && event.timeSlots.length > 0 ? 'SPECIAL' : 'FESTIVAL';
      if (eventTypes.length > 0 && !eventTypes.includes(inferredType)) {
        continue;
      }

      const bookingAction = resolveBookingAction(
        attr?.ticketingUrl,
        attr?.slug,
        locale,
        event.title || attr?.nameEn
      );

      results.push({
        id: event.id,
        attractionId: attr?.id || event.id,
        attractionNameEn: attr?.nameEn || event.title,
        attractionNameAr: attr?.nameAr || event.title,
        attractionSlug: attr?.slug || '',
        title: event.title,
        titleEn: event.title,
        titleAr: event.title,
        description: event.description || attr?.taglineEn,
        descriptionEn: event.description || attr?.taglineEn,
        descriptionAr: event.description || attr?.taglineAr,
        thumbnail,
        startTime: event.startDate.toISOString(),
        endTime: event.endDate.toISOString(),
        eventType: inferredType,
        price: lowestPrice,
        capacityGate: event.timeSlots?.[0]?.capacity || 100,
        currentCount: 0,
        isAvailable: true,
        hasOffer: attr?.offers ? attr.offers.length > 0 : false,
        locationNameEn: ops.locationNameEn || 'Doha, Qatar',
        locationNameAr: ops.locationNameAr || 'الدوحة، قطر',
        ticketingUrl: bookingAction.url,
        bookingAction,
      });
    }

    // 5. Map EventSchedule records
    for (const sched of schedules) {
      const attr = sched.attraction;
      if (attr && (attr.isPublished === false || attr.isHidden === true)) {
        continue;
      }

      if (hasDiscount && attr && (!attr.offers || attr.offers.length === 0)) {
        continue;
      }

      const ops = (attr?.operations as any) || {};
      const thumbnail =
        sched.heroMediaUrl ||
        attr?.heroMediaUrl ||
        attr?.heroThumbnailUrl ||
        attr?.gallery?.[0]?.url ||
        DEFAULT_COVER;

      const lowestPrice = attr?.pricing?.[0]
        ? `${attr.pricing[0].currency || 'QAR'} ${attr.pricing[0].price}`
        : null;

      const bookingAction = resolveBookingAction(
        attr?.ticketingUrl,
        attr?.slug,
        locale,
        sched.title || attr?.nameEn
      );

      results.push({
        id: sched.id,
        attractionId: attr?.id || sched.id,
        attractionNameEn: attr?.nameEn || sched.title || 'Event',
        attractionNameAr: attr?.nameAr || sched.title || 'فعالية',
        attractionSlug: attr?.slug || '',
        title: sched.title || attr?.nameEn,
        titleEn: sched.title || attr?.nameEn,
        titleAr: sched.title || attr?.nameAr,
        description: sched.description || attr?.taglineEn,
        descriptionEn: sched.description || attr?.taglineEn,
        descriptionAr: sched.description || attr?.taglineAr,
        thumbnail,
        startTime: sched.startTime.toISOString(),
        endTime: sched.endTime.toISOString(),
        eventType: sched.eventType || 'REGULAR',
        price: lowestPrice,
        capacityGate: sched.capacityGate || 100,
        currentCount: sched.currentCount || 0,
        isAvailable: sched.currentCount < sched.capacityGate,
        hasOffer: attr?.offers ? attr.offers.length > 0 : false,
        locationNameEn: ops.locationNameEn || 'Doha, Qatar',
        locationNameAr: ops.locationNameAr || 'الدوحة، قطر',
        ticketingUrl: bookingAction.url,
        bookingAction,
      });
    }

    try {
      await redis.set(cacheKey, JSON.stringify(results), 'EX', 120);
    } catch (e: any) {
      console.warn('[REDIS_ERROR] Redis write notice:', e.message);
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('[CALENDAR_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
