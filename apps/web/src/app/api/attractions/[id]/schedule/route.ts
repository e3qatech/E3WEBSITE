import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isWithinInterval, getDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const QATAR_TZ = 'Asia/Qatar';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attractionId } = await params;
    const { searchParams } = new URL(req.url);
    const dateQuery = searchParams.get('date');

    if (!dateQuery) {
      return NextResponse.json({ error: 'Missing date parameter (YYYY-MM-DD)' }, { status: 400 });
    }

    const rules = await db.attractionTemporalRule.findMany({
      where: { attractionId },
    });

    // Evaluate in priority: CLOSURE > OVERRIDE > RECURRING
    const targetDateStr = `${dateQuery}T12:00:00`; // Local time string
    // This is safe assuming dateQuery is YYYY-MM-DD
    const targetDate = toZonedTime(new Date(targetDateStr), QATAR_TZ);
    const targetDayOfWeek = getDay(targetDate); 

    let openTime = null;
    let closeTime = null;
    let isOpen = false;
    let notes = null;

    // 1. RECURRING
    const recurring = rules.filter(r => r.ruleType === 'RECURRING');
    for (const rule of recurring) {
       if (rule.daysOfWeek && Array.isArray(rule.daysOfWeek) && rule.daysOfWeek.includes(targetDayOfWeek)) {
         isOpen = true;
         openTime = rule.openTime;
         closeTime = rule.closeTime;
         notes = rule.notes;
       }
    }

    // 2. OVERRIDE
    const overrides = rules.filter(r => r.ruleType === 'OVERRIDE');
    for (const rule of overrides) {
       if (rule.startDate && rule.endDate) {
          const start = toZonedTime(rule.startDate, QATAR_TZ);
          const end = toZonedTime(rule.endDate, QATAR_TZ);
          // Compare using midday to see if it falls within the day ranges
          if (isWithinInterval(targetDate, { start, end })) {
             isOpen = true;
             openTime = rule.openTime;
             closeTime = rule.closeTime;
             notes = rule.notes;
          }
       }
    }

    // 3. CLOSURE
    const closures = rules.filter(r => r.ruleType === 'CLOSURE');
    for (const rule of closures) {
       if (rule.startDate && rule.endDate) {
          const start = toZonedTime(rule.startDate, QATAR_TZ);
          const end = toZonedTime(rule.endDate, QATAR_TZ);
          if (isWithinInterval(targetDate, { start, end })) {
             isOpen = false;
             openTime = null;
             closeTime = null;
             notes = rule.notes || 'Closed';
          }
       }
    }

    // Schedule query (Capacity check for the day)
    const schedule = await db.eventSchedule.findFirst({
       where: { attractionId },
       orderBy: { startTime: 'desc' }
    });

    return NextResponse.json({
      isOpen,
      openTime,
      closeTime,
      maxCapacity: schedule?.capacityGate || null,
      currentCapacity: schedule?.currentCount || null,
      notes
    });

  } catch (error: any) {
    console.error('[ATTRACTIONS_SCHEDULE_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
