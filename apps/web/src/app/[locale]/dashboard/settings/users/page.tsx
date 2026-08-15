import { Metadata } from "next";
import db from "@/lib/db";
import { UsersList } from "@/components/dashboard/crm/UsersList";
import { ChangePasswordForm } from "@/components/dashboard/settings/ChangePasswordForm";
import { requireCurrentUser } from "@/lib/server-auth";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardAccessDenied,
  DashboardErrorState,
} from "@/components/dashboard/ui";

export const metadata: Metadata = {
  title: "User Management & RBAC | E3 Admin",
};

export const dynamic = "force-dynamic";

export default async function UsersSettingsPage({
  params,
}: {
  params?: Promise<{ locale: string }>;
}) {
  const resolvedParams = params ? await params : { locale: "en" };
  const locale = resolvedParams.locale || "en";
  const isAr = locale === "ar";

  let currentUser: any = null;
  try {
    currentUser = await requireCurrentUser();
  } catch (_e) {
    return (
      <DashboardPageShell variant="focused">
        <DashboardAccessDenied
          title={isAr ? "تسجيل الدخول مطلوب" : "Authentication Required"}
          message={
            isAr
              ? "يرجى تسجيل الدخول بحساب إداري للوصول إلى إعدادات المستخدمين وصلاحيات الأدوار."
              : "Please log in with an administrative account to access user and RBAC settings."
          }
        />
      </DashboardPageShell>
    );
  }

  // Capability check: only SUPER_ADMIN or users with rbac.manage can manage users
  const isAuthorized =
    currentUser.role === "SUPER_ADMIN" ||
    currentUser.permissions?.includes("rbac.manage") ||
    currentUser.permissions?.includes("*");

  if (!isAuthorized) {
    return (
      <DashboardPageShell variant="focused">
        <DashboardAccessDenied
          title={isAr ? "صلاحيات الوصول مقيدة (RBAC)" : "RBAC Access Restricted"}
          message={
            isAr
              ? "حسابك لا يمتلك الصلاحيات المطلوبة لعرض أو إدارة المستخدمين وصلاحيات الأدوار."
              : "Your role does not have permission to view or manage administrative users and RBAC roles."
          }
          requiredRole="SUPER_ADMIN"
          requiredPermission="rbac.manage"
        />
      </DashboardPageShell>
    );
  }

  let formattedUsers: any[] = [];
  let fetchError: string | null = null;

  try {
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
      },
      take: 100,
    });

    formattedUsers = rawUsers.map((user: any) => ({
      ...user,
      email: user.email || "",
      createdAt: user.createdAt?.toISOString?.() || new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error("[UsersSettingsPage] database query warning:", error);
    fetchError = error?.message || "Failed to query database for users roster.";
  }

  const pageTitle = isAr
    ? "إدارة المستخدمين وصلاحيات الأدوار (RBAC)"
    : "User & Access Control (RBAC)";
  const pageDescription = isAr
    ? "إدارة الحسابات الإدارية، صلاحيات الأدوار، تجميد الحسابات، وإلغاء الجلسات النشطة."
    : "Manage administrative accounts, role-based access controls, account freezes, and session revocation.";

  const breadcrumbs = [
    { label: isAr ? "الإعدادات" : "Settings", href: `/${locale}/dashboard/settings/general` },
    { label: isAr ? "المستخدمون وصلاحيات الأدوار" : "Users & Roles" },
  ];

  const badgeLabel = isAr ? "أمان وصلاحيات" : "RBAC Security";

  return (
    <DashboardPageShell variant="wide">
      <DashboardPageHeader
        title={pageTitle}
        description={pageDescription}
        breadcrumbs={breadcrumbs}
        badge={{ label: badgeLabel, variant: "purple" }}
      />

      {fetchError && formattedUsers.length === 0 ? (
        <DashboardErrorState
          title={isAr ? "تعذر تحميل حسابات المستخدمين" : "Unable to load user accounts"}
          message={
            isAr
              ? "تعذر الاتصال بقاعدة بيانات المستخدمين. يرجى التحقق من حالة الاتصال."
              : "Could not connect to the user database. Please verify database connectivity."
          }
          error={fetchError}
        />
      ) : (
        <div className="space-y-8">
          <UsersList initialUsers={formattedUsers} />

          <div className="pt-4 border-t border-[var(--border-level-1)]">
            <ChangePasswordForm />
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
}
