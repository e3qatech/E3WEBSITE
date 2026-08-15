import { TeamManagerClient } from "@/components/dashboard/team/TeamManagerClient";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { isTeamAuthorized } from "@/lib/team/team-resolver";

export const metadata: Metadata = {
  title: "Team Management | E3 Dashboard",
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardTeamPage(props: PageProps) {
  const { locale } = await props.params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login/admin`);
  }
  if (!isTeamAuthorized((session.user as any)?.role)) {
    redirect(`/${locale}/dashboard`);
  }

  const employees = await prisma.employeeProfile.findMany({
    orderBy: [
      { displayOrder: "asc" },
      { order: "asc" },
      { createdAt: "asc" },
    ],
  });

  return <TeamManagerClient initialEmployees={employees as any} locale={locale} />;
}
