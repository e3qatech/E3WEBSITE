import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { isHRAuthorized } from '@/lib/careers/job-eligibility';
import { parseResumeWithAI } from '@/lib/careers/ai-cv-parser';

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
      return NextResponse.json({ error: 'Forbidden: HR permissions required to parse CV documents' }, { status: 403 });
    }

    const { id } = await params;
    const application = await db.jobApplication.findUnique({ where: { id } });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const jobTitle = application.jobTitle || 'Event Professional';
    const department = application.department || 'Operations';
    const candidateName = `${application.firstName || ''} ${application.lastName || ''}`.trim() || 'Candidate';

    const payload = await parseResumeWithAI({
      jobTitle,
      department,
      candidateName,
      email: application.email,
      phone: application.phone || undefined,
      notes: application.coverLetter || application.experience || undefined,
      cvUrl: application.cvUrl || undefined,
    });

    const updatedApplication = await db.jobApplication.update({
      where: { id },
      data: {
        cvParsedData: payload,
        status: application.status === 'NEW' ? 'REVIEWING' : application.status,
      },
    });

    return NextResponse.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error("[POST /api/careers/:id/parse] error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

