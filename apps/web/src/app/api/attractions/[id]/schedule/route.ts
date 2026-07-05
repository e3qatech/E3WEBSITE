import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== 'SUPER_ADMIN' && (session.user as any).role !== 'SALES_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    if (!dateStr) {
      return NextResponse.json({ error: 'date parameter is required (YYYY-MM-DD)' }, { status: 400 });
    }

    // Parse the target date explicitly in Asia/Qatar timezone
    const timeZone = 'Asia/Qatar';
    
    // Create a Date object for midnight in Qatar time
    const qatarDate = toZonedTime(`${dateStr}T00:00:00Z`, timeZone);
    const dayOfWeek = getDay(qatarDate);

    // Fetch all rules for the attraction
    const rules = await db.attractionTemporalRule.findMany({
      where: { attractionId: id },
    });

    // Filter rules that are active for the targetDate
    const activeRules = rules.filter(rule => {
      // If rule has start/end date, ensure targetDate is within it
      if (rule.startDate && rule.endDate) {
        if (!isWithinInterval(qatarDate, { start: startOfDay(rule.startDate), end: endOfDay(rule.endDate) })) {
          return false;
        }
      } else if (rule.startDate && qatarDate < startOfDay(rule.startDate)) {
         return false;
      } else if (rule.endDate && qatarDate > endOfDay(rule.endDate)) {
         return false;
      }
      return true;
    });

    // 1. Check for CLOSURE
    const closure = activeRules.find(r => r.ruleType === 'CLOSURE');
    if (closure) {
      return NextResponse.json({
        isOpen: false,
        status: 'CLOSURE',
        openTime: null,
        closeTime: null,
        notes: closure.notes
      });
    }

    // 2. Check for OVERRIDE
    const override = activeRules.find(r => r.ruleType === 'OVERRIDE');
    if (override) {
      return NextResponse.json({
        isOpen: true,
        status: 'OVERRIDE',
        openTime: override.openTime,
        closeTime: override.closeTime,
        notes: override.notes
      });
    }

    // 3. Fallback to RECURRING
    const recurringRules = activeRules.filter(r => r.ruleType === 'RECURRING');
    
    const applicableRecurring = recurringRules.find(r => {
       if (r.daysOfWeek && Array.isArray(r.daysOfWeek)) {
          return (r.daysOfWeek as number[]).includes(dayOfWeek);
       }
       return false;
    });

    if (applicableRecurring) {
      return NextResponse.json({
        isOpen: true,
        status: 'RECURRING',
        openTime: applicableRecurring.openTime,
        closeTime: applicableRecurring.closeTime,
        notes: applicableRecurring.notes
      });
    }

    // Default if no rules match
    return NextResponse.json({
      isOpen: false,
      status: 'NO_RULE_FOUND',
      openTime: null,
      closeTime: null,
      notes: null
    });

  } catch (error) {
    console.error('Schedule resolution error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
