"use client";

import React from "react";
import { FileCheck, Search, Users, Sparkles, CheckCircle2 } from "lucide-react";

interface HiringStep {
  number: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  icon: "file" | "search" | "users" | "sparkles";
}

const HIRING_STEPS: HiringStep[] = [
  {
    number: "01",
    titleEn: "Application & CV Submission",
    titleAr: "التقديم وإرسال السيرة الذاتية",
    descEn:
      "Submit your resume for an active vacancy or join our general talent pool. Your candidate profile is generated instantly.",
    descAr:
      "قدّم سيرتك الذاتية لشواغرنا الحالية أو سجّل في قاعدة الكفاءات العامة ليتم إنشاء ملف المترشح فوراً.",
    icon: "file",
  },
  {
    number: "02",
    titleEn: "Technical & Creative Screening",
    titleAr: "التقييم الفني والإبداعي",
    descEn:
      "Our practice leads evaluate your portfolio, technical proficiency, and past project execution track record.",
    descAr:
      "يقوم قادة الأقسام بمراجعة سابقة أعمالك وخبراتك الهندسية والميدانية لتقييم ملاءمتها لمشاريعنا الكبرى.",
    icon: "search",
  },
  {
    number: "03",
    titleEn: "Interactive Specialist Interview",
    titleAr: "المقابلة التخصصية التفاعلية",
    descEn:
      "A deep-dive technical conversation and situational problem solving session with department directors.",
    descAr:
      "جلسة نقاش معمقة مع مديري الإنتاج والتصميم لاستعراض التحديات الهندسية وطرق حل المشكلات الميدانية.",
    icon: "users",
  },
  {
    number: "04",
    titleEn: "Executive Offer & Onboarding",
    titleAr: "العرض الوظيفي والانضمام للفريق",
    descEn:
      "Finalize terms, complete verified credential checks, and begin orchestrating Qatar's premier live experiences.",
    descAr:
      "اعتماد العرض الوظيفي، إنهاء إجراءات الانضمام، والبدء فوراً في قيادة أضخم الفعاليات والتجارب الحية.",
    icon: "sparkles",
  },
];

interface HiringJourneySectionProps {
  locale?: string;
  eyebrowEn?: string;
  eyebrowAr?: string;
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
  steps?: HiringStep[];
}

export function HiringJourneySection({
  locale = "en",
  eyebrowEn,
  eyebrowAr,
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
  steps = HIRING_STEPS,
}: HiringJourneySectionProps) {
  const isAr = locale === "ar";

  const resolvedEyebrow = isAr ? (eyebrowAr || eyebrowEn || "رحلة المترشح والتقييم") : (eyebrowEn || eyebrowAr || "TRANSPARENT PROCESS");
  const resolvedTitle = isAr ? (titleAr || titleEn || "مراحل وخطوات الانضمام إلى إي ثري") : (titleEn || titleAr || "Our Four-Step Hiring Journey");
  const resolvedSubtitle = isAr
    ? (subtitleAr || subtitleEn || "مسار واضح وشفاف يضمن اختيار أفضل الكفاءات وتوفير تجربة انضمام سلسة ومهنية.")
    : (subtitleEn || subtitleAr || "From initial credential submission to your first live activation — clear milestones at every step.");

  const renderIcon = (icon: string) => {
    switch (icon) {
      case "file":
        return <FileCheck className="w-6 h-6 text-cyan-400" />;
      case "search":
        return <Search className="w-6 h-6 text-indigo-400" />;
      case "users":
        return <Users className="w-6 h-6 text-emerald-400" />;
      case "sparkles":
      default:
        return <Sparkles className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <section
      data-testid="hiring-journey-section"
      aria-label={isAr ? "مراحل وخطوات التوظيف" : "Our Hiring Journey"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{resolvedEyebrow}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight">
          {resolvedTitle}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 font-medium">
          {resolvedSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {HIRING_STEPS.map((step) => (
          <div
            key={step.number}
            data-testid={`hiring-step-${step.number}`}
            className="group relative rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] hover:border-cyan-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {/* Header / Number & Icon */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-2xl font-black text-cyan-400/80 group-hover:text-cyan-400 transition-colors">
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] flex items-center justify-center shadow-inner">
                  {renderIcon(step.icon)}
                </div>
              </div>

              {/* Title & Desc */}
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2 leading-snug">
                {isAr ? step.titleAr : step.titleEn}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                {isAr ? step.descAr : step.descEn}
              </p>
            </div>

            {/* Bottom Indicator */}
            <div className="mt-6 pt-4 border-t border-[var(--border-level-1)] flex items-center gap-1.5 text-[11px] font-bold text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{isAr ? `المرحلة ${step.number}` : `Stage ${step.number}`}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
