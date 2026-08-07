import { Metadata } from "next";
import db from "@/lib/db";
import { UsersList } from "@/components/dashboard/crm/UsersList";
import { ChangePasswordForm } from "@/components/dashboard/settings/ChangePasswordForm";

export const metadata: Metadata = {
  title: "User Management & RBAC | E3 Admin",
};

export const dynamic = 'force-dynamic';

export default async function UsersSettingsPage() {
  const rawUsers = await db.user.findMany({
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
  });

  const formattedUsers = rawUsers.map(user => ({
    ...user,
    email: user.email || '',
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">User & Access Control (RBAC)</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Manage administrative accounts, role-based access controls, account freezes, and session revocation.
        </p>
      </div>

      <UsersList initialUsers={formattedUsers} />

      <div className="pt-4 border-t border-[var(--border-default)]">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
