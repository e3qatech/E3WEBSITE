import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireCurrentUser, AppAuthError } from '@/lib/server-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const user = await requireCurrentUser();
    const { interviewId } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason, preferredDate } = body;

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json({ error: 'Please provide a reason for the reschedule request' }, { status: 400 });
    }

    // Find application that owns this interview and belongs to the candidate
    const applications = await (db as any).jobApplication.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(user.email ? [{ email: user.email }] : [])
        ]
      }
    });

    let targetApplication: any = null;
    let targetInterviewIndex = -1;

    for (const app of applications) {
      const parsed = (app.cvParsedData as any) || {};
      if (Array.isArray(parsed.interviews)) {
        const idx = parsed.interviews.findIndex((i: any) => i.id === interviewId);
        if (idx !== -1) {
          targetApplication = app;
          targetInterviewIndex = idx;
          break;
        }
      }
    }

    if (!targetApplication || targetInterviewIndex === -1) {
      return NextResponse.json({ error: 'Interview record not found or access denied' }, { status: 404 });
    }

    const currentParsed = (targetApplication.cvParsedData as any) || {};
    const updatedInterviews = [...(currentParsed.interviews || [])];
    const existing = updatedInterviews[targetInterviewIndex];

    updatedInterviews[targetInterviewIndex] = {
      ...existing,
      status: 'RESCHEDULE_REQUESTED',
      rescheduleReason: reason.trim(),
      preferredAlternativeDate: preferredDate || undefined,
      rescheduleRequestedAt: new Date().toISOString(),
    };

    await db.jobApplication.update({
      where: { id: targetApplication.id },
      data: {
        cvParsedData: {
          ...currentParsed,
          interviews: updatedInterviews,
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Reschedule request submitted successfully. Our talent team will reach out with an updated slot.',
      interview: updatedInterviews[targetInterviewIndex],
    });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('[POST /api/candidate/interviews/[interviewId]/reschedule] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
