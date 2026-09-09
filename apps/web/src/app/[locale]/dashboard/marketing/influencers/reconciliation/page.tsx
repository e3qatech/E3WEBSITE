import React from "react";
import { redirect } from "next/navigation";
import { requirePermission, AppAuthError } from "@/lib/server-auth";
import { DashboardAccessDenied } from "@/components/dashboard/ui/DashboardAccessDenied";
import { getUnmatchedConversions } from "@/lib/influencer/attribution-service";
import db from "@/lib/db";
import ReconciliationClient from "./ReconciliationClient";

export default async function ReconciliationQueuePage({
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
    await requirePermission("influencerFinance.read");
  } catch (authErr: any) {
    if (authErr instanceof AppAuthError && authErr.statusCode === 401) {
      redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/marketing/influencers/reconciliation`);
    }
    return (
      <DashboardAccessDenied
        title={isAr ? "غير مصرح بالدخول" : "Access Restricted"}
        message={
          isAr
            ? "حسابك لا يمتلك صلاحية الوصول إلى طابور مطابقة وتسوية المبيعات (influencerFinance.read)."
            : "Your account does not have permission to view or manage the influencer reconciliation queue."
        }
        requiredPermission="influencerFinance.read"
      />
    );
  }

  const status = typeof sParams.status === "string" ? sParams.status : "UNMATCHED_CODE";
  const page = typeof sParams.page === "string" ? parseInt(sParams.page, 10) : 1;
  const search = typeof sParams.search === "string" ? sParams.search : undefined;

  let data: { conversions: any[]; total: number; totalPages: number; page: number } = {
    conversions: [],
    total: 0,
    totalPages: 1,
    page: 1,
  };
  let campaigns: any[] = [];

  try {
    const [unmatchedResult, rawCampaigns] = await Promise.all([
      getUnmatchedConversions({ page, limit: 25, status, search }).catch(() => ({
        conversions: [],
        total: 0,
        totalPages: 1,
        page: 1,
      })),
      (db as any).influencerCampaign.findMany({
        where: { status: { in: ["ACTIVE", "APPROVED", "INVITING"] } },
        select: {
          id: true,
          titleEn: true,
          titleAr: true,
          internalCode: true,
          creatorAssignments: {
            select: {
              id: true,
              influencer: {
                select: {
                  id: true,
                  displayName: true,
                  platforms: {
                    select: {
                      handle: true,
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }).catch(() => []),
    ]);

    data = unmatchedResult;
    campaigns = (rawCampaigns || []).map((camp: any) => ({
      ...camp,
      creators: (camp.creatorAssignments || []).map((ca: any) => ({
        id: ca.id,
        influencer: {
          id: ca.influencer?.id,
          displayName: ca.influencer?.displayName,
          handle: ca.influencer?.platforms?.[0]?.handle || "",
        },
      })),
    }));
  } catch (dbErr) {
    console.error("[RECONCILIATION QUEUE FETCH ERROR]", dbErr);
  }

  return (
    <ReconciliationClient
      initialConversions={data.conversions}
      total={data.total}
      totalPages={data.totalPages}
      currentPage={data.page}
      status={status}
      campaigns={campaigns}
      locale={locale}
      isAr={isAr}
    />
  );
}

