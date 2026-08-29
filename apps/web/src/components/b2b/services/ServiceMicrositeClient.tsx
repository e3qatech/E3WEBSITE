"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { ServiceCmsPayload } from "@/lib/services/canonical-services";
import { getServiceFrameworkLabels } from "@/lib/services/service-labels";
import { ServiceHero } from "./ServiceHero";
import { ServiceWowHowSection } from "./ServiceWowHowSection";
import { ServiceObjectiveSelector } from "./ServiceObjectiveSelector";
import { ServiceCapabilitiesBento } from "./ServiceCapabilitiesBento";
import { ServiceProjectMoment } from "./ServiceProjectMoment";
import { ServiceEngagementModels } from "./ServiceEngagementModels";
import { ServiceDeliverablesRoster } from "./ServiceDeliverablesRoster";
import { ServiceDeliveryLifecycle } from "./ServiceDeliveryLifecycle";
import { ServiceSpecificModule } from "./ServiceSpecificModule";
import { ServiceEnterpriseReadiness } from "./ServiceEnterpriseReadiness";
import { ServiceRelatedSolutions } from "./ServiceRelatedSolutions";
import { ServiceMediaGallery } from "./ServiceMediaGallery";
import { ServiceSectionNavigator } from "./ServiceSectionNavigator";
import { ProjectBriefBuilderModal } from "./ProjectBriefBuilderModal";
import { ServiceFloatingDock } from "./ServiceFloatingDock";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { localizeHref } from "@/lib/url-helper";

interface ServiceMicrositeClientProps {
  serviceRecord: any;
  cmsPayload: ServiceCmsPayload;
  locale: string;
  relatedCaseStudies?: any[];
  relatedServices?: any[];
}

export function ServiceMicrositeClient({
  serviceRecord,
  cmsPayload,
  locale,
  relatedCaseStudies = [],
  relatedServices = [],
}: ServiceMicrositeClientProps) {
  const isAr = locale === "ar";
  const labels = getServiceFrameworkLabels(locale);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [selectedObjectiveForBrief, setSelectedObjectiveForBrief] = useState<string>("");
  const [selectedServicesForBrief, setSelectedServicesForBrief] = useState<string[]>([serviceRecord.slug]);

  const visibility = cmsPayload.sectionVisibility || {};
  const presentation = cmsPayload.presentation || {};
  const deliverablesLayout = presentation.deliverablesLayout || "roster";
  const galleryLayout = presentation.galleryLayout || "grid";

  // Combined gallery from DB relation or CMS payload
  const galleryItems = (serviceRecord?.gallery && serviceRecord.gallery.length > 0)
    ? serviceRecord.gallery
    : (cmsPayload.galleryItems && cmsPayload.galleryItems.length > 0)
    ? cmsPayload.galleryItems
    : [];

  const hasGallery = galleryItems.filter((i: any) => i && i.url && i.isVisible !== false).length > 0;
  const hasCaseStudies = relatedCaseStudies.length > 0;

  // Default section ordering sequence
  const defaultSectionsOrder = [
    "hero",
    "wowHow",
    "objectives",
    "capabilities",
    "projectMoment",
    "engagementModels",
    "deliverables",
    "specialistModule",
    "lifecycle",
    "gallery",
    "caseStudies",
    "enterpriseReadiness",
    "relatedSolutions",
  ];

  const sectionsOrder = (cmsPayload.sectionsOrder && cmsPayload.sectionsOrder.length > 0)
    ? cmsPayload.sectionsOrder
    : defaultSectionsOrder;

  // Render specific section by key
  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "hero":
        if (visibility.hero === false) return null;
        return (
          <ServiceHero
            key="hero"
            serviceRecord={serviceRecord}
            cmsPayload={cmsPayload}
            locale={locale}
            hasCaseStudies={hasCaseStudies}
            onOpenBriefBuilder={() => {
              setSelectedServicesForBrief([serviceRecord.slug]);
              setIsBriefModalOpen(true);
            }}
          />
        );

      case "wowHow":
        if (visibility.wowHow === false || !cmsPayload.wowHow || cmsPayload.wowHow.length === 0) return null;
        return <ServiceWowHowSection key="wowHow" items={cmsPayload.wowHow} locale={locale} />;

      case "objectives":
        if (visibility.objectives === false || !cmsPayload.objectives || cmsPayload.objectives.length === 0) return null;
        return (
          <ServiceObjectiveSelector
            key="objectives"
            objectives={cmsPayload.objectives}
            locale={locale}
            onSelectObjective={(obj) => {
              setSelectedObjectiveForBrief(isAr ? obj.labelAr : obj.labelEn);
              setSelectedServicesForBrief([serviceRecord.slug]);
              setIsBriefModalOpen(true);
            }}
          />
        );

      case "capabilities":
        if (visibility.capabilities === false || !cmsPayload.capabilities || cmsPayload.capabilities.length === 0) return null;
        return (
          <ServiceCapabilitiesBento
            key="capabilities"
            capabilities={cmsPayload.capabilities}
            presentation={presentation}
            locale={locale}
            onOpenBriefWithCapability={(_cap) => {
              setSelectedServicesForBrief([serviceRecord.slug]);
              setIsBriefModalOpen(true);
            }}
          />
        );

      case "projectMoment":
        if (visibility.projectMoment === false) return null;
        return (
          <ServiceProjectMoment
            key="projectMoment"
            moment={cmsPayload.projectMoment}
            fallbackMediaUrl={serviceRecord.heroMediaUrl || serviceRecord.thumbnail}
            fallbackTitleEn={serviceRecord.titleEn}
            fallbackTitleAr={serviceRecord.titleAr}
            locale={locale}
          />
        );

      case "engagementModels":
        if (visibility.engagementModels === false || !cmsPayload.engagementModels || cmsPayload.engagementModels.length === 0) return null;
        return (
          <ServiceEngagementModels
            key="engagementModels"
            models={cmsPayload.engagementModels}
            locale={locale}
            onSelectModel={(_model) => {
              setSelectedServicesForBrief([serviceRecord.slug]);
              setIsBriefModalOpen(true);
            }}
          />
        );

      case "deliverables":
        if (visibility.deliverables === false || !cmsPayload.deliverables || cmsPayload.deliverables.length === 0) return null;
        return (
          <ServiceDeliverablesRoster
            key="deliverables"
            categories={cmsPayload.deliverables}
            layoutVariant={deliverablesLayout}
            locale={locale}
          />
        );

      case "specialistModule":
        if (visibility.specialistModule === false || !cmsPayload.serviceSpecificModule) return null;
        return <ServiceSpecificModule key="specialistModule" moduleConfig={cmsPayload.serviceSpecificModule} locale={locale} />;

      case "lifecycle":
        if (visibility.lifecycle === false || !cmsPayload.lifecycleStages || cmsPayload.lifecycleStages.length === 0) return null;
        return <ServiceDeliveryLifecycle key="lifecycle" stages={cmsPayload.lifecycleStages} locale={locale} />;

      case "gallery":
        if (visibility.gallery === false || !hasGallery) return null;
        return (
          <ServiceMediaGallery
            key="gallery"
            items={galleryItems}
            layout={galleryLayout}
            locale={locale}
          />
        );

      case "caseStudies":
        if (visibility.caseStudies === false || !hasCaseStudies) return null;
        return (
          <section
            key="caseStudies"
            id="case-studies-section"
            className="py-24 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] transition-colors"
          >
            <div className="container mx-auto px-4 md:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{isAr ? "سجل الإنجاز والمشاريع" : "Landmark Proof of Work"}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-3">
                    {isAr ? labels.caseStudiesHeading : labels.caseStudiesHeading}
                  </h2>
                  <p className="text-base text-[var(--text-secondary)] font-medium">
                    {isAr ? labels.caseStudiesSubheading : labels.caseStudiesSubheading}
                  </p>
                </div>

                <Link
                  href={localizeHref("/b2b/case-studies", locale)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
                >
                  <span>{labels.viewAllCaseStudies}</span>
                  <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedCaseStudies.map((study) => {
                  const title = isAr ? study.titleAr || study.titleEn : study.titleEn;
                  const clientName = isAr ? study.clientNameAr || study.clientName || study.clientNameEn : study.clientName || study.clientNameEn;
                  const summary = isAr ? study.summaryAr || study.summaryEn : study.summaryEn;
                  const image = study.thumbnailUrl || study.heroImageUrl || study.thumbnailImage || undefined;

                  return (
                    <Link
                      key={study.id || study.slug}
                      href={localizeHref(`/b2b/case-studies/${study.slug}`, locale)}
                      className="group flex flex-col rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] overflow-hidden shadow-xs hover:border-emerald-500/50 hover:shadow-xl transition-all duration-500"
                    >
                      <div className="relative aspect-[16/10] bg-[var(--surface-raised)] overflow-hidden">
                        {image ? (
                          <UniversalMediaRenderer
                            type={(study.thumbnailMediaType || study.heroMediaType || "IMAGE") as any}
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-emerald-950/20 via-[var(--surface-default)] to-[var(--bg-level-1)]">
                            <Trophy className="w-8 h-8 text-emerald-500/40 mb-2" />
                            <span className="text-xs font-bold text-[var(--text-secondary)]">{title}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                        {clientName && (
                          <span className="absolute bottom-4 start-4 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                            {clientName}
                          </span>
                        )}
                      </div>

                      <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {title}
                          </h3>
                          {summary && (
                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-4 font-medium">
                              {summary}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-[var(--border-level-2)]/60 flex items-center justify-between text-xs font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
                          <span>{labels.readCaseStudy}</span>
                          <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case "enterpriseReadiness":
        if (visibility.enterpriseReadiness === false || !cmsPayload.enterpriseReadiness || cmsPayload.enterpriseReadiness.length === 0) return null;
        return <ServiceEnterpriseReadiness key="enterpriseReadiness" items={cmsPayload.enterpriseReadiness} locale={locale} />;

      case "relatedSolutions":
        if (visibility.relatedSolutions === false) return null;
        return (
          <ServiceRelatedSolutions
            key="relatedSolutions"
            relatedSlugs={cmsPayload.relatedServiceSlugs}
            relatedServices={relatedServices}
            locale={locale}
            onOpenBriefWithService={(relSlug) => {
              setSelectedServicesForBrief([serviceRecord.slug, relSlug]);
              setIsBriefModalOpen(true);
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="flex flex-col w-full bg-[var(--bg-level-1)] text-[var(--text-primary)] min-h-screen transition-colors selection:bg-emerald-500 selection:text-white"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* 1. HERO (Always first before sticky in-page navigator) */}
      {renderSection("hero")}

      {/* 2. IN-PAGE STICKY SECTION NAVIGATOR */}
      <ServiceSectionNavigator
        locale={locale}
        hasCaseStudies={hasCaseStudies}
        hasGallery={hasGallery}
        onOpenBriefBuilder={() => {
          setSelectedServicesForBrief([serviceRecord.slug]);
          setIsBriefModalOpen(true);
        }}
      />

      {/* 3. DYNAMICALLY ORDERED BODY SECTIONS */}
      {sectionsOrder
        .filter((key) => key !== "hero")
        .map((sectionKey) => renderSection(sectionKey))}

      {/* PROJECT BRIEF BUILDER MODAL */}
      <ProjectBriefBuilderModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        initialServiceRecord={serviceRecord}
        initialCmsPayload={cmsPayload}
        initialObjective={selectedObjectiveForBrief}
        initialSelectedServices={selectedServicesForBrief}
        locale={locale}
      />

      {/* RESTING FLOATING DOCK */}
      <ServiceFloatingDock
        locale={locale}
        onOpenBriefBuilder={() => {
          setSelectedServicesForBrief([serviceRecord.slug]);
          setIsBriefModalOpen(true);
        }}
      />
    </div>
  );
}
