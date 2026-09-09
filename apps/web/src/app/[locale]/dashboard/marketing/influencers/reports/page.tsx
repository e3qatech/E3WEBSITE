import React from "react";
import { redirect } from "next/navigation";
import { requirePermission, AppAuthError } from "@/lib/server-auth";
import { DashboardAccessDenied } from "@/components/dashboard/ui/DashboardAccessDenied";
import { listCampaigns } from "@/lib/influencer/campaign-service";
import ReportsClient from "./ReportsClient";

export default async function InfluencerReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  try {
    await requirePermission("influencerReport.read");
  } catch (authErr: any) {
    if (authErr instanceof AppAuthError && authErr.statusCode === 401) {
      redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/marketing/influencers/reports`);
    }
    return (
      <DashboardAccessDenied
        title={isAr ? "غير مصرح بالدخول" : "Access Restricted"}
        message={
          isAr
            ? "حسابك لا يمتلك صلاحية استعراض تقارير أداء المؤثرين (influencerReport.read)."
            : "Your account does not have permission to view influencer performance reports."
        }
        requiredPermission="influencerReport.read"
      />
    );
  }

  // Fetch campaigns for the report selector safely
  let campaigns: any[] = [];
  try {
    const listResult = await listCampaigns({ pageSize: 50 });
    campaigns = listResult.items || [];
  } catch (dbErr) {
    console.error("[INFLUENCER REPORTS CAMPAIGNS FETCH ERROR]", dbErr);
  }

  return (
    <ReportsClient
      campaigns={campaigns}
      locale={locale}
      isAr={isAr}
    />
  );
}

