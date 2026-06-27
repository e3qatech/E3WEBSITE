import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isWithinInterval, getDay, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { redis } from '@/lib/redis';

const QATAR_TZ = 'Asia/Qatar';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attractionId } = await params;

    // 30 second cache for live operations endpoint
    const cacheKey = `attractions:operations:${attractionId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const rules = await db.attractionTemporalRule.findMany({
      where: { attractionId },
    });

    const now = new Date();
    const qatarNow = toZonedTime(now, QATAR_TZ);
    const currentDay = getDay(qatarNow);
    const currentTimeStr = format(qatarNow, 'HH:mm');

    let isOpen = false;
    
    // 1. RECURRING
    const recurring = rules.filter(r => r.ruleType === 'RECURRING');
    for (const rule of recurring) {
       if (rule.daysOfWeek && Array.isArray(rule.daysOfWeek) && rule.daysOfWeek.includes(currentDay)) {
         if (rule.openTime && rule.closeTime && currentTimeStr >= rule.openTime && currentTimeStr <= rule.closeTime) {
           isOpen = true;
         }
       }
    }

    // 2. OVERRIDE
    const overrides = rules.filter(r => r.ruleType === 'OVERRIDE');
    for (const rule of overrides) {
       if (rule.startDate && rule.endDate) {
          const start = toZonedTime(rule.startDate, QATAR_TZ);
          const end = toZonedTime(rule.endDate, QATAR_TZ);
          if (isWithinInterval(qatarNow, { start, end })) {
             if (rule.openTime && rule.closeTime && currentTimeStr >= rule.openTime && currentTimeStr <= rule.closeTime) {
               isOpen = true;
             } else {
               isOpen = false;
             }
          }
       }
    }

    // 3. CLOSURE
    const closures = rules.filter(r => r.ruleType === 'CLOSURE');
    for (const rule of closures) {
       if (rule.startDate && rule.endDate) {
          const start = toZonedTime(rule.startDate, QATAR_TZ);
          const end = toZonedTime(rule.endDate, QATAR_TZ);
          if (isWithinInterval(qatarNow, { start, end })) {
             isOpen = false;
          }
       }
    }

    // Latest telemetry for live occupancy
    const telemetry = await db.telemetryLog.findFirst({
      where: { attractionId },
      orderBy: { timestamp: 'desc' }
    });

    const schedule = await db.eventSchedule.findFirst({
       where: { attractionId, startTime: { lte: now }, endTime: { gte: now } }
    });

    let currentOccupancy = 0;
    if (telemetry?.payload && typeof telemetry.payload === 'object' && 'count' in telemetry.payload) {
      currentOccupancy = (telemetry.payload as any).count;
    } else {
      currentOccupancy = schedule?.currentCount || 0;
    }

    const response = {
      isOpen,
      currentOccupancy,
      maxCapacity: schedule?.capacityGate || 1000,
      averageVisitDuration: 90, // Derived from static rules for now
    };

    await redis.set(cacheKey, JSON.stringify(response), 'EX', 30);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[ATTRACTIONS_OPERATIONS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
