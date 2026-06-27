import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const cacheKey = `tickets:active`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const attractions = await db.attraction.findMany({
      where: {
        isPublished: true,
        isHidden: false,
      },
      include: {
        pricing: true,
        // Include today's schedules to determine general availability
        schedules: {
          where: {
            startTime: { gte: new Date(new Date().setHours(0,0,0,0)) },
            endTime: { lte: new Date(new Date().setHours(23,59,59,999)) }
          }
        }
      }
    });

    const result = attractions.map(attraction => {
      // General availability check for today
      let isAvailableToday = false;
      if (attraction.schedules && attraction.schedules.length > 0) {
         isAvailableToday = attraction.schedules.some(s => s.currentCount < s.capacityGate);
      } else {
         // If no schedules exist, we might assume it's open based on temporal rules, but for tickets, we'll default to available
         isAvailableToday = true;
      }

      // Map the pricing tiers
      const pricingTiers = attraction.pricing.map(p => ({
        id: p.id,
        ticketType: p.type,
        titleEn: p.titleEn,
        titleAr: p.titleAr,
        price: p.price,
        currency: p.currency,
        isAvailable: isAvailableToday // Could be more granular per tier if DB supported it
      }));

      return {
        attractionId: attraction.id,
        attractionNameEn: attraction.nameEn,
        attractionNameAr: attraction.nameAr,
        attractionSlug: attraction.slug,
        descriptionEn: attraction.descriptionEn,
        descriptionAr: attraction.descriptionAr,
        heroMediaUrl: attraction.heroMediaUrl,
        bookingUrl: `https://bookingqube.com/e3/${attraction.slug}`, // Standard deep link pattern
        pricingTiers,
      };
    });

    // 5 min cache
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[TICKETS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
