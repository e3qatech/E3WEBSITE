import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import {
  getQatarDayBoundaries,
  resolveBookingAction,
} from '@/lib/qatar-calendar';
import { isAttractionActiveByDate } from '@/lib/cms-attractions';
import { DEFAULT_OUR_BRANDS } from '@/lib/cms-brands';

export const dynamic = 'force-dynamic';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop';

const SEED_FALLBACK_ATTRACTIONS = DEFAULT_OUR_BRANDS.map(b => ({
  id: b.id,
  slug: b.slug,
  nameEn: b.nameEn,
  nameAr: b.nameAr,
  taglineEn: b.taglineEn,
  taglineAr: b.taglineAr,
  descriptionEn: b.descriptionEn,
  descriptionAr: b.descriptionAr,
  status: 'ACTIVE',
  heroMediaUrl: b.logoPrimary,
  ticketingUrl: b.bookingUrl || b.internalRoute,
  pricing: [{ price: 50, currency: 'QAR', titleEn: 'General Admission', titleAr: 'دخول عام' }],
  offers: [],
  gallery: [],
  temporalRules: [],
  temporalStatus: { isPermanent: true, status: 'ACTIVE' },
  isPublished: true,
  isHidden: false,
  operations: {
    openingTime: "10:00",
    closingTime: "22:00",
    locationNameEn: "Doha, Qatar",
    locationNameAr: "الدوحة، قطر",
  }
}));

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const attractionIds = searchParams.getAll('attractions').filter(Boolean);
    const eventTypes = searchParams.getAll('types').filter(Boolean);
    const hasDiscount = searchParams.get('discount') === 'true';
    const availableNow = searchParams.get('availableNow') === 'true';
    const locale = searchParams.get('locale') || 'en';
    const isAr = locale === 'ar';

    // 1. Calculate precise Qatar day boundaries (Asia/Qatar, UTC+3)
    const startBounds = getQatarDayBoundaries(startDateParam);
    const endBounds = endDateParam
      ? getQatarDayBoundaries(endDateParam)
      : startBounds;

    const cacheKey = `calendar:v3:${startBounds.qatarDateString}:${endBounds.qatarDateString}:${attractionIds.join(',')}:${eventTypes.join(',')}:${hasDiscount}:${availableNow}:${locale}`;

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

    let calEvents: any[] = [];
    try {
      calEvents = await db.calendarEvent.findMany({
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
      }).catch(() => []);
    } catch (e: any) {
      console.warn('[CALENDAR_API_NOTICE] Failed to query calendarEvent:', e?.message || e);
      calEvents = [];
    }

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

    let schedules: any[] = [];
    try {
      schedules = await db.eventSchedule.findMany({
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
      }).catch(() => []);
    } catch (e: any) {
      console.warn('[CALENDAR_API_NOTICE] Failed to query eventSchedule:', e?.message || e);
      schedules = [];
    }

    // 4. Query Published Attractions
    let dbAttractions: any[] = [];
    try {
      const attrWhere: any = {
        isPublished: true,
        isHidden: false,
      };
      if (attractionIds.length > 0) {
        attrWhere.id = { in: attractionIds };
      }

      dbAttractions = await db.attraction.findMany({
        where: attrWhere,
        include: {
          pricing: { orderBy: { price: 'asc' }, take: 1 },
          offers: true,
          gallery: { orderBy: { orderIndex: 'asc' }, take: 1 },
          temporalRules: true,
        },
        orderBy: { isFeatured: 'desc' },
      }).catch(() => []);
    } catch (e: any) {
      console.warn('[CALENDAR_API_NOTICE] Failed to query attraction table:', e?.message || e);
      dbAttractions = [];
    }

    // If database returned 0 attractions, use canonical fallback attractions
    if (!dbAttractions || dbAttractions.length === 0) {
      dbAttractions = SEED_FALLBACK_ATTRACTIONS.filter(a => {
        if (attractionIds.length > 0) {
          return attractionIds.includes(a.id) || attractionIds.includes(a.slug);
        }
        return true;
      });
    }

    const results: any[] = [];
    const seenAttractionIds = new Set<string>();

    // 5. Map CalendarEvent records
    for (const event of calEvents) {
      const attr = event.attraction;
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

      const attractionKey = attr?.id || event.attractionId || event.id;
      if (attractionKey) seenAttractionIds.add(attractionKey);
      if (attr?.slug) seenAttractionIds.add(attr.slug);

      results.push({
        id: event.id,
        attractionId: attr?.id || event.id,
        attractionNameEn: attr?.nameEn || event.title,
        attractionNameAr: attr?.nameAr || event.title,
        attractionSlug: attr?.slug || '',
        title: isAr ? (attr?.nameAr || event.title) : (event.title || attr?.nameEn),
        titleEn: event.title || attr?.nameEn,
        titleAr: attr?.nameAr || event.title,
        description: isAr ? (attr?.taglineAr || attr?.descriptionAr || event.description) : (event.description || attr?.taglineEn || attr?.descriptionEn),
        descriptionEn: event.description || attr?.taglineEn,
        descriptionAr: attr?.taglineAr || event.description,
        thumbnail,
        startTime: event.startDate.toISOString(),
        endTime: event.endDate.toISOString(),
        eventType: inferredType,
        price: lowestPrice,
        capacityGate: event.timeSlots?.[0]?.capacity || 100,
        currentCount: 0,
        isAvailable: true,
        hasOffer: attr?.offers ? attr.offers.length > 0 : false,
        locationNameEn: ops.locationNameEn || ops.venueName || 'Doha, Qatar',
        locationNameAr: ops.locationNameAr || ops.venueName || 'الدوحة، قطر',
        ticketingUrl: bookingAction.url,
        bookingAction,
      });
    }

    // 6. Map EventSchedule records
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

      const attractionKey = attr?.id || sched.attractionId || sched.id;
      if (attractionKey) seenAttractionIds.add(attractionKey);
      if (attr?.slug) seenAttractionIds.add(attr.slug);

      results.push({
        id: sched.id,
        attractionId: attr?.id || sched.id,
        attractionNameEn: attr?.nameEn || sched.title || 'Event',
        attractionNameAr: attr?.nameAr || sched.title || 'فعالية',
        attractionSlug: attr?.slug || '',
        title: isAr ? (sched.title || attr?.nameAr || attr?.nameEn) : (sched.title || attr?.nameEn),
        titleEn: sched.title || attr?.nameEn,
        titleAr: sched.title || attr?.nameAr,
        description: isAr ? (sched.description || attr?.taglineAr || attr?.descriptionAr) : (sched.description || attr?.taglineEn || attr?.descriptionEn),
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
        locationNameEn: ops.locationNameEn || ops.venueName || 'Doha, Qatar',
        locationNameAr: ops.locationNameAr || ops.venueName || 'الدوحة، قطر',
        ticketingUrl: bookingAction.url,
        bookingAction,
      });
    }

    // 7. Generate regular scheduled occurrence for active published attractions
    for (const attr of dbAttractions) {
      // If attraction already has an explicit schedule or event on this date, do not duplicate
      if (seenAttractionIds.has(attr.id) || (attr.slug && seenAttractionIds.has(attr.slug))) {
        continue;
      }

      if (attr.isPublished === false || attr.isHidden === true) {
        continue;
      }

      // Check if attraction is active on target date
      if (!isAttractionActiveByDate(attr, startBounds.startUtc)) {
        continue;
      }

      // Filter by attractionIds if specified
      if (attractionIds.length > 0 && !attractionIds.includes(attr.id) && !attractionIds.includes(attr.slug)) {
        continue;
      }

      // Filter by discount if specified
      if (hasDiscount && (!attr.offers || attr.offers.length === 0)) {
        continue;
      }

      // Filter by event types if specified (regular attraction daily schedules are REGULAR)
      if (eventTypes.length > 0 && !eventTypes.includes('REGULAR')) {
        continue;
      }

      const ops = (attr?.operations as any) || {};
      const rawHours = ops.hours?.en || ops.hours || '';
      let openHour = 10;
      let openMin = 0;
      let closeHour = 22;
      let closeMin = 0;

      if (ops.openingTime) {
        const parts = String(ops.openingTime).split(':').map(Number);
        if (!isNaN(parts[0])) openHour = parts[0];
        if (!isNaN(parts[1])) openMin = parts[1];
      } else if (typeof rawHours === 'string' && rawHours.includes(':')) {
        const timeMatches = rawHours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/gi);
        if (timeMatches && timeMatches.length >= 2) {
          // Parse start and end time
          const startMatch = timeMatches[0];
          const endMatch = timeMatches[1];
          if (startMatch) {
            const isPM = /PM/i.test(startMatch);
            const digits = startMatch.replace(/[^0-9:]/g, '').split(':').map(Number);
            openHour = isPM && digits[0] < 12 ? digits[0] + 12 : digits[0];
            openMin = digits[1] || 0;
          }
          if (endMatch) {
            const isPM = /PM/i.test(endMatch);
            const digits = endMatch.replace(/[^0-9:]/g, '').split(':').map(Number);
            closeHour = isPM && digits[0] < 12 ? digits[0] + 12 : digits[0];
            closeMin = digits[1] || 0;
          }
        }
      }

      // Calculate UTC start and end timestamps in Qatar timezone (UTC+3)
      const startTime = new Date(Date.UTC(startBounds.year, startBounds.month - 1, startBounds.day, openHour - 3, openMin, 0, 0));
      const endTime = new Date(Date.UTC(startBounds.year, startBounds.month - 1, startBounds.day, closeHour - 3, closeMin, 0, 0));

      const thumbnail =
        attr?.heroMediaUrl ||
        attr?.heroThumbnailUrl ||
        attr?.gallery?.[0]?.url ||
        attr?.logoUrl ||
        DEFAULT_COVER;

      const lowestPrice = attr?.pricing?.[0]
        ? `${attr.pricing[0].currency || 'QAR'} ${attr.pricing[0].price}`
        : null;

      const bookingAction = resolveBookingAction(
        attr?.ticketingUrl,
        attr?.slug,
        locale,
        attr?.nameEn
      );

      const locationNameEn = ops.locationNameEn || (typeof ops.venueName === 'string' ? ops.venueName : ops.venueName?.en) || 'Doha, Qatar';
      const locationNameAr = ops.locationNameAr || (typeof ops.venueName === 'string' ? ops.venueName : ops.venueName?.ar) || 'الدوحة، قطر';

      const openingTimeString = `${String(openHour).padStart(2, '0')}:${String(openMin).padStart(2, '0')}`;
      const closingTimeString = `${String(closeHour).padStart(2, '0')}:${String(closeMin).padStart(2, '0')}`;

      results.push({
        id: `attraction-schedule-${attr.id}-${startBounds.qatarDateString}`,
        attractionId: attr.id,
        attractionNameEn: attr.nameEn,
        attractionNameAr: attr.nameAr,
        attractionSlug: attr.slug || '',
        title: isAr ? (attr.nameAr || attr.nameEn) : attr.nameEn,
        titleEn: attr.nameEn,
        titleAr: attr.nameAr,
        description: isAr ? (attr.taglineAr || attr.descriptionAr || attr.taglineEn) : (attr.taglineEn || attr.descriptionEn),
        descriptionEn: attr.taglineEn || attr.descriptionEn,
        descriptionAr: attr.taglineAr || attr.descriptionAr,
        thumbnail,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        eventType: 'REGULAR',
        price: lowestPrice,
        capacityGate: attr.capacity || 100,
        currentCount: 0,
        isAvailable: true,
        hasOffer: attr.offers ? attr.offers.length > 0 : false,
        locationNameEn,
        locationNameAr,
        openingTime: openingTimeString,
        closingTime: closingTimeString,
        ticketingUrl: bookingAction.url,
        bookingAction,
      });
    }

    // 8. Filter availableNow if requested
    let finalResults = results;
    if (availableNow) {
      const now = new Date();
      finalResults = results.filter(r => {
        const s = new Date(r.startTime);
        const e = new Date(r.endTime);
        return now >= s && now <= e;
      });
    }

    try {
      await redis.set(cacheKey, JSON.stringify(finalResults), 'EX', 120);
    } catch (e: any) {
      console.warn('[REDIS_ERROR] Redis write notice:', e.message);
    }

    return NextResponse.json(finalResults);
  } catch (error: any) {
    console.error('[CALENDAR_GET_ERROR]', error);
    // Return empty array instead of 500 so client gracefully renders without unhandled crashes
    return NextResponse.json([]);
  }
}
