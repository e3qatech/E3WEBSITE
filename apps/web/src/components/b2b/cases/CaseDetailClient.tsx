"use client";

import React, { useState } from "react";
import { CaseStudyPresentation } from "@/lib/case-studies/case-adapters";
import { CinematicCaseHero } from "./CinematicCaseHero";
import { ProjectIdentityBar } from "./ProjectIdentityBar";
import { TransformationNarrative } from "./TransformationNarrative";
import { ImpactMetricsGrid } from "./ImpactMetricsGrid";
import { CaseScopeTimeline } from "./CaseScopeTimeline";
import { CaseBeforeAfterSlider } from "./CaseBeforeAfterSlider";
import { LinkedAttractionFeature } from "./LinkedAttractionFeature";
import { CaseGalleryJourney } from "./CaseGalleryJourney";
import { ProjectTeamSection } from "./ProjectTeamSection";
import { CaseTestimonialsSection } from "./CaseTestimonialsSection";
import { CaseRelatedServices } from "./CaseRelatedServices";
import { NextProjectTransition } from "./NextProjectTransition";
import { CaseDetailFloatingDock } from "./CaseDetailFloatingDock";
import { ProjectBriefBuilderModal } from "../services/ProjectBriefBuilderModal";

interface CaseDetailClientProps {
  caseStudy: CaseStudyPresentation;
  nextProject?: any;
  locale: string;
}

export function CaseDetailClient({
  caseStudy,
  nextProject,
  locale,
}: CaseDetailClientProps) {
  const isAr = locale === "ar";
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [selectedDisciplineForBrief, setSelectedDisciplineForBrief] = useState<string[]>(
    caseStudy.relatedServiceSlugs || []
  );

  const handleOpenBriefWithDiscipline = (slug: string) => {
    setSelectedDisciplineForBrief((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    setIsBriefModalOpen(true);
  };

  return (
    <main
      className="min-h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] transition-colors duration-300"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* 1. Cinematic Hero with Dynamic Media, Client Badge & Live Stats */}
      <CinematicCaseHero
        locale={locale}
        title={isAr ? caseStudy.titleAr : caseStudy.titleEn}
        clientName={caseStudy.clientName}
        category={caseStudy.category}
        year={caseStudy.year}
        heroMediaType={caseStudy.heroMediaType}
        heroImageUrl={caseStudy.heroImageUrl}
        thumbnailMediaType={caseStudy.thumbnailMediaType}
        thumbnailUrl={caseStudy.thumbnailUrl}
        clientLogoUrl={caseStudy.clientLogoUrl}
        isFeatured={caseStudy.isFeatured}
        attraction={caseStudy.attraction}
      />

      {/* 2. Project Quick Identity Bar */}
      <ProjectIdentityBar
        locale={locale}
        clientName={caseStudy.clientName}
        category={caseStudy.category}
        year={caseStudy.year}
        isFeatured={caseStudy.isFeatured}
        attraction={caseStudy.attraction}
        hasChallenge={Boolean(caseStudy.challengeEn || caseStudy.challengeAr)}
        hasSolution={Boolean(caseStudy.solutionEn || caseStudy.solutionAr)}
        hasResult={Boolean(caseStudy.resultEn || caseStudy.resultAr)}
        hasImpact={caseStudy.metrics.length > 0}
        hasGallery={caseStudy.gallery.length > 0}
        hasTeam={caseStudy.teamMembers.length > 0}
        hasTestimonials={caseStudy.testimonials.length > 0}
      />

      {/* 3. Challenge, Solution & Execution Narrative */}
      <TransformationNarrative
        locale={locale}
        challengeText={isAr ? caseStudy.challengeAr : caseStudy.challengeEn}
        solutionText={isAr ? caseStudy.solutionAr : caseStudy.solutionEn}
        resultText={isAr ? caseStudy.resultAr : caseStudy.resultEn}
        heroImageUrl={caseStudy.heroImageUrl}
        heroMediaType={caseStudy.heroMediaType}
        thumbnailUrl={caseStudy.thumbnailUrl}
        galleryMedia={caseStudy.gallery}
      />

      {/* 4. Verified Impact Metrics & KPIs Grid */}
      {caseStudy.metrics && caseStudy.metrics.length > 0 && (
        <ImpactMetricsGrid metrics={caseStudy.metrics} locale={locale} />
      )}

      {/* 5. Turnkey Scope & Phased Delivery Timeline */}
      <CaseScopeTimeline
        scope={caseStudy.scopeTimeline}
        locale={locale}
        onOpenBriefWithDiscipline={handleOpenBriefWithDiscipline}
      />

      {/* 6. Before / After Spatial Transformation Slider */}
      {caseStudy.beforeAfter && (
        <CaseBeforeAfterSlider
          beforeAfter={caseStudy.beforeAfter}
          locale={locale}
        />
      )}

      {/* 7. Linked Public Attraction (When connected) */}
      {caseStudy.attraction && (
        <LinkedAttractionFeature
          attraction={caseStudy.attraction}
          locale={locale}
        />
      )}

      {/* 8. Curated Media Gallery & Transformation Journey */}
      {caseStudy.gallery && caseStudy.gallery.length > 0 && (
        <CaseGalleryJourney
          gallery={caseStudy.gallery}
          locale={locale}
        />
      )}

      {/* 9. Behind the Build: Leadership & Engineering Team */}
      {caseStudy.teamMembers && caseStudy.teamMembers.length > 0 && (
        <ProjectTeamSection
          teamMembers={caseStudy.teamMembers}
          locale={locale}
        />
      )}

      {/* 10. Client Testimonials & Partner Verification */}
      {caseStudy.testimonials && caseStudy.testimonials.length > 0 && (
        <CaseTestimonialsSection
          testimonials={caseStudy.testimonials}
          locale={locale}
        />
      )}

      {/* 11. Integrated Related Services & Cross-links */}
      {caseStudy.relatedServiceSlugs && caseStudy.relatedServiceSlugs.length > 0 && (
        <CaseRelatedServices
          serviceSlugs={caseStudy.relatedServiceSlugs}
          locale={locale}
          onOpenBriefWithService={handleOpenBriefWithDiscipline}
        />
      )}

      {/* 12. Next Project Transition Stage */}
      {nextProject && (
        <NextProjectTransition
          nextProject={nextProject}
          locale={locale}
        />
      )}

      {/* 13. Floating Action Dock for Brief Building */}
      <CaseDetailFloatingDock
        locale={locale}
        onOpenBriefBuilder={() => setIsBriefModalOpen(true)}
      />

      {/* 14. Project Brief Builder Modal */}
      <ProjectBriefBuilderModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        selectedServices={selectedDisciplineForBrief}
        locale={locale}
      />
    </main>
  );
}
