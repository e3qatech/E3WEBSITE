"use client";

import React, { useState, useEffect } from "react";
import { FileText, ArrowRight } from "lucide-react";
import { CASE_STUDY_LABELS } from "@/lib/case-studies/case-labels";

interface CaseDetailFloatingDockProps {
  locale: string;
  onOpenBriefBuilder: () => void;
}

export function CaseDetailFloatingDock({
  locale,
  onOpenBriefBuilder,
}: CaseDetailFloatingDockProps) {
  const isAr = locale === "ar";
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show dock after scrolling down 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 start-1/2 -translate-x-1/2 z-40 w-auto max-w-[90vw] animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-3 p-2 ps-4 rounded-full bg-[var(--surface-default)]/95 backdrop-blur-xl border border-[var(--border-level-2)] shadow-2xl">
        <span className="text-xs font-bold text-[var(--text-primary)] hidden sm:inline">
          {isAr
            ? "هل تخطط لمشروع ترفيهي أو فعالية وطنية؟"
            : "Planning a landmark project or event?"}
        </span>

        <button
          onClick={onOpenBriefBuilder}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{CASE_STUDY_LABELS.detail.floatingBriefCta[isAr ? "ar" : "en"]}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
