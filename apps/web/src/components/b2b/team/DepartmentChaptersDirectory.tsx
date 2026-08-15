"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, User } from "lucide-react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";
import { resolveDepartmentAura } from "@/lib/team/department-aura";
import { cn } from "@/lib/utils";

interface DepartmentChapter {
  key: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  members: SafePublicTeamMember[];
}

interface DepartmentChaptersDirectoryProps {
  members: SafePublicTeamMember[];
  searchQuery?: string;
  selectedDepartment?: string;
  locale?: string;
}

// Predefined department meta mappings
const DEPARTMENT_CONFIGS: Record<
  string,
  { nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string; order: number }
> = {
  leadership: {
    nameEn: "Executive Leadership",
    nameAr: "القيادة التنفيذية",
    descriptionEn: "Strategic direction, corporate governance, and master vision for Qatar's flagship experiences.",
    descriptionAr: "التوجيه الاستراتيجي، الحوكمة المؤسسية، والرؤية الكبرى للتجارب والفعاليات الرائدة في قطر.",
    order: 1,
  },
  creative: {
    nameEn: "Creative & Brand Engineering",
    nameAr: "الإبداع وهندسة العلامة التجارية",
    descriptionEn: "World-class spatial storytelling, visual art direction, and immersive multimedia narratives.",
    descriptionAr: "السرد المكاني العالمي، الإخراج الفني البصري، والروايات الإبداعية متكاملة الوسائط.",
    order: 2,
  },
  technical: {
    nameEn: "Technical Production & AV",
    nameAr: "الإنتاج التقني والأنظمة السمعية البصرية",
    descriptionEn: "Architectural projection, kinetic stages, laser choreography, and precision show systems.",
    descriptionAr: "الإسقاط المعماري، المسارح الحركية، استعراضات الليزر، وأنظمة العروض المتطورة.",
    order: 3,
  },
  operations: {
    nameEn: "Event Operations & Logistics",
    nameAr: "العمليات اللوجستية وإدارة الفعاليات",
    descriptionEn: "Crowd dynamics, venue infrastructure, vendor orchestration, and field execution mastery.",
    descriptionAr: "إدارة الحشود، البنية التحتية للمواقع، التنسيق الميداني، والتميز التشغيلي للفعاليات.",
    order: 4,
  },
  finance: {
    nameEn: "Finance & Legal Administration",
    nameAr: "الشؤون المالية والإدارية والقانونية",
    descriptionEn: "Fiscal governance, commercial contract compliance, and enterprise resource optimization.",
    descriptionAr: "الحوكمة المالية، الامتثال للعقود التجارية، وتحسين الموارد المؤسسية.",
    order: 5,
  },
  hospitality: {
    nameEn: "VIP Hospitality & Guest Relations",
    nameAr: "الضيافة الملكية وتجارب كبار الشخصيات",
    descriptionEn: "Bespoke protocol management, dignitary hosting, and ultra-premium visitor journeys.",
    descriptionAr: "إدارة البروتوكول المتخصصة، استضافة الوفود الرسمية، وتجارب الزوار الفاخرة.",
    order: 6,
  },
};

export function DepartmentChaptersDirectory({
  members,
  searchQuery: _searchQuery = "",
  selectedDepartment: _selectedDepartment = "all",
  locale = "en",
}: DepartmentChaptersDirectoryProps) {
  const isAr = locale === "ar";

  // 1. Group members into department chapters
  const chapters: DepartmentChapter[] = React.useMemo(() => {
    const map = new Map<string, SafePublicTeamMember[]>();

    members.forEach((m) => {
      const key = m.departmentKey || (m.department ? m.department.toLowerCase().replace(/[^a-z0-9]/g, "-") : "other");
      const list = map.get(key) || [];
      list.push(m);
      map.set(key, list);
    });

    const result: DepartmentChapter[] = [];

    map.forEach((deptMembers, key) => {
      const config = DEPARTMENT_CONFIGS[key] || {
        nameEn: deptMembers[0]?.department || "Specialized Operations",
        nameAr: deptMembers[0]?.departmentAr || deptMembers[0]?.department || "العمليات المتخصصة",
        descriptionEn: "Specialized professionals and domain experts delivering exceptional excellence.",
        descriptionAr: "متخصصون وخبراء مجالات يقدمون أعلى معايير التميز والإتقان.",
        order: 99,
      };

      result.push({
        key,
        nameEn: config.nameEn,
        nameAr: config.nameAr,
        descriptionEn: config.descriptionEn,
        descriptionAr: config.descriptionAr,
        members: deptMembers,
      });
    });

    // Sort chapters by predefined hierarchy
    result.sort((a, b) => {
      const orderA = DEPARTMENT_CONFIGS[a.key]?.order ?? 99;
      const orderB = DEPARTMENT_CONFIGS[b.key]?.order ?? 99;
      return orderA - orderB;
    });

    return result;
  }, [members]);

  if (members.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto py-20 px-4 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-1)] max-w-md mx-auto shadow-sm">
          <User className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
            {isAr ? "لم يتم العثور على أعضاء مطابقة" : "No team members found"}
          </h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            {isAr
              ? "جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً من الفلتر"
              : "Try adjusting your search query or select a different department filter"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      data-testid="department-chapters-directory"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24 pb-20"
    >
      {chapters.map((chapter, chapterIndex) => {
        // Layout alternation pattern:
        // Index 0 (mod 3 === 0): Lead on Left, supporting grid on Right
        // Index 1 (mod 3 === 1): Lead on Right, supporting grid on Left
        // Index 2 (mod 3 === 2): Bento full grid with prominent Lead top/span
        const layoutType = chapterIndex % 3;
        const aura = resolveDepartmentAura(chapter.nameEn, chapter.key);

        const leadMember = chapter.members[0];
        const supportingMembers = chapter.members.slice(1);

        const chapterNumber = String(chapterIndex + 1).padStart(2, "0");

        return (
          <section
            key={chapter.key}
            data-testid={`department-chapter-${chapter.key}`}
            className="relative space-y-8 scroll-mt-28"
          >
            {/* ============================================================ */}
            {/* CHAPTER HEADER                                               */}
            {/* ============================================================ */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[var(--border-level-1)]">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-xs font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-md border"
                    style={{
                      backgroundColor: `${aura.primaryColor}10`,
                      color: aura.primaryColor,
                      borderColor: `${aura.primaryColor}30`,
                    }}
                  >
                    {isAr ? `الفصل ${chapterNumber}` : `Chapter ${chapterNumber}`}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-tertiary)]">
                    {chapter.members.length} {isAr ? "أعضاء" : "Members"}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  {isAr ? chapter.nameAr : chapter.nameEn}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
                  {isAr ? chapter.descriptionAr : chapter.descriptionEn}
                </p>
              </div>
            </div>

            {/* ============================================================ */}
            {/* CHAPTER COMPOSITION (ALTERNATING ASYMMETRIC LAYOUTS)         */}
            {/* ============================================================ */}
            {layoutType === 0 && (
              /* Pattern 0: Lead on Left (col-span-5) + Supporting on Right (col-span-7) */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                {leadMember && (
                  <div className="md:col-span-5">
                    <TeamMemberCard member={leadMember} isLead={true} auraColor={aura.primaryColor} locale={locale} />
                  </div>
                )}
                <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-6", leadMember ? "md:col-span-7" : "md:col-span-12")}>
                  {supportingMembers.map((member) => (
                    <TeamMemberCard key={member.id || member.slug} member={member} isLead={false} auraColor={aura.primaryColor} locale={locale} />
                  ))}
                </div>
              </div>
            )}

            {layoutType === 1 && (
              /* Pattern 1: Supporting on Left (col-span-7) + Lead on Right (col-span-5) */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-6 order-2 md:order-1", leadMember ? "md:col-span-7" : "md:col-span-12")}>
                  {supportingMembers.map((member) => (
                    <TeamMemberCard key={member.id || member.slug} member={member} isLead={false} auraColor={aura.primaryColor} locale={locale} />
                  ))}
                </div>
                {leadMember && (
                  <div className="md:col-span-5 order-1 md:order-2">
                    <TeamMemberCard member={leadMember} isLead={true} auraColor={aura.primaryColor} locale={locale} />
                  </div>
                )}
              </div>
            )}

            {layoutType === 2 && (
              /* Pattern 2: Bento Grid Arrangement */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {leadMember && (
                  <div className="sm:col-span-2 lg:col-span-2">
                    <TeamMemberCard member={leadMember} isLead={true} auraColor={aura.primaryColor} locale={locale} />
                  </div>
                )}
                {supportingMembers.map((member) => (
                  <TeamMemberCard key={member.id || member.slug} member={member} isLead={false} auraColor={aura.primaryColor} locale={locale} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/* REUSABLE 3:4 RECTANGULAR PORTRAIT TEAM CARD                        */
/* ================================================================== */
interface TeamMemberCardProps {
  member: SafePublicTeamMember;
  isLead: boolean;
  auraColor: string;
  locale?: string;
}

function TeamMemberCard({ member, isLead, auraColor, locale = "en" }: TeamMemberCardProps) {
  const isAr = locale === "ar";
  const profileUrl = `/${locale}/b2b/team/${member.slug}`;

  const displayName = isAr && member.nameAr ? member.nameAr : member.name;
  const displayDesignation = isAr && member.designationAr ? member.designationAr : member.designation;
  const displayDepartment = isAr && member.departmentAr ? member.departmentAr : member.department;

  return (
    <div
      data-testid={`team-card-${member.slug}`}
      className={cn(
        "group relative h-full rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between",
        "bg-[var(--surface-default)] border border-[var(--border-level-1)] hover:border-[var(--color-primary)]/50",
        "shadow-md hover:shadow-2xl transition-all duration-500",
        isLead && "border-2 shadow-lg"
      )}
    >
      <Link
        href={profileUrl}
        className="absolute inset-0 z-20"
        aria-label={`${displayName} - ${displayDesignation}`}
      >
        <span className="sr-only">{displayName}</span>
      </Link>

      {/* 3:4 Rectangular Portrait Frame (NEVER circular) */}
      <div
        className={cn(
          "relative w-full overflow-hidden bg-slate-900",
          isLead ? "aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4]" : "aspect-[3/4]"
        )}
      >
        {member.profileImage ? (
          <img
            src={member.profileImage}
            alt={displayName}
            loading="lazy"
            className="w-full h-full object-cover object-top filter grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center"
            style={{
              background: `linear-gradient(135deg, ${auraColor}33 0%, #090c13 100%)`,
            }}
          >
            <div
              className={cn(
                "rounded-full border-2 flex items-center justify-center font-black mb-2",
                isLead ? "w-20 h-20 text-3xl" : "w-14 h-14 text-xl"
              )}
              style={{
                borderColor: `${auraColor}80`,
                color: auraColor,
              }}
            >
              {member.initials}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              {displayDepartment}
            </span>
          </div>
        )}

        {/* Lead Member Tag Badge */}
        {isLead && (
          <div className="absolute top-3.5 start-3.5 z-20">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-white shadow-md backdrop-blur-md"
              style={{ backgroundColor: `${auraColor}cc` }}
            >
              <Sparkles className="w-3 h-3 text-white" />
              <span>{isAr ? "قائد القسم" : "Department Lead"}</span>
            </span>
          </div>
        )}

        {/* Bottom Scrim with Name & View Profile Button */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex flex-col justify-end">
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-wider mb-1"
            style={{ color: auraColor }}
          >
            {displayDepartment}
          </span>
          <h3
            className={cn(
              "font-bold text-white leading-tight truncate",
              isLead ? "text-lg sm:text-xl" : "text-sm sm:text-base"
            )}
          >
            {displayName}
          </h3>
          <p className="text-xs text-slate-300 truncate mt-0.5">
            {displayDesignation}
          </p>

          {/* Action CTA on Hover */}
          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
              <span>{isAr ? "عرض الملف" : "View Profile"}</span>
              <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
            </span>
            {member.yearsOfExperience && (
              <span className="text-[10px] font-mono text-slate-400">
                {member.yearsOfExperience} {isAr ? "سنوات" : "yrs exp"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
