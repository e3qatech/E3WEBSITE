import React from "react";
import { requirePermission } from "@/lib/server-auth";
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

  await requirePermission("influencer.review");

  const status = typeof sParams.status === "string" ? (sParams.status as any) : undefined;
  const page = typeof sParams.page === "string" ? parseInt(sParams.page, 10) : 1;

  const { items: applications, total, totalPages } = await listApplications({
    status,
    page,
    pageSize: 25,
  });

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
