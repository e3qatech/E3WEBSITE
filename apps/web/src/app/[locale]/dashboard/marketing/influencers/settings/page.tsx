import React from "react";
import { redirect } from "next/navigation";
import { requirePermission, AppAuthError } from "@/lib/server-auth";
import { DashboardAccessDenied } from "@/components/dashboard/ui/DashboardAccessDenied";
import { getScoringWeights } from "@/lib/influencer/scoring";
import SettingsClient from "./SettingsClient";

export default async function InfluencerSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  try {
    await requirePermission("influencerSettings.manage");
  } catch (authErr: any) {
    if (authErr instanceof AppAuthError && authErr.statusCode === 401) {
      redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/marketing/influencers/settings`);
    }
    return (
      <DashboardAccessDenied
        title={isAr ? "غير مصرح بالدخول" : "Access Restricted"}
        message={
          isAr
            ? "حسابك لا يمتلك صلاحية تعديل إعدادات ونماذج تقييم المؤثرين (influencerSettings.manage)."
            : "Your account does not have permission to manage influencer scoring and module settings."
        }
        requiredPermission="influencerSettings.manage"
      />
    );
  }

  let initialWeights: any = {
    contentQuality: 0.35,
    engagementRate: 0.25,
    brandSafety: 0.20,
    pastReliability: 0.10,
    qatarAudienceRatio: 0.10,
  };
  try {
    initialWeights = await getScoringWeights();
  } catch (dbErr) {
    console.error("[INFLUENCER SCORING WEIGHTS FETCH ERROR]", dbErr);
  }

  return (
    <SettingsClient
      initialWeights={initialWeights}
      locale={locale}
      isAr={isAr}
    />
  );
}

