import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN', 'SALES_ADMIN', 'STAFF'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rules = await db.attractionTemporalRule.findMany({
      include: {
        attraction: {
          select: { id: true, nameEn: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching temporal rules:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN', 'SALES_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const rule = await db.attractionTemporalRule.create({
      data: {
        attractionId: data.attractionId,
        ruleType: data.ruleType,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        openTime: data.openTime,
        closeTime: data.closeTime,
        daysOfWeek: data.daysOfWeek,
        notes: data.notes,
      }
    });

    await db.systemLog.create({
      data: {
        action: `TEMPORAL_RULE_CREATED`,
        entity: `Rule for Attraction ${data.attractionId}`,
        entityId: rule.id,
        userId: (session.user as any)?.id,
      }
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error creating temporal rule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
