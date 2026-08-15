import { Metadata } from "next";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isHRAuthorized } from "@/lib/careers/job-eligibility";
import { ApplicationsManager } from "@/components/dashboard/careers/ApplicationsManager";

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

  return <ApplicationsManager initialApplications={applications} />;
}
