import React from "react";
import { redirect } from "next/navigation";
import { requirePermission, AppAuthError } from "@/lib/server-auth";
import { DashboardAccessDenied } from "@/components/dashboard/ui/DashboardAccessDenied";
import { listApplications } from "@/lib/influencer/application-service";
import ApplicationsClient from "./ApplicationsClient";

export default async function ApplicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const sParams = await searchParams;
  const isAr = locale === "ar";

  try {
    await requirePermission("influencer.review");
  } catch (authErr: any) {
    if (authErr instanceof AppAuthError && authErr.statusCode === 401) {
      redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/marketing/influencers/applications`);
    }
    return (
      <DashboardAccessDenied
        title={isAr ? "غير مصرح بالدخول" : "Access Restricted"}
        message={
          isAr
            ? "حسابك لا يمتلك صلاحية مراجعة طلبات الانضمام (influencer.review)."
            : "Your account does not have permission to review creator applications."
        }
        requiredPermission="influencer.review"
      />
    );
  }

  const status = typeof sParams.status === "string" ? (sParams.status as any) : undefined;
  const page = typeof sParams.page === "string" ? parseInt(sParams.page, 10) : 1;

  let applications: any[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const listResult = await listApplications({
      status,
      page,
      pageSize: 25,
    });
    applications = listResult.items || [];
    total = listResult.total || 0;
    totalPages = listResult.totalPages || 1;
  } catch (dbErr) {
    console.error("[APPLICATIONS LIST FETCH ERROR]", dbErr);
  }

  return (
    <ApplicationsClient
      initialApplications={applications}
      total={total}
      totalPages={totalPages}
      initialStatus={status}
      locale={locale}
      isAr={isAr}
    />
  );
}

