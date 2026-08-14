import { Metadata } from "next";
import db from "@/lib/db";
import { UsersList } from "@/components/dashboard/crm/UsersList";
import { requireCurrentUser } from "@/lib/server-auth";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardAccessDenied,
  DashboardErrorState,
} from "@/components/dashboard/ui";

export const metadata: Metadata = {
  title: "User & Role Management | CRM | E3 Admin",
};

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  let currentUser: any = null;
  try {
    currentUser = await requireCurrentUser();
  } catch (_e) {
    return (
      <DashboardPageShell variant="focused">
        <DashboardAccessDenied
          title="Authentication Required"
          message="Please log in with an administrative account to access user management."
        />
      </DashboardPageShell>
    );
  }

  // Capability check
  if (currentUser.role !== "SUPER_ADMIN" && !currentUser.permissions?.includes("rbac.manage") && !currentUser.permissions?.includes("*")) {
    return (
      <DashboardPageShell variant="focused">
        <DashboardAccessDenied
          title="Access Restricted"
          message="Your account does not have authorization to manage CRM users or RBAC roles."
          requiredRole="SUPER_ADMIN"
          requiredPermission="rbac.manage"
        />
      </DashboardPageShell>
    );
  }

  let formattedUsers: any[] = [];
  let fetchError: string | null = null;

  try {
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
      },
      take: 100,
    });

    formattedUsers = users.map((u: any) => ({
      ...u,
      createdAt: u.createdAt?.toISOString?.() || new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error("[CRM UsersPage] database query warning:", error);
    fetchError = error?.message || "Failed to query database for users list.";
  }

  return (
    <DashboardPageShell variant="wide">
      <DashboardPageHeader
        title="CRM Users & Access Control"
        description="View and administer portal users, clients, staff assignments, and credential status."
        breadcrumbs={[
          { label: "CRM & Sales", href: "/dashboard/crm/leads" },
          { label: "Users & Roles" },
        ]}
        badge={{ label: "RBAC Directory", variant: "purple" }}
      />

      {fetchError && formattedUsers.length === 0 ? (
        <DashboardErrorState
          title="Unable to load users"
          message="Could not load the users roster from the database."
          error={fetchError}
        />
      ) : (
        <UsersList initialUsers={formattedUsers} />
      )}
    </DashboardPageShell>
  );
}
