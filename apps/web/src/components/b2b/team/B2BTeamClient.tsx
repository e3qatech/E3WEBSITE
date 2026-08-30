"use client";

import React, { useState } from "react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";
import { CinematicPortraitWallHero } from "./CinematicPortraitWallHero";
import { MastermindSpotlightSection } from "./MastermindSpotlightSection";
import { HowE3WorksJourneySection } from "./HowE3WorksJourneySection";
import { TeamDirectoryDrawer } from "./TeamDirectoryDrawer";
import { PeopleProjectsSection, CaseStudyWithMetricsAndTeam } from "./PeopleProjectsSection";
import { TeamCareersCtaSection } from "./TeamCareersCtaSection";

interface B2BTeamClientProps {
  members: SafePublicTeamMember[];
  caseStudies?: CaseStudyWithMetricsAndTeam[];
  locale?: string;
  cmsContent?: any;
}

export function B2BTeamClient({
  members,
  caseStudies = [],
  locale = "en",
  cmsContent = {},
}: B2BTeamClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 5–7 published team members for Hero Portrait Strip / Spotlight
  const featuredMembers = members.filter((m) => m.isFeatured);
  const spotlightMembers = featuredMembers.length >= 3 ? featuredMembers : members;

  const careersUrl = cmsContent.primaryCta?.url
    ? cmsContent.primaryCta.url.replace("{locale}", locale)
    : `/${locale}/b2b/careers`;

  return (
    <div className="w-full bg-[#080b12] text-white min-h-screen">
      {/* 1. Hero — Clean Editorial Hero with Approved Copy & Atmospheric Media */}
      <CinematicPortraitWallHero
        featuredMembers={spotlightMembers.slice(0, 7)}
        locale={locale}
        eyebrowEn={cmsContent.eyebrowEn || cmsContent.hero?.eyebrowEn}
        eyebrowAr={cmsContent.eyebrowAr || cmsContent.hero?.eyebrowAr}
        fixedHeadlineEn={cmsContent.fixedHeadlineEn || cmsContent.titleEn || cmsContent.hero?.fixedHeadlineEn}
        fixedHeadlineAr={cmsContent.fixedHeadlineAr || cmsContent.titleAr || cmsContent.hero?.fixedHeadlineAr}
        headlineTemplateEn={cmsContent.headlineTemplateEn || cmsContent.hero?.headlineTemplateEn}
        headlineTemplateAr={cmsContent.headlineTemplateAr || cmsContent.hero?.headlineTemplateAr}
        rotatingWordsEn={cmsContent.rotatingWordsEn || cmsContent.hero?.rotatingWordsEn}
        rotatingWordsAr={cmsContent.rotatingWordsAr || cmsContent.hero?.rotatingWordsAr}
        descriptionEn={cmsContent.descriptionEn || cmsContent.descEn || cmsContent.hero?.descriptionEn}
        descriptionAr={cmsContent.descriptionAr || cmsContent.descAr || cmsContent.hero?.descriptionAr}
        primaryCtaLabelEn={cmsContent.primaryCta?.labelEn}
        primaryCtaLabelAr={cmsContent.primaryCta?.labelAr}
        primaryCtaUrl="#how-e3-works"
        secondaryCtaLabelEn={cmsContent.secondaryCta?.labelEn}
        secondaryCtaLabelAr={cmsContent.secondaryCta?.labelAr}
        secondaryCtaUrl={careersUrl}
        animationSpeed={cmsContent.animationSpeed || cmsContent.hero?.animationSpeed || 2800}
        heroMedia={cmsContent.heroMedia || cmsContent.hero?.heroMedia || cmsContent.hero?.media || cmsContent.media}
        media={cmsContent.heroMedia || cmsContent.hero?.heroMedia || cmsContent.hero?.media || cmsContent.media}
      />

      {/* 2. Featured Mastermind Spotlight (Refined bio, 4:5 portraits, accessible controls) */}
      <MastermindSpotlightSection
        featuredMembers={spotlightMembers}
        locale={locale}
      />

      {/* 3. HOW E3 WORKS: FROM BRIEF TO LIVE EXPERIENCE (6 connected stages with sticky navigator & vertical journey) */}
      <HowE3WorksJourneySection
        members={members}
        locale={locale}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* 4. Secondary "View All E3 People" Drawer (Live search, 6 consolidated filters, compact rows) */}
      <TeamDirectoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        members={members}
        locale={locale}
      />

      {/* 5. PEOPLE × PROJECTS - BUILT TOGETHER. PROVEN LIVE. (Up to 3 case studies with verified metrics & team members) */}
      <PeopleProjectsSection
        caseStudies={caseStudies}
        locale={locale}
      />

      {/* 6. Careers CTA Section (Updated copy: BUILD THE NEXT EXPERIENCE WITH US) */}
      <TeamCareersCtaSection
        locale={locale}
        primaryUrl={careersUrl}
      />
    </div>
  );
}
