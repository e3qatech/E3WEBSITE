import React from 'react';
import { requirePortalAccess, requireCandidateProfile } from '@/lib/server-auth';
import db from '@/lib/db';
import { CandidateHubClient } from '@/components/candidate/CandidateHubClient';

export const dynamic = 'force-dynamic';

export default async function CandidateDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { user } = await requireCandidateProfile();
  await requirePortalAccess('careers');

  // Fetch submitted applications owned by this candidate
  let applications: any[] = [];
  try {
    applications = await db.jobApplication.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(user.email ? [{ email: user.email }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching candidate applications:', error);
  }

  // Fetch active job listings for recommended matches
  let recommendedJobs: any[] = [];
  try {
    const rawJobs = await (db as any).job.findMany({
      where: { isPublished: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
    recommendedJobs = rawJobs.map((j: any) => ({
      id: j.id,
      title: j.title,
      department: j.department || 'Operations',
      location: j.location || 'Doha, Qatar',
      type: j.type || 'FULL_TIME',
      description: j.description,
      requirements: j.requirements,
    }));
  } catch (_e) {
    recommendedJobs = [];
  }

  // Build candidate profile data
  const latestApp = applications[0];
  const parsedData = (latestApp?.cvParsedData as any) || {};

  const profileData = {
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    phone: latestApp?.phone || parsedData.phone || '',
    headline: parsedData.position || latestApp?.jobTitle || '',
    department: parsedData.department || latestApp?.department || '',
    experienceLevel: parsedData.experienceLevel || '',
    skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
    summary: parsedData.summary || parsedData.notes || '',
    cvUrl: applications.find((a) => Boolean(a.cvUrl))?.cvUrl || '',
    location: parsedData.location || 'Doha, Qatar',
    linkedinUrl: parsedData.linkedinUrl || '',
    portfolioUrl: parsedData.portfolioUrl || '',
  };

  const sanitizedApplications = applications.map((app) => ({
    id: app.id,
    firstName: app.firstName,
    lastName: app.lastName,
    email: app.email,
    phone: app.phone,
    jobTitle: app.jobTitle,
    department: app.department,
    cvUrl: app.cvUrl,
    cvParsedData: app.cvParsedData,
    status: app.status,
    portal: app.portal,
    createdAt: app.createdAt.toISOString ? app.createdAt.toISOString() : app.createdAt,
    updatedAt: app.updatedAt.toISOString ? app.updatedAt.toISOString() : app.updatedAt,
  }));

  return (
    <CandidateHubClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      profile={profileData}
      applications={sanitizedApplications}
      recommendedJobs={recommendedJobs}
      locale={locale}
    />
  );
}
