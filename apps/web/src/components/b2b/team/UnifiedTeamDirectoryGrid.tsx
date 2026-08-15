"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Award } from "lucide-react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";
import { resolveDepartmentAura } from "@/lib/team/department-aura";
import { cn } from "@/lib/utils";

interface UnifiedTeamDirectoryGridProps {
  members: SafePublicTeamMember[];
  locale?: string;
}

export function UnifiedTeamDirectoryGrid({
  members,
  locale = "en",
}: UnifiedTeamDirectoryGridProps) {
  const isAr = locale === "ar";

  if (members.length === 0) {
    return (
      <div
        data-testid="empty-directory-state"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-hover)] flex items-center justify-center mx-auto mb-4 border border-[var(--border-level-1)]">
          <Briefcase className="w-8 h-8 text-[var(--text-tertiary)]" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          {isAr ? "لم يتم العثور على أعضاء مطابقة" : "No Team Members Found"}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
          {isAr
            ? "حاول تعديل كلمات البحث أو اختيار قسم مختلف لعرض أعضاء الفريق."
            : "Try adjusting your search query or selecting another department."}
        </p>
      </div>
    );
  }

  return (
    <section
      data-testid="unified-team-directory-grid"
      aria-label={isAr ? "دليل فريق العمل الموحد" : "Unified Team Directory Grid"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
        {members.map((member) => {
          const aura = resolveDepartmentAura(member.department, member.departmentKey);
          const initials = member.initials || "E3";
          const profileImg =
            member.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nameEn || member.name)}&background=0D1117&color=38BDF8&size=512`;

          const profileUrl = `/${locale}/b2b/team/${member.slug}`;

          return (
            <div
              key={member.id || member.slug}
              data-testid={`team-card-${member.slug}`}
              className="group relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-900 border border-[var(--border-level-1)] shadow-md hover:shadow-2xl transition-all duration-300 hover:border-cyan-500/50 flex flex-col justify-between"
            >
              {/* Restrained Department Colored Accent Line at Top */}
              <div
                className="absolute top-0 inset-x-0 h-1 z-20"
                style={{ backgroundColor: aura.primaryColor }}
                title={member.department}
              />

              {/* 3:4 Portrait Background Image */}
              <img
                src={profileImg}
                alt={isAr ? (member.nameAr || member.name) : member.name}
                className="absolute inset-0 w-full h-full object-cover object-top filter grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 z-0"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0D1117&color=38BDF8&size=512`;
                }}
              />

              {/* Dark Gradient Scrim to ensure crisp typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 pointer-events-none" />

              {/* Top Department Badge */}
              <div className="relative z-20 p-3.5 flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border border-white/10"
                  style={{
                    backgroundColor: `${aura.primaryColor}25`,
                    color: aura.primaryColor,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: aura.primaryColor }}
                  />
                  <span>
                    {isAr ? (member.departmentAr || member.department) : member.department}
                  </span>
                </span>
              </div>

              {/* Bottom Details & Hover Reveal Actions */}
              <div className="relative z-20 p-4 sm:p-5 flex flex-col justify-end text-start">
                {/* Member Name */}
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight drop-shadow-sm truncate">
                  {isAr ? (member.nameAr || member.name) : (member.nameEn || member.name)}
                </h3>

                {/* Member Designation */}
                <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                  {isAr ? (member.designationAr || member.designation) : member.designation}
                </p>

                {/* Hover Reveal: Experience and View Profile CTA */}
                <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Experience Badge */}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300">
                    <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      {member.yearsOfExperience > 0
                        ? isAr
                          ? `${member.yearsOfExperience} سنة خبرة`
                          : `${member.yearsOfExperience}+ Yrs Exp.`
                        : isAr
                        ? "خبير متخصص"
                        : "Specialist"}
                    </span>
                  </span>

                  {/* Profile Action Link */}
                  <Link
                    href={profileUrl}
                    data-testid={`view-profile-${member.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors"
                  >
                    <span>{isAr ? "الملف الشخصي" : "View Profile"}</span>
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
