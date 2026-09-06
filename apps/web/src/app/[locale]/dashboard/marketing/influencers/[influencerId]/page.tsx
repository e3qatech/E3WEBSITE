import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission, requireCurrentUser } from "@/lib/server-auth";
import { hasPermission } from "@/lib/permissions";
import { getInfluencerById } from "@/lib/influencer/influencer-service";
import InfluencerDetailTabs from "./InfluencerDetailTabs";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  ExternalLink,
  Award,
  AlertTriangle,
} from "lucide-react";

export default async function InfluencerDetailPage({
  params,
}: {
  params: Promise<{ locale: string; influencerId: string }>;
}) {
  const { locale, influencerId } = await params;
  const isAr = locale === "ar";

  await requirePermission("influencer.read");
  const user = await requireCurrentUser();

  const canViewSensitive = hasPermission(user.role, "influencer.viewSensitive");
  const canViewCommercial = hasPermission(user.role, "influencer.viewCommercial");

  const creator = await getInfluencerById(influencerId, {
    includeSensitive: canViewSensitive,
    includeCommercial: canViewCommercial,
  });

  if (!creator) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/${locale}/dashboard/marketing/influencers/directory`}
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
        >
          {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{isAr ? "العودة إلى دليل المؤثرين" : "Back to Directory"}</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">ID:</span>
          <span className="font-mono text-xs text-[var(--text-secondary)] px-2 py-0.5 rounded bg-[var(--bg-level-2)] border border-[var(--border-level-1)]">
            {creator.id}
          </span>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--bg-level-3)] border border-[var(--border-level-2)] flex items-center justify-center text-xl font-bold text-[var(--color-accent)] overflow-hidden shadow-inner">
            {creator.profileImage ? (
              <img src={creator.profileImage} alt={creator.displayName} className="w-full h-full object-cover" />
            ) : (
              creator.displayName.substring(0, 2).toUpperCase()
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{creator.displayName}</h1>
              {creator.legalName && canViewSensitive && (
                <span className="text-xs text-[var(--text-muted)]">({creator.legalName})</span>
              )}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  creator.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : creator.status === "APPROVED"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : creator.status === "UNDER_REVIEW"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                }`}
              >
                {creator.status.replace(/_/g, " ")}
              </span>

              {creator.publicFeatureEnabled && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {isAr ? "معروض للعامة" : "Publicly Featured"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mt-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {creator.location || "Doha, Qatar"} {creator.isQatarBased && "🇶🇦"}
              </span>
              <span>•</span>
              <span className="font-semibold text-[var(--text-secondary)]">Tier: {creator.creatorTier}</span>
              <span>•</span>
              <span>{creator.nationality || "Qatari"}</span>
              {creator.agencyName && (
                <>
                  <span>•</span>
                  <span className="text-[var(--color-accent)]">{creator.agencyName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Scores Badge */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-s border-[var(--border-level-1)] pt-4 md:pt-0 md:ps-6">
          <div className="text-center">
            <span className="block text-2xl font-black text-[var(--color-accent)]">
              {creator.overallScore !== null ? creator.overallScore.toFixed(0) : "N/A"}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              {isAr ? "التقييم الشامل" : "Overall Score"}
            </span>
          </div>

          <div className="text-center">
            <span className="block text-2xl font-black text-emerald-400">
              {creator.reliabilityScore !== null ? `${creator.reliabilityScore}%` : "100%"}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              {isAr ? "الموثوقية" : "Reliability"}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Client Component */}
      <InfluencerDetailTabs
        creator={creator}
        locale={locale}
        isAr={isAr}
        canViewSensitive={canViewSensitive}
        canViewCommercial={canViewCommercial}
      />
    </div>
  );
}
