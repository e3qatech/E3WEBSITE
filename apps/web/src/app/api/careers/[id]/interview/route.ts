import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { isHRAuthorized } from '@/lib/careers/job-eligibility';
import { InterviewRecord } from '@/lib/careers/candidate-portal';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userPermissions = (session.user as any)?.permissions;
    if (!isHRAuthorized(userRole, userPermissions)) {
      return NextResponse.json({ error: 'Forbidden: HR permissions required to schedule interviews' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const {
      roundName = 'Executive & Domain Assessment',
      format = 'VIRTUAL',
      scheduledAt,
      durationMinutes = 45,
      meetingUrl,
      location,
      interviewers = ['E3 Qatar Talent Board'],
      notes,
    } = body;

    if (!scheduledAt) {
      return NextResponse.json({ error: 'scheduledAt date-time is required' }, { status: 400 });
    }

    const application = await db.jobApplication.findUnique({ where: { id } });
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const currentParsed = (application.cvParsedData as any) || {};
    const existingInterviews: any[] = Array.isArray(currentParsed.interviews) ? currentParsed.interviews : [];

    const newInterviewId = `int-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const parsedInterviewers = Array.isArray(interviewers)
      ? interviewers
      : typeof interviewers === 'string'
      ? interviewers.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['E3 Qatar Talent Board'];

    const newInterview: InterviewRecord = {
      id: newInterviewId,
      applicationId: id,
      jobTitle: application.jobTitle || 'Event Professional',
      department: application.department || undefined,
      roundName,
      format: format === 'IN_PERSON' ? 'IN_PERSON' : 'VIRTUAL',
      scheduledAt: new Date(scheduledAt).toISOString(),
      durationMinutes: Number(durationMinutes) || 45,
      meetingUrl: format === 'VIRTUAL' ? (meetingUrl || 'https://meet.google.com/e3q-hr-interview') : undefined,
      location: format === 'IN_PERSON' ? (location || 'E3 Qatar HQ - Level 24, Lusail Marina, Doha') : undefined,
      interviewers: parsedInterviewers.length > 0 ? parsedInterviewers : ['E3 Qatar Talent Board'],
      notes: notes || undefined,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
    };

    const updatedInterviews = [newInterview, ...existingInterviews];

    const updatedApp = await db.jobApplication.update({
      where: { id },
      data: {
        status: 'INTERVIEW',
        cvParsedData: {
          ...currentParsed,
          interviews: updatedInterviews,
          lastInterviewScheduledAt: newInterview.scheduledAt,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Interview scheduled successfully',
      interview: newInterview,
      application: {
        id: updatedApp.id,
        status: updatedApp.status,
      },
    });
  } catch (error) {
    console.error('[POST /api/careers/[id]/interview] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const application = await db.jobApplication.findUnique({
      where: { id },
      select: { id: true, jobTitle: true, department: true, status: true, cvParsedData: true, userId: true, email: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const currentParsed = (application.cvParsedData as any) || {};
    const interviews = Array.isArray(currentParsed.interviews) ? currentParsed.interviews : [];

    return NextResponse.json({
      success: true,
      interviews,
    });
  } catch (error) {
    console.error('[GET /api/careers/[id]/interview] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
