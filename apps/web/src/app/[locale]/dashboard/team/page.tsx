import { TeamManagerClient } from "@/components/dashboard/team/TeamManagerClient";
import prisma from "@/lib/db";

export default async function DashboardTeamPage() {
  const employees = await prisma.employeeProfile.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <div className="flex-1 overflow-y-auto w-full flex flex-col h-screen">
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <TeamManagerClient initialEmployees={employees as any} />
      </div>
    </div>
  );
}
