"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/layout/LocaleProvider";
import {
  Sparkles,
  Users,
  Inbox,
  Briefcase,
  CheckCircle2,
  Calendar,
  BarChart3,
  Sliders,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function InfluencerModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const pathname = usePathname();

  const navTabs = [
    {
      href: `/${locale}/dashboard/marketing/influencers`,
      labelEn: "Overview",
      labelAr: "لوحة التحكم",
      icon: Sparkles,
      exact: true,
    },
    {
      href: `/${locale}/dashboard/marketing/influencers/directory`,
      labelEn: "Directory",
      labelAr: "دليل المؤثرين",
      icon: Users,
    },
    {
      href: `/${locale}/dashboard/marketing/influencers/applications`,
      labelEn: "Applications",
      labelAr: "طلبات الانضمام",
      icon: Inbox,
    },
    {
      href: `/${locale}/dashboard/marketing/influencers/campaigns`,
      labelEn: "Campaigns",
      labelAr: "الحملات",
      icon: Briefcase,
    },
    {
      href: `/${locale}/dashboard/marketing/influencers/content-review`,
      labelEn: "Content Review",
      labelAr: "اعتماد المحتوى",
      icon: CheckCircle2,
    },
    {
      href: `/${locale}/dashboard/marketing/influencers/calendar`,
      labelEn: "Calendar",
      labelAr: "جدول المواعيد",
      icon: Calendar,
    },
    {
      href: `/${locale}/dashboard/marketing/influencers/reports`,
      labelEn: "Reports",
      labelAr: "التقارير",
      icon: BarChart3,
    },
    {
      href: `/${locale}/dashboard/marketing/influencers/reconciliation`,
      labelEn: "Reconciliation",
      labelAr: "تسوية المبيعات",
      icon: RefreshCw,
    },
    {
      href: `/${locale}/dashboard/marketing/influencers/settings`,
      labelEn: "Settings",
      labelAr: "الإعدادات",
      icon: Sliders,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-level-1)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "التسويق والنمو" : "Marketing & Growth"}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            {isAr ? "إدارة المؤثرين وصناع المحتوى" : "Influencer & Creator Management"}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {isAr
              ? "إدارة العلاقات، الحملات الترويجية، مراجعة المحتوى، وتتبع مبيعات التذاكر المنسوبة"
              : "End-to-end creator intake, campaign workflows, draft review, and BookingQube revenue attribution"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/dashboard/marketing/influencers/new`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-accent)] text-white hover:opacity-90 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? "إضافة مؤثر جديد" : "Add Creator"}</span>
          </Link>
          <Link
            href={`/${locale}/dashboard/marketing/influencers/campaigns/new`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-primary)] hover:bg-[var(--bg-level-3)] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? "إنشاء حملة" : "New Campaign"}</span>
          </Link>
        </div>
      </div>

      {/* Subnavigation Tabs */}
      <div className="flex items-center overflow-x-auto custom-scrollbar border-b border-[var(--border-level-1)] gap-1 -mt-2">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-level-2)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </Link>
          );
        })}
      </div>

      {/* Workspace Area */}
      <div className="min-h-[500px]">{children}</div>
    </div>
  );
}
