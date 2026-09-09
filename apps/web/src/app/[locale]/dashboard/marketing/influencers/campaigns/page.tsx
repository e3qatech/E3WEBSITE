import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePermission, AppAuthError } from "@/lib/server-auth";
import { DashboardAccessDenied } from "@/components/dashboard/ui/DashboardAccessDenied";
import { listCampaigns } from "@/lib/influencer/campaign-service";
import {
  Briefcase,
  Plus,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
} from "lucide-react";

export default async function CampaignsListPage({
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
    await requirePermission("influencerCampaign.read");
  } catch (authErr: any) {
    if (authErr instanceof AppAuthError && authErr.statusCode === 401) {
      redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/marketing/influencers/campaigns`);
    }
    return (
      <DashboardAccessDenied
        title={isAr ? "غير مصرح بالدخول" : "Access Restricted"}
        message={
          isAr
            ? "حسابك لا يمتلك صلاحية استعراض حملات المؤثرين (influencerCampaign.read)."
            : "Your account does not have permission to view influencer campaigns."
        }
        requiredPermission="influencerCampaign.read"
      />
    );
  }

  const status = typeof sParams.status === "string" ? (sParams.status as any) : undefined;
  const page = typeof sParams.page === "string" ? parseInt(sParams.page, 10) : 1;

  let campaigns: any[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const listResult = await listCampaigns({
      status,
      page,
      pageSize: 20,
    });
    campaigns = listResult.items || [];
    total = listResult.total || 0;
    totalPages = listResult.totalPages || 1;
  } catch (dbErr) {
    console.error("[CAMPAIGNS LIST FETCH ERROR]", dbErr);
  }


  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Toolbar */}
      <div className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "حملات التسويق والفعاليات" : "Influencer Campaigns"}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold">
            {total}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            defaultValue={status || ""}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
          >
            <option value="">{isAr ? "جميع الحالات" : "All Statuses"}</option>
            <option value="ACTIVE">{isAr ? "نشطة" : "Active"}</option>
            <option value="APPROVED">{isAr ? "معتمدة" : "Approved"}</option>
            <option value="PENDING_APPROVAL">{isAr ? "قيد الاعتماد" : "Pending Approval"}</option>
            <option value="DRAFT">{isAr ? "مسودة" : "Draft"}</option>
            <option value="COMPLETED">{isAr ? "مكتملة" : "Completed"}</option>
          </select>

          <Link
            href={`/${locale}/dashboard/marketing/influencers/campaigns/new`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 transition whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? "إنشاء حملة جديدة" : "New Campaign"}</span>
          </Link>
        </div>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp: any) => (
            <div
              key={camp.id}
              className="p-5 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] hover:border-[var(--color-accent)]/50 transition flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-level-1)] text-[var(--text-muted)] border border-[var(--border-level-2)]">
                    {camp.internalCode}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      camp.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : camp.status === "APPROVED"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : camp.status === "COMPLETED"
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text-primary)] mt-2">
                  {isAr ? camp.titleAr || camp.titleEn : camp.titleEn}
                </h3>
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                  {isAr ? camp.descriptionAr || camp.descriptionEn : camp.descriptionEn || "No campaign description."}
                </p>

                {/* Linked Content Badge if any */}
                {(camp.event || camp.attraction) && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium">
                      {camp.event ? `Event: ${camp.event.title}` : `Attraction: ${camp.attraction.title}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-level-1)] text-center text-xs">
                <div>
                  <span className="block font-bold text-[var(--text-primary)]">
                    {camp._count?.creators || 0}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">Creators</span>
                </div>
                <div>
                  <span className="block font-bold text-[var(--text-primary)]">
                    {camp.budget ? `${Number(camp.budget).toLocaleString()} ${camp.currency}` : "N/A"}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">Budget</span>
                </div>
                <div>
                  <span className="block font-bold text-[var(--text-primary)]">
                    {camp.startDate ? new Date(camp.startDate).toLocaleDateString() : "TBD"}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">Start Date</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1 flex justify-end">
                <Link
                  href={`/${locale}/dashboard/marketing/influencers/campaigns/${camp.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--color-accent)] transition w-full justify-center"
                >
                  <span>{isAr ? "فتح إدارة الحملة" : "Open Workspace"}</span>
                  {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-3">
          <Briefcase className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            {isAr ? "لا توجد حملات مسجلة" : "No Campaigns Found"}
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {isAr
              ? "ابدأ بإنشاء أول حملة تسويقية لمؤثري الفعاليات أو الوجهات الترفيهية."
              : "Create your first creator campaign linked to E3 events or attractions."}
          </p>
          <div className="pt-2">
            <Link
              href={`/${locale}/dashboard/marketing/influencers/campaigns/new`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? "إنشاء حملة جديدة" : "New Campaign"}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
