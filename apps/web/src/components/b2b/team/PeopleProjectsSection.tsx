"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  Users,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CaseStudyTeamMemberRel {
  id?: string;
  roleEn?: string | null;
  roleAr?: string | null;
  orderIndex?: number;
  employeeProfile?: {
    id: string;
    slug?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    firstNameAr?: string | null;
    lastNameAr?: string | null;
    name?: string | null;
    nameEn?: string | null;
    nameAr?: string | null;
    designation?: string | null;
    designationAr?: string | null;
    profileImage?: string | null;
    avatarUrl?: string | null;
    department?: string | null;
  } | null;
}

export interface CaseStudyWithMetricsAndTeam {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string;
  clientName?: string;
  year?: number;
  category?: string;
  heroImageUrl?: string | null;
  thumbnailUrl?: string | null;
  metrics?: any;
  teamMembers?: CaseStudyTeamMemberRel[];
}

interface PeopleProjectsSectionProps {
  caseStudies: CaseStudyWithMetricsAndTeam[];
  locale?: string;
}

export function PeopleProjectsSection({
  caseStudies,
  locale = "en",
}: PeopleProjectsSectionProps) {
  const isAr = locale === "ar";

  // Filter case studies that have AT LEAST one verified metric AND AT LEAST one associated team member
  const verifiedCases = (caseStudies || []).filter((cs) => {
    if (!cs || !cs.slug) return false;

    // Check team members
    const hasTeam =
      Array.isArray(cs.teamMembers) &&
      cs.teamMembers.some((tm) => tm && tm.employeeProfile && (tm.employeeProfile.slug || tm.employeeProfile.id));

    // Check metrics
    let rawMetrics = cs.metrics;
    if (typeof rawMetrics === "string") {
      try {
        rawMetrics = JSON.parse(rawMetrics);
      } catch {
        rawMetrics = [];
      }
    }
    const hasMetrics =
      Array.isArray(rawMetrics) &&
      rawMetrics.some((m) => m && (m.value || m.val || m.valueEn) && (m.labelEn || m.label || m.labelAr));

    return hasTeam && hasMetrics;
  }).slice(0, 3); // Take up to 3

  // Hide the section completely if sufficient verified mappings do not exist
  if (verifiedCases.length === 0) {
    return null;
  }

  return (
    <section
      id="people-projects"
      dir={isAr ? "rtl" : "ltr"}
      data-testid="people-projects-section"
      aria-label={isAr ? "أشخاص × مشاريع - بنيت معاً. أثبتت نجاحها على أرض الواقع." : "People × Projects - Built Together. Proven Live."}
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/10"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(99,102,241,0.2) 50%, transparent 75%)",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
        <div>
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? "أشخاص × مشاريع" : "PEOPLE × PROJECTS"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight font-syne">
            {isAr ? "بنيت معاً. أثبتت نجاحها على أرض الواقع." : "BUILT TOGETHER. PROVEN LIVE."}
          </h2>

          <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl font-medium leading-relaxed">
            {isAr
              ? "مشاريع رائدة في قطر جمعت كفاءاتنا المتخصصة وحققت أرقاماً ومؤشرات أداء قياسية موثقة."
              : "Iconic landmark experiences delivered across Qatar, powered by the cross-functional collaboration of our verified specialists."}
          </p>
        </div>

        <Link
          href={`/${locale}/b2b/cases`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs transition-all shrink-0 hover:border-cyan-400/50 shadow-sm"
        >
          <span>{isAr ? "استعراض جميع دراسات الحالة" : "Explore All Case Studies"}</span>
          <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
        </Link>
      </div>

      {/* 3 Case Study Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {verifiedCases.map((cs) => {
          const title = isAr && cs.titleAr ? cs.titleAr : cs.titleEn;
          const imageUrl = cs.heroImageUrl || cs.thumbnailUrl || "";
          const caseUrl = `/${locale}/b2b/cases/${cs.slug}`;

          // Parse metrics
          let rawMetrics = cs.metrics;
          if (typeof rawMetrics === "string") {
            try {
              rawMetrics = JSON.parse(rawMetrics);
            } catch {
              rawMetrics = [];
            }
          }
          const metricsList = Array.isArray(rawMetrics) ? rawMetrics.slice(0, 2) : [];

          // Associated team members
          const validTeamMembers = (cs.teamMembers || [])
            .filter((tm) => tm && tm.employeeProfile)
            .slice(0, 4);

          return (
            <div
              key={cs.id || cs.slug}
              data-testid={`case-card-${cs.slug}`}
              className="group rounded-3xl bg-[#080b12] border border-white/10 hover:border-cyan-500/40 transition-all duration-300 flex flex-col overflow-hidden shadow-2xl hover:shadow-cyan-500/10"
            >
              {/* Media Thumbnail */}
              <div className="relative w-full aspect-[16/10] bg-zinc-950 overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter contrast-[1.03]"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500 font-mono text-xs">
                    E3 Case Study
                  </div>
                )}

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080b12] via-transparent to-transparent opacity-80" />

                {/* Top Category & Year Badges */}
                <div className="absolute top-4 start-4 flex items-center gap-2">
                  {cs.category && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/15 text-cyan-300">
                      {cs.category}
                    </span>
                  )}
                  {cs.year && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md border border-white/15 text-slate-300">
                      {cs.year}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-grow justify-between gap-6">
                <div>
                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors font-syne tracking-tight leading-snug">
                    <Link href={caseUrl} className="hover:underline">
                      {title}
                    </Link>
                  </h3>
                  {cs.clientName && (
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      {cs.clientName}
                    </p>
                  )}

                  {/* Verified Metrics Row */}
                  {metricsList.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                      {metricsList.map((metric: any, mIdx: number) => {
                        const val = metric.value || metric.val || metric.valueEn || "";
                        const label = isAr && metric.labelAr ? metric.labelAr : (metric.labelEn || metric.label || "");
                        return (
                          <div key={mIdx} className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-base sm:text-lg font-black text-cyan-300 font-syne tracking-tight">
                              {metric.prefix || ""}{val}{metric.suffix || ""}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider truncate mt-0.5">
                              {label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Associated Team Members Row */}
                  {validTeamMembers.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-white/10">
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isAr ? "فريق التنفيذ والإشراف" : "Execution Team"}</span>
                      </div>

                      <div className="space-y-2">
                        {validTeamMembers.map((tm, tmIdx) => {
                          const ep = tm.employeeProfile!;
                          const memberName = isAr
                            ? (ep.nameAr || `${ep.firstNameAr || ""} ${ep.lastNameAr || ""}`.trim() || ep.nameEn || `${ep.firstName || ""} ${ep.lastName || ""}`.trim() || "عضو الفريق")
                            : (ep.nameEn || `${ep.firstName || ""} ${ep.lastName || ""}`.trim() || "Team Member");
                          const role = isAr
                            ? (tm.roleAr || ep.designationAr || tm.roleEn || ep.designation || "مسؤول المشروع")
                            : (tm.roleEn || ep.designation || "Project Specialist");
                          const avatar = ep.profileImage || ep.avatarUrl;
                          const profileUrl = ep.slug ? `/${locale}/b2b/team/${ep.slug}` : `/${locale}/b2b/team`;

                          return (
                            <Link
                              key={tm.id || tmIdx}
                              href={profileUrl}
                              className="group/member p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between gap-2.5 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-9 rounded-md bg-zinc-900 border border-white/10 overflow-hidden shrink-0 aspect-[4/5] flex items-center justify-center">
                                  {avatar ? (
                                    <img src={avatar} alt={memberName} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="font-mono text-[9px] text-cyan-400">E3</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-200 group-hover/member:text-cyan-300 truncate">
                                    {memberName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {role}
                                  </div>
                                </div>
                              </div>
                              <ExternalLink className="w-3 h-3 text-slate-500 group-hover/member:text-cyan-400 shrink-0" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Case Study Detail Link */}
                <div className="pt-2">
                  <Link
                    href={caseUrl}
                    className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 group-hover:bg-cyan-500 text-slate-200 group-hover:text-black font-bold text-xs transition-all border border-white/10 group-hover:border-cyan-400"
                  >
                    <span>{isAr ? "استعرض دراسة الحالة كاملة" : "Read Full Case Study"}</span>
                    <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
