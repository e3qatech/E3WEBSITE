"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Compass,
  Home,
  Search,
  Sparkles,
  Ticket,
  Calendar,
  Briefcase,
  Layers,
  ArrowRight,
  HelpCircle,
  MapPin,
  FileText,
  RotateCcw,
} from "lucide-react";
import { localizeHref } from "@/lib/url-helper";

interface NotFoundViewProps {
  locale?: string;
}

export function NotFoundView({ locale = "en" }: NotFoundViewProps) {
  const router = useRouter();
  const isAr = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(localizeHref(`/b2c/discover?q=${encodeURIComponent(searchQuery.trim())}`, locale));
  };

  const quickPortals = [
    {
      titleEn: "Attractions & Worlds",
      titleAr: "التجارب والوجهات",
      descEn: "Explore world-class permanent and pop-up activations in Qatar",
      descAr: "استكشف أبرز الفعاليات والوجهات الترفيهية الحية",
      href: "/b2c/attractions",
      icon: Sparkles,
      color: "from-blue-600 to-indigo-600",
      badgeEn: "Popular",
      badgeAr: "شائع",
    },
    {
      titleEn: "Smart Packages",
      titleAr: "باقات الفعاليات والحفلات",
      descEn: "Celebration packages, VIP birthdays, and group bookings",
      descAr: "باقات أعياد الميلاد والاحتفالات والرحلات الجماعية",
      href: "/b2c/packages",
      icon: Ticket,
      color: "from-purple-600 to-pink-600",
      badgeEn: "Deals",
      badgeAr: "عروض",
    },
    {
      titleEn: "Event Calendar",
      titleAr: "أجندة الفعاليات",
      descEn: "Live schedules, seasonal operating times, and ticketing",
      descAr: "مواعيد العروض المباشرة وأوقات العمل والتذاكر",
      href: "/b2c/calendar",
      icon: Calendar,
      color: "from-emerald-600 to-teal-600",
      badgeEn: "Live",
      badgeAr: "مباشر",
    },
    {
      titleEn: "Insights & Press",
      titleAr: "الأخبار والرؤى والمقالات",
      descEn: "Editorial insights, official press releases, and announcements",
      descAr: "المقالات والبيانات الصحفية والتقارير الحصرية",
      href: "/b2c/insights",
      icon: FileText,
      color: "from-amber-600 to-orange-600",
      badgeEn: "New",
      badgeAr: "جديد",
    },
    {
      titleEn: "B2B Enterprise Solutions",
      titleAr: "خدمات الشركات والفعاليات الكبرى",
      descEn: "Event engineering, turnkey production, and spatial design",
      descAr: "هندسة الفعاليات، التصميم المكاني، والإنتاج المتكامل",
      href: "/b2b/services",
      icon: Briefcase,
      color: "from-cyan-600 to-blue-600",
      badgeEn: "B2B",
      badgeAr: "شركات",
    },
    {
      titleEn: "Interactive Map GIS",
      titleAr: "خريطة المواقع التفاعلية",
      descEn: "Navigate destinations across Doha, Lusail, and Qatar",
      descAr: "استكشف مواقع الوجهات في الدوحة ولوسيل وكافة مناطق قطر",
      href: "/b2c/locations",
      icon: MapPin,
      color: "from-rose-600 to-red-600",
      badgeEn: "GIS",
      badgeAr: "خريطة",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] flex flex-col justify-between relative overflow-hidden font-poppins transition-colors duration-300"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[var(--e3-royal-blue)]/15 via-[var(--e3-magenta)]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10 w-full flex-1 flex flex-col items-center justify-center text-center">
        {/* Animated Hologram 404 Headline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6 max-w-3xl mx-auto"
        >
          {/* Eyebrow Chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-md">
            <Compass className="w-4 h-4 text-[var(--e3-royal-blue)] animate-spin-slow" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--text-secondary)]">
              {isAr ? "رمز الخطأ 404 • الوجهة غير موجودة" : "ERROR CODE 404 • COORDINATE UNCHARTED"}
            </span>
          </div>

          {/* Big Stylized 404 Display */}
          <div className="relative select-none">
            <h1 className="text-8xl sm:text-9xl md:text-[12rem] font-black font-display uppercase tracking-tighter leading-none bg-gradient-to-r from-[var(--e3-royal-blue)] via-[var(--e3-magenta)] to-cyan-500 bg-clip-text text-transparent drop-shadow-2xl">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 blur-xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-400 bg-clip-text text-transparent">
              404
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black font-display uppercase tracking-tight text-[var(--text-primary)]">
              {isAr ? "يبدو أنك وصلت إلى إحداثيات مجهولة" : "Lost in the Experience Realm"}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
              {isAr
                ? "الصفحة أو الوجهة التي تحاول الوصول إليها قد تم نقلها أو تحديث مسارها أو أنها غير متوفرة حالياً."
                : "The attraction, experience coordinate, or portal you're looking for has moved to a new location or is temporarily unavailable."}
            </p>
          </div>

          {/* Live Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="pt-2 max-w-md mx-auto relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-default)]"
          >
            <Search className="w-4 h-4 absolute start-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder={isAr ? "ابحث عن الفعاليات، الباقات، أو الوجهات..." : "Search attractions, packages, or pages..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-11 pe-24 py-3 bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
            />
            <button
              type="submit"
              className="absolute end-1.5 px-4 py-2 rounded-xl bg-[var(--e3-royal-blue)] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              {isAr ? "بحث" : "Search"}
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href={localizeHref("/b2c/discover", locale)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--e3-royal-blue)] hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 group"
            >
              <Home className="w-4 h-4" />
              <span>{isAr ? "العودة إلى الاستكشاف" : "Return to Discover"}</span>
              <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </Link>

            <Link
              href={localizeHref("/b2c/attractions", locale)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[var(--e3-royal-blue)]" />
              <span>{isAr ? "استكشف كافة التجارب" : "Explore Attractions"}</span>
            </Link>

            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? "الصفحة السابقة" : "Go Back"}</span>
            </button>
          </div>
        </motion.div>

        {/* Quick Discovery Hub Bento Cards */}
        <div className="w-full mt-16 pt-12 border-t border-[var(--border-level-2)] text-start space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--e3-royal-blue)] block">
                {isAr ? "بوابات مقترحة" : "SUGGESTED DESTINATIONS"}
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-display uppercase tracking-tight text-[var(--text-primary)]">
                {isAr ? "قد ترغب في زيارة إحدى هذه الصفحات" : "Popular Portals & Highlights"}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickPortals.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.4 }}
                >
                  <Link
                    href={localizeHref(item.href, locale)}
                    className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-0.5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-[var(--text-secondary)]">
                          {isAr ? item.badgeAr : item.badgeEn}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--e3-royal-blue)] transition-colors">
                          {isAr ? item.titleAr : item.titleEn}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                          {isAr ? item.descAr : item.descEn}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[var(--border-level-2)] flex items-center justify-between text-xs font-bold text-[var(--e3-royal-blue)]">
                      <span>{isAr ? "انتقال سريع" : "Explore Now"}</span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Need Assistance Footer Bar */}
        <div className="mt-12 p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[var(--e3-royal-blue)] shrink-0" />
            <span>
              {isAr
                ? "هل تحتاج لمساعدة فورية؟ تواصل مع فريق تجارب الضيوف في إي ثري قطر."
                : "Need immediate assistance? Reach out to E3 Qatar Guest Concierge."}
            </span>
          </div>
          <Link
            href={localizeHref("/b2c/contact", locale)}
            className="font-bold text-[var(--e3-royal-blue)] hover:underline shrink-0"
          >
            {isAr ? "تواصل معنا ↗" : "Contact Concierge ↗"}
          </Link>
        </div>
      </main>
    </div>
  );
}
