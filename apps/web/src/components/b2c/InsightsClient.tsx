"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Newspaper,
  Radio,
  FileText,
  User,
  Share2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { formatLocalizedText } from "@/lib/utils";
import { localizeHref } from "@/lib/url-helper";

interface InsightItem {
  id: string;
  contentType: string;
  titleEn: string;
  titleAr?: string | null;
  slugEn: string;
  slugAr?: string | null;
  excerptEn?: string | null;
  excerptAr?: string | null;
  bodyEn?: string | null;
  bodyAr?: string | null;
  featuredMediaId?: string | null;
  featuredMediaUrl?: string | null;
  publishedAt?: string | Date | null;
  featured?: boolean;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    firstNameAr?: string | null;
    lastNameAr?: string | null;
    designation: string;
    designationAr?: string | null;
    profileImage?: string | null;
    slug?: string;
  } | null;
}

interface InsightsClientProps {
  initialInsights: InsightItem[];
  locale: string;
}

const FALLBACK_INSIGHTS: InsightItem[] = [
  {
    id: "fb-1",
    contentType: "ARTICLE",
    titleEn: "The Future of Immersive Entertainment: Qatar's New Era of Spatial Play",
    titleAr: "مستقبل الترفيه التفاعلي: حقبة قطر الجديدة في التجارب المكانية والترفيه الرقمي",
    slugEn: "future-of-immersive-entertainment-qatar",
    slugAr: "future-of-immersive-entertainment-qatar",
    excerptEn: "How next-generation physical-digital attractions are reshaping family leisure, cultural events, and high-energy indoor play in Doha.",
    excerptAr: "كيف تعيد وجهات الترفيه التفاعلية المدمجة تشكيل أوقات الفراغ العائلي والفعاليات الكبرى والأنشطة المغلقة في الدوحة.",
    featuredMediaId: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    publishedAt: new Date().toISOString(),
    featured: true,
    author: {
      id: "auth-1",
      firstName: "E3 Creative",
      lastName: "Labs",
      firstNameAr: "مختبرات إي ثري",
      lastNameAr: "الإبداعية",
      designation: "Entertainment Architecture",
      designationAr: "هندسة التجارب الترفيهية",
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "fb-2",
    contentType: "NEWS",
    titleEn: "E3 Qatar Announces Landmark Expansion of Inflatapark & Urban Arenas",
    titleAr: "إي ثري قطر تعلن عن توسعة كبرى لإنفلاتابارك والساحات الحضرية الترفيهية",
    slugEn: "e3-qatar-announces-landmark-expansion",
    slugAr: "e3-qatar-announces-landmark-expansion",
    excerptEn: "New flagship activations launch across Mall of Qatar and Doha Festival City, featuring multi-tiered obstacle courses and VIP party suites.",
    excerptAr: "إطلاق فعاليات تجريبية جديدة في قطر مول ودوحة فستيفال سيتي مع مسارات حواجز متعددة المستويات وأجنحة حفلات مميزة.",
    featuredMediaId: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    featured: false,
    author: {
      id: "auth-2",
      firstName: "Tariq",
      lastName: "Al-Mansoor",
      firstNameAr: "طارق",
      lastNameAr: "المنصور",
      designation: "Head of Operations",
      designationAr: "رئيس العمليات التشغيلية",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "fb-3",
    contentType: "TECHNICAL_INSIGHT",
    titleEn: "Engineering Safe, High-Capacity Indoor Dunes: The Science of Inflatarun",
    titleAr: "هندسة الكثبان الترفيهية الآمنة عالية السعة: المعايير الفنية لإنفلاتاران",
    slugEn: "engineering-safe-high-capacity-indoor-dunes",
    slugAr: "engineering-safe-high-capacity-indoor-dunes",
    excerptEn: "A deep dive into airflow pressure dynamics, anti-microbial fabric technology, and biometric crowd safety management systems.",
    excerptAr: "نظرة تقنية متعمقة على ديناميكيات ضغط الهواء، أقمشة الحماية، وأنظمة إدارة سلامة وتدفق الحشود الذكية.",
    featuredMediaId: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    featured: false,
    author: {
      id: "auth-3",
      firstName: "Dr. Sarah",
      lastName: "Jenkins",
      firstNameAr: "د. سارة",
      lastNameAr: "جينكينز",
      designation: "Safety & Compliance Lead",
      designationAr: "مسؤولة السلامة والامتثال",
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    id: "fb-4",
    contentType: "EVENT_RECAP",
    titleEn: "Behind the Scenes: Nickelodeon & SpongeBob Activation at Meryal Waterpark",
    titleAr: "كواليس الفعالية: تجربة سبونج بوب ونيكلوديون في حديقة مريال المائية",
    slugEn: "behind-the-scenes-spongebob-meryal",
    slugAr: "behind-the-scenes-spongebob-meryal",
    excerptEn: "Over 45,000 visitors experienced live meet-and-greets, interactive musical parades, and custom obstacle zones during the celebration.",
    excerptAr: "أكثر من 45,000 زائر استمتعوا بالعروض الحية والتفاعلية والمواكب الموسيقية خلال الفعالية الخاصة في لوسيل.",
    featuredMediaId: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    publishedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    featured: false,
    author: {
      id: "auth-4",
      firstName: "Nasser",
      lastName: "Al-Kuwari",
      firstNameAr: "ناصر",
      lastNameAr: "الكواري",
      designation: "Brand Partnerships",
      designationAr: "إدارة شراكات العلامات",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
  },
];

export function InsightsClient({ initialInsights, locale }: InsightsClientProps) {
  const isAr = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");

  const allInsights = useMemo(() => {
    if (Array.isArray(initialInsights) && initialInsights.length > 0) {
      return initialInsights;
    }
    return FALLBACK_INSIGHTS;
  }, [initialInsights]);

  const contentTypeTabs = [
    { id: "ALL", labelEn: "All Stories", labelAr: "كافة الموضوعات", icon: Sparkles },
    { id: "ARTICLE", labelEn: "Articles & Thought Leadership", labelAr: "مقالات ورؤى", icon: BookOpen },
    { id: "NEWS", labelEn: "News & Press Releases", labelAr: "أخبار وبيانات صحفية", icon: Newspaper },
    { id: "EVENT_RECAP", labelEn: "Event Recaps", labelAr: "تقارير الفعاليات", icon: Radio },
    { id: "TECHNICAL_INSIGHT", labelEn: "Technical Insights", labelAr: "رؤى هندسية وتقنية", icon: FileText },
    { id: "ANNOUNCEMENT", labelEn: "Announcements", labelAr: "إعلانات رسمية", icon: TrendingUp },
  ];

  const filteredInsights = useMemo(() => {
    return allInsights.filter((item) => {
      const title = (isAr ? item.titleAr || item.titleEn : item.titleEn) || "";
      const excerpt = (isAr ? item.excerptAr || item.excerptEn : item.excerptEn) || "";
      const query = searchQuery.toLowerCase().trim();

      const matchesQuery =
        !query ||
        title.toLowerCase().includes(query) ||
        excerpt.toLowerCase().includes(query);

      const matchesType =
        selectedType === "ALL" ||
        item.contentType === selectedType ||
        (selectedType === "NEWS" && item.contentType === "PRESS_RELEASE");

      return matchesQuery && matchesType;
    });
  }, [allInsights, searchQuery, selectedType, isAr]);

  const spotlightItem = useMemo(() => {
    return filteredInsights.find((i) => i.featured) || filteredInsights[0] || null;
  }, [filteredInsights]);

  const remainingItems = useMemo(() => {
    if (!spotlightItem) return filteredInsights;
    return filteredInsights.filter((i) => i.id !== spotlightItem.id);
  }, [filteredInsights, spotlightItem]);

  const getMediaSrc = (item: InsightItem) => {
    return (
      item.featuredMediaUrl ||
      item.featuredMediaId ||
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80"
    );
  };

  const getAuthorName = (author: InsightItem["author"]) => {
    if (!author) return isAr ? "فريق إي ثري قطر" : "E3 Editorial Team";
    if (isAr) {
      const first = author.firstNameAr || author.firstName || "";
      const last = author.lastNameAr || author.lastName || "";
      return `${first} ${last}`.trim() || author.firstName;
    }
    return `${author.firstName || ""} ${author.lastName || ""}`.trim() || "E3 Team";
  };

  const getAuthorDesignation = (author: InsightItem["author"]) => {
    if (!author) return isAr ? "إدارة المحتوى والتحرير" : "E3 Editorial & Media";
    if (isAr) {
      return author.designationAr || author.designation || "فريق العمل";
    }
    return author.designation || "E3 Specialist";
  };

  const getReadingTime = (bodyText?: string | null, excerptText?: string | null) => {
    const text = bodyText || excerptText || "";
    const words = text.trim().split(/\s+/).length;
    const mins = Math.max(2, Math.ceil(words / 180));
    return isAr ? `${mins} دقائق قراءة` : `${mins} min read`;
  };

  const getContentTypeBadge = (type: string) => {
    switch (type) {
      case "ARTICLE":
        return { en: "ARTICLE", ar: "مقال تحليلي", color: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30" };
      case "NEWS":
        return { en: "NEWS", ar: "خبر صحفي", color: "text-blue-700 dark:text-blue-300 bg-blue-500/15 border-blue-500/30" };
      case "PRESS_RELEASE":
        return { en: "PRESS RELEASE", ar: "بيان إعلامي", color: "text-purple-700 dark:text-purple-300 bg-purple-500/15 border-purple-500/30" };
      case "EVENT_RECAP":
        return { en: "EVENT RECAP", ar: "تقرير فعالية", color: "text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-500/30" };
      case "TECHNICAL_INSIGHT":
        return { en: "TECH INSIGHT", ar: "رؤية تقنية", color: "text-cyan-700 dark:text-cyan-300 bg-cyan-500/15 border-cyan-500/30" };
      default:
        return { en: type, ar: type, color: "text-[var(--text-primary)] bg-[var(--surface-hover)] border-[var(--border-level-2)]" };
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-level-1)] text-[var(--text-primary)] transition-colors duration-300 font-poppins" dir={isAr ? "rtl" : "ltr"}>
      {/* 1. HERO HEADER SECTION */}
      <section className="relative pt-32 pb-16 border-b border-[var(--border-level-2)] overflow-hidden bg-gradient-to-b from-[var(--bg-level-2)] to-[var(--bg-level-1)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--e3-royal-blue)]/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--e3-royal-blue)]/10 border border-[var(--e3-royal-blue)]/30 text-[var(--e3-royal-blue)] text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? "المركز الإعلامي والمقالات" : "E3 EDITORIAL & MEDIA HUB"}</span>
              </span>
              <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tight text-[var(--text-primary)]">
                {isAr ? "الرؤى والأخبار والقصص" : "Insights, News & Stories"}
              </h1>
              <p className="text-sm md:text-base text-[var(--text-secondary)] font-normal leading-relaxed max-w-2xl">
                {isAr
                  ? "استكشف أحدث الاتجاهات في هندسة الترفيه، تحليلات التجارب الغامرة، البيانات الصحفية، وتقارير الفعاليات الحية في قطر."
                  : "Explore the latest trends in experiential architecture, immersive play science, official press releases, and behind-the-scenes event recaps across Qatar."}
              </p>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder={isAr ? "ابحث في المقالات والأخبار..." : "Search stories & press..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--e3-royal-blue)] shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none">
            {contentTypeTabs.map((tab) => {
              const isActive = selectedType === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
                    isActive
                      ? "bg-[var(--e3-royal-blue)] text-white shadow-md shadow-blue-500/20"
                      : "bg-[var(--surface-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-level-2)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-24 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] space-y-4 max-w-xl mx-auto shadow-sm">
            <BookOpen className="w-12 h-12 mx-auto text-[var(--text-tertiary)] opacity-40" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {isAr ? "لم يتم العثور على موضوعات" : "No Stories Found"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr
                ? "جرب البحث بكلمات أخرى أو اختر تبويب موضوعات مختلف."
                : "Try adjusting your search terms or selecting a different category filter above."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--e3-royal-blue)] transition-all cursor-pointer"
            >
              {isAr ? "إعادة تعيين الفلاتر" : "Reset Filters"}
            </button>
          </div>
        ) : (
          <>
            {/* SPOTLIGHT STORY (if available and searching is broad) */}
            {spotlightItem && !searchQuery && (
              <div className="group relative rounded-3xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-default)] shadow-2xl hover:border-[var(--e3-royal-blue)] transition-all duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                  {/* Spotlight Image (7 Cols) */}
                  <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[320px] lg:min-h-[440px] overflow-hidden bg-black">
                    <img
                      src={getMediaSrc(spotlightItem)}
                      alt={isAr ? spotlightItem.titleAr || spotlightItem.titleEn : spotlightItem.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
                    <div className="absolute top-4 start-4 flex items-center gap-2 z-10">
                      <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono font-bold uppercase shadow-md flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {isAr ? "موضوع الغلاف المميز" : "FEATURED STORY"}
                      </span>
                    </div>
                  </div>

                  {/* Spotlight Details (5 Cols) */}
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {(() => {
                          const badge = getContentTypeBadge(spotlightItem.contentType);
                          return (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${badge.color}`}>
                              {isAr ? badge.ar : badge.en}
                            </span>
                          );
                        })()}
                        <span className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] font-mono">
                          <Clock className="w-3 h-3" />
                          {getReadingTime(spotlightItem.bodyEn, spotlightItem.excerptEn)}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display uppercase tracking-tight text-[var(--text-primary)] group-hover:text-[var(--e3-royal-blue)] transition-colors leading-tight">
                        {isAr ? spotlightItem.titleAr || spotlightItem.titleEn : spotlightItem.titleEn}
                      </h2>

                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal leading-relaxed line-clamp-3">
                        {isAr
                          ? spotlightItem.excerptAr || spotlightItem.excerptEn || spotlightItem.bodyEn?.slice(0, 160)
                          : spotlightItem.excerptEn || spotlightItem.bodyEn?.slice(0, 160)}
                      </p>
                    </div>

                    {/* Author & CTA Row */}
                    <div className="space-y-5 pt-4 border-t border-[var(--border-level-2)]">
                      <div className="flex items-center gap-3">
                        {spotlightItem.author?.profileImage ? (
                          <img
                            src={spotlightItem.author.profileImage}
                            alt={getAuthorName(spotlightItem.author)}
                            className="w-10 h-10 rounded-full object-cover border border-[var(--border-level-2)] shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex items-center justify-center text-[var(--text-secondary)]">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-bold text-[var(--text-primary)]">
                            {getAuthorName(spotlightItem.author)}
                          </div>
                          <div className="text-[10px] text-[var(--text-tertiary)]">
                            {getAuthorDesignation(spotlightItem.author)}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={localizeHref(`/b2c/insights/${spotlightItem.slugEn || spotlightItem.id}`, locale)}
                        className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[var(--e3-royal-blue)] hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 group/btn"
                      >
                        <span>{isAr ? "قراءة المقال بالكامل" : "Read Full Story"}</span>
                        <ArrowRight className={`w-4 h-4 transition-transform group-hover/btn:translate-x-1 ${isAr ? "rotate-180 group-hover/btn:-translate-x-1" : ""}`} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BENTO STORIES GRID */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-[var(--text-primary)]">
                    {isAr ? "أحدث الإصدارات والمقالات" : "Latest Stories & Releases"}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {isAr
                      ? `عرض ${filteredInsights.length} موضوعاً منشوراً`
                      : `Showing ${filteredInsights.length} published stories`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {remainingItems.map((item, idx) => {
                  const title = isAr ? item.titleAr || item.titleEn : item.titleEn;
                  const excerpt = isAr
                    ? item.excerptAr || item.excerptEn || item.bodyEn?.slice(0, 130)
                    : item.excerptEn || item.bodyEn?.slice(0, 130);
                  const badge = getContentTypeBadge(item.contentType);
                  const publishedDate = item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString(isAr ? "ar-QA" : "en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "";

                  return (
                    <motion.article
                      key={item.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (idx % 6) * 0.08, duration: 0.5 }}
                      className="group flex flex-col justify-between rounded-3xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-default)] shadow-lg hover:border-[var(--e3-royal-blue)] hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Image Thumbnail Header */}
                      <Link
                        href={localizeHref(`/b2c/insights/${item.slugEn || item.id}`, locale)}
                        className="relative block aspect-[16/10] overflow-hidden bg-black shrink-0"
                      >
                        <img
                          src={getMediaSrc(item)}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)]/90 via-transparent to-transparent pointer-events-none" />

                        {/* Category Floating Pill */}
                        <div className="absolute top-3 start-3 z-10">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md shadow-md ${badge.color}`}>
                            {isAr ? badge.ar : badge.en}
                          </span>
                        </div>

                        {/* Reading Time */}
                        <div className="absolute top-3 end-3 px-2 py-0.5 rounded-md bg-black/75 border border-white/10 text-white text-[10px] font-mono backdrop-blur-md flex items-center gap-1 shadow-md">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{getReadingTime(item.bodyEn, item.excerptEn)}</span>
                        </div>
                      </Link>

                      {/* Content Area */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          {publishedDate && (
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
                              <Calendar className="w-3 h-3 text-[var(--e3-royal-blue)]" />
                              <span>{publishedDate}</span>
                            </div>
                          )}

                          <Link href={localizeHref(`/b2c/insights/${item.slugEn || item.id}`, locale)}>
                            <h4 className="text-lg font-bold font-display uppercase tracking-tight text-[var(--text-primary)] group-hover:text-[var(--e3-royal-blue)] transition-colors leading-snug line-clamp-2">
                              {title}
                            </h4>
                          </Link>

                          {excerpt && (
                            <p className="text-xs text-[var(--text-secondary)] font-normal line-clamp-3 leading-relaxed">
                              {excerpt}
                            </p>
                          )}
                        </div>

                        {/* Footer with Author & Link */}
                        <div className="pt-4 border-t border-[var(--border-level-2)] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            {item.author?.profileImage ? (
                              <img
                                src={item.author.profileImage}
                                alt={getAuthorName(item.author)}
                                className="w-7 h-7 rounded-full object-cover border border-[var(--border-level-2)] shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                                <User className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <span className="text-[11px] font-bold text-[var(--text-secondary)] truncate">
                              {getAuthorName(item.author)}
                            </span>
                          </div>

                          <Link
                            href={localizeHref(`/b2c/insights/${item.slugEn || item.id}`, locale)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--e3-royal-blue)] hover:underline shrink-0"
                          >
                            <span>{isAr ? "اقرأ" : "Read"}</span>
                            <ChevronRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* 3. NEWSLETTER & SUBSCRIBER BANNER */}
        <div className="relative rounded-3xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-default)] p-8 sm:p-12 shadow-xl">
          <div className="absolute top-0 end-0 -mt-12 -me-12 w-64 h-64 bg-[var(--e3-royal-blue)]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-[var(--e3-royal-blue)] text-xs font-mono font-bold uppercase tracking-wider">
              <Newspaper className="w-3.5 h-3.5" />
              <span>{isAr ? "النشرة الإخبارية الحصرية" : "Stay Informed with E3"}</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-black font-display uppercase tracking-tight text-[var(--text-primary)]">
              {isAr ? "كن أول من يعلم بإطلاق الفعاليات والقصص" : "Never Miss an E3 Experience or Press Release"}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isAr
                ? "انضم إلى مجتمع إي ثري ليصلك جديد العروض الحصرية، مواعيد افتتاح الوجهات، وتذاكر الحجز المبكر."
                : "Subscribe to our VIP editorial updates for early ticket drops, seasonal attraction openings, and behind-the-scenes engineering insights."}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder={isAr ? "أدخل بريدك الإلكتروني..." : "Enter your email address..."}
                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--e3-royal-blue)] font-mono"
              />
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--e3-royal-blue)] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-md"
              >
                {isAr ? "اشتراك" : "Subscribe"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
