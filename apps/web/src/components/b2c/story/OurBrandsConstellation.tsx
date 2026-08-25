"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Ticket, Compass, Pause, Play, ChevronLeft, ChevronRight, MapPin, Layers, Award } from 'lucide-react';
import { E3ArrowHeroDevice } from './E3ArrowHeroDevice';
import { formatLocalizedText } from '@/lib/utils';
import { localizeHref } from '@/lib/url-helper';

interface OurBrandsConstellationProps {
  content?: any;
  locale?: string;
}

const KNOWN_BRAND_LOGOS: Record<string, string> = {
  'crayons-bricks': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/21d68b9a-2b51-44e0-b460-01b2e408e85b.png',
  'crayons-and-bricks': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/21d68b9a-2b51-44e0-b460-01b2e408e85b.png',
  'inflatapark': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/70c94378-0e91-4a97-84f7-aff462252b37.png',
  'urban-arena': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Urban%20Arena%20Color.svg',
  'space-tribe': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/space%20tribe.svg',
  'kids-city-driving-school': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/kids%20city%20driving%20school.svg',
  'bookingqube': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/51b907c6-d58b-40fb-b8bf-8a0dfad1b41b.svg',
  'inflatarun': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/inflatarun.png',
  'inflatacity': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/inflatacity.svg',
  'inflata-splash': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataSplash.png',
  'inflatasplash': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataSplash.png',
  'battle-arena': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/battle%20arena.svg',
  'drive-thru-cafe': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/drive%20thru%20cafe.svg',
  'inflatacafe': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/inlfata%20cafe.png',
  'inflata-cafe': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/inlfata%20cafe.png',
  'arena-by-e3': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/arena.png',
  'football-fest': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/football%20fest.png',
  'grab-n-win': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/grab%20n%20win.png',
  'le-marche': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/le%20marche.png',
  'doha-balloon-parade': 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/ballon%20parade.svg',
};

function resolveBrandLogo(src?: string, slug?: string, name?: string): string {
  const normSlug = (slug || '').toLowerCase().trim();
  const normName = (name || '').toLowerCase().trim();

  if (normSlug.includes('crayons') || normName.includes('crayons')) {
    return KNOWN_BRAND_LOGOS['crayons-bricks'];
  }
  if (normSlug.includes('urban-arena') || (normName.includes('urban') && normName.includes('arena'))) {
    return KNOWN_BRAND_LOGOS['urban-arena'];
  }
  if (normSlug.includes('inflatapark') || normName.includes('inflatapark')) {
    return KNOWN_BRAND_LOGOS['inflatapark'];
  }
  if (normSlug.includes('kids-city') || normSlug.includes('driving') || normName.includes('driving')) {
    return KNOWN_BRAND_LOGOS['kids-city-driving-school'];
  }
  if (normSlug.includes('space') || normName.includes('space tribe')) {
    return KNOWN_BRAND_LOGOS['space-tribe'];
  }
  if (normSlug.includes('bookingqube') || normName.includes('bookingqube')) {
    return KNOWN_BRAND_LOGOS['bookingqube'];
  }
  if (normSlug.includes('inflatarun') || normName.includes('inflatarun')) {
    return KNOWN_BRAND_LOGOS['inflatarun'];
  }
  if (normSlug.includes('inflatacity') || normName.includes('inflatacity')) {
    return KNOWN_BRAND_LOGOS['inflatacity'];
  }

  if (normSlug && KNOWN_BRAND_LOGOS[normSlug]) {
    return KNOWN_BRAND_LOGOS[normSlug];
  }

  if (src && typeof src === 'string' && src.trim().length > 0) {
    return src.trim();
  }

  return '';
}

function SafeBrandLogo({
  src,
  alt,
  slug,
  brandColor,
  className = "max-h-full max-w-full object-contain",
}: {
  src?: string;
  alt: string;
  slug?: string;
  brandColor?: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = resolveBrandLogo(src, slug, alt);

  useEffect(() => {
    setHasError(false);
  }, [src, slug, alt]);

  if (!resolvedUrl || hasError) {
    const fallbackKnown = slug ? KNOWN_BRAND_LOGOS[slug.toLowerCase()] : null;
    if (fallbackKnown && !hasError) {
      return (
        <img
          src={fallbackKnown}
          alt={alt}
          loading="lazy"
          onError={() => setHasError(true)}
          className={`${className} drop-shadow-[0_10px_25px_rgba(0,0,0,0.85)] filter transition-transform duration-300`}
        />
      );
    }

    const initial = (alt || "E3").charAt(0).toUpperCase();
    return (
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl select-none shadow-inner"
        style={{
          backgroundColor: brandColor ? `${brandColor}25` : "rgba(168, 85, 247, 0.2)",
          color: brandColor || "#a855f7",
          border: `1px solid ${brandColor ? `${brandColor}50` : 'rgba(168, 85, 247, 0.3)'}`
        }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      loading="lazy"
      onError={() => {
        const fallbackKnown = slug ? KNOWN_BRAND_LOGOS[slug.toLowerCase()] : null;
        if (fallbackKnown && fallbackKnown !== resolvedUrl) {
          // Retry with fallback
          const img = new Image();
          img.src = fallbackKnown;
          img.onload = () => {
            // Re-render
            setHasError(false);
          };
          img.onerror = () => setHasError(true);
        } else {
          setHasError(true);
        }
      }}
      className={`${className} drop-shadow-[0_12px_28px_rgba(0,0,0,0.9)] filter transition-transform duration-300`}
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

  const cleanSrc = src ? src.trim() : "";

  if (!cleanSrc || error) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
        style={{
          background: `radial-gradient(circle at center, ${fallbackColor || '#a855f7'}30, var(--surface-default))`
        }}
      >
        <span className="text-base font-black text-[var(--text-primary)] uppercase tracking-wider">{alt}</span>
        <span className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">E3 Flagship Entertainment Realm</span>
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
    const palette = ["#a855f7", "#10b981", "#ec4899", "#3b82f6", "#06b6d4", "#f59e0b", "#14b8a6", "#f43f5e"];
    return data.map((b: any, idx: number) => {
      const slug = b.slug || '';
      const resolvedLogo = resolveBrandLogo(
        b.primaryLogoUrl || b.lightLogoUrl || b.darkLogoUrl || b.compactLogoUrl,
        slug,
        b.nameEn
      );

      return {
        id: b.id || slug,
        slug: slug,
        nameEn: b.b2cTitleOverrideEn || b.nameEn,
        nameAr: b.b2cTitleOverrideAr || b.nameAr || b.nameEn,
        taglineEn: b.b2cShortDescOverrideEn || b.taglineEn || b.shortDescriptionEn || "E3 Flagship Realm",
        taglineAr: b.b2cShortDescOverrideAr || b.taglineAr || b.shortDescriptionAr || "وجهة ترفيهية رائدة",
        descriptionEn: b.b2cDetailCopyEn || b.fullStoryEn || b.shortDescriptionEn || b.b2cShortDescOverrideEn || "",
        descriptionAr: b.b2cDetailCopyAr || b.fullStoryAr || b.shortDescriptionAr || b.b2cShortDescOverrideAr || "",
        logoPrimary: resolvedLogo,
        logoLight: b.lightLogoUrl || resolvedLogo,
        logoDark: b.darkLogoUrl || resolvedLogo,
        brandColor: palette[idx % palette.length],
        relationship: b.primaryRelationshipId || b.lifecycleStatus || "OWNED",
        heroImage: b.primaryMediaUrl || b.coverMediaUrl || b.detailMediaUrl || resolvedLogo,
        ctaUrl: b.b2cCtaUrl || `/b2c/brands/${slug}`,
        bookingUrl: b.b2cCtaUrl || `/b2c/brands/${slug}`,
        internalRoute: b.b2cCtaUrl || `/b2c/brands/${slug}`,
      };
    });
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

  // Auto-scroll ticker cycle: steps gently every 4.2 seconds if not paused
  useEffect(() => {
    if (isPaused || brands.length <= 1) return;

    const interval = setInterval(() => {
      setActiveBrandId((prevId) => {
        const currentIdx = brands.findIndex(b => b.id === prevId);
        const nextIdx = (currentIdx + 1) % brands.length;
        return brands[nextIdx].id;
      });
    }, 4200);

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
    setIsPaused(true);
    const prevIdx = (safeActiveIndex - 1 + brands.length) % brands.length;
    setActiveBrandId(brands[prevIdx].id);
  };

  const handleNext = () => {
    setIsPaused(true);
    const nextIdx = (safeActiveIndex + 1) % brands.length;
    setActiveBrandId(brands[nextIdx].id);
  };

  const activeName = activeBrand ? formatLocalizedText(isAr ? activeBrand.nameAr : activeBrand.nameEn, locale) : "";
  const activeTagline = activeBrand ? formatLocalizedText(isAr ? activeBrand.taglineAr : activeBrand.taglineEn, locale) : "";
  const activeDesc = activeBrand ? formatLocalizedText(isAr ? activeBrand.descriptionAr : activeBrand.descriptionEn, locale) : "";

  const isDescLong = activeDesc && activeDesc.length > 200;
  const renderedDesc = isDescLong && !isExpanded ? `${activeDesc.slice(0, 195)}...` : activeDesc;

  return (
    <section className="relative w-full py-16 md:py-24 bg-gradient-to-b from-[var(--bg-level-1)] via-[var(--bg-level-2)] to-[var(--bg-level-1)] overflow-hidden border-t border-[var(--border-level-2)]">
      {/* Background ambient lighting tailored to active brand */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-15 pointer-events-none transition-all duration-700"
        style={{
          background: activeBrand ? `radial-gradient(circle, ${activeBrand.brandColor || '#a855f7'}, transparent 70%)` : 'radial-gradient(circle, #a855f7, transparent 70%)'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{isAr ? "علاماتنا التجارية — ابتكار E3" : "OUR BRANDS — CREATED BY E3"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
              {heading}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-normal leading-relaxed">
              {subtext}
            </p>
          </div>

          {/* Ticker Controls */}
          {brands.length > 1 && (
            <div className="flex items-center gap-2 bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] rounded-2xl p-1.5 backdrop-blur-md shadow-md shrink-0">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-purple-500 hover:text-slate-950 text-[var(--text-secondary)] transition-all duration-200 cursor-pointer shadow-sm"
                title={isAr ? "العلامة التجارية السابقة" : "Previous Brand"}
                aria-label="Previous Brand"
              >
                <ChevronLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <span className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-level-1)] text-xs font-mono font-extrabold text-[var(--text-primary)] border border-[var(--border-level-2)] shadow-inner">
                {String(safeActiveIndex + 1).padStart(2, '0')} / {String(brands.length).padStart(2, '0')}
              </span>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:opacity-80 text-[var(--text-primary)] transition-colors cursor-pointer"
                title={isPaused ? (isAr ? "تشغيل التمرير التلقائي" : "Resume Auto Scroll") : (isAr ? "إيقاف مؤقت" : "Pause Auto Scroll")}
                aria-label={isPaused ? "Resume auto scroll" : "Pause auto scroll"}
              >
                {isPaused ? <Play className="w-4 h-4 text-purple-400 fill-purple-400" /> : <Pause className="w-4 h-4 text-purple-400 fill-purple-400" />}
              </button>

              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-purple-500 hover:text-slate-950 text-[var(--text-secondary)] transition-all duration-200 cursor-pointer shadow-sm"
                title={isAr ? "العلامة التجارية التالية" : "Next Brand"}
                aria-label="Next Brand"
              >
                <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Continuous Horizontal Running Ticker Reel - Vertical Cards with Large Prominent Logos */}
        <div className="relative group/ticker">
          {/* Side Fade Overlays */}
          <div className="absolute top-0 bottom-0 start-0 w-16 bg-gradient-to-r from-[var(--bg-level-1)] to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 end-0 w-16 bg-gradient-to-l from-[var(--bg-level-1)] to-transparent z-20 pointer-events-none" />

          <div 
            ref={scrollContainerRef}
            className="flex items-stretch gap-5 overflow-x-auto hide-scrollbar py-6 px-4 scroll-smooth snap-x snap-mandatory"
          >
            {brands.map((brand) => {
              const isActive = brand.id === activeBrandId;
              const brandName = formatLocalizedText(isAr ? brand.nameAr : brand.nameEn, locale);
              const brandTagline = formatLocalizedText(isAr ? brand.taglineAr : brand.taglineEn, locale);

              return (
                <button
                  key={brand.id}
                  ref={(el) => { cardRefs.current[brand.id] = el; }}
                  onClick={() => {
                    setActiveBrandId(brand.id);
                    setIsPaused(true);
                  }}
                  onMouseEnter={() => {
                    setIsPaused(true);
                  }}
                  className={`relative shrink-0 w-56 sm:w-64 p-5 rounded-3xl border text-center transition-all duration-300 cursor-pointer flex flex-col justify-between h-56 sm:h-60 group snap-center ${
                    isActive
                      ? 'border-purple-500 bg-[var(--surface-default)] shadow-2xl scale-105 z-10 ring-1'
                      : 'border-[var(--border-level-2)] bg-[var(--surface-default)]/75 hover:border-purple-400 hover:bg-[var(--surface-default)] opacity-90 hover:opacity-100 shadow-sm'
                  }`}
                  style={{
                    borderColor: isActive ? (brand.brandColor || '#a855f7') : undefined,
                    boxShadow: isActive ? `0 0 35px ${brand.brandColor || '#a855f7'}35` : undefined
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

                  {/* Top Status & Relationship Pill */}
                  <div className="flex items-center justify-between w-full">
                    <span 
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${brand.brandColor || '#a855f7'}15`,
                        color: brand.brandColor || '#a855f7',
                        borderColor: `${brand.brandColor || '#a855f7'}30`
                      }}
                    >
                      {brand.relationship === 'OWNED' ? (isAr ? 'علامة مملوكة' : 'OWNED IP') : (isAr ? 'وجهة مُدارة' : 'OPERATED')}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: brand.brandColor || '#a855f7' }} />
                    )}
                  </div>

                  {/* Large Prominent Logo Container */}
                  <div className="w-full h-28 sm:h-32 flex items-center justify-center p-2">
                    <SafeBrandLogo
                      src={brand.logoPrimary}
                      alt={brandName}
                      slug={brand.slug}
                      brandColor={brand.brandColor}
                      className="max-h-24 sm:max-h-28 max-w-[170px] w-auto h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.9)] filter transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  {/* Bottom Brand Title & Subtext */}
                  <div className="pt-2 border-t border-[var(--border-level-1)] w-full">
                    <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] line-clamp-1 tracking-tight">
                      {brandName}
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] font-medium line-clamp-1 mt-0.5">
                      {brandTagline || (isAr ? "عالم ترفيهي من E3" : "E3 Entertainment Realm")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail View Showcase Card for Active Brand - Rich, Non-Empty, Commandingly Visual */}
        {activeBrand && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBrand.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="p-6 sm:p-8 md:p-10 rounded-3xl border bg-[var(--surface-default)] backdrop-blur-2xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden"
              style={{
                borderColor: activeBrand.brandColor || '#a855f7',
                boxShadow: `0 20px 60px -15px ${activeBrand.brandColor || '#a855f7'}25`
              }}
            >
              {/* Subtle ambient light gradient inside card */}
              <div 
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
                style={{ backgroundColor: activeBrand.brandColor || '#a855f7' }}
              />

              {/* Left Column: Brand Identity, Large Logo, Story & Actions (7 Cols) */}
              <div className="lg:col-span-7 space-y-6 relative z-10">
                {/* Brand Header with Large Logo & Tagline */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div 
                    className="h-24 sm:h-28 w-44 sm:w-48 rounded-2xl p-2.5 shrink-0 flex items-center justify-center bg-[var(--bg-level-1)]/60 border border-[var(--border-level-2)] shadow-inner"
                    style={{ borderColor: `${activeBrand.brandColor || '#a855f7'}40` }}
                  >
                    <SafeBrandLogo
                      src={activeBrand.logoPrimary}
                      alt={activeName}
                      slug={activeBrand.slug}
                      brandColor={activeBrand.brandColor}
                      className="max-h-full max-w-full w-auto h-auto object-contain drop-shadow-[0_14px_32px_rgba(0,0,0,0.95)] filter"
                    />
                  </div>

                  <div className="space-y-1.5">
                    {activeTagline && (
                      <span 
                        className="inline-block px-3 py-1 rounded-lg text-xs font-mono font-black uppercase tracking-wider border shadow-xs"
                        style={{
                          backgroundColor: `${activeBrand.brandColor || '#a855f7'}15`,
                          color: activeBrand.brandColor || '#a855f7',
                          borderColor: `${activeBrand.brandColor || '#a855f7'}40`
                        }}
                      >
                        {activeTagline}
                      </span>
                    )}
                    <h3 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                      {activeName}
                    </h3>
                  </div>
                </div>

                {/* Value Highlights Row */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-secondary)]">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    <span>{activeBrand.relationship === 'OWNED' ? (isAr ? 'علامة تجارية مملوكة لـ E3' : 'Flagship E3 Owned IP') : (isAr ? 'وجهة ترفيهية مُدارة' : 'E3 Operated Destination')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-secondary)]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'شبكة وجهات قطر' : 'Qatar Venues Network'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-secondary)]">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'تجارب تفاعلية عائلية' : 'Immersive Family Realm'}</span>
                  </div>
                </div>

                {/* Engaging Description */}
                {activeDesc && (
                  <div className="text-sm sm:text-base text-[var(--text-secondary)] font-normal leading-relaxed p-4 rounded-2xl bg-[var(--surface-subtle)]/60 border border-[var(--border-level-1)]">
                    <p className="inline">
                      {renderedDesc}
                    </p>
                    {isDescLong && (
                      <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center ms-2 text-xs font-bold text-purple-400 hover:text-purple-300 underline cursor-pointer transition-colors"
                      >
                        {isExpanded ? (isAr ? "عرض أقل" : "Read less") : (isAr ? "اقرأ المزيد" : "Read more")}
                      </button>
                    )}
                  </div>
                )}

                {/* Call-to-Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {(activeBrand.internalRoute || activeBrand.ctaUrl) && (
                    <Link
                      href={localizeHref(activeBrand.internalRoute || activeBrand.ctaUrl, locale)}
                      className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-black text-xs transition-all shadow-xl hover:scale-105 cursor-pointer"
                      style={{ 
                        backgroundColor: activeBrand.brandColor || '#a855f7', 
                        color: '#070210' 
                      }}
                    >
                      <Compass className="w-4 h-4" />
                      <span>{isAr ? "استكشف التجربة" : "Explore Experience"}</span>
                      <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </Link>
                  )}

                  {activeBrand.bookingUrl && (
                    <Link
                      href={localizeHref(activeBrand.bookingUrl, locale)}
                      className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-xs font-extrabold text-[var(--text-primary)] transition-all shadow-sm cursor-pointer"
                    >
                      <Ticket className="w-4 h-4 text-purple-400" />
                      <span>{isAr ? "حجز التذاكر" : "Book Tickets"}</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Right Column: High-Res Hero Image Stage (5 Cols) */}
              <div className="lg:col-span-5 relative aspect-[16/10] sm:aspect-[4/3] rounded-3xl overflow-hidden border border-[var(--border-level-2)] shadow-2xl group">
                <SafeBrandCover
                  src={activeBrand.heroImage || activeBrand.logoPrimary}
                  alt={activeName}
                  fallbackColor={activeBrand.brandColor}
                />
                
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)]/90 via-transparent to-transparent pointer-events-none" />

                {/* Floating Destination Badge */}
                <div className="absolute bottom-4 start-4 end-4 flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-default)]/85 backdrop-blur-md border border-[var(--border-level-2)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: activeBrand.brandColor || '#a855f7' }} />
                    <span className="text-xs font-bold text-[var(--text-primary)]">{activeName}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                    {isAr ? "وجهة نشطة" : "ACTIVE DESTINATION"}
                  </span>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
