import { NextResponse } from 'next/server';
import { requireCandidateProfile, AppAuthError } from '@/lib/server-auth';
import db from '@/lib/db';

export async function GET() {
  try {
    const { user } = await requireCandidateProfile();

    // Fetch latest application to pull contact details and parsed resume info
    const latestApp = await db.jobApplication.findFirst({
      where: {
        OR: [
          { userId: user.id },
          ...(user.email ? [{ email: user.email }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsedData = (latestApp?.cvParsedData as any) || {};

    const profile = {
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      phone: latestApp?.phone || parsedData.phone || '',
      headline: parsedData.position || latestApp?.jobTitle || '',
      department: parsedData.department || latestApp?.department || '',
      experienceLevel: parsedData.experienceLevel || '',
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      summary: parsedData.summary || parsedData.notes || '',
      cvUrl: latestApp?.cvUrl || '',
      location: parsedData.location || 'Doha, Qatar',
      linkedinUrl: parsedData.linkedinUrl || '',
      portfolioUrl: parsedData.portfolioUrl || '',
      totalApplications: await db.jobApplication.count({
        where: {
          OR: [
            { userId: user.id },
            ...(user.email ? [{ email: user.email }] : []),
          ],
        },
      }),
    };

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error fetching candidate profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await requireCandidateProfile();
    const body = await request.json();

    const {
      name,
      phone,
      headline,
      department,
      experienceLevel,
      skills,
      summary,
      location,
      linkedinUrl,
      portfolioUrl,
    } = body;

    // 1. Update user name if provided
    if (name && typeof name === 'string') {
      await db.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
    }

    // 2. Fetch latest application to update its contact info and cvParsedData
    const latestApp = await db.jobApplication.findFirst({
      where: {
        OR: [
          { userId: user.id },
          ...(user.email ? [{ email: user.email }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latestApp) {
      const existingParsed = (latestApp.cvParsedData as any) || {};
      const updatedParsed = {
        ...existingParsed,
        ...(phone ? { phone: phone.trim() } : {}),
        ...(headline ? { position: headline.trim() } : {}),
        ...(department ? { department: department.trim() } : {}),
        ...(experienceLevel ? { experienceLevel: experienceLevel.trim() } : {}),
        ...(Array.isArray(skills) ? { skills } : {}),
        ...(summary ? { summary: summary.trim(), notes: summary.trim() } : {}),
        ...(location ? { location: location.trim() } : {}),
        ...(linkedinUrl !== undefined ? { linkedinUrl: String(linkedinUrl).trim() } : {}),
        ...(portfolioUrl !== undefined ? { portfolioUrl: String(portfolioUrl).trim() } : {}),
        updatedAt: new Date().toISOString(),
      };

      await db.jobApplication.update({
        where: { id: latestApp.id },
        data: {
          ...(phone ? { phone: phone.trim() } : {}),
          cvParsedData: updatedParsed,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Candidate profile updated successfully',
    });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error updating candidate profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
