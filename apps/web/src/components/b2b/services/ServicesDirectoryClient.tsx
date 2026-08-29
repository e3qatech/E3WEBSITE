"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Trophy, 
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  FileText,
  Workflow,
  Plus
} from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { LivingHeroHeadline } from "@/components/b2b/shared/LivingHeroHeadline";
import { ProjectBriefBuilderModal } from "./ProjectBriefBuilderModal";
import { localizeHref } from "@/lib/url-helper";
import { getLocalizedCanonicalServiceTitle } from "@/lib/services/canonical-services";
import { cn } from "@/lib/utils";

interface ServiceItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  taglineEn?: string;
  taglineAr?: string;
  category?: string;
  heroMediaUrl?: string;
  heroMediaType?: string;
  heroMobileMediaUrl?: string;
  heroVideoPosterUrl?: string;
  thumbnail?: string;
  process?: any;
}

interface CaseStudyItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string;
  clientName?: string;
  clientNameEn?: string;
  clientNameAr?: string;
  summaryEn?: string;
  summaryAr?: string;
  thumbnailUrl?: string;
  heroImageUrl?: string;
  stats?: Record<string, any>;
  sectors?: string[];
  services?: string[];
}

interface ServicesDirectoryClientProps {
  services: ServiceItem[];
  caseStudies: CaseStudyItem[];
  cmsPage: any;
  locale: string;
}

export function ServicesDirectoryClient({
  services = [],
  caseStudies = [],
  cmsPage: _cmsPage,
  locale,
}: ServicesDirectoryClientProps) {
  const isAr = locale === "ar";

  // Active navigator index
  const [activeServiceIdx, setActiveServiceIdx] = useState<number>(0);
  const activeService = services[activeServiceIdx] || services[0] || null;

  // Brief Builder Modal State
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [briefSelectedServices, setBriefSelectedServices] = useState<string[]>([]);
  const [briefInitialParameters, setBriefInitialParameters] = useState<Record<string, any>>({});

  // Ecosystem active stage (0-5)
  const [activeEcosystemStage, setActiveEcosystemStage] = useState<number>(0);

  // Solution Finder State
  const [solutionFinder, setSolutionFinder] = useState({
    projectType: "mega-event",
    lifespan: "temporary",
    audience: "mass-public",
    objective: "spectacle",
    scope: "turnkey",
  });

  // Recommended services calculated from Solution Finder selections
  const recommendedServiceSlugs = useMemo(() => {
    const recs = new Set<string>();
    
    if (solutionFinder.projectType === "mega-event") {
      recs.add("mega-events");
      recs.add("av-stage-rentals");
    } else if (solutionFinder.projectType === "fec-destination") {
      recs.add("fec-development");
      recs.add("attraction-operations");
    } else if (solutionFinder.projectType === "kids-edutainment") {
      recs.add("kids-concepts");
      recs.add("fabrication-branding");
    } else {
      recs.add("experiential-activations");
      recs.add("shows-performances");
    }

    if (solutionFinder.scope === "turnkey") {
      recs.add("feasibility-design-research");
    }
    if (solutionFinder.scope === "ticketing" || solutionFinder.objective === "revenue") {
      recs.add("ticketing-solutions");
    }
    if (solutionFinder.objective === "spectacle") {
      recs.add("shows-performances");
    }
    if (solutionFinder.scope === "fabrication") {
      recs.add("fabrication-branding");
    }

    return Array.from(recs).slice(0, 3);
  }, [solutionFinder]);

  // Handle opening Brief Builder from Solution Finder
  const handleApplySolutionFinderToBrief = () => {
    const formatLabels: Record<string, { en: string; ar: string }> = {
      "mega-event": { en: "Mega Festival / National Event", ar: "فعالية وطنية كبرى / مهرجان جماهيري" },
      "fec-destination": { en: "Permanent Family Entertainment Center", ar: "مركز ترفيه عائلي / وجهة جذب دائمة" },
      "kids-edutainment": { en: "Kids Interactive Edutainment World", ar: "عالم ألعاب أطفال / مفهوم تعليمي تفاعلي" },
      "brand-activation": { en: "Experiential Brand Activation", ar: "تفعيل علامة تجارية / جناح تجربة غامرة" },
    };

    const lifespanLabels: Record<string, { en: string; ar: string }> = {
      permanent: { en: "Permanent Destination / Fixed Asset", ar: "منشأة دائمة مستمرة" },
      seasonal: { en: "Seasonal Campaign (1 - 3 Months)", ar: "حملة موسمية مؤقتة (١ - ٣ أشهر)" },
      temporary: { en: "Single Weekend / Ceremony", ar: "فعالية ختامية / عطلة أسبوعية" },
    };

    const audienceLabels: Record<string, { en: string; ar: string }> = {
      "mass-public": { en: "Mass Public (50,000+ Guests)", ar: "حشود جماهيرية ضخمة (٥٠ ألف+)" },
      families: { en: "Families & Children", ar: "العائلات والأطفال والناشئة" },
      vips: { en: "B2B VIPs & State Dignitaries", ar: "شخصيات رفيعة ووفود رسمية" },
    };

    const objectiveLabels: Record<string, { en: string; ar: string }> = {
      spectacle: { en: "World-Class Visual Spectacle", ar: "إبهار بصري وتجربة استثنائية" },
      revenue: { en: "Max Revenue & High Throughput", ar: "تعظيم الإيرادات والتدفق اليومي" },
      safety: { en: "Flawless Crowd Safety & Logistics", ar: "أعلى درجات الأمان وإدارة الحشود" },
    };

    const scopeLabels: Record<string, { en: string; ar: string }> = {
      turnkey: { en: "Turnkey End-to-End Delivery (A-Z)", ar: "تسليم مفتاح شامل (من التخطيط للتشغيل الميداني)" },
      av: { en: "Specialist Audio-Visual & Staging Only", ar: "الأنظمة الصوتية والضوئية وهندسة المسارح فقط" },
      ticketing: { en: "Cloud Ticketing & Access Hardware Only", ar: "بوابات الدخول السحابية وإصدار التذاكر" },
      fabrication: { en: "Bespoke Scenic & Themed Fabrication Only", ar: "التصنيع المعماري والديكورات المخصصة" },
    };

    const format = formatLabels[solutionFinder.projectType] || { en: solutionFinder.projectType, ar: solutionFinder.projectType };
    const lifespan = lifespanLabels[solutionFinder.lifespan] || { en: solutionFinder.lifespan, ar: solutionFinder.lifespan };
    const audience = audienceLabels[solutionFinder.audience] || { en: solutionFinder.audience, ar: solutionFinder.audience };
    const objective = objectiveLabels[solutionFinder.objective] || { en: solutionFinder.objective, ar: solutionFinder.objective };
    const scope = scopeLabels[solutionFinder.scope] || { en: solutionFinder.scope, ar: solutionFinder.scope };

    setBriefSelectedServices(recommendedServiceSlugs);
    setBriefInitialParameters({
      projectFormat: isAr ? format.ar : format.en,
      lifespan: isAr ? lifespan.ar : lifespan.en,
      audience: isAr ? audience.ar : audience.en,
      primaryObjective: isAr ? objective.ar : objective.en,
      requiredScope: isAr ? scope.ar : scope.en,
      recommendedServiceSlugs,
      objective: isAr ? objective.ar : objective.en,
      venueType: solutionFinder.lifespan === "permanent" ? "Dedicated Entertainment Venue" : (solutionFinder.projectType === "mega-event" ? "Outdoor Boulevard / Plaza" : "Ballroom / Arena"),
      audienceSize: solutionFinder.audience === "mass-public" ? "15,000+ Guests" : (solutionFinder.audience === "families" ? "2,500 - 15,000 Guests" : "500 - 2,500 Guests"),
      duration: solutionFinder.lifespan === "permanent" ? "Permanent / Long-Term" : (solutionFinder.lifespan === "seasonal" ? "1 - 4 Weeks (Seasonal)" : "1 - 3 Days"),
      briefNotes: `[Solution Finder: ${isAr ? format.ar : format.en} | ${isAr ? lifespan.ar : lifespan.en} | ${isAr ? scope.ar : scope.en}]`,
    });
    setIsBriefModalOpen(true);
  };

  // Ecosystem Stages Data
  const ecosystemStages = useMemo(() => [
    {
      id: "concept-research",
      stepNum: "01",
      titleEn: "Concept & Feasibility",
      titleAr: "المفهوم ودراسات الجدوى",
      descEn: "Financial modeling, visitor flow forecasting, and thematic master planning.",
      descAr: "النمذجة المالية وتوقعات تدفق الزوار والمخططات الرئيسية للمشاريع الترفيهية.",
      serviceSlugs: ["feasibility-design-research"],
    },
    {
      id: "spatial-design",
      stepNum: "02",
      titleEn: "Spatial & Themed Design",
      titleAr: "التصميم المكاني والسمات الترفيهية",
      descEn: "Attraction layout, ride safety envelope zoning, and immersive play schematics.",
      descAr: "تخطيط مناطق الجذب وحرم الأمان للألعاب ومخططات مناطق الألعاب الغامرة.",
      serviceSlugs: ["fec-development", "kids-concepts"],
    },
    {
      id: "fabrication",
      stepNum: "03",
      titleEn: "Engineering & Scenic Build",
      titleAr: "الهندسة وتصنيع الديكورات",
      descEn: "Structural steel, architectural finishes, themed facades, and bespoke scenic joinery.",
      descAr: "الهياكل الفولاذية والتشطيبات المعمارية والواجهات المنفذة حسب أعلى المعايير.",
      serviceSlugs: ["fabrication-branding"],
    },
    {
      id: "production-av",
      stepNum: "04",
      titleEn: "AV & Live Production",
      titleAr: "الإنظمة المرئية والصوتية والإنتاج الحي",
      descEn: "Kinetic illumination, concert sound arrays, projection mapping, and international talent staging.",
      descAr: "الإضاءة الحركية ومصفوفات الصوت الاحترافية والعروض الضوئية والإنتاج المسرحي.",
      serviceSlugs: ["mega-events", "shows-performances", "av-stage-rentals", "experiential-activations"],
    },
    {
      id: "ticketing",
      stepNum: "05",
      titleEn: "Ticketing & Cloud Access",
      titleAr: "حلول التذاكر وبوابات الدخول السحابية",
      descEn: "Turnstile hardware, RFID accreditation, contactless POS, and real-time crowd telemetry.",
      descAr: "بوابات الدخول الآلية وتقنيات RFID ونقاط البيع السحابية والتحليلات المباشرة.",
      serviceSlugs: ["ticketing-solutions"],
    },
    {
      id: "operations",
      stepNum: "06",
      titleEn: "Turnkey Operations & SOPs",
      titleAr: "التشغيل المتكامل وإجراءات السلامة القياسية",
      descEn: "Facility management, guest services, certified ride maintenance, and emergency protocols.",
      descAr: "إدارة المرافق وخدمات الضيافة وصيانة الألعاب المعتمدة وبروتوكولات الطوارئ المعتمدة.",
      serviceSlugs: ["attraction-operations"],
    },
  ], []);

  // Navigator scroll container ref for mobile
  const navRailRef = useRef<HTMLDivElement>(null);

  const handlePrevService = () => {
    setActiveServiceIdx((prev) => (prev > 0 ? prev - 1 : services.length - 1));
  };

  const handleNextService = () => {
    setActiveServiceIdx((prev) => (prev < services.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="flex flex-col w-full min-h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] font-sans selection:bg-emerald-500 selection:text-zinc-950 transition-colors"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ========================================================================= */}
      {/* 1. CINEMATIC OPENING HERO (High-Contrast White Typography over Dark Media) */}
      {/* ========================================================================= */}
      <section className="relative min-h-[90vh] flex flex-col justify-between overflow-hidden border-b border-[var(--border-level-1)] pt-24 pb-12">
        {/* Full-bleed Background Media with Overlays */}
        <div className="absolute inset-0 z-0">
          <UniversalMediaRenderer
            type="VIDEO"
            src="https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Doha%20Balloon%20Parade%20-%20Eid%20in%20Qatar%202022.mp4"
            poster="https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DJI_0151.jpg"
            alt="E3 Enterprise Capabilities"
            className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05]"
          />
          {/* High-contrast directional gradient overlays ensuring WCAG readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent rtl:bg-gradient-to-l rtl:from-black/90 rtl:via-black/60 rtl:to-transparent" />
        </div>

        {/* Hero Main Content */}
        <div className="container relative z-10 mx-auto px-4 md:px-8 pt-8 md:pt-16">
          <div className="max-w-4xl">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs uppercase tracking-widest mb-6 backdrop-blur-md">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? "القدرات التخصصية الشاملة — إي ثري لقطاع الأعمال" : "Turnkey Enterprise Capabilities — E3 Qatar"}</span>
            </div>

            {/* Outcome-Led Living Headline */}
            <div className="mb-6">
              <LivingHeroHeadline
                headlineTemplateEn="Engineered for {{animated}}"
                headlineTemplateAr="هندسة متكاملة لصناعة {{animated}}"
                rotatingWordsEn={[
                  "National Spectacles",
                  "Landmark FECs",
                  "Turnkey Live Production",
                  "Interactive Edutainment",
                  "Smart Ticketing Cloud",
                  "Landmark Attractions",
                ]}
                rotatingWordsAr={[
                  "الاحتفالات والفعاليات الكبرى",
                  "مراكز الترفيه العائلي",
                  "الإنتاج الميداني المتكامل",
                  "العوالم التفاعلية والتعليمية",
                  "حلول الدخول والتذاكر السحابية",
                  "الوجهات الترفيهية المستدامة",
                ]}
                enableRotatingWords={true}
                animationSpeed={2800}
                locale={locale}
                align="start"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black font-syne text-white tracking-tight leading-[1.08] drop-shadow-2xl"
                gradientClass="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 drop-shadow-lg"
              />
            </div>

            <p className="text-lg sm:text-xl md:text-2xl text-zinc-200 font-medium max-w-3xl mb-10 leading-relaxed drop-shadow-md">
              {isAr
                ? "من التخطيط الاستراتيجي ودراسات الجدوى إلى التصنيع المعماري، التقنيات الصوتية والضوئية، بوابات الدخول السحابية، والتشغيل الميداني المتكامل في قطر."
                : "From master planning and feasibility to turnkey scenic fabrication, concert-grade AV, cloud ticketing telemetry, and certified attraction operations in Qatar."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#service-navigator"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-zinc-950 font-bold text-base rounded-full hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] hover:-translate-y-0.5"
              >
                <span>{isAr ? "استكشف القدرات العشر" : "Explore Our Capabilities"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setBriefSelectedServices(services.map((s) => s.slug));
                  setIsBriefModalOpen(true);
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-base rounded-full backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-0.5 shadow-lg cursor-pointer"
              >
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>{isAr ? "بناء موجز المشروع (RFP)" : "Build Your Project Brief"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Live Service Indicator Rail */}
        <div className="container relative z-10 mx-auto px-4 md:px-8 mt-12">
          <div className="p-4 rounded-2xl bg-black/60 backdrop-blur-lg border border-white/15 shadow-xl">
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest shrink-0">
                {isAr ? "خدماتنا المتكاملة العشر:" : "10 INTEGRATED SERVICES:"}
              </span>
              <div className="flex items-center gap-2">
                {services.map((svc, idx) => (
                  <button
                    key={svc.slug}
                    onClick={() => {
                      setActiveServiceIdx(idx);
                      const el = document.getElementById("service-navigator");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all whitespace-nowrap border cursor-pointer",
                      activeServiceIdx === idx
                        ? "bg-emerald-500 text-zinc-950 border-emerald-400 font-bold shadow-xs"
                        : "bg-white/5 text-zinc-300 border-white/10 hover:text-white hover:border-emerald-500/40"
                    )}
                  >
                    <span>{String(idx + 1).padStart(2, "0")}</span>{" "}
                    <span className="hidden lg:inline">{isAr ? svc.titleAr || svc.titleEn : svc.titleEn}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE SERVICE DISCOVERY NAVIGATOR (10-Service Dual-Rail Navigator) */}
      {/* ========================================================================= */}
      <section id="service-navigator" className="py-24 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors scroll-mt-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-3">
                <Workflow className="w-3.5 h-3.5" />
                <span>{isAr ? "المنظومة التخصصية المتكاملة" : "10 INTEGRATED SERVICES"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight">
                {isAr ? "استكشف قدراتنا التخصصية الشاملة" : "Explore Our Capabilities"}
              </h2>
            </div>
            
            {/* Mobile Navigation Controls */}
            <div className="flex items-center gap-3 lg:hidden">
              <span className="font-mono text-sm text-[var(--text-secondary)]">
                {String(activeServiceIdx + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
              </span>
              <button
                onClick={handlePrevService}
                aria-label="Previous service"
                className="p-3 rounded-full bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)] hover:border-emerald-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
              <button
                onClick={handleNextService}
                aria-label="Next service"
                className="p-3 rounded-full bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)] hover:border-emerald-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5 rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Desktop Dual-Rail Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Numbered Service Rail (Desktop) */}
            <div
              ref={navRailRef}
              className="lg:col-span-5 flex flex-col gap-2 max-h-[640px] overflow-y-auto pr-2 no-scrollbar"
            >
              {services.map((svc, idx) => {
                const isActive = activeServiceIdx === idx;
                const title = isAr ? svc.titleAr || svc.titleEn : svc.titleEn;
                const tagline = isAr ? svc.taglineAr || svc.taglineEn : svc.taglineEn;

                return (
                  <button
                    key={svc.slug}
                    onClick={() => setActiveServiceIdx(idx)}
                    onMouseEnter={() => setActiveServiceIdx(idx)}
                    className={cn(
                      "w-full text-start p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 group cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-emerald-500/15 via-[var(--surface-default)] to-[var(--surface-default)] border-emerald-500/50 shadow-md translate-x-1 rtl:-translate-x-1"
                        : "bg-[var(--surface-default)] border-[var(--border-level-2)] hover:border-emerald-500/30 hover:bg-[var(--surface-raised)]"
                    )}
                  >
                    <span
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors",
                        isActive
                          ? "bg-emerald-500 text-zinc-950"
                          : "bg-[var(--surface-raised)] text-[var(--text-secondary)] border border-[var(--border-level-2)] group-hover:text-emerald-400"
                      )}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3
                          className={cn(
                            "font-bold font-syne text-base sm:text-lg transition-colors truncate",
                            isActive ? "text-emerald-400" : "text-[var(--text-primary)] group-hover:text-emerald-400"
                          )}
                        >
                          {title}
                        </h3>
                        {svc.category && (
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--surface-raised)] text-[var(--text-tertiary)] shrink-0 hidden sm:inline">
                            {svc.category}
                          </span>
                        )}
                      </div>
                      {tagline && (
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                          {tagline}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Live Changing Media Canvas */}
            {activeService && (
              <div className="lg:col-span-7 flex flex-col">
                <div className="relative flex-1 rounded-3xl overflow-hidden bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-2xl flex flex-col min-h-[480px]">
                  {/* Visual Background */}
                  <div className="absolute inset-0 z-0">
                    {activeService.heroMediaUrl || activeService.thumbnail ? (
                      <UniversalMediaRenderer
                        type={activeService.heroMediaType as any || "IMAGE"}
                        src={activeService.heroMediaUrl || activeService.thumbnail}
                        poster={activeService.heroVideoPosterUrl || activeService.thumbnail}
                        alt={isAr ? activeService.titleAr : activeService.titleEn}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-950/30 via-[var(--surface-default)] to-[var(--bg-level-1)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-[var(--surface-default)]/75 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface-default)]/90 via-transparent to-transparent rtl:bg-gradient-to-l" />
                  </div>

                  {/* Canvas Foreground Details */}
                  <div className="relative z-10 p-6 sm:p-10 mt-auto flex flex-col justify-end">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500 text-zinc-950">
                        {String(activeServiceIdx + 1).padStart(2, "0")} / 10
                      </span>
                      {activeService.category && (
                        <span className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[var(--surface-raised)]/90 backdrop-blur-md text-emerald-400 border border-emerald-500/20">
                          {activeService.category}
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-3">
                      {isAr ? activeService.titleAr || activeService.titleEn : activeService.titleEn}
                    </h3>

                    <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium mb-6 max-w-2xl leading-relaxed">
                      {isAr
                        ? activeService.taglineAr || activeService.process?.heroOutcomeAr || "تنفيذ متكامل بمعايير أمان وتجهيزات هندسية عالمية."
                        : activeService.taglineEn || activeService.process?.heroOutcomeEn || "Turnkey engineering delivery backed by certified execution standards."}
                    </p>

                    {/* Key Capability Highlights */}
                    {activeService.process?.capabilities && activeService.process.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-8">
                        {activeService.process.capabilities.slice(0, 3).map((cap: any, cIdx: number) => (
                          <span
                            key={cap.id || cIdx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--surface-raised)]/80 backdrop-blur-md border border-[var(--border-level-2)] text-xs text-[var(--text-secondary)]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{isAr ? cap.titleAr || cap.titleEn : cap.titleEn}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Direct Links */}
                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        href={localizeHref(`/b2b/services/${activeService.slug}`, locale)}
                        className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-emerald-500 text-zinc-950 font-bold text-sm hover:bg-emerald-400 transition-all shadow-md hover:-translate-y-0.5"
                      >
                        <span>{isAr ? "استعراض تفاصيل الخدمة" : "Explore Service Details"}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setBriefSelectedServices([activeService.slug]);
                          setIsBriefModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[var(--surface-raised)]/90 backdrop-blur-md border border-[var(--border-level-2)] text-[var(--text-primary)] font-bold text-sm hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? "إضافة إلى موجز المشروع" : "Add to Project Brief"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. "WHAT ARE YOU BUILDING?" INTERACTIVE SOLUTION FINDER */}
      {/* ========================================================================= */}
      <section className="py-24 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] transition-colors">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>{isAr ? "أداة تحديد الحلول الذكية" : "DISCIPLINE RECOMMENDATION ENGINE"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-4">
              {isAr ? "ما الذي تخطط لبنائه أو تنظيمه؟" : "What Are You Building or Staging?"}
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-secondary)]">
              {isAr
                ? "حدد طبيعة مشروعك وأهدافه لاقتراح حزمة الخدمات المثالية لإنجازه بكفاءة."
                : "Select your project parameters to receive a tailored E3 capability bundle designed for turnkey execution."}
            </p>
          </div>

          <div className="max-w-5xl mx-auto p-6 sm:p-10 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* 1. Project Format */}
              <div>
                <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
                  1. {isAr ? "نوع المشروع" : "Project Format"}
                </label>
                <select
                  value={solutionFinder.projectType}
                  onChange={(e) => setSolutionFinder({ ...solutionFinder, projectType: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm font-medium focus:border-emerald-500 focus:outline-none"
                >
                  <option value="mega-event">{isAr ? "فعالية وطنية كبرى / مهرجان جماهيري" : "Mega Festival / National Event"}</option>
                  <option value="fec-destination">{isAr ? "مركز ترفيه عائلي / وجهة جذب دائمة" : "Permanent Family Entertainment Center"}</option>
                  <option value="kids-edutainment">{isAr ? "عالم ألعاب أطفال / مفهوم تعليمي تفاعلي" : "Kids Interactive Edutainment World"}</option>
                  <option value="brand-activation">{isAr ? "تفعيل علامة تجارية / جناح تجربة غامرة" : "Experiential Brand Activation"}</option>
                </select>
              </div>

              {/* 2. Lifespan */}
              <div>
                <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
                  2. {isAr ? "الإطار الزمني" : "Lifespan"}
                </label>
                <select
                  value={solutionFinder.lifespan}
                  onChange={(e) => setSolutionFinder({ ...solutionFinder, lifespan: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm font-medium focus:border-emerald-500 focus:outline-none"
                >
                  <option value="permanent">{isAr ? "منشأة دائمة مستمرة" : "Permanent Destination / Fixed Asset"}</option>
                  <option value="seasonal">{isAr ? "حملة موسمية مؤقتة (١ - ٣ أشهر)" : "Seasonal Campaign (1 - 3 Months)"}</option>
                  <option value="temporary">{isAr ? "فعالية ختامية / عطلة أسبوعية" : "Single Weekend / Ceremony"}</option>
                </select>
              </div>

              {/* 3. Primary Audience */}
              <div>
                <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
                  3. {isAr ? "الجمهور المستهدف" : "Target Audience"}
                </label>
                <select
                  value={solutionFinder.audience}
                  onChange={(e) => setSolutionFinder({ ...solutionFinder, audience: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm font-medium focus:border-emerald-500 focus:outline-none"
                >
                  <option value="mass-public">{isAr ? "حشود جماهيرية ضخمة (٥٠ ألف+)" : "Mass Public (50,000+ Guests)"}</option>
                  <option value="families">{isAr ? "العائلات والأطفال والناشئة" : "Families & Children"}</option>
                  <option value="vips">{isAr ? "شخصيات رفيعة ووفود رسمية" : "B2B VIPs & State Dignitaries"}</option>
                </select>
              </div>

              {/* 4. Primary Objective */}
              <div>
                <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
                  4. {isAr ? "الهدف الأساسي" : "Primary Objective"}
                </label>
                <select
                  value={solutionFinder.objective}
                  onChange={(e) => setSolutionFinder({ ...solutionFinder, objective: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm font-medium focus:border-emerald-500 focus:outline-none"
                >
                  <option value="spectacle">{isAr ? "إبهار بصري وتجربة استثنائية" : "World-Class Visual Spectacle"}</option>
                  <option value="revenue">{isAr ? "تعظيم الإيرادات والتدفق اليومي" : "Max Revenue & High Throughput"}</option>
                  <option value="safety">{isAr ? "أعلى درجات الأمان وإدارة الحشود" : "Flawless Crowd Safety & Logistics"}</option>
                </select>
              </div>

              {/* 5. Required Scope */}
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
                  5. {isAr ? "نطاق الدعم المطلوب" : "Required Scope of Support"}
                </label>
                <select
                  value={solutionFinder.scope}
                  onChange={(e) => setSolutionFinder({ ...solutionFinder, scope: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm font-medium focus:border-emerald-500 focus:outline-none"
                >
                  <option value="turnkey">{isAr ? "تسليم مفتاح شامل (من التخطيط للتشغيل الميداني)" : "Turnkey End-to-End Delivery (A-Z)"}</option>
                  <option value="av">{isAr ? "الأنظمة الصوتية والضوئية وهندسة المسارح فقط" : "Specialist Audio-Visual & Staging Only"}</option>
                  <option value="ticketing">{isAr ? "بوابات الدخول السحابية وإصدار التذاكر" : "Cloud Ticketing & Access Hardware Only"}</option>
                  <option value="fabrication">{isAr ? "التصنيع المعماري والديكورات المخصصة" : "Bespoke Scenic & Themed Fabrication Only"}</option>
                </select>
              </div>
            </div>

            {/* Recommended Bundle Output */}
            <div className="pt-6 border-t border-[var(--border-level-2)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                  {isAr ? "الحزمة التخصصية المقترحة لمشروعك:" : "RECOMMENDED CAPABILITY BUNDLE:"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {recommendedServiceSlugs.map((slug) => {
                    const svc = services.find((s) => s.slug === slug);
                    const title = svc ? (isAr ? svc.titleAr || svc.titleEn : svc.titleEn) : getLocalizedCanonicalServiceTitle(slug, isAr);
                    return (
                      <span
                        key={slug}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{title}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplySolutionFinderToBrief}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-emerald-500 text-zinc-950 font-bold text-sm hover:bg-emerald-400 transition-all shadow-md hover:-translate-y-0.5 shrink-0 cursor-pointer"
              >
                <span>{isAr ? "نقل الحزمة إلى موجز المشروع" : "Apply Bundle to Project Brief"}</span>
                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTEGRATED E3 ECOSYSTEM (Interactive 6-Stage Architecture) */}
      {/* ========================================================================= */}
      <section className="py-24 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? "منهجية العمل المتكاملة" : "INTEGRATED DELIVERY ECOSYSTEM"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-4">
              {isAr ? "كيف تتكامل تخصصاتنا في دورة حياة المشروع" : "Seamless Lifecycle Integration"}
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-secondary)]">
              {isAr
                ? "انقر على أي مرحلة لاستعراض التخصصات والمخرجات المعتمدة المرتبطة بها."
                : "Explore how E3's capabilities connect sequentially from initial concept to permanent operations."}
            </p>
          </div>

          {/* Interactive Stages Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            {ecosystemStages.map((stg, i) => (
              <button
                key={stg.id}
                onClick={() => setActiveEcosystemStage(i)}
                className={cn(
                  "p-4 rounded-2xl border text-start transition-all cursor-pointer",
                  activeEcosystemStage === i
                    ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md font-bold"
                    : "bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:border-emerald-500/40 hover:text-[var(--text-primary)]"
                )}
              >
                <span className="font-mono text-xs block mb-1 opacity-80">{stg.stepNum}</span>
                <span className="text-xs sm:text-sm font-bold block line-clamp-2">
                  {isAr ? stg.titleAr : stg.titleEn}
                </span>
              </button>
            ))}
          </div>

          {/* Active Stage Detailed Card */}
          {ecosystemStages[activeEcosystemStage] && (
            <div className="p-8 sm:p-12 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                  {isAr ? `المرحلة ${ecosystemStages[activeEcosystemStage].stepNum}` : `STAGE ${ecosystemStages[activeEcosystemStage].stepNum}`}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black font-syne text-[var(--text-primary)] mb-3">
                  {isAr ? ecosystemStages[activeEcosystemStage].titleAr : ecosystemStages[activeEcosystemStage].titleEn}
                </h3>
                <p className="text-base text-[var(--text-secondary)] font-medium leading-relaxed">
                  {isAr ? ecosystemStages[activeEcosystemStage].descAr : ecosystemStages[activeEcosystemStage].descEn}
                </p>
              </div>

              {/* Related Services in this stage */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                {ecosystemStages[activeEcosystemStage].serviceSlugs.map((slug) => {
                  const svc = services.find((s) => s.slug === slug);
                  const title = svc ? (isAr ? svc.titleAr || svc.titleEn : svc.titleEn) : getLocalizedCanonicalServiceTitle(slug, isAr);
                  return (
                    <Link
                      key={slug}
                      href={localizeHref(`/b2b/services/${slug}`, locale)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-primary)] hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      <span>{title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 rtl:-scale-x-100" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CINEMATIC FEATURED PROOF (Case-Study Rail) */}
      {/* ========================================================================= */}
      {caseStudies && caseStudies.length > 0 && (
        <section className="py-24 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] transition-colors">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-3">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{isAr ? "شواهد التنفيذ الوطنية" : "VERIFIED CASE STUDIES"}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight">
                  {isAr ? "مشاريع معتمدة تم تنفيذها في قطر" : "Landmark Qatar Delivery Proof"}
                </h2>
              </div>

              <Link
                href={localizeHref("/b2b/case-studies", locale)}
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:underline shrink-0"
              >
                <span>{isAr ? "استعراض كافة دراسات الحالة" : "View All Case Studies"}</span>
                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.slice(0, 3).map((study) => {
                const title = isAr ? study.titleAr || study.titleEn : study.titleEn;
                const client = isAr ? study.clientNameAr || study.clientName || study.clientNameEn : study.clientName || study.clientNameEn;
                const summary = isAr ? study.summaryAr || study.summaryEn : study.summaryEn;
                const image = study.thumbnailUrl || study.heroImageUrl || undefined;

                return (
                  <Link
                    key={study.id || study.slug}
                    href={localizeHref(`/b2b/case-studies/${study.slug}`, locale)}
                    className="group rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] overflow-hidden shadow-xs hover:border-emerald-500/50 hover:shadow-2xl transition-all duration-500 flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-raised)]">
                      {image ? (
                        <UniversalMediaRenderer
                          type="IMAGE"
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
                      {client && (
                        <span className="absolute bottom-4 start-4 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-black/70 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                          {client}
                        </span>
                      )}
                    </div>

                    <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-xl font-bold font-syne text-[var(--text-primary)] mb-3 group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {title}
                        </h3>
                        {summary && (
                          <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-6 font-medium">
                            {summary}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[var(--border-level-2)] flex items-center justify-between text-xs font-bold text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                        <span>{isAr ? "استعراض تفاصيل المشروع" : "Explore Case Study"}</span>
                        <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. STRONG FINAL CONVERSION */}
      {/* ========================================================================= */}
      <section className="py-24 bg-gradient-to-b from-[var(--bg-level-2)] to-[var(--bg-level-1)] border-t border-[var(--border-level-1)] text-center transition-colors">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "بدء التعاون الهندسي والإنتاجي" : "COMMENCE COLLABORATION"}</span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-6">
              {isAr ? "جاهزون لهندسة مشروعكم القادم في قطر؟" : "Ready to Engineer Your Next Landmark?"}
            </h2>

            <p className="text-lg sm:text-xl text-[var(--text-secondary)] font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              {isAr
                ? "سواء كنتم بحاجة إلى تسليم مفتاح كامل أو استشارة تخصصية محددة، فريقنا الهندسي جاهز لتقديم الدعم الفوري."
                : "Whether requiring full turnkey delivery or specialized capability integration, our engineering team is ready to structure your scope."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setBriefSelectedServices(services.map((s) => s.slug));
                  setIsBriefModalOpen(true);
                }}
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-emerald-500 text-zinc-950 font-bold text-base rounded-full hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_35px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                <span>{isAr ? "بناء موجز المشروع (Brief Builder)" : "Build a Project Brief"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
              </button>

              <Link
                href={localizeHref("/b2b/contact", locale)}
                className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)] font-bold text-base rounded-full hover:bg-[var(--surface-hover)] transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <span>{isAr ? "طلب استشارة هندسية مباشرة" : "Request Consultation"}</span>
                <ArrowUpRight className="w-5 h-5 text-emerald-400 rtl:-scale-x-100" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Project Brief Builder Modal with preloaded services / parameters */}
      <ProjectBriefBuilderModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        initialSelectedServices={briefSelectedServices}
        initialParameters={briefInitialParameters}
        locale={locale}
      />
    </div>
  );
}
