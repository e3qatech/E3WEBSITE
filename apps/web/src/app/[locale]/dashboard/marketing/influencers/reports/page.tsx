import React from "react";
import { requirePermission } from "@/lib/server-auth";
import { listCampaigns } from "@/lib/influencer/campaign-service";
import ReportsClient from "./ReportsClient";

export default async function InfluencerReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  await requirePermission("influencerReport.read");

  // Fetch campaigns for the report selector
  const { items: campaigns } = await listCampaigns({ pageSize: 50 });

  return (
    <ReportsClient
      campaigns={campaigns}
      locale={locale}
      isAr={isAr}
    />
  );
}
