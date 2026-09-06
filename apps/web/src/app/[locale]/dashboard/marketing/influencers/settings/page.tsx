import React from "react";
import { requirePermission } from "@/lib/server-auth";
import { getScoringWeights } from "@/lib/influencer/scoring";
import SettingsClient from "./SettingsClient";

export default async function InfluencerSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  await requirePermission("influencerSettings.manage");

  const initialWeights = await getScoringWeights();

  return (
    <SettingsClient
      initialWeights={initialWeights}
      locale={locale}
      isAr={isAr}
    />
  );
}
