"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Ticket, MapPin, Sparkles, HelpCircle, Compass, Star, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { isExternalUrl, normalizeExternalUrl } from "@/lib/url-helper";

interface AttractionStickyNavProps {
  name: string;
  logoUrl?: string | null;
  isOpen?: boolean;
  bookingUrl?: string | null;
  locale?: string;
}

export function AttractionStickyNav({
  name,
  logoUrl,
  isOpen = true,
  bookingUrl,
  locale = "en",
}: AttractionStickyNavProps) {
  const isAr = locale === "ar";
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("overview");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 400);

      // Detect active section on scroll
      const sections = ["overview", "whats-inside", "pricing", "location", "social-reviews", "faq"];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "overview", labelEn: "Overview", labelAr: "نظرة عامة", icon: <Sparkles className="w-3 h-3" /> },
    { id: "whats-inside", labelEn: "What's Inside", labelAr: "محتويات الوجهة", icon: <Compass className="w-3 h-3" /> },
    { id: "pricing", labelEn: "Pricing & Passes", labelAr: "الباقات والتذاكر", icon: <Ticket className="w-3 h-3" /> },
    { id: "location", labelEn: "Location & Hours", labelAr: "الموقع والمواعيد", icon: <MapPin className="w-3 h-3" /> },
    { id: "social-reviews", labelEn: "Reviews", labelAr: "آراء الزوار", icon: <Star className="w-3 h-3" /> },
    { id: "faq", labelEn: "FAQ", labelAr: "الأسئلة الشائعة", icon: <HelpCircle className="w-3 h-3" /> },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 85;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={cn(
        "sticky top-20 z-40 w-full transition-all duration-300 pointer-events-none",
        scrolled
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      )}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="pointer-events-auto rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)]/95 backdrop-blur-xl shadow-xl p-2 md:p-2.5 flex items-center justify-between gap-3">
          {/* Left: Brand Identity & Status */}
          <div className="flex items-center gap-3 shrink-0">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={name}
                className="w-7 h-7 object-contain rounded-lg bg-[var(--surface-hover)] p-0.5 border border-[var(--border-level-2)]"
              />
            )}
            <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)] max-w-[140px] sm:max-w-[200px] truncate">
              {name}
            </span>

            {isOpen ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isAr ? "مفتوح" : "Open"}</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                {isAr ? "مغلق" : "Closed"}
              </span>
            )}
          </div>

          {/* Middle: Horizontal Nav Pills */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-none px-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  )}
                >
                  {item.icon}
                  <span>{isAr ? item.labelAr : item.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Instant Book Tickets Action */}
          <div className="flex items-center gap-2 shrink-0">
            {bookingUrl && (
              isExternalUrl(bookingUrl) ? (
                <a
                  href={normalizeExternalUrl(bookingUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md hover:scale-105 cursor-pointer shrink-0"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{isAr ? "احجز الآن" : "Book Tickets"}</span>
                  <ArrowUpRight className="w-3 h-3 ms-0.5 rtl:rotate-90" />
                </a>
              ) : (
                <Link
                  href={bookingUrl}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md hover:scale-105 cursor-pointer shrink-0"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{isAr ? "احجز الآن" : "Book Tickets"}</span>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
