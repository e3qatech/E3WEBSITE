"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Layers, Calendar, Trophy, ExternalLink } from "lucide-react";
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
  const [activeSection, setActiveSection] = useState<string>("story");

  const attractionName = isAr
    ? attraction?.nameAr || attraction?.nameEn
    : attraction?.nameEn;

  const hasStory = hasChallenge || hasSolution || hasResult;

  const navItems: SectionNavItem[] = [
    { id: "overview", labelEn: "Overview", labelAr: "نظرة عامة", hasContent: Boolean(clientName) || hasStory },
    { id: "challenge", labelEn: "Challenge", labelAr: "التحدي", hasContent: hasChallenge },
    { id: "solution", labelEn: "Solution", labelAr: "الحل", hasContent: hasSolution },
    { id: "result", labelEn: "Result", labelAr: "النتائج", hasContent: hasResult },
    { id: "impact", labelEn: "Impact", labelAr: "الأثر", hasContent: hasImpact },
    { id: "attraction", labelEn: "Attraction", labelAr: "الوجهة", hasContent: Boolean(attraction) },
    { id: "gallery", labelEn: "Gallery", labelAr: "المعرض", hasContent: hasGallery },
    { id: "team", labelEn: "Team", labelAr: "الفريق", hasContent: hasTeam },
    { id: "testimonials", labelEn: "Endorsements", labelAr: "الشهادات", hasContent: hasTestimonials },
  ].filter((item) => item.hasContent);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220;
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
      id="identity-bar"
      data-testid="project-identity-bar"
      aria-label={isAr ? "شريط هوية المشروع والتنقل" : "Project Identity & Navigation Bar"}
      dir={isAr ? "rtl" : "ltr"}
      className="sticky top-16 z-40 w-full bg-[#080d1a]/95 backdrop-blur-xl border-y border-white/10 shadow-2xl transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Compact Project Metadata Chips */}
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto scrollbar-none py-0.5">
          {/* Client */}
          {clientName && (
            <div className="flex items-center gap-1.5 shrink-0 text-xs text-slate-300 font-medium">
              <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-syne font-bold text-white max-w-[150px] sm:max-w-[200px] truncate">
                {clientName}
              </span>
            </div>
          )}

          {/* Category */}
          {category && (
            <div className="flex items-center gap-1.5 shrink-0 text-xs text-slate-300 font-medium border-s border-white/10 ps-3 sm:ps-5">
              <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-200 font-medium">{category}</span>
            </div>
          )}

          {/* Year */}
          {year && (
            <div className="flex items-center gap-1.5 shrink-0 text-xs text-slate-300 font-mono border-s border-white/10 ps-3 sm:ps-5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{year}</span>
            </div>
          )}

          {/* Linked Attraction Badge */}
          {attraction && (
            <Link
              href={`/${locale}/b2c/attractions/${attraction.slug || attraction.id}`}
              data-testid="identity-attraction-link"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-colors shrink-0 shadow-sm group"
            >
              <Trophy className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[120px]">{attractionName}</span>
              <ExternalLink className="w-2.5 h-2.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {/* Right Side: Section Fast-Scroll Navigation Pills */}
        {navItems.length > 0 && (
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-0.5 md:justify-end border-t md:border-t-0 border-white/10 pt-2 md:pt-0">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <Link
                  key={item.id}
                  href={`#${item.id}`}
                  data-testid={`nav-link-${item.id}`}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold tracking-wider transition-all shrink-0 font-mono",
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  )}
                >
                  {isAr ? item.labelAr : item.labelEn}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
