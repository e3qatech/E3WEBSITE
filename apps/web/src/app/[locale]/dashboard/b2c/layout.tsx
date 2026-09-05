import React from "react";
import { requireCurrentUser } from "@/lib/server-auth";
import { hasPermission } from "@/lib/permissions";
import {
  DashboardPageShell,
  DashboardAccessDenied,
} from "@/components/dashboard/ui";

export default async function B2CDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
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
              ? "يرجى تسجيل الدخول بحساب إداري للوصول إلى لوحة إدارة الفعاليات والوجهات (B2C)."
              : "Please log in with an administrative account to access the B2C Attractions & Events portal."
          }
        />
      </DashboardPageShell>
    );
  }

  const userRole = String(currentUser?.role || currentUser?.rawRole || "").trim().toUpperCase();
  const permissions: string[] = currentUser?.permissions || [];

  const isAuthorized =
    userRole === "SUPER_ADMIN" ||
    userRole === "ADMIN" ||
    userRole === "B2C_ADMIN" ||
    userRole === "SUPPORT_ADMIN" ||
    userRole === "EVENTS_ADMIN" ||
    userRole === "EVENTS_TEAM" ||
    hasPermission(userRole, "b2c.content.read") ||
    hasPermission(userRole, "b2c.content.write") ||
    permissions.includes("*") ||
    permissions.includes("b2c.content.read") ||
    permissions.includes("b2c.content.write") ||
    permissions.includes("view:b2c");

  if (!isAuthorized) {
    return (
      <DashboardPageShell variant="focused">
        <DashboardAccessDenied
          title={isAr ? "صلاحيات الوصول مقيدة (B2C Admin)" : "B2C Attractions Access Restricted"}
          message={
            isAr
              ? "حسابك الحالي لا يمتلك الصلاحيات الإدارية المطلوبة لإدارة الوجهات والفعاليات والباقات الترفيهية (B2C). تم تفعيل العزل الأمني بين القطاعات."
              : "Your account does not possess the requisite administrative authorization to manage B2C attractions, entertainment packages, or event schedules. Cross-domain security isolation is active."
          }
          requiredRole="B2C_ADMIN / SUPPORT_ADMIN / EVENTS_ADMIN"
          requiredPermission="b2c.content.read"
        />
      </DashboardPageShell>
    );
  }

  return <>{children}</>;
}
