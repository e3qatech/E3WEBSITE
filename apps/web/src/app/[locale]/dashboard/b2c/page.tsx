import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  Star,
  Sparkles,
  Ticket,
  Calendar,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Radio,
  Gamepad2,
  Users,
  Compass,
} from "lucide-react";
import db from "@/lib/db";
import { requireCurrentUser } from "@/lib/server-auth";
import { hasPermission } from "@/lib/permissions";
import {
  DashboardPageShell,
  DashboardPageHeader,
  AdminButton,
} from "@/components/dashboard/ui";

export const metadata: Metadata = {
  title: "B2C Attractions & Events Command Center | E3 Admin",
  description: "Unified entertainment command center, live RBAC access & telemetry, and attractions module management.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function B2CCommandCenterPage({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const resolvedParams = params ? await params : { locale: "en" };
  const locale = resolvedParams.locale || "en";
  const isAr = locale === "ar";

  const currentUser = await requireCurrentUser();
  const userRole = String(currentUser?.role || currentUser?.rawRole || "B2C_ADMIN").trim().toUpperCase();
  const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  // Fetch B2C metrics safely
  let attractionsCount = 0;
  let packagesCount = 0;
  let eventsCount = 0;
  let feedbackCount = 0;

  try {
    const results = await Promise.all([
      db.attraction.count().catch(() => 0),
      db.package.count().catch(() => 0),
      db.calendarEvent.count().catch(() => 0),
      db.feedback.count().catch(() => 0),
    ]);
    attractionsCount = results[0];
    packagesCount = results[1];
    eventsCount = results[2];
    feedbackCount = results[3];
  } catch (_e) {
    // Graceful fallback
  }

  // Canonical B2C Capabilities matrix to inspect
  const b2cCapabilities = [
    { key: "b2c.content.read", label: isAr ? "عرض محتوى الوجهات" : "Read B2C Content", critical: true },
    { key: "b2c.content.write", label: isAr ? "تحرير وتعديل صفحات B2C" : "Write & Edit B2C Content", critical: true },
    { key: "b2c.attractions.manage", label: isAr ? "إدارة دليل الوجهات والألعاب" : "Manage Attractions Catalog", critical: true },
    { key: "b2c.packages.manage", label: isAr ? "إدارة باقات التذاكر والأسعار" : "Manage Ticket Packages", critical: true },
    { key: "b2c.packages.read", label: isAr ? "استعراض باقات الأفراد" : "Read Packages & Pricing", critical: false },
    { key: "b2c.calendar.manage", label: isAr ? "جدولة الفعاليات والسعة" : "Manage Event Calendar", critical: true },
    { key: "b2c.feedback.manage", label: isAr ? "مراجعة تقييمات الزوار" : "Manage Visitor Feedback", critical: false },
    { key: "b2c.inquiries.manage", label: isAr ? "استفسارات الزوار والباقات" : "Handle Visitor Inquiries", critical: true },
  ];

  const grantedCapabilities = b2cCapabilities.map((cap) => ({
    ...cap,
    granted: isSuperAdmin || hasPermission(userRole, cap.key) || currentUser.permissions.includes(cap.key),
  }));

  const allB2CModules = [
    {
      title: isAr ? "دليل الألعاب والوجهات" : "Attractions Catalog",
      desc: isAr ? "إدارة العوالم الترفيهية والمناطق التفاعلية والتذاكر." : "Theme zones, thrill rides, interactive worlds, and capacity.",
      href: `/${locale}/dashboard/b2c/attractions`,
      icon: Gamepad2,
      badge: `${attractionsCount} ${isAr ? "وجهة" : "Attractions"}`,
      color: "from-pink-600 to-rose-600",
    },
    {
      title: isAr ? "الباقات وتذاكر VIP" : "Tickets & VIP Passes",
      desc: isAr ? "باقات العائلات، تذاكر الدخول السريع، وأعياد الميلاد." : "Family passes, VIP express tickets, and celebration packages.",
      href: `/${locale}/dashboard/b2c/packages`,
      icon: Ticket,
      badge: `${packagesCount} ${isAr ? "باقة" : "Packages"}`,
      color: "from-purple-600 to-indigo-600",
    },
    {
      title: isAr ? "جدول الفعاليات والمواعيد" : "Calendar & Events Schedule",
      desc: isAr ? "جدول العروض الحية والمهرجانات وساعات العمل." : "Live entertainment showtimes, festivals, and venue capacity.",
      href: `/${locale}/dashboard/operations/events`,
      icon: Calendar,
      badge: `${eventsCount} ${isAr ? "فعالية" : "Events"}`,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: isAr ? "المواقع والخرائط التفاعلية" : "Locations & Qatar GIS",
      desc: isAr ? "الإحداثيات الجغرافية لمواقع E3 الترفيهية في قطر." : "Interactive map pins, access routes, and venue coordinates.",
      href: `/${locale}/dashboard/b2c/locations`,
      icon: MapPin,
      badge: isAr ? "خرائط قطر" : "Qatar GIS",
      color: "from-blue-600 to-cyan-600",
    },
    {
      title: isAr ? "محطة نبض الفعاليات (Pulse Orbit)" : "Pulse Orbit (B2C Stream)",
      desc: isAr ? "تخصيص شريط الأخبار الترفيهية والعروض الفورية." : "Real-time ticket promos, entertainment news, and alerts.",
      href: `/${locale}/dashboard/b2c/pulse-orbit`,
      icon: Radio,
      badge: isAr ? "مباشر" : "Live",
      color: "from-emerald-600 to-teal-600",
    },
    {
      title: isAr ? "مسار الاستكشاف القصصي" : "Story Discovery Stream",
      desc: isAr ? "سرد القصص التفاعلية والعوالم المرئية للزوار." : "Narrative journey builder, lore entries, and character profiles.",
      href: `/${locale}/dashboard/b2c/content/story-discovery`,
      icon: Compass,
      badge: isAr ? "قصصي" : "Story Lore",
      color: "from-violet-600 to-purple-600",
    },
  ];

  const b2cCmsPages = [
    { title: isAr ? "الصفحة الرئيسية (B2C)" : "Landing Page", href: `/${locale}/dashboard/b2c/landing`, slug: "b2c-landing" },
    { title: isAr ? "صفحة الاستكشاف" : "Discover Universe", href: `/${locale}/dashboard/b2c/discover`, slug: "b2c-discover" },
    { title: isAr ? "صفحة الوجهات والألعاب" : "Attractions Showcase", href: `/${locale}/dashboard/b2c/attractions-page`, slug: "b2c-attractions" },
    { title: isAr ? "صفحة الباقات والتذاكر" : "Packages & Passes", href: `/${locale}/dashboard/b2c/packages-page`, slug: "b2c-packages" },
    { title: isAr ? "صفحة جدول الفعاليات" : "Calendar & Events", href: `/${locale}/dashboard/b2c/calendar-page`, slug: "b2c-calendar" },
    { title: isAr ? "صفحة التواصل وخدمة الزوار" : "Contact & Support", href: `/${locale}/dashboard/b2c/contact`, slug: "b2c-contact" },
  ];

  return (
    <DashboardPageShell variant="wide">
      {/* PAGE HEADER */}
      <DashboardPageHeader
        title={isAr ? "مركز قيادة الوجهات والفعاليات والباقات (B2C)" : "B2C Attractions & Events Command Center & Access Hub"}
        description={
          isAr
            ? "المركز الموحد لإدارة الوجهات الترفيهية، تذاكر الأفراد، الفعاليات، ومراقبة صلاحيات العزل الأمني."
            : "Unified entertainment command center, live RBAC access telemetry, and attractions module management."
        }
        breadcrumbs={[
          { label: isAr ? "لوحة التحكم" : "Dashboard", href: `/${locale}/dashboard` },
          { label: isAr ? "الفعاليات والوجهات (B2C)" : "B2C Attractions & Events" },
        ]}
        badge={{
          label: isAr ? "عزل النطاق الأمني نشط • B2C" : "Domain Isolation Active • B2C Shield",
          variant: "indigo",
        }}
        primaryAction={{
          label: isAr ? "إضافة وجهة ترفيهية" : "New Attraction",
          href: `/${locale}/dashboard/b2c/attractions/new`,
          icon: <Star className="w-4 h-4" />,
        }}
      />

      <div className="mt-6 space-y-6">
        {/* ACCESS & CONTROL TELEMETRY PANEL */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-zinc-200/80 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md ring-4 ring-pink-500/10 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-zinc-900 dark:text-white">
                    {isAr ? "محددات الوصول والتحكم الأمني (Access & Control)" : "Access & Control Telemetry Status"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {isAr ? "مصرح للنطاق" : "B2C Authorized"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {isAr
                    ? `المستخدم المسجل: ${currentUser.name || currentUser.email} (${currentUser.email})`
                    : `Active Session: ${currentUser.name || currentUser.email} (${currentUser.email})`}
                </p>
              </div>
            </div>

            {/* Role & Access Tier Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-white/10 text-end">
                <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                  {isAr ? "الدور المعين بالنظام" : "Enforced Role"}
                </div>
                <div className="text-sm font-black font-mono text-pink-600 dark:text-pink-400">
                  {userRole}
                </div>
              </div>

              {isSuperAdmin && (
                <Link
                  href={`/${locale}/dashboard/settings/users`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isAr ? "إدارة المستخدمين والأدوار" : "Manage RBAC Roles"}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Granular Capabilities Checklist */}
          <div className="pt-5">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>{isAr ? "الصلاحيات الممنوحة لقطاع الوجهات والفعاليات:" : "Active B2C Operational Capabilities:"}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {grantedCapabilities.map((cap) => (
                <div
                  key={cap.key}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    cap.granted
                      ? "bg-emerald-500/5 border-emerald-500/20 text-zinc-800 dark:text-zinc-200"
                      : "bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-white/5 text-zinc-400 opacity-60"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold truncate text-[11px]">{cap.label}</div>
                    <code className="text-[9px] font-mono text-zinc-400">{cap.key}</code>
                  </div>
                  {cap.granted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* B2C METRICS SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 shadow-xs">
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isAr ? "الوجهات والألعاب" : "Live Attractions"}
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{attractionsCount}</div>
            <div className="text-[10px] text-pink-600 dark:text-pink-400 font-bold mt-0.5">
              {isAr ? "مناطق ترفيهية نشطة" : "Active zones"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 shadow-xs">
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isAr ? "باقات التذاكر" : "Ticket Packages"}
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{packagesCount}</div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">
              {isAr ? "باقات وتذاكر VIP" : "Passes & celebrations"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 shadow-xs">
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isAr ? "الفعاليات المجدولة" : "Scheduled Events"}
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{eventsCount}</div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
              {isAr ? "عروض ومهرجانات" : "Live shows & capacity"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 shadow-xs">
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {isAr ? "تقييمات وآراء الزوار" : "Visitor Reviews"}
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{feedbackCount}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
              {isAr ? "مستوى الرضا العام" : "Satisfaction logs"}
            </div>
          </div>
        </div>

        {/* PRIMARY B2C MODULES DECK */}
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">
            {isAr ? "وحدات إدارة الوجهات والفعاليات" : "Primary B2C Entertainment Modules"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allB2CModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 hover:border-pink-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {mod.title}
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {mod.badge}
                      </span>
                    </div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {mod.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* B2C CMS PAGES DIRECTORY */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                {isAr ? "فهرس صفحات قطاع الأفراد والفعاليات (B2C CMS Pages)" : "B2C CMS Pages Directory"}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isAr ? "تحرير مباشر لمحتوى صفحات الألعاب والباقات والفعاليات" : "Direct visual page editors and media blocks"}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {b2cCmsPages.length} {isAr ? "صفحة" : "Pages"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {b2cCmsPages.map((page) => (
              <Link
                key={page.slug}
                href={page.href}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-white/5 transition-all flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200 group-hover:text-pink-600 dark:group-hover:text-pink-400 truncate transition-colors">
                    {page.title}
                  </div>
                  <code className="text-[10px] font-mono text-zinc-400">/{page.slug}</code>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-pink-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardPageShell>
  );
}
