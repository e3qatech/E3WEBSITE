"use client";

import React from "react";
import { Sparkles, Layers, Cpu, Compass, Clapperboard } from "lucide-react";

interface LifeAtE3Item {
  id: string;
  titleEn: string;
  titleAr: string;
  categoryEn: string;
  categoryAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: "layers" | "cpu" | "compass" | "clapperboard";
  imageUrl?: string;
}

const DEFAULT_LIFE_AT_E3: LifeAtE3Item[] = [
  {
    id: "kinetic-production",
    titleEn: "Master Kinetic Stage Engineering",
    titleAr: "هندسة المسارح والعروض الحركية الكبرى",
    categoryEn: "Technical Production",
    categoryAr: "الإنتاج التقني والهندسي",
    descriptionEn:
      "Our engineers design and deploy synchronized kinetic rigs, projection mapping, and ultra-high-definition laser systems across Qatar's flagship venues.",
    descriptionAr:
      "يقوم مهندسونا بتصميم وتنفيذ مسارح حركية متزامنة، عروض إسقاط ضوئي متطورة، وأنظمة ليزر فائقة الدقة في أبرز وجهات قطر.",
    icon: "cpu",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
  },
  {
    id: "spatial-architecture",
    titleEn: "Spatial & Multisensory Narrative Design",
    titleAr: "التصميم المكاني والتجارب متعددة الحواس",
    categoryEn: "Creative Architecture",
    categoryAr: "العمارة الإبداعية",
    descriptionEn:
      "Atelier teams transform raw spaces into living, breathing emotional environments connecting audiences with rich cultural stories.",
    descriptionAr:
      "يحول استوديو التصميم المساحات الصامتة إلى بيئات حسية غامرة تربط الجماهير بروايات ثقافية وتجارب استثنائية.",
    icon: "compass",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
  },
  {
    id: "live-event-ops",
    titleEn: "Mega-Scale Live Event Synchronization",
    titleAr: "تزامن وإدارة الفعاليات الجماهيرية الكبرى",
    categoryEn: "Operations & Logistics",
    categoryAr: "العمليات الميدانية واللوجستية",
    descriptionEn:
      "Operating live with zero margin for error — synchronizing high-throughput crowd dynamics, protocol dignitary hospitality, and site safety.",
    descriptionAr:
      "إدارة العمليات الميدانية الحية بدقة متناهية تشمل بروتوكولات كبار الشخصيات، حركة الحشود، والسلامة الهندسية المتكاملة.",
    icon: "layers",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
  },
  {
    id: "creative-direction",
    titleEn: "World-Class Show Direction & Media Production",
    titleAr: "الإخراج الفني والإنتاج الإعلامي العالمي",
    categoryEn: "Creative Direction",
    categoryAr: "الإخراج الإبداعي",
    descriptionEn:
      "Conceptualizing original musical scores, volumetric holographic visuals, and international protocol opening ceremonies.",
    descriptionAr:
      "ابتكار المقطوعات الموسيقية الأصلية، المؤثرات الهولوغرافية ثلاثية الأبعاد، وإخراج حفلات الافتتاح الرسمية العالمية.",
    icon: "clapperboard",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
  },
];

interface LifeAtE3SectionProps {
  locale?: string;
  items?: LifeAtE3Item[];
}

export function LifeAtE3Section({
  locale = "en",
  items = DEFAULT_LIFE_AT_E3,
}: LifeAtE3SectionProps) {
  const isAr = locale === "ar";

  const renderIcon = (icon: string) => {
    switch (icon) {
      case "cpu":
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case "compass":
        return <Compass className="w-5 h-5 text-indigo-400" />;
      case "layers":
        return <Layers className="w-5 h-5 text-emerald-400" />;
      case "clapperboard":
      default:
        return <Clapperboard className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <section
      data-testid="life-at-e3-section"
      aria-label={isAr ? "الحياة في إي ثري والعمل الميداني" : "Life at E3 & Culture"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? "بيئة العمل وكواليس الإنجاز" : "ATELIER CULTURE & PRODUCTION"}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight">
          {isAr ? "الحياة والابتكار في إي ثري" : "Life Inside the Engineering Atelier"}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 font-medium">
          {isAr
            ? "نحن نجمع بين أحدث التقنيات الهندسية وأرفع معايير الإبداع الفني لنصنع ذكريات لا تُنسى في قطر والمنطقة."
            : "Where architectural rigor meets boundless creative ambition. Experience the disciplines that power our landmark productions."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {items.map((item) => (
          <div
            key={item.id}
            data-testid={`life-item-${item.id}`}
            className="group relative rounded-3xl overflow-hidden bg-[var(--surface-default)] border border-[var(--border-level-1)] hover:border-cyan-500/40 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
          >
            {/* Image Banner */}
            {item.imageUrl && (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={isAr ? item.titleAr : item.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-4 start-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/60 backdrop-blur-md text-white border border-white/15">
                    {renderIcon(item.icon)}
                    <span>{isAr ? item.categoryAr : item.categoryEn}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Content Details */}
            <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors leading-snug mb-2">
                  {isAr ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                  {isAr ? item.descriptionAr : item.descriptionEn}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
