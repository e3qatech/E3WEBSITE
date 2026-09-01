"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Compass,
  Lightbulb,
  CalendarCheck,
  Hammer,
  Activity,
  Cpu,
  ArrowRight,
  Sparkles,
  Users,
  Search,
  CheckCircle2,
} from "lucide-react";
import { SafePublicTeamMember, resolvePresentationGroup } from "@/lib/team/team-resolver";
import { cn } from "@/lib/utils";

export interface StageConfig {
  id: "direction" | "imagine" | "plan" | "build" | "operate" | "amplify";
  number: "01" | "02" | "03" | "04" | "05" | "06";
  nameEn: string;
  nameAr: string;
  subtitleEn: string;
  subtitleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

export const E3_JOURNEY_STAGES: StageConfig[] = [
  {
    id: "direction",
    number: "01",
    nameEn: "Direction",
    nameAr: "التوجيه",
    subtitleEn: "Leadership & Strategy",
    subtitleAr: "القيادة والاستراتيجية",
    descriptionEn: "Setting the holistic vision, orchestrating institutional partnerships, and guiding high-impact live experiences across Qatar.",
    descriptionAr: "تحديد الرؤية الاستراتيجية الشاملة، وتنسيق الشراكات الكبرى، وتوجيه المشاريع الأكثر تأثيراً في قطر.",
    icon: Compass,
    accentColor: "#06b6d4", // Cyan
  },
  {
    id: "imagine",
    number: "02",
    nameEn: "Imagine",
    nameAr: "الابتكار",
    subtitleEn: "Creative, Brand & Growth",
    subtitleAr: "الإبداع والهوية والنمو",
    descriptionEn: "Translating brand stories into spatial design, narrative architecture, and multisensory visual concepts.",
    descriptionAr: "تحويل القصص إلى مفاهيم مكانية وهوية تجريبية وبيئات بصرية غامرة.",
    icon: Lightbulb,
    accentColor: "#38bdf8", // Sky Blue
  },
  {
    id: "plan",
    number: "03",
    nameEn: "Plan",
    nameAr: "التخطيط",
    subtitleEn: "Projects & Events",
    subtitleAr: "المشاريع والفعاليات",
    descriptionEn: "Architecting master timelines, multi-stakeholder synchronization, and rigorous operational project governance.",
    descriptionAr: "هيكلة الجداول الزمنية الرئيسية، وتنسيق أصحاب المصلحة، وإدارة معالم التنفيذ الدقيقة.",
    icon: CalendarCheck,
    accentColor: "#818cf8", // Indigo
  },
  {
    id: "amplify",
    number: "04",
    nameEn: "Amplify",
    nameAr: "التطوير",
    subtitleEn: "Technology & Systems",
    subtitleAr: "التكنولوجيا والأنظمة",
    descriptionEn: "Advanced AV infrastructure, interactive systems, software automation, and digital audience engagement.",
    descriptionAr: "الشبكات السمعية والبصرية المتقدمة، والتقنيات التفاعلية، وأنظمة البرمجيات الرقمية.",
    icon: Cpu,
    accentColor: "#34d399", // Emerald
  },
  {
    id: "build",
    number: "05",
    nameEn: "Build",
    nameAr: "التنفيذ",
    subtitleEn: "Production & Logistics",
    subtitleAr: "الإنتاج واللوجستيات",
    descriptionEn: "Precision fabrication, site logistics, technical staging, and rapid deployment on ground.",
    descriptionAr: "التصنيع الميداني الدقيق، والخدمات اللوجستية، وتركيب المسارح والأنظمة الميدانية.",
    icon: Hammer,
    accentColor: "#2dd4bf", // Teal
  },
  {
    id: "operate",
    number: "06",
    nameEn: "Operate",
    nameAr: "التشغيل",
    subtitleEn: "Operations & Guest Experience",
    subtitleAr: "العمليات وتجربة الزوار",
    descriptionEn: "Flawless live execution, crowd dynamics, VIP hospitality protocols, and comprehensive site safety.",
    descriptionAr: "التشغيل الحي المتقن، وإدارة حركة الحشود، والضيافة الرفيعة، وبروتوكولات السلامة الميدانية.",
    icon: Activity,
    accentColor: "#a78bfa", // Purple
  },
];

/**
 * Maps any team member safely and deterministically to one of the 6 Journey Stages or Corporate Enablement.
 */
export function mapMemberToStage(member: SafePublicTeamMember): StageConfig["id"] | "corporate-enablement" {
  const resolved = resolvePresentationGroup(member as any, "en");
  const stageId = resolved.stageId || resolved.key;
  if (stageId === "corporate-enablement") {
    return "corporate-enablement";
  }
  if (["direction", "imagine", "plan", "build", "operate", "amplify"].includes(stageId)) {
    return stageId as StageConfig["id"];
  }
  return "plan";
}

/**
 * Extracts a verified responsibility or landmark project for clean card preview.
 */
export function getVerifiedHighlight(member: SafePublicTeamMember, isAr: boolean): string {
  // 1. Landmark Project
  if (Array.isArray(member.projects) && member.projects.length > 0) {
    const firstProj = member.projects[0];
    if (typeof firstProj === "string" && firstProj.trim()) {
      return firstProj.trim();
    }
    if (firstProj && typeof firstProj === "object") {
      const projName = isAr && firstProj.nameAr ? firstProj.nameAr : (firstProj.name || firstProj.projectName || firstProj.title);
      if (projName) return String(projName).trim();
    }
  }

  // 2. Core Expertise Tag
  if (Array.isArray(member.expertiseTags) && member.expertiseTags.length > 0) {
    const validTags = member.expertiseTags.filter((t) => typeof t === "string" && t.trim());
    if (validTags.length > 0) {
      return validTags.slice(0, 2).join(" • ");
    }
  }

  // 3. Core Competency
  if (Array.isArray(member.coreCompetencies) && member.coreCompetencies.length > 0) {
    const validComp = member.coreCompetencies.filter((c) => typeof c === "string" && c.trim());
    if (validComp.length > 0) {
      return validComp[0];
    }
  }

  // 4. Tagline
  if (member.tagline && member.tagline.trim()) {
    return member.tagline.trim();
  }

  // 5. Fallback to designation
  return isAr && member.designationAr ? member.designationAr : member.designation;
}

interface HowE3WorksJourneySectionProps {
  members: SafePublicTeamMember[];
  locale?: string;
  onOpenDrawer?: () => void;
}

export function HowE3WorksJourneySection({
  members,
  locale = "en",
  onOpenDrawer,
}: HowE3WorksJourneySectionProps) {
  const isAr = locale === "ar";
  const [activeStageId, setActiveStageId] = useState<string>("direction");

  // Group members into the 6 connected stages + Corporate Enablement
  const stageGroups = useMemo(() => {
    const map: Record<StageConfig["id"] | "corporate-enablement", SafePublicTeamMember[]> = {
      direction: [],
      imagine: [],
      plan: [],
      build: [],
      operate: [],
      amplify: [],
      "corporate-enablement": [],
    };

    members.forEach((m) => {
      const stage = mapMemberToStage(m);
      if (map[stage]) {
        map[stage].push(m);
      } else {
        map.plan.push(m);
      }
    });

    return map;
  }, [members]);

  // ScrollSpy to update active stage in sticky navigator
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const stage of E3_JOURNEY_STAGES) {
        const el = document.getElementById(`stage-${stage.id}`);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveStageId(stage.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToStage = (stageId: string) => {
    setActiveStageId(stageId);
    const target = document.getElementById(`stage-${stageId}`);
    if (target) {
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 110;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  };

  const corporateMembers = stageGroups["corporate-enablement"] || [];

  return (
    <section
      id="how-e3-works"
      dir={isAr ? "rtl" : "ltr"}
      data-testid="how-e3-works-journey-section"
      aria-label={isAr ? "كيف تعمل إي ثري - من الفكرة إلى التجربة الحية" : "How E3 Works - From Brief to Live Experience"}
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24"
    >
      {/* ============================================================ */}
      {/* SECTION HEADER                                               */}
      {/* ============================================================ */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? "كيف تعمل إي ثري" : "HOW E3 WORKS"}</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight font-syne">
          {isAr ? "من الفكرة المبدئية إلى التجربة الحية" : "FROM BRIEF TO LIVE EXPERIENCE"}
        </h2>

        {/* Subtitle */}
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          {isAr
            ? "نستعرض فريق عملنا المتكامل عبر ست مراحل مترابطة تضمن تحويل الرؤى والأفكار إلى تجارب حية مبهرة وموثوقة."
            : "Presenting all E3 specialists through six connected stages of live experiential engineering."}
        </p>
      </div>

      {/* ============================================================ */}
      {/* STICKY STAGE NAVIGATOR (Desktop & Tablet)                     */}
      {/* ============================================================ */}
      <div className="sticky top-16 sm:top-20 z-30 my-6 py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl bg-[#080b12]/90 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          
          {/* Stage Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {E3_JOURNEY_STAGES.map((stage) => {
              const count = stageGroups[stage.id]?.length || 0;
              const isActive = activeStageId === stage.id;
              const Icon = stage.icon;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => scrollToStage(stage.id)}
                  aria-label={`${stage.number} ${isAr ? stage.nameAr : stage.nameEn}`}
                  data-testid={`stage-nav-btn-${stage.id}`}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                    isActive
                      ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black scale-[1.02]"
                      : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-black" : "text-cyan-400")} />
                  <span className="font-mono opacity-70 hidden xs:inline">{stage.number}</span>
                  <span>{isAr ? stage.nameAr : stage.nameEn}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-md text-[10px] font-mono",
                      isActive ? "bg-black/20 text-black font-black" : "bg-white/10 text-slate-400"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Trigger: View All People Drawer */}
          {onOpenDrawer && (
            <button
              type="button"
              onClick={onOpenDrawer}
              data-testid="open-team-drawer-btn"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-all shrink-0 cursor-pointer shadow-sm"
              title={isAr ? "استعراض والبحث في جميع أفراد الفريق" : "Search & View All E3 People"}
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">{isAr ? "دليل جميع الأفراد" : "View All People"}</span>
              <span className="font-mono text-[11px] text-cyan-300">({members.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6 CONNECTED STAGES JOURNEY                                    */}
      {/* ============================================================ */}
      <div className="relative mt-8 sm:mt-12 space-y-16 sm:space-y-24">
        
        {/* Continuous Vertical Timeline Line on Mobile/Tablet */}
        <div
          className="absolute start-4 sm:start-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-cyan-500 via-indigo-500 to-teal-500 opacity-20 pointer-events-none hidden sm:block"
          aria-hidden="true"
        />

        {E3_JOURNEY_STAGES.map((stage) => {
          const stageMembers = stageGroups[stage.id] || [];

          return (
            <div
              key={stage.id}
              id={`stage-${stage.id}`}
              data-testid={`stage-${stage.id}`}
              className="relative scroll-mt-28 sm:scroll-mt-36"
            >
              {/* STAGE HEADER BANNER */}
              <div className="relative mb-8 sm:mb-10 pb-6 border-b border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                
                <div className="flex items-start gap-3.5 sm:gap-4">
                  {/* Stage Number Badge with Milestone Connector */}
                  <div className="relative shrink-0">
                    <div
                      className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center font-mono font-black text-sm sm:text-base border shadow-xl"
                      style={{
                        backgroundColor: `${stage.accentColor}18`,
                        borderColor: `${stage.accentColor}40`,
                        color: stage.accentColor,
                      }}
                    >
                      {stage.number}
                    </div>
                  </div>

                  {/* Stage Titles & Description */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                        {isAr ? stage.nameAr : stage.nameEn}
                      </span>
                      <span className="text-slate-500 text-xs">•</span>
                      <span className="text-xs font-medium text-slate-300">
                        {isAr ? stage.subtitleAr : stage.subtitleEn}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight font-syne">
                      {isAr ? `${stage.nameAr}: ${stage.subtitleAr}` : `${stage.nameEn} — ${stage.subtitleEn}`}
                    </h3>

                    <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      {isAr ? stage.descriptionAr : stage.descriptionEn}
                    </p>
                  </div>
                </div>

                {/* Member Count Indicator */}
                <div className="flex items-center gap-2 self-start md:self-end ps-14 md:ps-0 shrink-0">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {stageMembers.length} {isAr ? "كفاءة قيادية ومتخصصة" : "Specialists"}
                  </span>
                </div>
              </div>

              {/* STAGE TEAM MEMBERS GRID (4:5 Ratio Cards, Single-column Mobile) */}
              {stageMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                  {stageMembers.map((member) => {
                    const displayName = isAr && member.nameAr ? member.nameAr : member.name;
                    const displayDesignation = isAr && member.designationAr ? member.designationAr : member.designation;
                    const verifiedHighlight = getVerifiedHighlight(member, isAr);
                    const profileUrl = `/${locale}/b2b/team/${member.slug}`;

                    return (
                      <div
                        key={member.id || member.slug}
                        data-testid={`team-card-${member.slug}`}
                        className="group relative rounded-2xl bg-[#0b101e] border border-white/10 hover:border-cyan-500/50 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 w-full"
                      >
                        {/* 4:5 Aspect Ratio Portrait */}
                        <div className="relative w-full aspect-[4/5] bg-zinc-950 overflow-hidden">
                          {member.profileImage ? (
                            <img
                              src={member.profileImage}
                              alt={displayName}
                              className="w-full h-full object-cover object-top filter grayscale-0 contrast-[1.02] group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-900 via-[#0b101e] to-black">
                              <div
                                className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black mb-2"
                                style={{
                                  borderColor: stage.accentColor,
                                  color: stage.accentColor,
                                }}
                              >
                                {member.initials}
                              </div>
                              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                                {isAr ? stage.nameAr : stage.nameEn}
                              </span>
                            </div>
                          )}

                          {/* Gradient bottom scrim */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0b101e] via-[#0b101e]/20 to-transparent opacity-90" />

                          {/* Stage Pill on Top Corner */}
                          <div className="absolute top-3 start-3">
                            <span
                              className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm"
                              style={{
                                backgroundColor: `${stage.accentColor}25`,
                                color: stage.accentColor,
                                borderColor: `${stage.accentColor}40`,
                              }}
                            >
                              {stage.number} • {isAr ? stage.nameAr : stage.nameEn}
                            </span>
                          </div>
                        </div>

                        {/* Card Content & Verified Project/Responsibility */}
                        <div className="p-5 flex flex-col flex-grow justify-between gap-4 -mt-6 relative z-10">
                          <div>
                            {/* Name */}
                            <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors tracking-tight font-syne leading-snug">
                              {displayName}
                            </h4>

                            {/* Designation */}
                            <p className="text-xs text-cyan-300/90 font-medium mt-0.5 leading-snug">
                              {displayDesignation}
                            </p>

                            {/* One Verified Responsibility / Landmark Project */}
                            {verifiedHighlight && (
                              <div className="mt-3 pt-3 border-t border-white/5 flex items-start gap-1.5 text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                <span className="text-[11px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
                                  {verifiedHighlight}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Canonical Profile Link */}
                          <Link
                            href={profileUrl}
                            className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 group-hover:bg-cyan-500 text-slate-200 group-hover:text-black font-bold text-xs transition-all border border-white/10 group-hover:border-cyan-400 active:scale-[0.98]"
                          >
                            <span>{isAr ? "الملف الشخصي والخبرات" : "View Profile"}</span>
                            <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center text-slate-400 text-xs font-mono">
                  {isAr ? "لا توجد سجلات في هذه المرحلة حالياً." : "No team records assigned to this stage."}
                </div>
              )}
            </div>
          );
        })}

        {/* ============================================================ */}
        {/* CORPORATE ENABLEMENT (Outside the 6-Stage Journey)           */}
        {/* ============================================================ */}
        {corporateMembers.length > 0 && (
          <div
            id="stage-corporate-enablement"
            data-testid="stage-corporate-enablement"
            className="relative scroll-mt-28 sm:scroll-mt-36 pt-8 border-t border-white/10"
          >
            <div className="relative mb-8 sm:mb-10 pb-6 border-b border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex items-start gap-3.5 sm:gap-4">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center font-mono font-black text-sm sm:text-base border shadow-xl bg-amber-500/10 border-amber-500/30 text-amber-400">
                    CE
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                      {isAr ? "التمكين المؤسسي" : "Corporate Enablement"}
                    </span>
                    <span className="text-slate-500 text-xs">•</span>
                    <span className="text-xs font-medium text-slate-300">
                      {isAr ? "الحوكمة والعلاقات المؤسسية" : "Governance & Operations"}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight font-syne">
                    {isAr ? "التمكين المؤسسي والحوكمة" : "Corporate Enablement & Governance"}
                  </h3>

                  <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    {isAr
                      ? "إدارة الامتثال المالي، وحوكمة الموارد، والتنسيق الحكومي الشامل الذي يدعم سلاسة العمليات الميدانية."
                      : "Providing institutional compliance, financial stewardship, and sovereign liaison that anchor every E3 deployment."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-end ps-14 md:ps-0 shrink-0">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono font-bold text-slate-400">
                  {corporateMembers.length} {isAr ? "كفاءة قيادية ومؤسسية" : "Specialists"}
                </span>
              </div>
            </div>

            {/* Corporate Enablement Members Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {corporateMembers.map((member) => {
                const displayName = isAr && member.nameAr ? member.nameAr : member.name;
                const displayDesignation = isAr && member.designationAr ? member.designationAr : member.designation;
                const verifiedHighlight = getVerifiedHighlight(member, isAr);
                const profileUrl = `/${locale}/b2b/team/${member.slug}`;

                return (
                  <div
                    key={member.id || member.slug}
                    data-testid={`team-card-${member.slug}`}
                    className="group relative rounded-2xl bg-[#0b101e] border border-white/10 hover:border-amber-500/50 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 w-full"
                  >
                    {/* 4:5 Aspect Ratio Portrait */}
                    <div className="relative w-full aspect-[4/5] bg-zinc-950 overflow-hidden">
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={displayName}
                          className="w-full h-full object-cover object-top filter grayscale-0 contrast-[1.02] group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-900 via-[#0b101e] to-black">
                          <div className="w-16 h-16 rounded-2xl border-2 border-amber-400 text-amber-400 flex items-center justify-center text-2xl font-black mb-2">
                            {member.initials}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                            {isAr ? "التمكين المؤسسي" : "Corporate"}
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b101e] via-[#0b101e]/20 to-transparent opacity-90" />

                      <div className="absolute top-3 start-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm bg-amber-500/20 text-amber-300 border-amber-500/30">
                          {isAr ? "تمكين مؤسسي" : "Enablement"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow justify-between gap-4 -mt-6 relative z-10">
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors tracking-tight font-syne leading-snug">
                          {displayName}
                        </h4>

                        <p className="text-xs text-amber-300/90 font-medium mt-0.5 leading-snug">
                          {displayDesignation}
                        </p>

                        {verifiedHighlight && (
                          <div className="mt-3 pt-3 border-t border-white/5 flex items-start gap-1.5 text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span className="text-[11px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
                              {verifiedHighlight}
                            </span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={profileUrl}
                        className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 group-hover:bg-amber-500 text-slate-200 group-hover:text-black font-bold text-xs transition-all border border-white/10 group-hover:border-amber-400 active:scale-[0.98]"
                      >
                        <span>{isAr ? "الملف الشخصي والخبرات" : "View Profile"}</span>
                        <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
