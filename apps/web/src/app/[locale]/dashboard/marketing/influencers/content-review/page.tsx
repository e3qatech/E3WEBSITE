import React from "react";
import { requirePermission } from "@/lib/server-auth";
import db from "@/lib/db";
import ContentReviewClient from "./ContentReviewClient";

export default async function ContentReviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  await requirePermission("influencerContent.review");

  // Fetch pending submissions and published deliverables needing verification
  const deliverables = await (db as any).campaignDeliverable.findMany({
    where: {
      status: {
        in: ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "PUBLISHED"],
      },
    },
    include: {
      submissions: {
        orderBy: { version: "desc" },
        take: 1,
        include: {
          reviews: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
      campaignCreator: {
        include: {
          influencer: true,
          campaign: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <ContentReviewClient
      initialDeliverables={deliverables}
      locale={locale}
      isAr={isAr}
    />
  );
}
