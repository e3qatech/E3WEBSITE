import React from "react";
import { redirect } from "next/navigation";
import { requirePermission, AppAuthError } from "@/lib/server-auth";
import { DashboardAccessDenied } from "@/components/dashboard/ui/DashboardAccessDenied";
import db from "@/lib/db";
import ContentReviewClient from "./ContentReviewClient";

export default async function ContentReviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  try {
    await requirePermission("influencerContent.review");
  } catch (authErr: any) {
    if (authErr instanceof AppAuthError && authErr.statusCode === 401) {
      redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/marketing/influencers/content-review`);
    }
    return (
      <DashboardAccessDenied
        title={isAr ? "غير مصرح بالدخول" : "Access Restricted"}
        message={
          isAr
            ? "حسابك لا يمتلك صلاحية مراجعة واعتماد المحتوى (influencerContent.review)."
            : "Your account does not have permission to review or approve influencer content submissions."
        }
        requiredPermission="influencerContent.review"
      />
    );
  }

  // Fetch pending submissions and published deliverables needing verification safely
  let deliverables: any[] = [];
  try {
    deliverables = await (db as any).campaignDeliverable.findMany({
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
    }).catch(() => []);
  } catch (dbErr) {
    console.error("[CONTENT REVIEW DELIVERABLES FETCH ERROR]", dbErr);
  }


  return (
    <ContentReviewClient
      initialDeliverables={deliverables}
      locale={locale}
      isAr={isAr}
    />
  );
}
