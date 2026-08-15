"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Layers, Calendar, Trophy, Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionNavItem {
  id: string;
  labelEn: string;
  labelAr: string;
  hasContent: boolean;
}

interface ProjectIdentityBarProps {
  locale?: string;
  clientName?: string | null;
  category?: string | null;
  year?: number | null;
  isFeatured?: boolean;
  attraction?: {
    id: string;
    slug?: string | null;
    nameEn?: string | null;
    nameAr?: string | null;
  } | null;
  hasChallenge?: boolean;
  hasSolution?: boolean;
  hasResult?: boolean;
  hasImpact?: boolean;
  hasTeam?: boolean;
  hasTestimonials?: boolean;
  hasGallery?: boolean;
}

export function ProjectIdentityBar({
  locale = "en",
  clientName,
  category,
  year,
  isFeatured = false,
  attraction,
  hasChallenge = false,
  hasSolution = false,
  hasResult = false,
  hasImpact = false,
  hasTeam = false,
  hasTestimonials = false,
  hasGallery = false,
}: ProjectIdentityBarProps) {
  const isAr = locale === "ar";
  const [activeSection, setActiveSection] = useState<string>("overview");

  const attractionName = isAr
    ? attraction?.nameAr || attraction?.nameEn
    : attraction?.nameEn;

  const navItems: SectionNavItem[] = [
    { id: "overview", labelEn: "Overview", labelAr: "نظرة عامة", hasContent: true },
    { id: "challenge", labelEn: "The Challenge", labelAr: "التحدي", hasContent: hasChallenge },
    { id: "solution", labelEn: "Our Solution", labelAr: "الحل", hasContent: hasSolution },
    { id: "result", labelEn: "The Result", labelAr: "النتائج", hasContent: hasResult },
    { id: "impact", labelEn: "Impact & Metrics", labelAr: "الأثر والأرقام", hasContent: hasImpact },
    { id: "team", labelEn: "Key Team", labelAr: "فريق العمل", hasContent: hasTeam },
    { id: "testimonials", labelEn: "Testimonials", labelAr: "شهادات العملاء", hasContent: hasTestimonials },
    { id: "gallery", labelEn: "Media Gallery", labelAr: "معرض الصور", hasContent: hasGallery },
  ].filter((item) => item.hasContent);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  return (
    <div
      id="overview"
      data-testid="project-identity-bar"
      aria-label={isAr ? "شريط هوية المشروع والتنقل" : "Project Identity & Navigation Bar"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full bg-[#0a0f1d] border-b border-white/10"
    >
      {/* 1. Project Identity Overview Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 items-center">
          {/* Client */}
          {clientName && (
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? "العميل" : "CLIENT"}</span>
              </div>
              <div className="text-white font-bold text-sm sm:text-base font-syne truncate">
                {clientName}
              </div>
            </div>
          )}

          {/* Category */}
          {category && (
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isAr ? "الفئة" : "CATEGORY"}</span>
              </div>
              <div className="text-white font-bold text-sm sm:text-base font-syne truncate">
                {category}
              </div>
            </div>
          )}

          {/* Year */}
          {year && (
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? "السنة" : "YEAR"}</span>
              </div>
              <div className="text-white font-bold text-sm sm:text-base font-syne">
                {year}
              </div>
            </div>
          )}

          {/* Featured Status */}
          {isFeatured && (
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? "الدرجة" : "TIER"}</span>
              </div>
              <div className="text-amber-300 font-bold text-xs sm:text-sm font-mono uppercase">
                {isAr ? "مشروع رئيسي مميز" : "Flagship Feature"}
              </div>
            </div>
          )}

          {/* Linked Attraction CTA */}
          {attraction && (
            <div className="col-span-2 md:col-span-4 lg:col-span-1 flex justify-start lg:justify-end">
              <Link
                href={`/${locale}/b2c/attractions/${attraction.slug || attraction.id}`}
                data-testid="identity-attraction-link"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm group"
              >
                <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[140px]">{attractionName}</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 2. Compact Sticky Desktop Section Navigator */}
      {navItems.length > 1 && (
        <div className="sticky top-16 z-30 bg-[#080b12]/90 backdrop-blur-md border-t border-white/10 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 sm:gap-2 py-2.5 overflow-x-auto scrollbar-none">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <Link
                    key={item.id}
                    href={`#${item.id}`}
                    data-testid={`nav-link-${item.id}`}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all shrink-0 font-mono",
                      isActive
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {isAr ? item.labelAr : item.labelEn}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
