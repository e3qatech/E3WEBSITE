"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface SectionNavItem {
  id: string;
  labelEn: string;
  labelAr: string;
  targetId: string;
}

const DEFAULT_SECTIONS: SectionNavItem[] = [
  { id: "hero", labelEn: "Overview", labelAr: "نظرة عامة", targetId: "overview-section" },
  { id: "wowHow", labelEn: "WOW & HOW", labelAr: "الإبهار والتنفيذ", targetId: "wow-how-section" },
  { id: "objectives", labelEn: "Objectives", labelAr: "الأهداف", targetId: "objectives-section" },
  { id: "capabilities", labelEn: "Capabilities", labelAr: "القدرات", targetId: "capabilities-section" },
  { id: "engagementModels", labelEn: "Engagement", labelAr: "نماذج التعاقد", targetId: "engagement-section" },
  { id: "deliverables", labelEn: "Deliverables", labelAr: "المخرجات", targetId: "deliverables-section" },
  { id: "specialistModule", labelEn: "Specialist Tool", labelAr: "الأداة التخصصية", targetId: "specialist-section" },
  { id: "lifecycle", labelEn: "Lifecycle", labelAr: "دورة العمل", targetId: "lifecycle-section" },
  { id: "gallery", labelEn: "Gallery", labelAr: "المعرض", targetId: "gallery-section" },
  { id: "caseStudies", labelEn: "Case Studies", labelAr: "دراسات الحالة", targetId: "case-studies-section" },
  { id: "enterpriseReadiness", labelEn: "Readiness", labelAr: "الجاهزية", targetId: "readiness-section" },
  { id: "relatedSolutions", labelEn: "Related", labelAr: "خدمات متكاملة", targetId: "related-section" },
];

interface ServiceSectionNavigatorProps {
  locale: string;
  activeSections?: string[];
  hasCaseStudies?: boolean;
  hasGallery?: boolean;
  onOpenBriefBuilder?: () => void;
}

export function ServiceSectionNavigator({
  locale,
  activeSections,
  hasCaseStudies = true,
  hasGallery = true,
  onOpenBriefBuilder,
}: ServiceSectionNavigatorProps) {
  const isAr = locale === "ar";
  const [activeSectionId, setActiveSectionId] = useState<string>("overview-section");
  const [isSticky, setIsSticky] = useState(false);

  // Filter items to only show sections that exist in the DOM or are configured
  const navItems = DEFAULT_SECTIONS.filter((item) => {
    if (item.id === "caseStudies" && !hasCaseStudies) return false;
    if (item.id === "gallery" && !hasGallery) return false;
    if (activeSections && activeSections.length > 0) {
      return activeSections.includes(item.id);
    }
    return true;
  });

  useEffect(() => {
    const handleScroll = () => {
      // Toggle sticky state based on scroll position
      setIsSticky(window.scrollY > 400);

      // Find current active section
      const sectionElements = navItems
        .map((item) => document.getElementById(item.targetId))
        .filter((el): el is HTMLElement => el !== null);

      const scrollPos = window.scrollY + 160;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el.offsetTop <= scrollPos) {
          setActiveSectionId(el.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  const scrollToSection = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      aria-label={isAr ? "شريط التنقل بين أقسام الخدمة" : "Service Sections In-Page Navigation"}
      className={cn(
        "sticky top-16 z-30 w-full transition-all duration-300 backdrop-blur-md border-y bg-[var(--surface-default)]/90 border-[var(--border-level-2)] shadow-xs",
        isSticky ? "opacity-100 translate-y-0" : "opacity-95"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-4 py-2.5 overflow-x-auto no-scrollbar">
          {/* Scrollable Pill Nav */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {navItems.map((item) => {
              const isActive = activeSectionId === item.targetId;
              const label = isAr ? item.labelAr : item.labelEn;

              return (
                <button
                  key={item.id}
                  type="button"
                  data-target={item.targetId}
                  onClick={() => scrollToSection(item.targetId)}
                  className={cn(
                    "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-400",
                    isActive
                      ? "bg-emerald-500 text-zinc-950 shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Quick CTA button */}
          {onOpenBriefBuilder && (
            <button
              type="button"
              onClick={onOpenBriefBuilder}
              className="shrink-0 hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>{isAr ? "موجز المشروع" : "Project Brief"}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
