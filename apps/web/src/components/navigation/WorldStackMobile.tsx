"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Compass, Briefcase, Sun, CloudRain, Wind, Sparkles, LogIn, Phone } from "lucide-react";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useTheme } from "@/components/layout/ThemeProvider";
import { E3Logo } from "@/components/shared/E3Logo";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { cn } from "@/lib/utils";

interface WorldStackMobileProps {
  isOpen: boolean;
  onClose: () => void;
  weatherSummary?: {
    temperature: number;
    conditionEn: string;
    conditionAr: string;
    isSandstorm: boolean;
  };
}

export function WorldStackMobile({ isOpen, onClose, weatherSummary }: WorldStackMobileProps) {
  const { locale, dir } = useLocale();
  const { theme, setTheme } = useTheme();
  const isAr = locale === "ar";
  const [b2bExpanded, setB2bExpanded] = useState(true);
  const [b2cExpanded, setB2cExpanded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#09090b] text-white md:hidden overflow-y-auto font-sans"
          dir={dir}
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? "قائمة التصفح للهاتف" : "Mobile World Stack Menu"}
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-20 p-5 flex items-center justify-between bg-[#09090b]/95 backdrop-blur-lg border-b border-white/10">
            <E3Logo isLight={false} size="sm" />

            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="pill" />
              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-white/10 text-white flex items-center gap-1.5"
                aria-label="Close Mobile Menu"
              >
                <span className="text-xs font-bold uppercase tracking-wider">{isAr ? "إغلاق" : "Close"}</span>
                <X className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Scrollable Accordion Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Live Weather Widget */}
            {weatherSummary && (
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    {weatherSummary.isSandstorm ? <Wind className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isAr ? "طريـق الدوحة الحـي" : "Doha Live Atmosphere"}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {isAr ? weatherSummary.conditionAr : weatherSummary.conditionEn}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-base font-extrabold text-amber-400">
                  {weatherSummary.temperature}°C
                </span>
              </div>
            )}

            {/* Accordion 1: B2B Enterprise Engineering */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
              <button
                onClick={() => setB2bExpanded(!b2bExpanded)}
                className="w-full p-4 flex items-center justify-between text-start font-bold text-base text-white"
              >
                <span className="flex items-center gap-2 text-emerald-400">
                  <Briefcase className="w-5 h-5" />
                  <span>{isAr ? "بوابة الشركات والهندسة (B2B)" : "B2B Enterprise Engineering"}</span>
                </span>
                <ChevronDown className={cn("w-5 h-5 transition-transform", b2bExpanded && "rotate-180")} />
              </button>

              {b2bExpanded && (
                <div className="p-4 pt-0 space-y-2 border-t border-white/5">
                  {[
                    { labelEn: "Services & Capabilities", labelAr: "الخدمات والقدرات الهندسية", href: "/b2b/services" },
                    { labelEn: "Case Studies & Projects", labelAr: "المشاريع ودراسات الحالة", href: "/b2b/cases" },
                    { labelEn: "Clients Directory", labelAr: "دليل الشركات والعملاء", href: "/b2b/clients" },
                    { labelEn: "Engineering Team", labelAr: "فريق الهندسة والتنفيذ", href: "/b2b/team" },
                    { labelEn: "Contact & RFP", labelAr: "طلب تقديم عروض / الاستشارة", href: "/b2b/contact" },
                  ].map((sub, i) => (
                    <Link
                      key={i}
                      href={`/${locale}${sub.href}`}
                      onClick={onClose}
                      className="block p-3 rounded-xl hover:bg-white/5 text-sm text-zinc-300 font-medium"
                    >
                      {isAr ? sub.labelAr : sub.labelEn}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion 2: B2C Public Attractions */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
              <button
                onClick={() => setB2cExpanded(!b2cExpanded)}
                className="w-full p-4 flex items-center justify-between text-start font-bold text-base text-white"
              >
                <span className="flex items-center gap-2 text-cyan-400">
                  <Compass className="w-5 h-5" />
                  <span>{isAr ? "تجارب الجمهور والفعاليات (B2C)" : "B2C Public Experiences"}</span>
                </span>
                <ChevronDown className={cn("w-5 h-5 transition-transform", b2cExpanded && "rotate-180")} />
              </button>

              {b2cExpanded && (
                <div className="p-4 pt-0 space-y-2 border-t border-white/5">
                  {[
                    { labelEn: "Discover Attractions", labelAr: "استكشف جميع الوجهات", href: "/b2c/discover" },
                    { labelEn: "Live Event Calendar", labelAr: "جدول الفعاليات التفاعلي", href: "/b2c/calendar" },
                    { labelEn: "Team & Organizers", labelAr: "فريق تنظيم الفعاليات", href: "/b2c/team" },
                    { labelEn: "Public Contact", labelAr: "تواصل مع خدمة العملاء", href: "/b2c/contact" },
                  ].map((sub, i) => (
                    <Link
                      key={i}
                      href={`/${locale}${sub.href}`}
                      onClick={onClose}
                      className="block p-3 rounded-xl hover:bg-white/5 text-sm text-zinc-300 font-medium"
                    >
                      {isAr ? sub.labelAr : sub.labelEn}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Account Portals */}
            <div className="pt-2">
              <Link
                href={`/${locale}/login/admin`}
                onClick={onClose}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-sm font-bold text-white"
              >
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  {isAr ? "تسجيل الدخول للمنصات" : "Platform Login Portals"}
                </span>
                <span className="text-xs text-zinc-400 font-mono">SUPER / STAFF / B2B</span>
              </Link>
            </div>
          </div>

          {/* Sticky Thumb-Zone Primary CTA Bar */}
          <div className="sticky bottom-0 z-20 p-5 bg-[#09090b] border-t border-white/10">
            <Link
              href={`/${locale}/b2b/contact`}
              onClick={onClose}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-500 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-transform"
            >
              <Phone className="w-5 h-5" />
              <span>{isAr ? "تواصل مباشر مع مهندسينا" : "Connect with Technical Directors"}</span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
