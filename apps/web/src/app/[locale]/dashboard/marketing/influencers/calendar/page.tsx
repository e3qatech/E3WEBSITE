import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePermission, AppAuthError } from "@/lib/server-auth";
import { DashboardAccessDenied } from "@/components/dashboard/ui/DashboardAccessDenied";
import db from "@/lib/db";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  MapPin,
  FileText,
  User,
} from "lucide-react";

export default async function InfluencerCalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  try {
    await requirePermission("influencerCampaign.read");
  } catch (authErr: any) {
    if (authErr instanceof AppAuthError && authErr.statusCode === 401) {
      redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/marketing/influencers/calendar`);
    }
    return (
      <DashboardAccessDenied
        title={isAr ? "غير مصرح بالدخول" : "Access Restricted"}
        message={
          isAr
            ? "حسابك لا يمتلك صلاحية استعراض روزنامة الحملات والمحتوى (influencerCampaign.read)."
            : "Your account does not have permission to view the influencer content and event calendar."
        }
        requiredPermission="influencerCampaign.read"
      />
    );
  }

  // Fetch upcoming deliverables and attendance items safely
  let deliverables: any[] = [];
  let attendances: any[] = [];

  try {
    const [delivs, atts] = await Promise.all([
      (db as any).campaignDeliverable.findMany({
        where: {
          OR: [
            { draftDueAt: { not: null } },
            { publishDueAt: { not: null } },
          ],
        },
        include: {
          campaignCreator: {
            include: {
              influencer: true,
              campaign: true,
            },
          },
        },
        take: 50,
      }).catch(() => []),
      (db as any).influencerAttendance.findMany({
        include: {
          campaignCreator: {
            include: {
              influencer: true,
              campaign: true,
            },
          },
        },
        take: 50,
      }).catch(() => []),
    ]);

    deliverables = delivs || [];
    attendances = atts || [];
  } catch (dbErr) {
    console.error("[INFLUENCER CALENDAR FETCH ERROR]", dbErr);
  }


  // Merge items into chronological timeline
  const timelineItems: any[] = [];

  deliverables.forEach((d: any) => {
    if (d.draftDueAt) {
      timelineItems.push({
        id: `draft-${d.id}`,
        date: new Date(d.draftDueAt),
        type: "DRAFT_DUE",
        title: `Draft Due: ${d.title}`,
        creator: d.campaignCreator?.influencer?.displayName,
        campaign: d.campaignCreator?.campaign?.titleEn,
        campaignId: d.campaignCreator?.campaign?.id,
        platform: d.platform,
        status: d.status,
      });
    }
    if (d.publishDueAt) {
      timelineItems.push({
        id: `publish-${d.id}`,
        date: new Date(d.publishDueAt),
        type: "PUBLISH_DUE",
        title: `Publishing Deadline: ${d.title}`,
        creator: d.campaignCreator?.influencer?.displayName,
        campaign: d.campaignCreator?.campaign?.titleEn,
        campaignId: d.campaignCreator?.campaign?.id,
        platform: d.platform,
        status: d.status,
      });
    }
  });

  attendances.forEach((a: any) => {
    if (a.eventDate) {
      timelineItems.push({
        id: `attendance-${a.id}`,
        date: new Date(a.eventDate),
        type: "EVENT_ATTENDANCE",
        title: `Creator Visit: ${a.campaignCreator?.influencer?.displayName}`,
        creator: a.campaignCreator?.influencer?.displayName,
        campaign: a.campaignCreator?.campaign?.titleEn,
        campaignId: a.campaignCreator?.campaign?.id,
        status: a.status,
        guestCount: a.guestCount,
      });
    }
  });

  // Sort by date ascending
  timelineItems.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "جدول مواعيد المخرجات والزيارات المقررة" : "Production & Attendance Schedule"}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold">
            {timelineItems.length}
          </span>
        </div>
      </div>

      {/* Timeline List */}
      {timelineItems.length > 0 ? (
        <div className="space-y-3">
          {timelineItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--color-accent)]/40 transition"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === "EVENT_ATTENDANCE"
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      : item.type === "PUBLISH_DUE"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {item.type === "EVENT_ATTENDANCE" ? (
                    <MapPin className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{item.title}</h4>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        item.type === "EVENT_ATTENDANCE"
                          ? "bg-purple-500/20 text-purple-300"
                          : item.type === "PUBLISH_DUE"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {item.type.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-1">
                    <span>Creator: <strong className="text-[var(--text-secondary)]">{item.creator}</strong></span>
                    <span>•</span>
                    <span>Campaign: <strong className="text-[var(--text-secondary)]">{item.campaign}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-end">
                  <span className="block text-xs font-bold text-[var(--text-primary)]">
                    {item.date.toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {item.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {item.campaignId && (
                  <Link
                    href={`/${locale}/dashboard/marketing/influencers/campaigns/${item.campaignId}`}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--color-accent)] hover:border-[var(--color-accent)] transition font-medium"
                  >
                    {isAr ? "الحملة" : "View"}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-3">
          <CalendarIcon className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            {isAr ? "لا توجد مواعيد مجدولة" : "No Scheduled Events or Deadlines"}
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {isAr
              ? "ستظهر مواعيد تسليم المسودات ومواعيد النشر وحضور الفعاليات هنا تلقائياً."
              : "Planned draft deadlines, publishing dates, and VIP creator attendances will automatically populate this schedule."}
          </p>
        </div>
      )}
    </div>
  );
}
