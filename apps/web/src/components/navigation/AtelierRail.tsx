"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, ShieldCheck, Briefcase, Building2, Calendar, FileText, Phone } from "lucide-react";
import { useLocale } from "@/components/layout/LocaleProvider";
import { E3Logo } from "@/components/shared/E3Logo";
import { cn } from "@/lib/utils";

interface AtelierRailProps {
  isOpen: boolean;
  onClose: () => void;
}

const b2bNavItems = [
  { id: "01", labelEn: "Services & Capabilities", labelAr: "الخدمات والقدرات الهندسية", href: "/b2b/services", icon: Briefcase, descEn: "Spatial design, kinetic lighting, stage fabrication", descAr: "التصميم المكاني، الإضاءة الحركية، تصنيع المسارح" },
  { id: "02", labelEn: "Case Studies & Projects", labelAr: "دراسات الحالة والمشاريع", href: "/b2b/cases", icon: FileText, descEn: "450+ corporate activations & government summits", descAr: "+٤٥٠ مشروع مؤسسي وقمم حكومية" },
  { id: "03", labelEn: "Client Directory", labelAr: "دليل الشركاء والعملاء", href: "/b2b/clients", icon: Building2, descEn: "Trusted by tier-1 brands and ministries across MENA", descAr: "موضع ثقة الجهات الحكومية والشركات الكبرى" },
  { id: "04", labelEn: "Engineering Team & Logistics", labelAr: "فريق الهندسة واللوجستيات", href: "/b2b/team", icon: ShieldCheck, descEn: "Certified structural engineers & WebXR specialists", descAr: "مهندسون معتمدون ومتخصصون في التقنيات المكانيّة" },
  { id: "05", labelEn: "Schedule RFP / Consultation", labelAr: "طلب تقديم عروض / الاستشارة", href: "/b2b/contact", icon: Calendar, descEn: "Direct consultation with technical directors", descAr: "استشارة مباشرة مع المدراء الفنيين" },
];

export function AtelierRail({ isOpen, onClose }: AtelierRailProps) {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar";
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard accessibility: Escape key closes menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#090b10] text-white overflow-y-auto font-sans"
          dir={dir}
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? "القائمة الرئيسية للهندسة والأعمال" : "Atelier Rail B2B Navigation"}
        >
          {/* Architectural Ambient Backdrop Grid */}
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute top-0 end-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Header Bar */}
          <div className="relative z-10 p-6 md:px-12 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-4">
              <E3Logo isLight={false} size="md" />
              <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {isAr ? "بوابة هندسة الفعاليات B2B" : "ATELIER B2B NAVIGATION"}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/5 border border-white/15 text-zinc-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
              aria-label="Close Navigation"
            >
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                {isAr ? "إغلاق" : "Close"}
              </span>
              <X className="w-5 h-5 text-emerald-400" />
            </button>
          </div>

          {/* Main Spatial Grid */}
          <div className="relative z-10 flex-1 container mx-auto px-6 py-12 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Numbered Navigation List */}
            <div className="lg:col-span-8 space-y-4">
              {b2bNavItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: isAr ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                  >
                    <Link
                      href={`/${locale}${item.href}`}
                      onClick={onClose}
                      className="group relative flex items-start justify-between p-5 md:p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden"
                    >
                      <div className="flex items-start gap-5">
                        <span className="font-mono text-emerald-400 font-bold text-sm md:text-base pt-1">
                          {item.id}
                        </span>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <Icon className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors font-display">
                              {isAr ? item.labelAr : item.labelEn}
                            </h3>
                          </div>
                          <p className="text-xs md:text-sm text-zinc-400 font-normal max-w-lg">
                            {isAr ? item.descAr : item.descEn}
                          </p>
                        </div>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                        <ArrowUpRight className="w-5 h-5 rtl:-scale-x-100" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Side Metric Panel */}
            <div className="lg:col-span-4 space-y-6 bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">
                  {isAr ? "القدرات الفنية المعتمدة" : "CERTIFIED B2B CAPABILITIES"}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {isAr
                    ? "توفير حلول الهندسة المتكاملة للمسارح والفعاليات الكبرى مع الالتزام بأعلى معايير الأمان والتكنولوجيا."
                    : "End-to-end stage engineering, structural analysis, kinetic lighting, and WebXR spatial activations across Qatar and the GCC."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black text-white font-mono">450+</div>
                  <div className="text-[11px] text-zinc-400 font-medium">
                    {isAr ? "مشروع مؤسسي" : "Activations Delivered"}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black text-emerald-400 font-mono">1,055m</div>
                  <div className="text-[11px] text-zinc-400 font-medium">
                    {isAr ? "رقم قياسي عالمي" : "Guinness World Record"}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/${locale}/b2b/contact`}
                  onClick={onClose}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isAr ? "حجز استشارة هندسية" : "Book Engineering Consultation"}</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
