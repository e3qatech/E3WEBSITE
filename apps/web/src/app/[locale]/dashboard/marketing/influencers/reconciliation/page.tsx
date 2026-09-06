import React from "react";
import { requirePermission } from "@/lib/server-auth";
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

  await requirePermission("influencerFinance.read");

  const status = typeof sParams.status === "string" ? sParams.status : "UNMATCHED_CODE";
  const page = typeof sParams.page === "string" ? parseInt(sParams.page, 10) : 1;
  const search = typeof sParams.search === "string" ? sParams.search : undefined;

  const [data, campaigns] = await Promise.all([
    getUnmatchedConversions({ page, limit: 25, status, search }),
    (db as any).influencerCampaign.findMany({
      where: { status: { in: ['ACTIVE', 'APPROVED', 'INVITING'] } },
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        internalCode: true,
        creators: {
          select: {
            id: true,
            influencer: {
              select: {
                id: true,
                displayName: true,
                handle: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

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
