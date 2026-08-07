"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Ticket, Compass, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/layout/LocaleProvider";
import { E3Logo } from "@/components/shared/E3Logo";

interface PulseOrbitProps {
  isOpen: boolean;
  onClose: () => void;
}

const b2cAttractions = [
  { id: "01", nameEn: "Pristine Snow Park", nameAr: "حديقة الثلج والرياضات الشتوية", categoryEn: "Permanent Attraction", categoryAr: "وجهة دائمة", status: "AVAILABLE", color: "#06b6d4", href: "/b2c" },
  { id: "02", nameEn: "Inflatable Obstacle World", nameAr: "مضمار التحدي الهوائي العملاق", categoryEn: "1,055m Guinness Record", categoryAr: "رقم قياسي عالمي 1055م", status: "SELLING FAST", color: "#f43f5e", href: "/b2c/discover" },
  { id: "03", nameEn: "Live Summer Festival 2026", nameAr: "مهرجان الصيف الترفيهي 2026", categoryEn: "Live Live Event", categoryAr: "فعالية حية مباشرة", status: "AVAILABLE", color: "#f59e0b", href: "/b2c/calendar" },
  { id: "04", nameEn: "Spatial VR Arena", nameAr: "ساحة التفاعل الرقمي والافتراضي", categoryEn: "Interactive VR", categoryAr: "تقنيات تفاعلية", status: "AVAILABLE", color: "#a855f7", href: "/b2c/team" },
];

export function PulseOrbit({ isOpen, onClose }: PulseOrbitProps) {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar";

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#0c0a14] text-white overflow-y-auto font-sans"
          dir={dir}
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? "دليل الفعاليات والاستكشاف" : "Pulse Orbit B2C Discovery Ring"}
        >
          {/* Vibrant Orbit Glows */}
          <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[130px] pointer-events-none" />

          {/* Header Bar */}
          <div className="relative z-10 p-6 md:px-12 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-4">
              <E3Logo isLight={false} size="md" />
              <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                {isAr ? "دليل تجارب الجمهور B2C" : "PULSE B2C ORBIT"}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/5 border border-white/15 text-zinc-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
              aria-label="Close Discovery Ring"
            >
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                {isAr ? "إغلاق" : "Close"}
              </span>
              <X className="w-5 h-5 text-cyan-400" />
            </button>
          </div>

          {/* Main Discovery Container */}
          <div className="relative z-10 flex-1 container mx-auto px-6 py-12 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Attraction Cards Grid */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {b2cAttractions.map((att, idx) => (
                <motion.div
                  key={att.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                >
                  <Link
                    href={`/${locale}${att.href}`}
                    onClick={onClose}
                    className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/40 transition-all duration-300 h-64 overflow-hidden"
                  >
                    <div
                      className="absolute top-0 end-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
                      style={{ backgroundColor: att.color }}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          {isAr ? att.categoryAr : att.categoryEn}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            att.status === "SELLING FAST"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse"
                              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                          }`}
                        >
                          {att.status === "SELLING FAST" ? (isAr ? "نفاد تذاكر سريع" : "SELLING FAST") : (isAr ? "التذاكر متاحة" : "AVAILABLE")}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors font-display">
                        {isAr ? att.nameAr : att.nameEn}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Ticket className="w-4 h-4" />
                        {isAr ? "حجز التذاكر واستكشاف" : "Explore & Book"}
                      </span>
                      {isAr ? <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1.5 transition-transform" /> : <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1.5 transition-transform" />}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Side Quick Actions */}
            <div className="lg:col-span-4 space-y-6 bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{isAr ? "تجارب حية يومية" : "Daily Live Experiences"}</h4>
                  <p className="text-xs text-zinc-400">{isAr ? "أكثر من ١.٢ مليون زائر سنوياً" : "1.2M+ Annual Festival Visitors"}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href={`/${locale}/b2c/calendar`}
                  onClick={onClose}
                  className="w-full py-3.5 px-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    {isAr ? "جدول الفعاليات التفاعلي" : "Full Event Calendar"}
                  </span>
                  {isAr ? <ArrowLeft className="w-4 h-4 text-zinc-400" /> : <ArrowRight className="w-4 h-4 text-zinc-400" />}
                </Link>

                <Link
                  href={`/${locale}/b2c/discover`}
                  onClick={onClose}
                  className="w-full py-3.5 px-5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-cyan-400 flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Compass className="w-4 h-4" />
                  <span>{isAr ? "استكشف جميع الوجهات" : "Discover All Destinations"}</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
