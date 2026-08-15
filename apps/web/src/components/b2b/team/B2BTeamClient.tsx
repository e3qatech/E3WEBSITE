"use client";

import React, { useState } from "react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";
import { HumanConstellationHero } from "./HumanConstellationHero";
import { DepartmentNavigator } from "./DepartmentNavigator";
import { EditorialTeamGrid } from "./EditorialTeamGrid";
import { FeaturedMemberStory } from "./FeaturedMemberStory";

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
  const [activeGroupKey, setActiveGroupKey] = useState("all");

  // Filter members by presentation group
  const filteredMembers =
    activeGroupKey === "all"
      ? members
      : members.filter((m) => (m.presentationGroupKey || "events-production") === activeGroupKey);

  // Extract featured members for Constellation Hero (5 max) and Story Carousel
  const featuredMembers = members.filter((m) => m.isFeatured);
  const heroFeatured = featuredMembers.length >= 3 ? featuredMembers : members.slice(0, 5);

  return (
    <div className="w-full bg-[var(--surface-default)] min-h-screen">
      {/* 1. Human Constellation Hero */}
      <HumanConstellationHero
        featuredMembers={heroFeatured}
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
        primaryCtaUrl={cmsContent.primaryCta?.url ? cmsContent.primaryCta.url.replace("{locale}", locale) : `/${locale}/careers`}
        secondaryCtaLabelEn={cmsContent.secondaryCta?.labelEn}
        secondaryCtaLabelAr={cmsContent.secondaryCta?.labelAr}
        secondaryCtaUrl={cmsContent.secondaryCta?.url || "#department-navigator"}
        animationSpeed={cmsContent.animationSpeed || 2800}
      />

      {/* 2. Department Navigator (Sticky Filter Rail) */}
      <DepartmentNavigator
        members={members}
        activeGroupKey={activeGroupKey}
        onSelectGroup={setActiveGroupKey}
        locale={locale}
      />

      {/* 3. Main Body Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Section Heading */}
        <div className="mb-10 md:mb-14 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-2">
              {isAr ? "العقول المدبرة — الدليل القيادي والهندسي" : "The Masterminds — Engineering & Creative Roster"}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium">
              {isAr
                ? "تعرف على المهندسين والمبدعين والمخططين الذين يجعلون المستحيل ممكناً كل يوم."
                : "Meet the engineers, creatives, and tacticians who make the impossible happen every day."}
            </p>
          </div>
          <div className="text-xs font-bold text-[var(--text-tertiary)] px-3 py-1.5 rounded-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)]">
            {filteredMembers.length} {isAr ? "عضو معتمد" : "specialists"}
          </div>
        </div>

        {/* 4. Editorial Team Grid */}
        <EditorialTeamGrid members={filteredMembers} locale={locale} />

        {/* 5. Featured Member Story Spotlight */}
        <FeaturedMemberStory featuredMembers={members} locale={locale} />
      </div>
    </div>
  );
}
