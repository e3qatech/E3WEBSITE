"use client";

import React from "react";
import Link from "next/link";
import { Quote, ArrowRight, UserCheck } from "lucide-react";

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
    <section className="py-24 bg-zinc-900/30 border-b border-zinc-900 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block mb-2">
            {eyebrow}
          </span>
          <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight">
            {title}
          </h2>
          {(config.descriptionEn || config.descriptionAr) && (
            <p className="text-zinc-400 text-sm md:text-base mt-4 max-w-2xl leading-relaxed">
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
                className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/50 transition-colors shadow-lg"
              >
                <Quote className="w-12 h-12 text-zinc-900 absolute top-6 end-6 -rotate-6 pointer-events-none" />

                <div className="relative z-10 mb-8">
                  <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{role}</span>
                  </div>

                  {storyTitle && (
                    <h3 className="text-lg font-bold font-syne text-zinc-100 mb-3">
                      {storyTitle}
                    </h3>
                  )}

                  <p className="text-base text-zinc-300 italic leading-relaxed">
                    &quot;{quote}&quot;
                  </p>
                </div>

                <div className="pt-5 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    {profileImg ? (
                      <img
                        src={profileImg}
                        alt={memberName}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 font-bold font-mono text-xs">
                        {memberName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-zinc-200">
                        {memberName}
                      </div>
                      {department && (
                        <div className="text-[10px] font-mono text-zinc-500 uppercase">
                          {department}
                        </div>
                      )}
                    </div>
                  </div>

                  {caseSlug && caseTitle && (
                    <Link
                      href={`/${locale}/b2b/cases/${caseSlug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider group/link transition-colors"
                    >
                      <span className="max-w-[180px] truncate">{caseTitle}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 rtl:group-hover/link:-translate-x-1 rtl:-scale-x-100 transition-transform" />
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
