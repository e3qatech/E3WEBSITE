"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { CanonicalService } from "@/lib/services/canonical-services";
import { ServiceHero } from "./ServiceHero";
import { ServiceMediaGallery } from "./ServiceMediaGallery";
import { ServiceWowHowSection } from "./ServiceWowHowSection";
import { ServiceObjectiveSelector } from "./ServiceObjectiveSelector";
import { ServiceCapabilitiesBento } from "./ServiceCapabilitiesBento";
import { ServiceEngagementModels } from "./ServiceEngagementModels";
import { ServiceDeliverablesRoster } from "./ServiceDeliverablesRoster";
import { ServiceDeliveryLifecycle } from "./ServiceDeliveryLifecycle";
import { ServiceSpecificModule } from "./ServiceSpecificModule";
import { ServiceEnterpriseReadiness } from "./ServiceEnterpriseReadiness";
import { ServiceRelatedSolutions } from "./ServiceRelatedSolutions";
import { ProjectBriefBuilderModal } from "./ProjectBriefBuilderModal";
import { ServiceFloatingDock } from "./ServiceFloatingDock";
import { localizeHref } from "@/lib/url-helper";

interface ServiceMicrositeClientProps {
  service: CanonicalService;
  locale: string;
  relatedCaseStudies?: any[];
  dbOverrides?: any;
  availableServices?: CanonicalService[];
}

export function ServiceMicrositeClient({
  service,
  locale,
  relatedCaseStudies = [],
  dbOverrides,
  availableServices
}: ServiceMicrositeClientProps) {
  const isAr = locale === "ar";
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [selectedObjectiveForBrief, setSelectedObjectiveForBrief] = useState<any>(null);
  const [selectedServicesForBrief, setSelectedServicesForBrief] = useState<string[]>([]);

  // Merge DB overrides if present while keeping canonical integrity
  const mergedService: CanonicalService = {
    ...service,
    heroMediaUrl: dbOverrides?.heroMediaUrl || service.heroMediaUrl,
    heroMediaType: dbOverrides?.heroMediaType || service.heroMediaType,
    taglineEn: dbOverrides?.taglineEn || service.taglineEn,
    taglineAr: dbOverrides?.taglineAr || service.taglineAr,
    galleryItems: dbOverrides?.galleryItems || service.galleryItems || [],
  };

  const visibility = mergedService.sectionVisibility || {};

  const handleOpenBriefWithObjective = (obj: any) => {
    setSelectedObjectiveForBrief(obj);
    setIsBriefModalOpen(true);
  };

  const handleOpenBriefWithService = (slug: string) => {
    setSelectedServicesForBrief((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    setIsBriefModalOpen(true);
  };

  return (
    <div
      className="flex flex-col w-full bg-[var(--bg-level-1)] text-[var(--text-primary)] min-h-screen transition-colors selection:bg-emerald-500 selection:text-white"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* 1. CINEMATIC HERO */}
      {visibility.hero !== false && (
        <ServiceHero
          service={mergedService}
          locale={locale}
          onOpenBriefBuilder={() => setIsBriefModalOpen(true)}
        />
      )}

      {/* 2. WOW & HOW SIGNATURE SECTION */}
      {visibility.wowHow !== false && mergedService.wowHow && mergedService.wowHow.length > 0 && (
        <ServiceWowHowSection items={mergedService.wowHow} locale={locale} />
      )}

      {/* 3. "WHAT ARE YOU TRYING TO ACHIEVE?" OBJECTIVE SELECTOR */}
      {visibility.objectives !== false && mergedService.objectives && mergedService.objectives.length > 0 && (
        <ServiceObjectiveSelector
          objectives={mergedService.objectives}
          locale={locale}
          onSelectObjective={handleOpenBriefWithObjective}
          onOpenBriefBuilder={handleOpenBriefWithObjective}
        />
      )}

      {/* 4. VISUAL MEDIA & EXECUTION GALLERY */}
      {visibility.gallery !== false && mergedService.galleryItems && mergedService.galleryItems.length > 0 && (
        <ServiceMediaGallery items={mergedService.galleryItems} locale={locale} />
      )}

      {/* 5. CAPABILITIES BENTO MATRIX */}
      {visibility.capabilities !== false && mergedService.capabilities && mergedService.capabilities.length > 0 && (
        <ServiceCapabilitiesBento capabilities={mergedService.capabilities} locale={locale} />
      )}

      {/* 6. ENGAGEMENT & PROCUREMENT APPOINTMENT MODELS */}
      {visibility.engagementModels !== false && mergedService.engagementModels && mergedService.engagementModels.length > 0 && (
        <ServiceEngagementModels
          models={mergedService.engagementModels}
          locale={locale}
          onSelectModel={() => setIsBriefModalOpen(true)}
        />
      )}

      {/* 7. CLEAR DELIVERABLES ROSTER */}
      {visibility.deliverables !== false && mergedService.deliverables && mergedService.deliverables.length > 0 && (
        <ServiceDeliverablesRoster categories={mergedService.deliverables} locale={locale} />
      )}

      {/* 8. DELIVERY LIFECYCLE METHODOLOGY */}
      {visibility.lifecycle !== false && mergedService.lifecycleStages && mergedService.lifecycleStages.length > 0 && (
        <ServiceDeliveryLifecycle stages={mergedService.lifecycleStages} locale={locale} />
      )}

      {/* 9. SERVICE-SPECIFIC UNIQUE MODULE */}
      {visibility.specialistModule !== false && mergedService.serviceSpecificModule && mergedService.serviceSpecificModule.type && mergedService.serviceSpecificModule.type !== 'none' && (
        <ServiceSpecificModule moduleConfig={mergedService.serviceSpecificModule} locale={locale} />
      )}

      {/* 10. CONNECTED LANDMARK CASE STUDIES (Proof of Work) */}
      {visibility.caseStudies !== false && relatedCaseStudies && relatedCaseStudies.length > 0 && (
        <section id="case-studies-section" className="py-20 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] transition-colors">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Trophy className="w-3.5 h-3.5" />
                  {isAr ? "سجل الإنجاز والمشاريع" : "Landmark Proof of Work"}
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-2">
                  {isAr ? "مشاريع وطنية تم تنفيذها بهذا التخصص" : "Verified Projects Executed in Qatar"}
                </h2>
                <p className="text-base text-[var(--text-secondary)]">
                  {isAr
                    ? "استعرض نماذج من مشاريعنا المعتمدة المنفذة للجهات الحكومية والقطاع الخاص."
                    : "Real case studies showcasing E3's exact scope, attendance numbers, and execution outcomes."}
                </p>
              </div>

              <Link
                href={localizeHref("/b2b/case-studies", locale)}
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
              >
                <span>{isAr ? "عرض جميع المشاريع" : "View All Case Studies"}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedCaseStudies.map((study) => {
                const title = isAr ? study.titleAr || study.titleEn : study.titleEn;
                const clientName = isAr ? study.clientNameAr || study.clientNameEn : study.clientNameEn;
                const summary = isAr ? study.summaryAr || study.summaryEn : study.summaryEn;
                const image = study.heroMediaUrl || study.heroThumbnailUrl || study.thumbnailImage || study.thumbnail;

                return (
                  <Link
                    key={study.id || study.slug}
                    href={localizeHref(`/b2b/case-studies/${study.slug}`, locale)}
                    className="group flex flex-col rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] overflow-hidden shadow-xs hover:border-emerald-500/50 transition-all"
                  >
                    <div className="relative aspect-video bg-[var(--surface-raised)] overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] font-bold text-xs">
                          {isAr ? "مشروع معتمد" : "Verified Case Study"}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                      {clientName && (
                        <span className="absolute bottom-3 start-4 text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                          {clientName}
                        </span>
                      )}
                    </div>

                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {title}
                        </h3>
                        {summary && (
                          <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-4">
                            {summary}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[var(--border-level-2)]/60 flex items-center justify-between text-xs font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
                        <span>{isAr ? "استعراض تفاصيل المشروع" : "Read Case Study"}</span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 11. ENTERPRISE READINESS & ACCREDITATIONS */}
      {visibility.enterpriseReadiness !== false && mergedService.enterpriseReadiness && mergedService.enterpriseReadiness.length > 0 && (
        <ServiceEnterpriseReadiness items={mergedService.enterpriseReadiness} locale={locale} />
      )}

      {/* 12. RELATED INTEGRATED SOLUTIONS */}
      {visibility.relatedServices !== false && mergedService.relatedServiceSlugs && mergedService.relatedServiceSlugs.length > 0 && (
        <ServiceRelatedSolutions
          relatedSlugs={mergedService.relatedServiceSlugs}
          locale={locale}
          availableServices={availableServices}
          onOpenBriefWithService={handleOpenBriefWithService}
        />
      )}

      {/* 13. PROJECT BRIEF BUILDER MODAL */}
      <ProjectBriefBuilderModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        initialService={mergedService}
        initialObjective={selectedObjectiveForBrief}
        selectedServices={selectedServicesForBrief}
        availableServices={availableServices}
        locale={locale}
      />

      {/* 14. RESTING FLOATING DOCK */}
      <ServiceFloatingDock
        locale={locale}
        onOpenBriefBuilder={() => setIsBriefModalOpen(true)}
      />
    </div>
  );
}
