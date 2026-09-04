import { Metadata } from "next";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isHRAuthorized } from "@/lib/careers/job-eligibility";
import { ApplicationsManager } from "@/components/dashboard/careers/ApplicationsManager";
import { isLegacySimulatedMock, sanitizeCandidateAnalysis } from "@/lib/careers/ai-cv-parser";

export const metadata: Metadata = {
  title: "Job Applications | E3 Admin",
};

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const userPermissions = (session?.user as any)?.permissions;

  if (!session || !session.user || !isHRAuthorized(userRole, userPermissions)) {
    redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/careers/applications`);
  }

  const applications = await db.jobApplication.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Automatically heal and replace legacy mock software developer analysis with real domain intelligence
  const sanitizedApplications = await Promise.all(
    applications.map(async (app: any) => {
      const candidateName = `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Candidate';
      if (isLegacySimulatedMock(app.cvParsedData, app.jobTitle)) {
        const sanitized = sanitizeCandidateAnalysis(app.cvParsedData, app.jobTitle, app.department || undefined, candidateName);
        try {
          await db.jobApplication.update({
            where: { id: app.id },
            data: { cvParsedData: sanitized },
          });
        } catch (dbErr) {
          console.warn(`[Careers Page] Failed to persist sanitized AI analysis for app ${app.id}:`, dbErr);
        }
        return { ...app, cvParsedData: sanitized };
      }
      return app;
    })
  );

  return <ApplicationsManager initialApplications={sanitizedApplications} />;
}

