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
    let application = await db.jobApplication.findUnique({ where: { id } });

    if (application) {
      const jobTitle = application.jobTitle || 'Event Professional';
      const department = application.department || 'Operations';
      const candidateName = `${application.firstName || ''} ${application.lastName || ''}`.trim() || 'Candidate';

      const payload = await parseResumeWithAI({
        jobTitle,
        department,
        candidateName,
        email: application.email,
        phone: application.phone || undefined,
        notes: (application as any).coverLetter || (application as any).experience || undefined,
        cvUrl: application.cvUrl || undefined,
      });

      const updatedApplication = await db.jobApplication.update({
        where: { id },
        data: {
          cvParsedData: payload as any,
          status: application.status === 'NEW' ? 'REVIEWING' : application.status,
        },
      });

      // Optionally sync to Talent table if matching record exists
      try {
        await (db as any).talent.updateMany({
          where: { email: application.email },
          data: {
            skills: payload.skills,
            experienceLevel: `${payload.experienceYears} Years`,
            notes: `[E3 AI Dossier] ${payload.summary}`,
          },
        });
      } catch (_tErr) {}

      return NextResponse.json({
        success: true,
        application: updatedApplication,
        data: { application: updatedApplication },
      });
    }

    // Fallback: check if id belongs to Talent record
    const talent = await db.talent.findUnique({ where: { id } });
    if (!talent) {
      return NextResponse.json({ error: 'Candidate application or talent profile not found' }, { status: 404 });
    }

    const talentJobTitle = talent.position || 'Event Professional';
    const talentDept = talent.department || 'Operations';
    const talentPayload = await parseResumeWithAI({
      jobTitle: talentJobTitle,
      department: talentDept,
      candidateName: talent.name || 'Candidate',
      email: talent.email,
      phone: talent.phone || undefined,
      notes: talent.notes || undefined,
      cvUrl: talent.resumeUrl || undefined,
    });

    const updatedTalent = await db.talent.update({
      where: { id },
      data: {
        skills: talentPayload.skills,
        experienceLevel: `${talentPayload.experienceYears} Years`,
        notes: `[E3 AI Dossier] ${talentPayload.summary}`,
      },
    });

    // Provide unified application representation
    const unifiedApp = {
      id: updatedTalent.id,
      firstName: updatedTalent.name.split(' ')[0] || updatedTalent.name,
      lastName: updatedTalent.name.split(' ').slice(1).join(' ') || '',
      email: updatedTalent.email,
      phone: updatedTalent.phone,
      jobTitle: talentJobTitle,
      department: talentDept,
      cvUrl: updatedTalent.resumeUrl,
      cvParsedData: talentPayload,
      status: updatedTalent.status,
      createdAt: updatedTalent.appliedDate.toISOString(),
    };

    return NextResponse.json({
      success: true,
      talent: updatedTalent,
      application: unifiedApp,
      data: { application: unifiedApp, talent: updatedTalent },
    });
  } catch (error) {
    console.error("[POST /api/careers/:id/parse] error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

