import React from 'react';
import { requireCandidateApplication } from '@/lib/server-auth';
import { notFound } from 'next/navigation';
import { CandidateApplicationDetailClient } from '@/components/candidate/CandidateApplicationDetailClient';

export const dynamic = 'force-dynamic';

export default async function CandidateApplicationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  let result: any = null;
  try {
    result = await requireCandidateApplication(id);
  } catch (_err) {
    notFound();
  }

  const { application } = result || {};

  if (!application) {
    notFound();
  }

  return (
    <CandidateApplicationDetailClient
      application={{
        id: application.id,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        jobTitle: application.jobTitle,
        department: application.department,
        cvUrl: application.cvUrl,
        cvParsedData: application.cvParsedData,
        status: application.status,
        portal: application.portal,
        createdAt: application.createdAt.toISOString ? application.createdAt.toISOString() : application.createdAt,
        updatedAt: application.updatedAt.toISOString ? application.updatedAt.toISOString() : application.updatedAt,
      }}
      locale={locale}
    />
  );
}
