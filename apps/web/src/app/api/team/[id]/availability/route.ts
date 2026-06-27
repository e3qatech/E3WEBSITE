import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isWithinInterval } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const QATAR_TZ = 'Asia/Qatar';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamMemberId } = await params;
    const { searchParams } = new URL(req.url);
    const dateQuery = searchParams.get('date');

    if (!dateQuery) {
      return NextResponse.json({ error: 'Missing date parameter (YYYY-MM-DD)' }, { status: 400 });
    }

    const startOfDay = toZonedTime(`${dateQuery}T00:00:00Z`, QATAR_TZ);
    const endOfDay = toZonedTime(`${dateQuery}T23:59:59Z`, QATAR_TZ);

    const [slots, meetings] = await Promise.all([
      db.availabilitySlot.findMany({
        where: {
          teamMemberId,
          startTime: { gte: startOfDay, lte: endOfDay }
        },
        orderBy: { startTime: 'asc' }
      }),
      db.meeting.findMany({
        where: {
          startTime: { gte: startOfDay, lte: endOfDay }
        }
      })
    ]);

    const availableSlots = slots.map(slot => {
      // If slot is marked as booked, it's not available
      if (slot.isBooked) return { ...slot, available: false };

      // Also check if any Meeting overlaps with this slot
      const hasConflict = meetings.some(meeting => {
        return (
          isWithinInterval(meeting.startTime, { start: slot.startTime, end: slot.endTime }) ||
          isWithinInterval(meeting.endTime, { start: slot.startTime, end: slot.endTime }) ||
          (meeting.startTime <= slot.startTime && meeting.endTime >= slot.endTime)
        );
      });

      return {
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: !hasConflict
      };
    });

    return NextResponse.json(availableSlots);
  } catch (error: any) {
    console.error('[TEAM_AVAILABILITY_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
