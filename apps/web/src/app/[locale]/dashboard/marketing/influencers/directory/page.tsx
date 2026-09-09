import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePermission, AppAuthError } from "@/lib/server-auth";
import { DashboardAccessDenied } from "@/components/dashboard/ui/DashboardAccessDenied";
import { listInfluencers } from "@/lib/influencer/influencer-service";
import {
  Search,
  Filter,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Eye,
  Users,
} from "lucide-react";

export default async function InfluencerDirectoryPage({
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
    await requirePermission("influencer.read");
  } catch (authErr: any) {
    if (authErr instanceof AppAuthError && authErr.statusCode === 401) {
      redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/marketing/influencers/directory`);
    }
    return (
      <DashboardAccessDenied
        title={isAr ? "غير مصرح بالدخول" : "Access Restricted"}
        message={
          isAr
            ? "حسابك لا يمتلك صلاحية استعراض دليل المؤثرين (influencer.read)."
            : "Your account does not have permission to view the Influencer Directory."
        }
        requiredPermission="influencer.read"
      />
    );
  }

  const search = typeof sParams.search === "string" ? sParams.search : undefined;
  const status = typeof sParams.status === "string" ? (sParams.status as any) : undefined;
  const creatorTier = typeof sParams.tier === "string" ? (sParams.tier as any) : undefined;
  const isQatarBased = sParams.qatar === "true" ? true : sParams.qatar === "false" ? false : undefined;
  const page = typeof sParams.page === "string" ? parseInt(sParams.page, 10) : 1;

  let creators: any[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const listResult = await listInfluencers({
      search,
      status,
      creatorTier,
      isQatarBased,
      page,
      pageSize: 20,
    });
    creators = listResult.items || [];
    total = listResult.total || 0;
    totalPages = listResult.totalPages || 1;
  } catch (dbErr) {
    console.error("[INFLUENCER DIRECTORY FETCH ERROR]", dbErr);
  }


  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] flex flex-col md:flex-row items-center justify-between gap-4">
        <form method="GET" className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder={isAr ? "البحث بالاسم، الحساب، الدولة، أو البريد..." : "Search by name, handle, nationality, or email..."}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <select
            name="status"
            defaultValue={status || ""}
            className="px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
          >
            <option value="">{isAr ? "جميع الحالات" : "All Statuses"}</option>
            <option value="ACTIVE">{isAr ? "نشط" : "Active"}</option>
            <option value="APPROVED">{isAr ? "معتمد" : "Approved"}</option>
            <option value="UNDER_REVIEW">{isAr ? "قيد المراجعة" : "Under Review"}</option>
            <option value="PROSPECT">{isAr ? "مرشح" : "Prospect"}</option>
            <option value="PAUSED">{isAr ? "متوقف" : "Paused"}</option>
            <option value="RESTRICTED">{isAr ? "مقيد" : "Restricted"}</option>
          </select>

          <select
            name="tier"
            defaultValue={creatorTier || ""}
            className="px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
          >
            <option value="">{isAr ? "جميع الفئات" : "All Tiers"}</option>
            <option value="NANO">Nano (&lt;10k)</option>
            <option value="MICRO">Micro (10k-50k)</option>
            <option value="MID_TIER">Mid-Tier (50k-500k)</option>
            <option value="MACRO">Macro (500k-1M)</option>
            <option value="MEGA">Mega (1M+)</option>
            <option value="CELEBRITY">Celebrity</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[var(--bg-level-3)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--border-level-1)] transition"
          >
            {isAr ? "تصفية" : "Filter"}
          </button>
        </form>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs text-[var(--text-muted)]">
            {isAr ? `${total} مؤثر` : `${total} creators`}
          </span>
          <Link
            href={`/${locale}/dashboard/marketing/influencers/new`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-accent)] text-white hover:opacity-90 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? "إضافة مؤثر" : "Add Creator"}</span>
          </Link>
        </div>
      </div>

      {/* Directory Grid / Table */}
      {creators.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)]">
          <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {isAr ? "لم يتم العثور على مؤثرين" : "No creators found"}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            {isAr
              ? "جرّب تعديل مصطلحات البحث أو الفلاتر المختارة، أو أضف مؤثراً جديداً إلى الدليل."
              : "Try adjusting your search criteria, or click 'Add Creator' to register a new profile."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map((creator: any) => {
            const statusColor =
              creator.status === "ACTIVE"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : creator.status === "APPROVED"
                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                : creator.status === "UNDER_REVIEW"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-slate-500/10 text-slate-400 border-slate-500/20";

            return (
              <div
                key={creator.id}
                className="p-5 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] flex flex-col justify-between hover:border-[var(--color-accent)]/40 transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-level-3)] border border-[var(--border-level-1)] flex items-center justify-center font-bold text-sm text-[var(--color-accent)] overflow-hidden">
                        {creator.profileImage ? (
                          <img src={creator.profileImage} alt={creator.displayName} className="w-full h-full object-cover" />
                        ) : (
                          creator.displayName[0]
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-accent)] transition">
                          {creator.displayName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span>{creator.location || (creator.isQatarBased ? "Doha, Qatar" : "International")}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-full ${statusColor}`}>
                      {creator.status}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">
                    {creator.bioEn || (isAr ? "لا توجد نبذة مختصرة مضافة." : "No biography provided yet.")}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--bg-level-3)] text-[var(--text-muted)] border border-[var(--border-level-1)]">
                      Tier: {creator.creatorTier}
                    </span>
                    {creator.categories?.slice(0, 2).map((cat: string) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded text-[10px] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Platforms Summary */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-level-1)] text-xs text-[var(--text-muted)]">
                    {creator.platforms?.length > 0 ? (
                      creator.platforms.map((p: any) => (
                        <span key={p.id} className="text-[11px] font-medium text-[var(--text-primary)]">
                          {p.platform}: @{p.handle} ({p.followerCount?.toLocaleString() || 0})
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] italic text-[var(--text-muted)]">
                        {isAr ? "لا توجد حسابات مضافة" : "No social accounts attached"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--border-level-1)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {creator.campaignAssignments?.length || 0} {isAr ? "حملات" : "campaigns"}
                  </span>

                  <Link
                    href={`/${locale}/dashboard/marketing/influencers/${creator.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:underline"
                  >
                    <span>{isAr ? "عرض الملف" : "View Profile"}</span>
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/${locale}/dashboard/marketing/influencers/directory?page=${p}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                p === page
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                  : "bg-[var(--bg-level-2)] border-[var(--border-level-1)] text-[var(--text-muted)] hover:bg-[var(--bg-level-3)]"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
