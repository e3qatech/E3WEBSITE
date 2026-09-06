import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { scheduleCreatorAttendance, checkInCreatorAttendance, checkOutCreatorAttendance } from '@/lib/influencer/attendance-service';
import db from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerCampaign.manageAttendance');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const attendances = await (db as any).influencerAttendance.findMany({
      where: {
        campaignCreator: { campaignId },
      },
      include: {
        campaignCreator: {
          include: { influencer: true },
        },
      },
      orderBy: { eventDate: 'asc' },
    });

    return NextResponse.json(attendances);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkInfluencerAuth(req, 'influencerCampaign.manageAttendance');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const attendance = await scheduleCreatorAttendance({
      ...body,
      actorId: auth.userId,
    });
    return NextResponse.json(attendance, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkInfluencerAuth(req, 'influencerCampaign.manageAttendance');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { attendanceId, action } = body;

    if (!attendanceId) return NextResponse.json({ error: 'attendanceId is required' }, { status: 400 });

    if (action === 'CHECK_IN') {
      const updated = await checkInCreatorAttendance(attendanceId, auth.userId);
      return NextResponse.json(updated);
    } else if (action === 'CHECK_OUT') {
      const updated = await checkOutCreatorAttendance(attendanceId, auth.userId);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid attendance action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
