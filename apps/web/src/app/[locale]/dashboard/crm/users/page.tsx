import db from "@/lib/db";
import { UsersList } from "@/components/dashboard/crm/UsersList";
import { requireAdmin } from "@/lib/server-auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "User & Role Management | CRM | E3 Admin",
};

export default async function UsersPage() {
  try {
    await requireAdmin();
  } catch (_e) {
    redirect("/login");
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      sessionVersion: true,
      createdAt: true,
      clientMemberships: {
        select: {
          id: true,
          role: true,
          client: {
            select: {
              id: true,
              company: true,
            },
          },
        },
      },
    },
    take: 100,
  });

  const formattedUsers = users.map((u: any) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return <UsersList initialUsers={formattedUsers as any} />;
}
