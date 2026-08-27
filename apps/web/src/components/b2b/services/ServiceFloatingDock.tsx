"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, PhoneCall, Download, ChevronUp } from "lucide-react";
import { localizeHref } from "@/lib/url-helper";
import { cn } from "@/lib/utils";

interface ServiceFloatingDockProps {
  locale: string;
  onOpenBriefBuilder: () => void;
}

export function ServiceFloatingDock({ locale, onOpenBriefBuilder }: ServiceFloatingDockProps) {
  const isAr = locale === "ar";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show dock after scrolling past 400px
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside aria-label="Quick Actions" className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-2xl bg-[var(--surface-default)]/90 backdrop-blur-xl border border-[var(--border-level-2)] shadow-2xl shadow-black/20">
        {/* Primary Brief Builder Button */}
        <button
          onClick={onOpenBriefBuilder}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
        >
          <FileText className="w-4 h-4" />
          <span>{isAr ? "موجز المشروع" : "Build Project Brief"}</span>
        </button>

        {/* Consultation Link */}
        <Link
          href={localizeHref("/b2b/contact", locale)}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-default)] text-[var(--text-primary)] font-semibold text-xs sm:text-sm border border-[var(--border-level-2)] transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
          <span>{isAr ? "طلب استشارة" : "Request Consultation"}</span>
        </Link>

        {/* Scroll To Top Anchor */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="p-2.5 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-level-2)] transition-all cursor-pointer"
          title={isAr ? "العودة للأعلى" : "Back to top"}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
