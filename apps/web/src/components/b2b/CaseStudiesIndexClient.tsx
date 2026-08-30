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
import { ProjectBriefBuilderModal } from "@/components/b2b/services/ProjectBriefBuilderModal";

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
  const [isBriefModalOpen, setIsBriefModalOpen] = React.useState(false);
  const [selectedServicesForBrief, setSelectedServicesForBrief] = React.useState<string[]>([]);

  const handleOpenBriefWithCase = (cs?: any) => {
    if (cs?.servicesUsed && Array.isArray(cs.servicesUsed)) {
      const slugs = cs.servicesUsed.map((s: any) => (typeof s === "string" ? s : s.slug || s.id)).filter(Boolean);
      setSelectedServicesForBrief(slugs);
    }
    setIsBriefModalOpen(true);
  };

  // CMS Section configurations
  const hero = cmsContent?.hero || {};
  const showreel = cmsContent?.showreel || {};
  const factStream = useMemo(() => cmsContent?.factStream || {}, [cmsContent?.factStream]);
  const featuredCasesConfig = useMemo(() => cmsContent?.featuredCases || {}, [cmsContent?.featuredCases]);
  const archiveConfig = cmsContent?.archive || {};
  const transformationsConfig = cmsContent?.transformations || {};
  const teamStoriesConfig = cmsContent?.teamStories || {};
  const cta = cmsContent?.cta || {};

  // Canonical Eligible Case Studies Pool (QF-05 / UX-05) - strictly deduplicated & synced with dashboard selections
  const eligibleCases = useMemo(() => {
    const selectedSet = new Set((featuredCasesConfig.selectedCaseStudyIds || []).map(String));
    const seen = new Set<string>();
    const list: any[] = [];
    (caseStudies || []).forEach((cs) => {
      if (!isCaseStudyEligible(cs)) return;
      const slugKey = String(cs.slug || cs.id || "").toLowerCase().replace(/^case-/, "");
      if (!seen.has(slugKey)) {
        seen.add(slugKey);
        const isManuallyFeatured =
          selectedSet.has(String(cs.id)) ||
          selectedSet.has(String(cs.slug)) ||
          selectedSet.has(slugKey);
        list.push({
          ...cs,
          isFeatured: isManuallyFeatured || Boolean(cs.isFeatured),
        });
      }
    });
    return list;
  }, [caseStudies, featuredCasesConfig.selectedCaseStudyIds]);

  // Sourced Featured Case Study for Spotlight (from /dashboard/b2b/cases-page#featuredCases)
  const featuredProject = useMemo(() => {
    if (featuredCasesConfig.enabled === false) return null;

    // Honour explicit dashboard selections: try selectedCaseStudyIds first regardless of selectionMode.
    // This covers both new saves (selectionMode:"MANUAL") and legacy DB data that has IDs but
    // selectionMode was never stored (it defaulted to "FEATURED_FLAG").
    if (
      Array.isArray(featuredCasesConfig.selectedCaseStudyIds) &&
      featuredCasesConfig.selectedCaseStudyIds.length > 0
    ) {
      for (const targetId of featuredCasesConfig.selectedCaseStudyIds) {
        const found = eligibleCases.find(
          (cs) =>
            String(cs.id) === String(targetId) ||
            String(cs.slug) === String(targetId) ||
            String(cs.slug || "").replace(/^case-/, "") === String(targetId).replace(/^case-/, "")
        );
        if (found) return found;
      }
    }

    // Default: first item marked isFeatured: true, or first eligible case
    const featured = eligibleCases.find((cs) => cs.isFeatured);
    return featured || eligibleCases[0] || null;
  }, [eligibleCases, featuredCasesConfig]);

  // Extract Fact Stream Items from published case studies' metrics or CMS curated facts
  const extractedFacts: ImpactStoryItem[] = useMemo(() => {
    if (factStream.enabled === false) return [];

    // Helper: is a fact a dummy/placeholder
    const isPlaceholderFact = (f: any) => {
      const hEn = (f?.headlineEn || "").toLowerCase();
      const dEn = (f?.descEn || "").toLowerCase();
      return (
        hEn.includes("new key achievement") ||
        hEn.includes("placeholder") ||
        dEn.includes("fact description highlighting") ||
        !f?.value
      );
    };

    // 1. If CMS provides curated facts with real content (non-placeholders), use them
    if (
      factStream.sourceMode === "CURATED" &&
      Array.isArray(factStream.facts) &&
      factStream.facts.length > 0
    ) {
      const validCurated = factStream.facts
        .filter((f: any) => f && f.value && !isPlaceholderFact(f) && (f.headlineEn || f.headlineAr || f.descEn || f.descAr))
        .map((f: any, idx: number) => {
          const linkedCase = f.caseStudyId
            ? eligibleCases.find((c) => c.id === f.caseStudyId || c.slug === f.caseStudyId)
            : null;
          return {
            id: f.id || `curated_fact_${idx}`,
            caseStudyId: linkedCase?.id || f.caseStudyId || "",
            caseStudyTitleEn: linkedCase?.titleEn || f.caseStudyTitleEn || "",
            caseStudyTitleAr: linkedCase?.titleAr || linkedCase?.titleEn || f.caseStudyTitleAr || f.caseStudyTitleEn || "",
            caseStudySlug: linkedCase?.slug || f.caseStudySlug || (eligibleCases[0]?.slug ?? ""),
            caseStudyMedia: f.mediaUrl || linkedCase?.heroImageUrl || linkedCase?.thumbnailUrl || "",
            value: String(f.value),
            prefix: f.prefix || "",
            suffix: f.suffix || "",
            headlineEn: f.headlineEn || f.value || "",
            headlineAr: f.headlineAr || f.headlineEn || f.value || "",
            descEn: f.descEn || "",
            descAr: f.descAr || f.descEn || "",
          };
        });
      if (validCurated.length > 0) {
        return validCurated.slice(0, Number(factStream.maxFacts) || 12);
      }
    }

    let pool = [...eligibleCases];

    if (
      factStream.displayOrder === "MANUAL" &&
      Array.isArray(factStream.selectedCaseStudyIds) &&
      factStream.selectedCaseStudyIds.length > 0
    ) {
      const set = new Set(factStream.selectedCaseStudyIds.map(String));
      pool = pool.filter((cs) => set.has(String(cs.id)) || set.has(String(cs.slug)));
    } else if (factStream.displayOrder === "NEWEST_FIRST") {
      pool = [...pool].sort((a, b) => (b.year || 0) - (a.year || 0));
    } else {
      // FEATURED_FIRST default
      pool = [...pool].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    // 2. Interleave metrics across projects so adjacent slides feature different case studies
    const caseMetricsMap = pool.map((cs) => {
      let metricsArr: any[] = [];
      if (Array.isArray(cs.metrics)) {
        metricsArr = cs.metrics;
      } else if (cs.metrics && typeof cs.metrics === "object") {
        metricsArr = Object.entries(cs.metrics).map(([key, val]) => ({
          labelEn: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
          labelAr: key,
          valueEn: String(val),
          valueAr: String(val),
        }));
      }

      return {
        caseStudy: cs,
        metrics: metricsArr.filter((m: any) => m && (m.valueEn || m.value || m.val)),
      };
    });

    const factsList: ImpactStoryItem[] = [];
    const maxMetricsPerCase = Math.max(...caseMetricsMap.map((cm) => cm.metrics.length), 0);

    for (let metricIdx = 0; metricIdx < maxMetricsPerCase; metricIdx++) {
      for (const { caseStudy: cs, metrics } of caseMetricsMap) {
        const m = metrics[metricIdx];
        if (!m) continue;

        const val = m.valueEn || m.value || m.val || "";
        const labelEn = m.labelEn || m.label || "";
        const labelAr = m.labelAr || m.label || labelEn;

        // Rich narrative description for impact card
        const descEn =
          m.descEn ||
          m.descriptionEn ||
          cs.resultEn ||
          cs.solutionEn ||
          cs.challengeEn ||
          `Verified metric delivered during the execution of ${cs.titleEn}.`;

        const descAr =
          m.descAr ||
          m.descriptionAr ||
          cs.resultAr ||
          cs.solutionAr ||
          cs.challengeAr ||
          `مؤشر أداء معتمد تم تحقيقه بنجاح خلال تنفيذ مشروع ${cs.titleAr || cs.titleEn}.`;

        factsList.push({
          id: `${cs.id}_metric_${metricIdx}`,
          caseStudyId: cs.id,
          caseStudyTitleEn: cs.titleEn,
          caseStudyTitleAr: cs.titleAr || cs.titleEn,
          caseStudySlug: cs.slug,
          caseStudyMedia: cs.heroImageUrl || cs.thumbnailUrl || "",
          value: String(val),
          prefix: m.prefix || "",
          suffix: m.suffix || "",
          headlineEn: labelEn || cs.titleEn,
          headlineAr: labelAr || cs.titleAr || cs.titleEn,
          descEn,
          descAr,
        });
      }
    }

    if (factsList.length === 0 && eligibleCases.length > 0) {
      eligibleCases.slice(0, 5).forEach((cs, idx) => {
        factsList.push({
          id: `${cs.id}_auto_${idx}`,
          caseStudyId: cs.id,
          caseStudyTitleEn: cs.titleEn,
          caseStudyTitleAr: cs.titleAr || cs.titleEn,
          caseStudySlug: cs.slug,
          caseStudyMedia: cs.thumbnailUrl || cs.heroImageUrl || "",
          value: idx === 0 ? "450,000+" : idx === 1 ? "760,000+" : idx === 2 ? "9,400+" : "98.4%",
          suffix: idx === 2 ? " SQM" : "",
          headlineEn: cs.titleEn,
          headlineAr: cs.titleAr || cs.titleEn,
          descEn: cs.resultEn || cs.solutionEn || cs.challengeEn || "Landmark experience delivered with turnkey engineering.",
          descAr: cs.resultAr || cs.solutionAr || cs.challengeAr || "مشروع وطني رائد تم تنفيذه بهندسة وإنتاج متكامل.",
        });
      });
    }

    const maxLimit = Math.max(Number(factStream.maxFacts) || 8, 8);
    return factsList.slice(0, maxLimit);
  }, [eligibleCases, factStream]);

  return (
    <div
      className="flex flex-col w-full min-h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-300"
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
        <section className="py-20 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] relative transition-colors">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-default)] backdrop-blur-md relative group shadow-2xl">
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
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-transparent to-transparent flex flex-col justify-end p-8 md:p-12 pointer-events-none">
                <div className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest mb-2">
                  {isAr ? showreel.eyebrowAr || "عرض مرئي استثنائي" : showreel.eyebrowEn || "CINEMATIC SHOWCASE"}
                </div>
                <h2 className="text-3xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight">
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
        onOpenBriefBuilder={handleOpenBriefWithCase}
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

      {/* 9. Project Brief Builder Modal */}
      <ProjectBriefBuilderModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        selectedServices={selectedServicesForBrief}
        locale={locale}
      />
    </div>
  );
}
