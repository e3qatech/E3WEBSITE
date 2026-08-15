"use client";

import React from "react";
import Link from "next/link";
import { Users, ExternalLink, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseTeamMember {
  id?: string;
  roleEn?: string | null;
  roleAr?: string | null;
  orderIndex?: number;
  employeeProfile?: {
    id: string;
    slug?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    designation?: string | null;
    designationAr?: string | null;
    avatarUrl?: string | null;
    imageUrl?: string | null;
  } | null;
}

interface ProjectTeamSectionProps {
  locale?: string;
  teamMembers?: CaseTeamMember[] | null;
}

export function ProjectTeamSection({
  locale = "en",
  teamMembers = [],
}: ProjectTeamSectionProps) {
  const isAr = locale === "ar";

  if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
    return null;
  }

  return (
    <section
      id="team"
      data-testid="project-team-section"
      aria-label={isAr ? "فريق العمل القيادي والمهندسين" : "Key Execution Team"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-2 border border-indigo-500/20">
            <Users className="w-3.5 h-3.5" />
            <span>{isAr ? "فريق العمل والتنفيذ" : "PEOPLE BEHIND THE BUILD"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight font-syne">
            {isAr ? "فريق العمل والقيادة الهندسية" : "Key Execution & Production Leads"}
          </h2>
        </div>

        <Link
          href={`/${locale}/b2b/team`}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
        >
          <span>{isAr ? "استعراض كامل فريق إي ثري" : "Explore All E3 Team"}</span>
          <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
        </Link>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, i) => {
          const profile = member.employeeProfile;
          if (!profile) return null;

          const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || (isAr ? "عضو الفريق" : "Team Specialist");
          const designation = isAr
            ? profile.designationAr || profile.designation || ""
            : profile.designation || "";
          const projectRole = isAr
            ? member.roleAr || member.roleEn || designation
            : member.roleEn || designation;

          const avatar = profile.avatarUrl || profile.imageUrl;
          const profileUrl = `/${locale}/b2b/team/${profile.slug || profile.id}`;

          return (
            <Link
              key={member.id || i}
              href={profileUrl}
              data-testid={`team-member-card-${profile.slug || profile.id}`}
              className="group p-6 rounded-2xl bg-[#0b101e] border border-white/10 hover:border-cyan-500/40 transition-all duration-300 flex items-center gap-4 shadow-lg hover:shadow-2xl hover:-translate-y-0.5"
            >
              {/* Avatar / Portrait Media */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 shadow-inner">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <Users className="w-7 h-7 text-cyan-400/60" />
                )}
              </div>

              {/* Details & Link */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors truncate font-syne">
                    {fullName}
                  </h3>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
                </div>

                <div className="text-xs font-mono font-bold text-cyan-400 truncate mb-1">
                  {projectRole}
                </div>

                {designation && designation !== projectRole && (
                  <div className="text-[11px] text-slate-400 truncate font-medium">
                    {designation}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
