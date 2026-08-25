"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Ticket, Compass, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { E3ArrowHeroDevice } from './E3ArrowHeroDevice';
import { formatLocalizedText } from '@/lib/utils';
import { localizeHref } from '@/lib/url-helper';

interface OurBrandsConstellationProps {
  content?: any;
  locale?: string;
}

function SafeBrandLogo({
  src,
  alt,
  brandColor,
  className = "w-full h-full object-contain",
}: {
  src?: string;
  alt: string;
  brandColor?: string;
  className?: string;
}) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const cleanSrc = src ? encodeURI(decodeURI(src)) : "";

  if (!cleanSrc || error) {
    const initial = (alt || "E3").charAt(0).toUpperCase();
    return (
      <div
        className="w-full h-full rounded-xl flex items-center justify-center font-black text-lg select-none"
        style={{
          backgroundColor: brandColor ? `${brandColor}20` : "rgba(59, 130, 246, 0.15)",
          color: brandColor || "#3b82f6",
        }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className={className}
    />
  );
}

function SafeBrandCover({
  src,
  alt,
  fallbackColor,
}: {
  src?: string;
  alt: string;
  fallbackColor?: string;
}) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const cleanSrc = src ? encodeURI(decodeURI(src)) : "";

  if (!cleanSrc || error) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
        style={{
          background: `radial-gradient(circle at center, ${fallbackColor || '#3b82f6'}30, var(--surface-default))`
        }}
      >
        <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">{alt}</span>
        <span className="text-xs text-[var(--text-tertiary)] mt-1">E3 Flagship Realm</span>
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
    />
  );
}

export function OurBrandsConstellation({ content, locale = 'en' }: OurBrandsConstellationProps) {
  const isAr = locale === 'ar';
  const brandSectionData = content?.ourBrands || {};

  const heading = formatLocalizedText(
    isAr
      ? (brandSectionData.headlineAr || "عوالم من ابتكار E3")
      : (brandSectionData.headlineEn || "Worlds created by E3"),
    locale
  );

  const subtext = formatLocalizedText(
    isAr
      ? (brandSectionData.subtextAr || "استكشف منظومة الوجهات والساحات الترفيهية والتطبيقات الرقمية التي ابتكرتها وطوّرتها E3.")
      : (brandSectionData.subtextEn || "Explore flagship entertainment worlds, kinetic arenas, and digital platforms created and operated by E3."),
    locale
  );

  const [brands, setBrands] = useState<any[]>(() => {
    if (Array.isArray(brandSectionData.brands) && brandSectionData.brands.length > 0) {
      return brandSectionData.brands;
    }
    return [];
  });
  const [activeBrandId, setActiveBrandId] = useState<string>("");
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const mapDbBrandToDisplay = (data: any[]) => {
    const palette = ["#f59e0b", "#10b981", "#ec4899", "#3b82f6", "#06b6d4", "#8b5cf6", "#14b8a6", "#f43f5e"];
    return data.map((b: any, idx: number) => ({
      id: b.id || b.slug,
      slug: b.slug,
      nameEn: b.b2cTitleOverrideEn || b.nameEn,
      nameAr: b.b2cTitleOverrideAr || b.nameAr || b.nameEn,
      taglineEn: b.b2cShortDescOverrideEn || b.taglineEn || b.shortDescriptionEn || "",
      taglineAr: b.b2cShortDescOverrideAr || b.taglineAr || b.shortDescriptionAr || "",
      descriptionEn: b.b2cDetailCopyEn || b.fullStoryEn || b.shortDescriptionEn || b.b2cShortDescOverrideEn || "",
      descriptionAr: b.b2cDetailCopyAr || b.fullStoryAr || b.shortDescriptionAr || b.b2cShortDescOverrideAr || "",
      logoPrimary: b.primaryLogoUrl || b.lightLogoUrl || b.darkLogoUrl || b.compactLogoUrl || "",
      logoLight: b.lightLogoUrl || b.primaryLogoUrl || "",
      logoDark: b.darkLogoUrl || b.primaryLogoUrl || "",
      brandColor: palette[idx % palette.length],
      relationship: b.primaryRelationshipId || b.lifecycleStatus || "OWNED",
      heroImage: b.primaryMediaUrl || b.coverMediaUrl || b.primaryLogoUrl || "",
      ctaUrl: b.b2cCtaUrl || `/b2c/brands/${b.slug}`,
      bookingUrl: b.b2cCtaUrl || `/b2c/brands/${b.slug}`,
      internalRoute: b.b2cCtaUrl || `/b2c/brands/${b.slug}`,
    }));
  };

  // Fetch live brands from authoritative database endpoint
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch('/api/b2c/brands?published=true&portal=b2c')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch brands");
        return res.json();
      })
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped = mapDbBrandToDisplay(data);
          setBrands(mapped);
        }
      })
      .catch(err => {
        console.warn("[OUR_BRANDS_FETCH_WARN]", err);
        if (isMounted && Array.isArray(brandSectionData.brands) && brandSectionData.brands.length > 0) {
          setBrands(brandSectionData.brands);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Keep active index in sync with available brands
  useEffect(() => {
    if (brands.length > 0 && (!activeBrandId || !brands.some(b => b.id === activeBrandId))) {
      setActiveBrandId(brands[0].id);
      setIsExpanded(false);
    }
  }, [brands, activeBrandId]);

  // Reset read-more state on brand change
  useEffect(() => {
    setIsExpanded(false);
  }, [activeBrandId]);

  const activeIndex = brands.findIndex(b => b.id === activeBrandId);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeBrand = brands[safeActiveIndex] || brands[0];

  // Auto-scroll ticker cycle: steps gently every 3.8 seconds if not paused
  useEffect(() => {
    if (isPaused || brands.length <= 1) return;

    const interval = setInterval(() => {
      setActiveBrandId((prevId) => {
        const currentIdx = brands.findIndex(b => b.id === prevId);
        const nextIdx = (currentIdx + 1) % brands.length;
        return brands[nextIdx].id;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused, brands]);

  // Center the active brand card in the running ticker view
  useEffect(() => {
    if (!activeBrandId) return;
    const activeEl = cardRefs.current[activeBrandId];
    const container = scrollContainerRef.current;

    if (activeEl && container) {
      const containerWidth = container.offsetWidth;
      const elOffsetLeft = activeEl.offsetLeft;
      const elWidth = activeEl.offsetWidth;

      const targetScroll = elOffsetLeft - (containerWidth / 2) + (elWidth / 2);

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [activeBrandId]);

  const handlePrev = () => {
    if (brands.length === 0) return;
    const prevIdx = (safeActiveIndex - 1 + brands.length) % brands.length;
    setActiveBrandId(brands[prevIdx].id);
  };

  const handleNext = () => {
    if (brands.length === 0) return;
    const nextIdx = (safeActiveIndex + 1) % brands.length;
    setActiveBrandId(brands[nextIdx].id);
  };

  const activeName = activeBrand ? formatLocalizedText(isAr ? activeBrand.nameAr : activeBrand.nameEn, locale) : "";

  const rawTaglineEn = activeBrand?.taglineEn || activeBrand?.shortDescEn || activeBrand?.shortDescriptionEn || activeBrand?.tagline;
  const rawTaglineAr = activeBrand?.taglineAr || activeBrand?.shortDescAr || activeBrand?.shortDescriptionAr || activeBrand?.tagline;

  const rawDescEn = activeBrand?.descriptionEn || activeBrand?.detailCopyEn || activeBrand?.shortDescEn || activeBrand?.shortDescriptionEn || activeBrand?.description;
  const rawDescAr = activeBrand?.descriptionAr || activeBrand?.detailCopyAr || activeBrand?.shortDescAr || activeBrand?.shortDescriptionAr || activeBrand?.description;

  const activeTagline = activeBrand ? (formatLocalizedText(isAr ? (rawTaglineAr || rawTaglineEn) : (rawTaglineEn || rawTaglineAr), locale) || (activeBrand.relationship === 'OWNED' ? (isAr ? 'فكرة مملوكة لـ E3' : 'Owned E3 Concept') : (isAr ? 'منظومة إي ثري الترفيهية' : 'E3 Entertainment Realm'))) : "";
  const activeDesc = activeBrand ? (formatLocalizedText(isAr ? (rawDescAr || rawDescEn) : (rawDescEn || rawDescAr), locale) || (isAr ? 'وجهة ترفيهية تفاعلية مبتكرة ومصممة بعناية لتقديم تجارب لا تُنسى في قطر.' : 'An innovative interactive entertainment destination engineered by E3 to deliver unforgettable experiences in Qatar.')) : "";

  // Truncation threshold for long descriptions
  const DESC_LIMIT = 200;
  const isDescLong = activeDesc.length > DESC_LIMIT;
  const renderedDesc = isExpanded || !isDescLong ? activeDesc : `${activeDesc.slice(0, DESC_LIMIT).trim()}...`;

  if (!isLoading && brands.length === 0) {
    return null;
  }

  return (
    <section 
      id="our-brands" 
      className="relative py-28 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)] overflow-hidden transition-colors duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Ambient Brand Color Tint Glow */}
      {activeBrand && (
        <div
          className="absolute inset-0 opacity-15 dark:opacity-25 transition-colors duration-1000 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${activeBrand.brandColor || '#3b82f6'}, transparent 75%)`
          }}
        />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header & Ticker Status */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-start max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-[var(--surface-default)] text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>{isAr ? "منظومة إي ثري — OUR BRANDS" : "OUR BRANDS — CREATED BY E3"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {heading}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light">
              {subtext}
            </p>
          </div>

          {/* Ticker Controls */}
          {brands.length > 1 && (
            <div className="flex items-center gap-2 bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] rounded-2xl p-1.5 backdrop-blur-md shadow-md">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-emerald-500 hover:text-slate-950 text-[var(--text-secondary)] transition-all duration-200 cursor-pointer shadow-sm"
                title={isAr ? "العلامة التجارية السابقة" : "Previous Brand"}
                aria-label="Previous Brand"
              >
                <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <span className="px-3 py-1.5 rounded-xl bg-[var(--bg-level-1)] text-xs font-mono font-bold text-[var(--text-primary)] border border-[var(--border-level-2)] shadow-inner">
                {String(safeActiveIndex + 1).padStart(2, '0')} / {String(brands.length).padStart(2, '0')}
              </span>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:opacity-80 text-[var(--text-primary)] transition-colors cursor-pointer"
                title={isPaused ? (isAr ? "تشغيل التمرير التلقائي" : "Resume Auto Scroll") : (isAr ? "إيقاف مؤقت" : "Pause Auto Scroll")}
                aria-label={isPaused ? "Resume auto scroll" : "Pause auto scroll"}
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" /> : <Pause className="w-4 h-4 text-emerald-500 fill-emerald-500" />}
              </button>

              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-emerald-500 hover:text-slate-950 text-[var(--text-secondary)] transition-all duration-200 cursor-pointer shadow-sm"
                title={isAr ? "العلامة التجارية التالية" : "Next Brand"}
                aria-label="Next Brand"
              >
                <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Continuous Horizontal Running Ticker Reel */}
        <div className="relative group/ticker">
          {/* Side Fade Overlays */}
          <div className="absolute top-0 bottom-0 start-0 w-16 bg-gradient-to-r from-[var(--bg-level-1)] to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 end-0 w-16 bg-gradient-to-l from-[var(--bg-level-1)] to-transparent z-20 pointer-events-none" />

          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-5 overflow-x-auto hide-scrollbar py-6 px-4 scroll-smooth snap-x snap-mandatory"
          >
            {brands.map((brand) => {
              const isActive = brand.id === activeBrandId;
              const brandName = formatLocalizedText(isAr ? brand.nameAr : brand.nameEn, locale);

              return (
                <button
                  key={brand.id}
                  ref={(el) => { cardRefs.current[brand.id] = el; }}
                  onClick={() => {
                    setActiveBrandId(brand.id);
                    setIsPaused(true);
                  }}
                  onMouseEnter={() => {
                    // Only pause on hover without rapidly jumping between items
                    setIsPaused(true);
                  }}
                  className={`relative shrink-0 w-60 p-5 rounded-3xl border text-start transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 group snap-center ${
                    isActive
                      ? 'border-purple-500 bg-[var(--surface-default)] shadow-2xl scale-105 z-10'
                      : 'border-[var(--border-level-2)] bg-[var(--surface-default)]/70 hover:border-purple-400 hover:bg-[var(--surface-default)] opacity-85 hover:opacity-100 shadow-sm'
                  }`}
                  style={{
                    borderColor: isActive ? (brand.brandColor || '#a855f7') : undefined,
                    boxShadow: isActive ? `0 0 30px ${brand.brandColor || '#a855f7'}30` : undefined
                  }}
                >
                  {/* Constellation Indicator Arrow */}
                  {isActive && (
                    <motion.div
                      layoutId="constellation-arrow"
                      className="absolute -top-3 end-4 z-20"
                    >
                      <E3ArrowHeroDevice variant="LIGHT_BEAM" accentColor={brand.brandColor} className="w-6 h-6" />
                    </motion.div>
                  )}

                  {/* High-Contrast Crisp Logo Placeholder */}
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white dark:bg-white/95 border border-white/30 shadow-md p-2.5 flex items-center justify-center">
                      <SafeBrandLogo
                        src={brand.logoPrimary}
                        alt={brandName}
                        brandColor={brand.brandColor}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {isActive && (
                      <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: brand.brandColor || '#a855f7' }} />
                    )}
                  </div>

                  <div className="pt-2">
                    <h3 className="text-base font-extrabold text-[var(--text-primary)] line-clamp-1">
                      {brandName}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail View Card for the Active Centered Brand */}
        {activeBrand && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBrand.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="p-8 md:p-10 rounded-3xl border border-purple-500/30 bg-[var(--surface-default)] backdrop-blur-xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              style={{ borderColor: activeBrand.brandColor || '#a855f7' }}
            >
              {/* Left Info & Description (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white dark:bg-white/95 border border-white/30 p-3 shrink-0 shadow-lg flex items-center justify-center">
                    <SafeBrandLogo
                      src={activeBrand.logoPrimary}
                      alt={activeName}
                      brandColor={activeBrand.brandColor}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    {activeTagline && (
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider mb-1 bg-purple-500/10 border border-purple-500/20" style={{ color: activeBrand.brandColor || '#a855f7', borderColor: `${activeBrand.brandColor || '#a855f7'}40` }}>
                        {activeTagline}
                      </span>
                    )}
                    <h3 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
                      {activeName}
                    </h3>
                  </div>
                </div>

                {activeDesc && (
                  <div className="text-sm sm:text-base text-[var(--text-secondary)] font-light leading-relaxed">
                    <p className="inline">
                      {renderedDesc}
                    </p>
                    {isDescLong && (
                      <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center ms-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer transition-colors"
                      >
                        {isExpanded ? (isAr ? "عرض أقل" : "Read less") : (isAr ? "اقرأ المزيد" : "Read more")}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {(activeBrand.internalRoute || activeBrand.ctaUrl) && (
                    <Link
                      href={localizeHref(activeBrand.internalRoute || activeBrand.ctaUrl, locale)}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-slate-950 font-extrabold text-xs transition-all shadow-lg hover:scale-105 cursor-pointer"
                      style={{ backgroundColor: activeBrand.brandColor || '#a855f7', color: '#090417' }}
                    >
                      <Compass className="w-4 h-4" />
                      <span>{isAr ? "استكشف التجربة" : "Explore Experience"}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                    </Link>
                  )}

                  {activeBrand.bookingUrl && (
                    <Link
                      href={localizeHref(activeBrand.bookingUrl, locale)}
                      className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-xs font-extrabold text-[var(--text-primary)] transition-all shadow-sm cursor-pointer"
                    >
                      <Ticket className="w-4 h-4 text-emerald-500" />
                      <span>{isAr ? "حجز التذاكر" : "Book Tickets"}</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Right Brand Hero Cover Image Stage (5 Cols) */}
              <div className="lg:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--border-level-2)] shadow-2xl group">
                <SafeBrandCover
                  src={activeBrand.heroImage || activeBrand.logoPrimary}
                  alt={activeName}
                  fallbackColor={activeBrand.brandColor}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)]/80 via-transparent to-transparent pointer-events-none" />
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
