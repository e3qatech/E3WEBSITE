import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { FALLBACK_ATTRACTIONS } from '@/components/b2c/AttractionsDirectory';

const _QATAR_TZ = 'Asia/Qatar';

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

    // Fetch directly from database attractions
    const attractionsWhere: any = { isPublished: true, isHidden: false };
    
    if (attractionIds && attractionIds.length > 0) {
      attractionsWhere.id = { in: attractionIds };
    }
    
    if (hasDiscount) {
      attractionsWhere.offers = { some: {} };
    }

    let attractions = await db.attraction.findMany({
      where: attractionsWhere,
      include: {
        offers: { select: { id: true } },
        gallery: { orderBy: { orderIndex: 'asc' }, take: 1 },
        pricing: {
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // If database query returns empty array, seed with canonical FALLBACK_ATTRACTIONS
    if (!attractions || attractions.length === 0) {
      attractions = FALLBACK_ATTRACTIONS as any;
    }

    const result = attractions.map((attraction: any) => {
      const ops = attraction.operations || {};
      const fallbackObj = FALLBACK_ATTRACTIONS.find((f) => 
        f.id === attraction.id || 
        f.slug === attraction.slug || 
        f.nameEn.toLowerCase().includes((attraction.nameEn || '').toLowerCase())
      );

      // Prioritize heroMediaUrl -> heroThumbnailUrl -> gallery[0] -> fallback image
      const thumbnail =
        attraction.heroMediaUrl ||
        attraction.heroThumbnailUrl ||
        attraction.gallery?.[0]?.url ||
        attraction.logoUrl ||
        fallbackObj?.heroMediaUrl ||
        'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop';

      const lowestPrice = attraction.pricing?.[0]
        ? `${attraction.pricing[0].currency || 'QAR'} ${attraction.pricing[0].price}`
        : attraction.price 
        ? `QAR ${attraction.price}` 
        : 'QAR 25';
      
      const locationNameEn = ops.locationNameEn || attraction.venue?.nameEn || fallbackObj?.operations?.locationNameEn || 'Lusail Boulevard, Qatar';
      const locationNameAr = ops.locationNameAr || attraction.venue?.nameAr || fallbackObj?.operations?.locationNameAr || 'شارع لوسيل التجاري، قطر';
      
      const openTimeStr = ops.openingTime || fallbackObj?.operations?.openingTime || '14:00';
      const closeTimeStr = ops.closingTime || fallbackObj?.operations?.closingTime || '23:00';

      const targetDateStr = searchParams.get('startDate');
      const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
      
      const [openH, openM] = openTimeStr.split(':').map(Number);
      const [closeH, closeM] = closeTimeStr.split(':').map(Number);

      const startTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), openH || 14, openM || 0);
      const endTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), closeH || 23, closeM || 0);

      return {
        id: attraction.id,
        attractionId: attraction.id,
        attractionNameEn: attraction.nameEn || attraction.name?.en || 'Flagship Attraction',
        attractionNameAr: attraction.nameAr || attraction.name?.ar || 'وجهة ترفيهية',
        attractionSlug: attraction.slug || 'attractions',
        ticketingUrl: attraction.ticketingUrl || fallbackObj?.ticketingUrl || `/en/b2c/calendar`,
        title: attraction.nameEn || attraction.name?.en || 'Flagship Attraction',
        description: attraction.taglineEn || attraction.descriptionEn || 'World-class entertainment world in Qatar',
        thumbnail,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        eventType: "REGULAR",
        price: lowestPrice,
        capacityGate: attraction.capacity || 100,
        currentCount: attraction.currentOccupancy || 0,
        isAvailable: true,
        hasOffer: attraction.offers?.length > 0,
        locationNameEn,
        locationNameAr,
        openingTime: openTimeStr,
        closingTime: closeTimeStr
      };
    });

    if (availableNow) {
      const filtered = result.filter((r: any) => r.isAvailable);
      try {
        await redis.set(cacheKey, JSON.stringify(filtered), 'EX', 60);
      } catch (e: any) {
        console.warn('[REDIS_ERROR] Failed to set cache:', e.message);
      }
      return NextResponse.json(filtered);
    }

    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
    } catch (e: any) {
      console.warn('[REDIS_ERROR] Failed to set cache:', e.message);
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[CALENDAR_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
