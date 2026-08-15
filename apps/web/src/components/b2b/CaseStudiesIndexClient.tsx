"use client";

import React, { useMemo } from "react";
import { isCaseStudyEligible } from "@/lib/case-studies";
import { CaseStudiesHero } from "@/components/b2b/cases/landing/CaseStudiesHero";
import { FeaturedProjectSpotlight } from "@/components/b2b/cases/landing/FeaturedProjectSpotlight";
import { ImpactStoriesStream, ImpactStoryItem } from "@/components/b2b/cases/landing/ImpactStoriesStream";
import { CaseStudyArchiveGrid, CaseStudyCardItem } from "@/components/b2b/cases/landing/CaseStudyArchiveGrid";
import { BeforeAfterTransformationStage } from "@/components/b2b/cases/landing/BeforeAfterTransformationStage";
import { BehindTheBuildTeam } from "@/components/b2b/cases/landing/BehindTheBuildTeam";
import { CaseStudiesCommercialCta } from "@/components/b2b/cases/landing/CaseStudiesCommercialCta";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";

export interface CaseStudiesIndexClientProps {
  caseStudies: CaseStudyCardItem[];
  services?: any[];
  employeeProfiles?: any[];
  cmsContent: any;
  locale: string;
}

export function CaseStudiesIndexClient({
  caseStudies,
  services: _services = [],
  employeeProfiles = [],
  cmsContent,
  locale,
}: CaseStudiesIndexClientProps) {
  const isAr = locale === "ar";

  // CMS Section configurations
  const hero = cmsContent?.hero || {};
  const showreel = cmsContent?.showreel || {};
  const factStream = useMemo(() => cmsContent?.factStream || {}, [cmsContent?.factStream]);
  const featuredCasesConfig = useMemo(() => cmsContent?.featuredCases || {}, [cmsContent?.featuredCases]);
  const archiveConfig = cmsContent?.archive || {};
  const transformationsConfig = cmsContent?.transformations || {};
  const teamStoriesConfig = cmsContent?.teamStories || {};
  const cta = cmsContent?.cta || {};

  // Canonical Eligible Case Studies Pool (QF-05 / UX-05)
  const eligibleCases = useMemo(() => {
    return (caseStudies || []).filter(isCaseStudyEligible);
  }, [caseStudies]);

  // Sourced Featured Case Study for Spotlight
  const featuredProject = useMemo(() => {
    if (featuredCasesConfig.enabled === false) return null;

    if (
      featuredCasesConfig.selectionMode === "MANUAL" &&
      Array.isArray(featuredCasesConfig.selectedCaseStudyIds) &&
      featuredCasesConfig.selectedCaseStudyIds.length > 0
    ) {
      const targetId = String(featuredCasesConfig.selectedCaseStudyIds[0]);
      const found = eligibleCases.find((cs) => String(cs.id) === targetId);
      if (found) return found;
    }

    // Default: first item marked isFeatured: true, or first eligible case
    const featured = eligibleCases.find((cs) => cs.isFeatured);
    return featured || eligibleCases[0] || null;
  }, [eligibleCases, featuredCasesConfig]);

  // Extract Fact Stream Items from published case studies' metrics
  const extractedFacts: ImpactStoryItem[] = useMemo(() => {
    if (factStream.enabled === false) return [];

    let pool = [...eligibleCases];

    if (
      factStream.displayOrder === "MANUAL" &&
      Array.isArray(factStream.selectedCaseStudyIds) &&
      factStream.selectedCaseStudyIds.length > 0
    ) {
      const set = new Set(factStream.selectedCaseStudyIds.map(String));
      pool = pool.filter((cs) => set.has(String(cs.id)));
    } else if (factStream.displayOrder === "NEWEST_FIRST") {
      pool = [...pool].sort((a, b) => (b.year || 0) - (a.year || 0));
    } else {
      // FEATURED_FIRST default
      pool = [...pool].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    const factsList: ImpactStoryItem[] = [];

    pool.forEach((cs) => {
      const metricsArr = Array.isArray(cs.metrics) ? cs.metrics : [];
      metricsArr.forEach((m: any, idx: number) => {
        const val = m.valueEn || m.value || m.val || "";
        const labelEn = m.labelEn || m.label || "";
        const labelAr = m.labelAr || m.label || labelEn;

        if (val && (labelEn || labelAr)) {
          factsList.push({
            id: `${cs.id}_metric_${idx}`,
            caseStudyId: cs.id,
            caseStudyTitleEn: cs.titleEn,
            caseStudyTitleAr: cs.titleAr || cs.titleEn,
            caseStudySlug: cs.slug,
            caseStudyMedia: cs.heroImageUrl || cs.thumbnailUrl || "",
            value: String(val),
            prefix: m.prefix || "",
            suffix: m.suffix || "",
            headlineEn: labelEn,
            headlineAr: labelAr,
            descEn: m.descEn || m.descriptionEn || cs.titleEn,
            descAr: m.descAr || m.descriptionAr || cs.titleAr || cs.titleEn,
          });
        }
      });
    });

    const maxLimit = Number(factStream.maxFacts) || 8;
    return factsList.slice(0, maxLimit);
  }, [eligibleCases, factStream]);

  return (
    <div
      className="flex flex-col w-full min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* 1. Cinematic Hero Section with live count */}
      <CaseStudiesHero
        hero={hero}
        totalDeliveredCount={eligibleCases.length}
        locale={locale}
      />

      {/* 2. Interactive Showreel (When Configured) */}
      {showreel.enabled !== false && showreel.mediaUrl && (
        <section className="py-20 bg-zinc-950 border-b border-zinc-900 relative">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/40 backdrop-blur-md relative group shadow-2xl">
              <UniversalMediaRenderer
                type={
                  (showreel.mediaType as any) ||
                  (showreel.mediaUrl?.includes("youtube.com") || showreel.mediaUrl?.includes("youtu.be")
                    ? "YOUTUBE"
                    : showreel.mediaUrl?.includes("vimeo.com")
                    ? "VIMEO"
                    : "VIDEO")
                }
                src={showreel.mediaUrl}
                poster={showreel.posterImage}
                autoPlay={showreel.autoplay !== false}
                muted={showreel.muted !== false}
                loop
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12 pointer-events-none">
                <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest mb-2">
                  {isAr ? showreel.eyebrowAr || "عرض مرئي استثنائي" : showreel.eyebrowEn || "CINEMATIC SHOWCASE"}
                </div>
                <h2 className="text-3xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight">
                  {isAr ? showreel.titleAr || "نظرة إلى التجارب التي نصنعها" : showreel.titleEn || "A Glimpse Inside the Experiences We Build"}
                </h2>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Featured Project Spotlight Section */}
      <FeaturedProjectSpotlight
        config={featuredCasesConfig}
        featuredProject={featuredProject}
        locale={locale}
      />

      {/* 4. Impact Stories Stream Carousel ("Did You Know?") */}
      <ImpactStoriesStream
        config={factStream}
        facts={extractedFacts}
        locale={locale}
      />

      {/* 5. Project Archive Grid with Filters & Instant Search */}
      <CaseStudyArchiveGrid
        config={archiveConfig}
        caseStudies={eligibleCases}
        locale={locale}
      />

      {/* 6. Before & After Transformations Stage (Isolated Slider States) */}
      <BeforeAfterTransformationStage
        config={transformationsConfig}
        locale={locale}
      />

      {/* 7. Behind the Build (Team Spotlight & Stories) */}
      <BehindTheBuildTeam
        config={teamStoriesConfig}
        caseStudies={eligibleCases}
        employeeProfiles={employeeProfiles}
        locale={locale}
      />

      {/* 8. Commercial Final CTA */}
      <CaseStudiesCommercialCta
        cta={cta}
        locale={locale}
      />
    </div>
  );
}
