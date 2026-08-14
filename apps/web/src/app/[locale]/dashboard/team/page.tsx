import { TeamManagerClient } from "@/components/dashboard/team/TeamManagerClient";
import prisma from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Management | E3 Dashboard",
};

export default async function DashboardTeamPage() {
  const employees = await prisma.employeeProfile.findMany({
    orderBy: { order: 'asc' }
  });

  return <TeamManagerClient initialEmployees={employees as any} />;
}
