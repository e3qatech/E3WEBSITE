"use client";

import React from "react";
import Link from "next/link";
import { Quote, ArrowRight, ArrowUpRight, UserCheck } from "lucide-react";

export interface BehindTheBuildTeamProps {
  config: {
    enabled?: boolean;
    eyebrowEn?: string;
    eyebrowAr?: string;
    titleEn?: string;
    titleAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    stories?: any[];
  };
  caseStudies: any[];
  employeeProfiles: any[];
  locale: string;
}

export function BehindTheBuildTeam({
  config,
  caseStudies,
  employeeProfiles,
  locale,
}: BehindTheBuildTeamProps) {
  const isAr = locale === "ar";
  if (config?.enabled === false) return null;

  // Build public presentation list from stories or canonical case study team members
  const teamStories = Array.isArray(config?.stories) ? config.stories : [];

  // If no stories are explicitly set in CMS, derive from published case studies' team assignments
  const derivedAssignments: any[] = [];
  if (teamStories.length === 0) {
    caseStudies.forEach((cs) => {
      const members = Array.isArray(cs.teamMembers) ? cs.teamMembers : [];
      members.forEach((tm: any) => {
        const profile = tm.employeeProfile || employeeProfiles.find((ep) => ep.id === tm.employeeProfileId);
        if (profile) {
          derivedAssignments.push({
            employeeProfileId: profile.id,
            teamMemberName: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
            roleEn: tm.roleEn || profile.designation || "Project Lead",
            roleAr: tm.roleAr || profile.designation || "مسؤول المشروع",
            storyTitleEn: `Execution at ${cs.titleEn}`,
            storyTitleAr: `إدارة العمليات في ${cs.titleAr || cs.titleEn}`,
            quoteEn: `Precision logistics, crowd safety protocols, and technical staging orchestrated for ${cs.titleEn}.`,
            quoteAr: `تنسيق العمليات اللوجستية وبروتوكولات السلامة وإدارة الحشود في ${cs.titleAr || cs.titleEn}.`,
            caseStudyId: cs.id,
            caseStudySlug: cs.slug,
            caseStudyTitleEn: cs.titleEn,
            caseStudyTitleAr: cs.titleAr || cs.titleEn,
            profileImage: profile.profileImage,
            department: profile.department,
            designation: profile.designation,
          });
        }
      });
    });
  }

  const displayList = teamStories.length > 0 ? teamStories : derivedAssignments.slice(0, 4);
  if (displayList.length === 0) return null;

  const eyebrow = isAr
    ? config.eyebrowAr || "خلف الكواليس"
    : config.eyebrowEn || "Behind the Build";
  const title = isAr
    ? config.titleAr || "قصص لا يراها الجمهور على المسرح."
    : config.titleEn || "The Stories You Don’t See on Stage.";

  return (
    <section className="py-24 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] relative overflow-hidden transition-colors">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono font-bold text-purple-500 uppercase tracking-widest block mb-2">
            {eyebrow}
          </span>
          <h2 className="text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight">
            {title}
          </h2>
          {(config.descriptionEn || config.descriptionAr) && (
            <p className="text-[var(--text-secondary)] text-sm md:text-base mt-4 max-w-2xl leading-relaxed">
              {isAr ? config.descriptionAr : config.descriptionEn}
            </p>
          )}
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayList.map((story: any, i: number) => {
            const linkedEmployee = story.employeeProfileId
              ? employeeProfiles.find((ep) => ep.id === story.employeeProfileId)
              : null;

            const linkedCaseStudy = story.caseStudyId
              ? caseStudies.find((cs) => cs.id === story.caseStudyId)
              : story.caseStudySlug
              ? caseStudies.find((cs) => cs.slug === story.caseStudySlug)
              : null;

            const memberName = linkedEmployee
              ? `${linkedEmployee.firstName || ""} ${linkedEmployee.lastName || ""}`.trim()
              : story.teamMemberName || "E3 Execution Specialist";

            const profileImg =
              linkedEmployee?.profileImage || story.profileImage || "";
            const designation =
              linkedEmployee?.designation || story.designation || "";
            const department =
              linkedEmployee?.department || story.department || "";

            const role = isAr
              ? story.roleAr || story.roleEn || designation
              : story.roleEn || designation || "Specialist";

            const quote = isAr
              ? story.quoteAr || story.quoteEn || "التنفيذ الدقيق هو الجوهر."
              : story.quoteEn || "Execution is key.";

            const storyTitle = isAr
              ? story.storyTitleAr || story.storyTitleEn
              : story.storyTitleEn;

            const caseTitle = linkedCaseStudy
              ? isAr
                ? linkedCaseStudy.titleAr || linkedCaseStudy.titleEn
                : linkedCaseStudy.titleEn
              : story.caseStudyTitleEn || null;

            const caseSlug = linkedCaseStudy?.slug || story.caseStudySlug;

            return (
              <div
                key={i}
                className="bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/50 transition-colors shadow-sm"
              >
                <Quote className="w-12 h-12 text-[var(--border-level-2)]/50 absolute top-6 end-6 -rotate-6 pointer-events-none" />

                <div className="relative z-10 mb-8">
                  <div className="text-xs font-mono font-bold text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{role}</span>
                  </div>

                  {storyTitle && (
                    <h3 className="text-lg font-bold font-syne text-[var(--text-primary)] mb-3">
                      {storyTitle}
                    </h3>
                  )}

                  <p className="text-base text-[var(--text-secondary)] italic leading-relaxed">
                    &quot;{quote}&quot;
                  </p>
                </div>

                <div className="relative z-10 pt-6 border-t border-[var(--border-level-2)] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {profileImg ? (
                      <img
                        src={profileImg}
                        alt={memberName}
                        className="w-11 h-11 rounded-full object-cover border border-[var(--border-level-2)]"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[var(--bg-level-2)] border border-[var(--border-level-2)] flex items-center justify-center font-bold text-xs text-[var(--text-secondary)]">
                        {memberName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold font-syne text-[var(--text-primary)]">
                        {memberName}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {department ? `${department} • ` : ""}{designation}
                      </div>
                    </div>
                  </div>

                  {caseTitle && caseSlug && (
                    <Link
                      href={`/${locale}/b2b/cases/${caseSlug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-purple-500 hover:text-purple-600 transition-colors"
                    >
                      <span className="hidden sm:inline line-clamp-1 max-w-[140px]">
                        {caseTitle}
                      </span>
                      <ArrowUpRight className="w-4 h-4 shrink-0" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
