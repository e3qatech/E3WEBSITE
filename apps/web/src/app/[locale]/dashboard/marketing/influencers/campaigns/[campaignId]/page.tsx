import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requirePermission, requireCurrentUser, AppAuthError } from "@/lib/server-auth";
import { hasPermission } from "@/lib/permissions";
import { DashboardAccessDenied } from "@/components/dashboard/ui/DashboardAccessDenied";
import { getCampaignById } from "@/lib/influencer/campaign-service";
import CampaignWorkspaceTabs from "./CampaignWorkspaceTabs";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Share2,
  FileText,
  Activity,
  Layers,
} from "lucide-react";

export default async function CampaignWorkspacePage({
  params,
}: {
  params: Promise<{ locale: string; campaignId: string }>;
}) {
  const { locale, campaignId } = await params;
  const isAr = locale === "ar";

  let user: any = null;
  try {
    await requirePermission("influencerCampaign.read");
    user = await requireCurrentUser();
  } catch (authErr: any) {
    if (authErr instanceof AppAuthError && authErr.statusCode === 401) {
      redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/marketing/influencers/campaigns/${campaignId}`);
    }
    return (
      <DashboardAccessDenied
        title={isAr ? "غير مصرح بالدخول" : "Access Restricted"}
        message={
          isAr
            ? "حسابك لا يمتلك صلاحية استعراض مساحة عمل هذه الحملة (influencerCampaign.read)."
            : "Your account does not have permission to view this campaign workspace."
        }
        requiredPermission="influencerCampaign.read"
      />
    );
  }

  const canApprove = hasPermission(user.role, "influencerCampaign.approve");
  const canManageAttendance = hasPermission(user.role, "influencerCampaign.manageAttendance");
  const canViewFinance = hasPermission(user.role, "influencerFinance.read");

  let campaign: any = null;
  try {
    campaign = await getCampaignById(campaignId);
  } catch (dbErr) {
    console.error("[CAMPAIGN GET ERROR]", dbErr);
    notFound();
  }

  if (!campaign) {
    notFound();
  }


  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & ID Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/${locale}/dashboard/marketing/influencers/campaigns`}
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
        >
          {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{isAr ? "العودة إلى الحملات" : "Back to Campaigns"}</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Code:</span>
          <span className="font-mono text-xs text-[var(--color-accent)] font-semibold px-2 py-0.5 rounded bg-[var(--bg-level-2)] border border-[var(--border-level-1)]">
            {campaign.internalCode}
          </span>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--bg-level-3)] border border-[var(--border-level-2)] flex items-center justify-center text-lg font-bold text-[var(--color-accent)] shrink-0">
            <Briefcase className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                {isAr ? campaign.titleAr || campaign.titleEn : campaign.titleEn}
              </h1>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  campaign.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : campaign.status === "APPROVED"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : campaign.status === "COMPLETED"
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                }`}
              >
                {campaign.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mt-1.5 flex-wrap">
              <span>Format: {campaign.campaignType.replace(/_/g, " ")}</span>
              <span>•</span>
              <span>Client: {campaign.clientName || "E3"}</span>
              {campaign.startDate && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(campaign.startDate).toLocaleDateString()}
                    {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString()}`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Budget & Creator Stats */}
        <div className="flex items-center gap-5 border-t md:border-t-0 md:border-s border-[var(--border-level-1)] pt-4 md:pt-0 md:ps-6">
          <div className="text-center">
            <span className="block text-2xl font-black text-[var(--text-primary)]">
              {campaign.creators?.length || 0}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              {isAr ? "صناع المحتوى" : "Creators"}
            </span>
          </div>

          <div className="text-center">
            <span className="block text-2xl font-black text-[var(--color-accent)]">
              {campaign.budget ? `${Number(campaign.budget).toLocaleString()}` : "0"}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              {campaign.currency} Budget
            </span>
          </div>
        </div>
      </div>

      {/* 10-Tab Workspace Client Component */}
      <CampaignWorkspaceTabs
        campaign={campaign}
        locale={locale}
        isAr={isAr}
        canApprove={canApprove}
        canManageAttendance={canManageAttendance}
        canViewFinance={canViewFinance}
      />
    </div>
  );
}
