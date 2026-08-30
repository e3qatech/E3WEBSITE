"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  Search,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";
import { E3_JOURNEY_STAGES, mapMemberToStage, getVerifiedHighlight } from "./HowE3WorksJourneySection";
import { cn } from "@/lib/utils";

interface TeamDirectoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  members: SafePublicTeamMember[];
  locale?: string;
}

export function TeamDirectoryDrawer({
  isOpen,
  onClose,
  members,
  locale = "en",
}: TeamDirectoryDrawerProps) {
  const isAr = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input when drawer opens & lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset";
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Compute 6 stage counts + All
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: members.length };
    E3_JOURNEY_STAGES.forEach((s) => {
      counts[s.id] = 0;
    });
    members.forEach((m) => {
      const stage = mapMemberToStage(m);
      if (counts[stage] !== undefined) {
        counts[stage]++;
      }
    });
    return counts;
  }, [members]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 1. Stage filter
      if (selectedStage !== "all") {
        const memberStage = mapMemberToStage(member);
        if (memberStage !== selectedStage) return false;
      }

      // 2. Search query filter (name, designation, department, expertise)
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const nameMatch =
        member.name?.toLowerCase().includes(q) ||
        member.nameEn?.toLowerCase().includes(q) ||
        member.nameAr?.includes(q);
      const designationMatch =
        member.designation?.toLowerCase().includes(q) ||
        member.designationAr?.includes(q);
      const departmentMatch =
        member.department?.toLowerCase().includes(q) ||
        member.departmentAr?.includes(q);
      const tagsMatch =
        Array.isArray(member.expertiseTags) &&
        member.expertiseTags.some((t: string) => typeof t === "string" && t.toLowerCase().includes(q));

      return Boolean(nameMatch || designationMatch || departmentMatch || tagsMatch);
    });
  }, [members, selectedStage, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      data-testid="team-directory-drawer"
      aria-label={isAr ? "دليل جميع أفراد إي ثري" : "All E3 People Directory"}
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className={cn(
          "relative z-10 w-full sm:max-w-xl md:max-w-2xl h-full bg-[#080b12] text-white shadow-2xl border-s border-white/10 flex flex-col transition-transform duration-300",
          isAr ? "border-r border-l-0" : "border-l"
        )}
      >
        {/* DRAWER HEADER */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 bg-[#090c13]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-syne tracking-tight">
                {isAr ? "دليل أفراد وكفاءات إي ثري" : "All E3 People Directory"}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {isAr
                  ? `${filteredMembers.length} من أصل ${members.length} عضو فريق`
                  : `Showing ${filteredMembers.length} of ${members.length} verified specialists`}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            data-testid="drawer-close-btn"
            aria-label={isAr ? "إغلاق الدليل" : "Close directory drawer"}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SEARCH BAR & CONSOLIDATED STAGE FILTERS */}
        <div className="p-4 sm:p-6 space-y-4 border-b border-white/10 bg-[#0b101e]/60 shrink-0">
          {/* Live Search Input */}
          <div className="relative">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "البحث بالاسم، المسمى الوظيفي، أو المهارة..." : "Search by name, designation, or expertise..."}
              data-testid="drawer-search-input"
              className="w-full ps-10 pe-10 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:bg-white/10 text-white placeholder-slate-400 text-xs sm:text-sm font-medium outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={isAr ? "مسح البحث" : "Clear search"}
                className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 6 Consolidated Stage Filter Chips + All */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedStage("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0",
                selectedStage === "all"
                  ? "bg-cyan-500 text-black font-black"
                  : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
              )}
            >
              <span>{isAr ? "الكل" : "All"}</span>
              <span className="ms-1.5 font-mono text-[11px] opacity-80">({stageCounts.all})</span>
            </button>

            {E3_JOURNEY_STAGES.map((s) => {
              const isSelected = selectedStage === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStage(s.id)}
                  data-testid={`drawer-filter-${s.id}`}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0",
                    isSelected
                      ? "bg-cyan-500 text-black font-black"
                      : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  )}
                >
                  <span>{isAr ? s.nameAr : s.nameEn}</span>
                  <span className="ms-1.5 font-mono text-[11px] opacity-80">({stageCounts[s.id] || 0})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* EMPLOYEE ROWS LIST (Scrollable) */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => {
              const displayName = isAr && member.nameAr ? member.nameAr : member.name;
              const displayDesignation = isAr && member.designationAr ? member.designationAr : member.designation;
              const verifiedHighlight = getVerifiedHighlight(member, isAr);
              const stageId = mapMemberToStage(member);
              const stage = E3_JOURNEY_STAGES.find((s) => s.id === stageId) || E3_JOURNEY_STAGES[0];
              const profileUrl = `/${locale}/b2b/team/${member.slug}`;

              return (
                <Link
                  key={member.id || member.slug}
                  href={profileUrl}
                  onClick={onClose}
                  data-testid={`drawer-employee-row-${member.slug}`}
                  className="group p-3.5 sm:p-4 rounded-xl bg-[#0b101e] hover:bg-[#10172a] border border-white/10 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3.5 shadow-sm"
                >
                  {/* Avatar & Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* 4:5 Thumbnail Avatar */}
                    <div className="w-12 h-15 sm:w-14 sm:h-17.5 rounded-lg bg-zinc-950 border border-white/10 overflow-hidden shrink-0 aspect-[4/5] flex items-center justify-center">
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={displayName}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <span className="font-mono font-bold text-xs text-cyan-400">
                          {member.initials}
                        </span>
                      )}
                    </div>

                    {/* Meta Text */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-400 transition-colors truncate font-syne">
                          {displayName}
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 hidden xs:inline"
                          style={{
                            backgroundColor: `${stage.accentColor}20`,
                            color: stage.accentColor,
                          }}
                        >
                          {stage.number} • {isAr ? stage.nameAr : stage.nameEn}
                        </span>
                      </div>

                      <p className="text-xs text-cyan-300/80 font-medium truncate">
                        {displayDesignation}
                      </p>

                      {verifiedHighlight && (
                        <p className="text-[11px] font-mono text-slate-400 truncate mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{verifiedHighlight}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Profile Link Arrow */}
                  <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-cyan-500 text-slate-400 group-hover:text-black flex items-center justify-center shrink-0 transition-all">
                    <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-16 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-bold text-slate-300">
                {isAr ? "لم يتم العثور على أي نتائج تطابق بحثك." : "No team members found matching your search."}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isAr ? "جرّب البحث بكلمات أخرى أو اختر مرحلة أخرى." : "Try adjusting your search terms or filter stage."}
              </p>
            </div>
          )}
        </div>

        {/* DRAWER FOOTER */}
        <div className="p-4 border-t border-white/10 bg-[#090c13] shrink-0 text-center">
          <p className="text-xs text-slate-400 font-mono">
            {isAr
              ? "جميع السجلات مفعلة وموثقة ضمن منظومة إي ثري قطر"
              : "All profiles verified & governed by E3 Qatar experiential standards"}
          </p>
        </div>
      </div>
    </div>
  );
}
