"use client";

import React, { useState, useMemo } from "react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";
import { CinematicPortraitWallHero } from "./CinematicPortraitWallHero";
import { MastermindSpotlightSection } from "./MastermindSpotlightSection";
import { TeamDirectoryToolbar } from "./TeamDirectoryToolbar";
import { UnifiedTeamDirectoryGrid } from "./UnifiedTeamDirectoryGrid";
import { TeamCareersCtaSection } from "./TeamCareersCtaSection";

interface B2BTeamClientProps {
  members: SafePublicTeamMember[];
  locale?: string;
  cmsContent?: any;
}

export function B2BTeamClient({
  members,
  locale = "en",
  cmsContent = {},
}: B2BTeamClientProps) {
  const isAr = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Filter members by department and search query
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 1. Department matching
      const matchesDept =
        selectedDepartment === "all" ||
        member.department === selectedDepartment ||
        member.departmentKey === selectedDepartment ||
        member.presentationGroupKey === selectedDepartment;

      if (!matchesDept) return false;

      // 2. Search query matching (name, designation, department, expertise tags)
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
      const expertiseMatch =
        Array.isArray(member.expertiseTags) &&
        member.expertiseTags.some(
          (tag: string) => typeof tag === "string" && tag.toLowerCase().includes(q)
        );

      return Boolean(nameMatch || designationMatch || departmentMatch || expertiseMatch);
    });
  }, [members, selectedDepartment, searchQuery]);

  // Compute department list with dynamic counts
  const departments = useMemo(() => {
    const map = new Map<string, { key: string; nameEn: string; nameAr: string; count: number }>();
    members.forEach((m) => {
      const key =
        m.departmentKey ||
        (m.department ? m.department.toLowerCase().replace(/[^a-z0-9]/g, "-") : "other");
      const existing = map.get(key);
      if (existing) {
        existing.count++;
      } else {
        map.set(key, {
          key,
          nameEn: m.department || "Specialized",
          nameAr: m.departmentAr || m.department || "العمليات المتخصصة",
          count: 1,
        });
      }
    });
    return Array.from(map.values());
  }, [members]);

  // 5–7 published team members for Hero Portrait Strip
  const featuredMembers = members.filter((m) => m.isFeatured);
  const heroWallMembers = featuredMembers.length >= 5 ? featuredMembers.slice(0, 7) : members.slice(0, 7);

  const careersUrl = cmsContent.primaryCta?.url
    ? cmsContent.primaryCta.url.replace("{locale}", locale)
    : `/${locale}/careers`;

  return (
    <div className="w-full bg-[var(--surface-default)] min-h-screen">
      {/* 1. Hero — Clean 70-80svh Hero with non-overlapping 5-7 3:4 portrait strip */}
      <CinematicPortraitWallHero
        featuredMembers={heroWallMembers}
        locale={locale}
        eyebrowEn={cmsContent.eyebrowEn || cmsContent.hero?.eyebrowEn}
        eyebrowAr={cmsContent.eyebrowAr || cmsContent.hero?.eyebrowAr}
        fixedHeadlineEn={cmsContent.fixedHeadlineEn || cmsContent.titleEn || cmsContent.hero?.fixedHeadlineEn}
        fixedHeadlineAr={cmsContent.fixedHeadlineAr || cmsContent.titleAr || cmsContent.hero?.fixedHeadlineAr}
        rotatingWordsEn={cmsContent.rotatingWordsEn || cmsContent.hero?.rotatingWordsEn}
        rotatingWordsAr={cmsContent.rotatingWordsAr || cmsContent.hero?.rotatingWordsAr}
        descriptionEn={cmsContent.descriptionEn || cmsContent.descEn || cmsContent.hero?.descriptionEn}
        descriptionAr={cmsContent.descriptionAr || cmsContent.descAr || cmsContent.hero?.descriptionAr}
        primaryCtaLabelEn={cmsContent.primaryCta?.labelEn}
        primaryCtaLabelAr={cmsContent.primaryCta?.labelAr}
        primaryCtaUrl={careersUrl}
        secondaryCtaLabelEn={cmsContent.secondaryCta?.labelEn}
        secondaryCtaLabelAr={cmsContent.secondaryCta?.labelAr}
        secondaryCtaUrl={cmsContent.secondaryCta?.url || "#team-directory"}
        animationSpeed={cmsContent.animationSpeed || 2800}
      />

      {/* 2. Featured Mastermind Spotlight (Preserved structure, normalized spacing) */}
      <MastermindSpotlightSection featuredMembers={members} locale={locale} />

      {/* 3. Single Heading above Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 mb-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight">
          {isAr ? "دليل فريق العمل والقيادات" : "The Masterminds Directory"}
        </h2>
      </div>

      {/* 4. Non-sticky Search and Department Filter Toolbar */}
      <TeamDirectoryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={setSelectedDepartment}
        departments={departments}
        totalMembersCount={members.length}
        filteredCount={filteredMembers.length}
        locale={locale}
      />

      {/* 5. Unified Team Directory Grid (Identical 3:4 portrait cards, 4/3/2/1 responsive columns) */}
      <UnifiedTeamDirectoryGrid
        members={filteredMembers}
        locale={locale}
      />

      {/* 6. Careers CTA Section */}
      <TeamCareersCtaSection
        locale={locale}
        primaryUrl={careersUrl}
      />
    </div>
  );
}
