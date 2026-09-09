import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { requirePermission, AppAuthError } from "@/lib/server-auth";
import { DashboardAccessDenied } from "@/components/dashboard/ui/DashboardAccessDenied";
import {
  Users,
  Inbox,
  Briefcase,
  FileCheck,
  Ticket,
  DollarSign,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default async function InfluencerOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  // Enforce server authorization with graceful redirect / access denied
  try {
    await requirePermission("influencer.read");
  } catch (authErr: any) {
    if (authErr instanceof AppAuthError && authErr.statusCode === 401) {
      redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/marketing/influencers`);
    }
    return (
      <DashboardAccessDenied
        title={isAr ? "غير مصرح بالدخول" : "Access Restricted"}
        message={
          isAr
            ? "حسابك لا يمتلك صلاحية عرض وحدة المؤثرين وصناع المحتوى (influencer.read)."
            : "Your account does not have permission to view the Influencer & Creator Management module."
        }
        requiredPermission="influencer.read"
      />
    );
  }

  // Fetch live stats in parallel with resilient fallbacks
  let activeCreatorsCount = 0;
  let pendingAppsCount = 0;
  let activeCampaignsCount = 0;
  let invitationsAwaitingCount = 0;
  let contentAwaitingReviewCount = 0;
  let pendingVerificationCount = 0;
  let conversions: any[] = [];
  let pendingApps: any[] = [];
  let pendingReviews: any[] = [];
  let expiringInvitations: any[] = [];

  try {
    const results = await Promise.all([
      (db as any).influencer?.count({ where: { status: "ACTIVE" } }).catch(() => 0) ?? 0,
      (db as any).influencerApplication?.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }).catch(() => 0) ?? 0,
      (db as any).influencerCampaign?.count({ where: { status: "ACTIVE" } }).catch(() => 0) ?? 0,
      (db as any).campaignCreator?.count({ where: { status: "INVITED" } }).catch(() => 0) ?? 0,
      (db as any).campaignDeliverable?.count({ where: { status: "SUBMITTED" } }).catch(() => 0) ?? 0,
      (db as any).campaignDeliverable?.count({ where: { status: "PUBLISHED" } }).catch(() => 0) ?? 0,
      (db as any).influencerConversion?.findMany({
        select: { ticketCount: true, grossRevenue: true, netRevenue: true },
      }).catch(() => []) ?? [],
      (db as any).influencerApplication?.findMany({
        where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
        include: { influencer: true },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }).catch(() => []) ?? [],
      (db as any).campaignDeliverable?.findMany({
        where: { status: "SUBMITTED" },
        include: {
          campaignCreator: {
            include: { influencer: true, campaign: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }).catch(() => []) ?? [],
      (db as any).campaignCreator?.findMany({
        where: { status: "INVITED" },
        include: { influencer: true, campaign: true },
        orderBy: { invitationExpiresAt: "asc" },
        take: 5,
      }).catch(() => []) ?? [],
    ]);

    activeCreatorsCount = results[0] || 0;
    pendingAppsCount = results[1] || 0;
    activeCampaignsCount = results[2] || 0;
    invitationsAwaitingCount = results[3] || 0;
    contentAwaitingReviewCount = results[4] || 0;
    pendingVerificationCount = results[5] || 0;
    conversions = Array.isArray(results[6]) ? results[6] : [];
    pendingApps = Array.isArray(results[7]) ? results[7] : [];
    pendingReviews = Array.isArray(results[8]) ? results[8] : [];
    expiringInvitations = Array.isArray(results[9]) ? results[9] : [];
  } catch (dbErr) {
    console.error("[INFLUENCER OVERVIEW FETCH ERROR]", dbErr);
  }

  let totalTicketsSold = 0;
  let totalAttributedRevenue = 0;
  for (const c of conversions) {
    totalTicketsSold += c?.ticketCount || 0;
    totalAttributedRevenue += Number(c?.netRevenue) || 0;
  }


  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)]">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">{isAr ? "المؤثرين النشطين" : "Active Creators"}</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{activeCreatorsCount}</div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            {isAr ? "معتمدون في الدليل" : "Approved & verified roster"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)]">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">{isAr ? "طلبات قيد المراجعة" : "Pending Applications"}</span>
            <Inbox className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{pendingAppsCount}</div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            {isAr ? "تتطلب قرار القبول" : "Awaiting review decision"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)]">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">{isAr ? "الحملات النشطة" : "Active Campaigns"}</span>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{activeCampaignsCount}</div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            {isAr ? `${invitationsAwaitingCount} دعوة بانتظار الرد` : `${invitationsAwaitingCount} invitations pending`}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)]">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">{isAr ? "مسودات بانتظار الاعتماد" : "Drafts to Review"}</span>
            <FileCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{contentAwaitingReviewCount}</div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            {isAr ? `${pendingVerificationCount} منشور بانتظار التحقق` : `${pendingVerificationCount} posts to verify`}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)]">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">{isAr ? "تذاكر مباعة منسوبة" : "Attributed Tickets"}</span>
            <Ticket className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{totalTicketsSold.toLocaleString()}</div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            {isAr ? "عبر أكواد الخصم والروابط" : "Via promo codes & links"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)]">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">{isAr ? "الإيرادات المنسوبة" : "Attributed Revenue"}</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-500">
            {totalAttributedRevenue.toLocaleString()} <span className="text-xs text-[var(--text-muted)]">QAR</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            {isAr ? "صافي المبيعات المحققة" : "Net attributed booking revenue"}
          </p>
        </div>
      </div>

      {/* Consolidated Action Queue (Section 18) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Queue 1: Content Awaiting Review */}
        <div className="rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-2)] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-level-1)]">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[var(--color-accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {isAr ? "مسودات محتوى بانتظار المراجعة والاعتماد" : "Draft Content Awaiting Review"}
              </h2>
            </div>
            <Link
              href={`/${locale}/dashboard/marketing/influencers/content-review`}
              className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
            >
              <span>{isAr ? "عرض الكل" : "View All"}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[var(--border-level-1)] mt-2">
            {pendingReviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                {isAr ? "لا توجد مسودات محتوى معلقة للمراجعة حالياً." : "No pending drafts awaiting review right now."}
              </div>
            ) : (
              pendingReviews.map((d: any) => (
                <div key={d.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">{d.title}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {d.campaignCreator?.influencer?.displayName} · {d.campaignCreator?.campaign?.titleEn}
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/dashboard/marketing/influencers/content-review`}
                    className="px-2.5 py-1 text-[11px] font-medium bg-[var(--color-accent)] text-white rounded-md hover:opacity-90 transition"
                  >
                    {isAr ? "مراجعة" : "Review"}
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Queue 2: Applications to Review */}
        <div className="rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-2)] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-level-1)]">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {isAr ? "طلبات انضمام جديدة بانتظار القرار" : "New Creator Applications"}
              </h2>
            </div>
            <Link
              href={`/${locale}/dashboard/marketing/influencers/applications`}
              className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
            >
              <span>{isAr ? "عرض الكل" : "View All"}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[var(--border-level-1)] mt-2">
            {pendingApps.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                {isAr ? "صندوق طلبات الانضمام نظيف." : "All creator applications have been reviewed."}
              </div>
            ) : (
              pendingApps.map((app: any) => (
                <div key={app.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">
                      {app.influencer?.displayName || "New Applicant"}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {app.influencer?.location || "Qatar"} · {app.influencer?.categories?.slice(0, 2).join(", ")}
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/dashboard/marketing/influencers/applications`}
                    className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-level-3)] text-[var(--text-primary)] border border-[var(--border-level-2)] rounded-md hover:bg-[var(--border-level-1)] transition"
                  >
                    {isAr ? "فحص الطلب" : "Inspect"}
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Queue 3: Expiring Invitations */}
        <div className="rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-2)] p-5 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-level-1)]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {isAr ? "دعوات حملات مرسلة بانتظار استجابة المؤثر" : "Active Campaign Invitations"}
              </h2>
            </div>
            <Link
              href={`/${locale}/dashboard/marketing/influencers/campaigns`}
              className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
            >
              <span>{isAr ? "إدارة الحملات" : "Manage Campaigns"}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[var(--border-level-1)] mt-2">
            {expiringInvitations.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                {isAr ? "لا توجد دعوات معلقة بدون استجابة حالياً." : "No pending invitations awaiting creator response."}
              </div>
            ) : (
              expiringInvitations.map((inv: any) => (
                <div key={inv.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">
                      {inv.influencer?.displayName}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {inv.campaign?.titleEn} · {isAr ? "الراتب المقترح:" : "Proposed Rate:"} {inv.proposedRate ? `${inv.proposedRate} ${inv.currency}` : "Barter/Complimentary"}
                    </div>
                  </div>
                  <div className="text-[11px] text-amber-500 font-medium">
                    {inv.invitationExpiresAt ? `Expires ${new Date(inv.invitationExpiresAt).toLocaleDateString()}` : "Active"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
