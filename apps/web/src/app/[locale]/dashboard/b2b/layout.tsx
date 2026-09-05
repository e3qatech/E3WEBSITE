import React from "react";
import { requireCurrentUser } from "@/lib/server-auth";
import { hasPermission } from "@/lib/permissions";
import {
  DashboardPageShell,
  DashboardAccessDenied,
} from "@/components/dashboard/ui";

export default async function B2BDashboardLayout({
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
              ? "يرجى تسجيل الدخول بحساب إداري للوصول إلى لوحة إدارة الشركات (B2B)."
              : "Please log in with an administrative account to access the B2B Enterprise portal."
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
    userRole === "B2B_ADMIN" ||
    userRole === "SALES_ADMIN" ||
    hasPermission(userRole, "b2b.content.read") ||
    hasPermission(userRole, "b2b.content.write") ||
    permissions.includes("*") ||
    permissions.includes("b2b.content.read") ||
    permissions.includes("b2b.content.write") ||
    permissions.includes("view:b2b");

  if (!isAuthorized) {
    return (
      <DashboardPageShell variant="focused">
        <DashboardAccessDenied
          title={isAr ? "صلاحيات الوصول مقيدة (B2B Admin)" : "B2B Enterprise Access Restricted"}
          message={
            isAr
              ? "حسابك الحالي لا يمتلك الصلاحيات الإدارية المطلوبة لإدارة قطاع الشركات والخدمات الهندسية (B2B). تم تفعيل العزل الأمني بين القطاعات."
              : "Your account does not possess the requisite administrative authorization to manage B2B enterprise solutions and client accounts. Cross-domain security isolation is active."
          }
          requiredRole="B2B_ADMIN / SALES_ADMIN"
          requiredPermission="b2b.content.read"
        />
      </DashboardPageShell>
    );
  }

  return <>{children}</>;
}
