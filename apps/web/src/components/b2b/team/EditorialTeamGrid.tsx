import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface EditorialTeamGridProps {
  members: SafePublicTeamMember[];
  locale?: string;
}

export function EditorialTeamGrid({
  members,
  locale = "en",
}: EditorialTeamGridProps) {
  const isAr = locale === "ar";

  if (members.length === 0) {
    return (
      <div className="w-full py-20 text-center text-[var(--text-secondary)]">
        <p className="text-lg font-medium">
          {isAr ? "لا يوجد أعضاء في هذا القسم حالياً." : "No team members found in this group."}
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      dir={isAr ? "rtl" : "ltr"}
      data-testid="editorial-team-grid"
    >
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
      >
        <AnimatePresence mode="popLayout">
          {members.map((member, index) => {
            const isFeaturedLeader = Boolean(member.isFeatured && member.presentationGroupKey === "leadership");
            // Allow featured leadership to occupy 2 cols on md+ screens for editorial asymmetry
            const spanClass = isFeaturedLeader
              ? "sm:col-span-2 lg:col-span-2"
              : "col-span-1";

            return (
              <motion.div
                layout
                key={member.id || member.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                className={`group relative ${spanClass} rounded-[2rem] overflow-hidden bg-[var(--surface-default)] border border-[var(--border-level-1)] hover:border-violet-500/50 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col justify-end`}
                data-testid={`team-card-${member.slug}`}
              >
                <Link
                  href={`/${locale}/b2b/team/${member.slug}`}
                  className="absolute inset-0 z-10"
                  aria-label={`${member.name} - ${member.designation}`}
                >
                  <span className="sr-only">
                    {member.name} - {member.designation}
                  </span>
                </Link>

                {/* 4:5 Aspect Ratio Portrait Container */}
                <div className={`relative w-full ${isFeaturedLeader ? "aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/11]" : "aspect-[4/5]"} overflow-hidden bg-slate-900`}>
                  {member.profileImage ? (
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-focus-within:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/60 via-purple-900/40 to-slate-900 text-white text-5xl font-black">
                      {member.initials}
                    </div>
                  )}

                  {/* Top Badge: Department / Leadership */}
                  <div className="absolute top-4 start-4 z-20 pointer-events-none flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-950/70 backdrop-blur-md text-white border border-white/10 shadow-sm flex items-center gap-1.5">
                      {member.isFeatured && <Sparkles className="w-3 h-3 text-cyan-400" />}
                      <span>{member.presentationGroup || member.department}</span>
                    </span>
                  </div>

                  {/* Top-End Actions: LinkedIn (if available) */}
                  {member.linkedinUrl && (
                    <div className="absolute top-4 end-4 z-30 pointer-events-auto">
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="LinkedIn"
                        className="w-8 h-8 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-cyan-300 hover:scale-110 transition-all shadow-md"
                      >
                        <LinkedinIcon className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Gradient Scrim & Information Layer (Always Visible identity + reveal tagline) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-6 md:p-7 z-20 pointer-events-none">
                    {/* Tagline snippet (shown cleanly without flip) */}
                    {member.tagline && (
                      <p className="text-xs md:text-sm font-medium text-cyan-300 dark:text-cyan-400 line-clamp-1 mb-2 tracking-wide opacity-90 group-hover:opacity-100 transition-opacity">
                        &ldquo;{member.tagline}&rdquo;
                      </p>
                    )}

                    {/* Always-Visible Name */}
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-1 group-hover:text-cyan-200 transition-colors">
                      {member.name}
                    </h3>

                    {/* Always-Visible Designation */}
                    <p className="text-xs sm:text-sm font-semibold text-slate-300 tracking-wide line-clamp-1 mb-3">
                      {member.designation}
                    </p>

                    {/* View Profile Action Bar */}
                    <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs font-bold text-violet-300 group-hover:text-white transition-colors">
                      <span className="inline-flex items-center gap-1.5">
                        <span>{isAr ? "عرض الملف والخبرات" : "View Profile"}</span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""} group-hover:translate-x-1 transition-transform`} />
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {member.yearsOfExperience > 0 ? `${member.yearsOfExperience} ${isAr ? "سنوات خبرة" : "yrs exp"}` : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
