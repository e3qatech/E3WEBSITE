"use client";

import { useState, useCallback } from "react";
import { useMounted } from "@/hooks/useMounted";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Sun, Moon, ArrowRight, ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useTheme } from "@/components/layout/ThemeProvider";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { UniversalMediaHolder } from "@/components/shared/UniversalMediaHolder";
import { GatewayCustomizationPayload, DEFAULT_GATEWAY_CMS_PAYLOAD } from "@/types/gateway-cms";
import { cn } from "@/lib/utils";

const WireframeBackground = dynamic(
  () => import('./WireframeBackground').then(mod => mod.WireframeBackground),
  { ssr: false }
);

interface PortalGatewayProps {
  cmsData?: GatewayCustomizationPayload;
}

export function PortalGateway({ cmsData = DEFAULT_GATEWAY_CMS_PAYLOAD }: PortalGatewayProps) {
  const router = useRouter();
  const { locale, dir } = useLocale();
  const { theme, setTheme } = useTheme();
  const isAr = locale === 'ar';
  
  const [hoveredPortal, setHoveredPortal] = useState<'b2c' | 'b2b' | null>(null);
  const [selectedPortal, setSelectedPortal] = useState<'b2c' | 'b2b' | null>(null);
  const [focusedPortal, setFocusedPortal] = useState<'b2c' | 'b2b' | null>(null);
  const isMounted = useMounted();

  // Resolve theme synchronously based on mount status and theme preference
  const systemTheme = isMounted && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const resolvedTheme = theme === 'system' ? systemTheme : ((theme as 'light' | 'dark') || 'dark');

  const en = cmsData.english;
  const ar = cmsData.arabic;

  // Bilingual fields with fallback
  const eyebrow = isAr ? ar.eyebrowAr || en.eyebrowEn : en.eyebrowEn || ar.eyebrowAr;
  const headline = isAr ? ar.headlineAr || en.headlineEn : en.headlineEn || ar.headlineAr;

  const b2cLabel = isAr ? ar.b2cLabelAr || en.b2cLabelEn : en.b2cLabelEn || ar.b2cLabelAr;
  const b2cTitle = isAr ? ar.b2cTitleAr || en.b2cTitleEn : en.b2cTitleEn || ar.b2cTitleAr;
  const b2cDesc = isAr ? ar.b2cDescAr || en.b2cDescEn : en.b2cDescEn || ar.b2cDescAr;
  const b2cCta = isAr ? ar.b2cCtaLabelAr || en.b2cCtaLabelEn : en.b2cCtaLabelEn || ar.b2cCtaLabelAr;
  const b2cStat = isAr ? ar.b2cStatLabelAr || en.b2cStatLabelEn : en.b2cStatLabelEn || ar.b2cStatLabelAr;

  const b2bLabel = isAr ? ar.b2bLabelAr || en.b2bLabelEn : en.b2bLabelEn || ar.b2bLabelAr;
  const b2bTitle = isAr ? ar.b2bTitleAr || en.b2bTitleEn : en.b2bTitleEn || ar.b2bTitleAr;
  const b2bDesc = isAr ? ar.b2bDescAr || en.b2bDescEn : en.b2bDescEn || ar.b2bDescAr;
  const b2bCta = isAr ? ar.b2bCtaLabelAr || en.b2bCtaLabelEn : en.b2bCtaLabelEn || ar.b2bCtaLabelAr;
  const b2bStat = isAr ? ar.b2bStatLabelAr || en.b2bStatLabelEn : en.b2bStatLabelEn || ar.b2bStatLabelAr;

  const ariaLabel = isAr ? cmsData.seoAccess.ariaGatewayLabelAr : cmsData.seoAccess.ariaGatewayLabelEn;

  const handleSelect = useCallback((portal: 'b2c' | 'b2b') => {
    setSelectedPortal(portal);
    localStorage.setItem('e3_preferred_portal', portal);

    setTimeout(() => {
      router.push(`/${locale}/${portal}`);
    }, 600);
  }, [router, locale]);

  // Handle Keyboard Selection
  const handleKeyDown = (e: React.KeyboardEvent, portal: 'b2c' | 'b2b') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(portal);
    }
  };

  const isLight = resolvedTheme === 'light';
  const reducedMotion = cmsData.visual.reducedMotionDefault;

  // Animation values based on hover/focus state
  const activePortal = hoveredPortal || focusedPortal;

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden transition-colors duration-500",
        isLight ? "bg-[#f8f9fa]" : "bg-[#09090b]"
      )}
      dir={dir}
      role="region"
      aria-label={ariaLabel || 'E3 Qatar Portal Gateway'}
    >
      {/* 3D Background */}
      {isMounted && cmsData.visual.backgroundStyle === 'wireframe' && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-40">
          <WireframeBackground />
        </div>
      )}

      {/* HEADER LAYER */}
      <header className="absolute top-0 inset-x-0 z-40 px-6 py-6 md:px-12 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pointer-events-auto">
          <div className={cn(
            "font-black text-2xl tracking-tighter font-display transition-colors",
            isLight ? "text-zinc-950" : "text-white"
          )}>
            E3 <span className="text-[var(--color-primary)]">QATAR</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-full border transition-all",
              isLight 
                ? "bg-zinc-100 text-zinc-800 border-zinc-200" 
                : "bg-white/5 text-white/80 border-white/10"
            )}>
              {eyebrow}
            </span>
            <span className={cn(
              "hidden lg:inline-block text-xs font-bold border-s ps-3 transition-colors",
              isLight ? "text-zinc-500 border-zinc-200" : "text-zinc-400 border-white/10"
            )}>
              {headline}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Theme Control */}
          <button
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            className={cn(
              "p-2.5 rounded-full border transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] outline-none",
              isLight 
                ? "bg-white text-zinc-800 border-zinc-200 shadow-sm" 
                : "bg-zinc-900/80 text-white border-white/10 backdrop-blur"
            )}
            aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher variant="pill" />
        </div>
      </header>

      {/* PORTAL WORLDS (SPLIT ENGINE) */}
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row items-stretch">
        
        {/* B2C World */}
        <motion.div
          className={cn(
            "relative flex-1 flex flex-col justify-end md:justify-center p-8 md:p-16 overflow-hidden outline-none transition-colors duration-500 group",
            isLight 
              ? (activePortal === 'b2c' ? "bg-[#fdfaf6]" : "bg-[#f9f6f0]") 
              : (activePortal === 'b2c' ? "bg-[#140b1e]" : "bg-[#09090b]")
          )}
          tabIndex={0}
          onMouseEnter={() => setHoveredPortal('b2c')}
          onMouseLeave={() => setHoveredPortal(null)}
          onFocus={() => setFocusedPortal('b2c')}
          onBlur={() => setFocusedPortal(null)}
          onKeyDown={(e) => handleKeyDown(e, 'b2c')}
          onClick={() => handleSelect('b2c')}
          animate={{
            flex: activePortal === 'b2c' ? 1.6 : (activePortal === 'b2b' ? 0.95 : 1),
            opacity: selectedPortal === 'b2b' ? 0 : 1
          }}
          transition={reducedMotion ? { duration: 0.1 } : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          role="button"
          aria-label={b2cLabel + " " + b2cTitle}
        >
          {/* Cinematic Background Media */}
          <div className={cn(
            "absolute inset-0 z-0 transition-all duration-700 pointer-events-none",
            activePortal === 'b2c' ? "scale-100 opacity-30 md:opacity-40" : "scale-105 opacity-15 md:opacity-20"
          )} style={reducedMotion ? { transform: 'none' } : undefined}>
            {/* Desktop */}
            <div className="hidden md:block w-full h-full">
              <UniversalMediaHolder
                config={cmsData.b2cDesktopMedia}
                locale={locale}
                forceReducedMotion={reducedMotion}
              />
            </div>
            {/* Mobile */}
            <div className="block md:hidden w-full h-full">
              <UniversalMediaHolder
                config={cmsData.b2cMobileMedia}
                locale={locale}
                forceReducedMotion={reducedMotion}
              />
            </div>
          </div>

          {/* Protective Gradient Overlay */}
          <div className={cn(
            "absolute inset-0 z-0 pointer-events-none transition-opacity duration-500",
            isLight 
              ? "bg-gradient-to-t from-[#fdfaf6] via-[#fdfaf6]/90 to-transparent opacity-95" 
              : "bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent opacity-90"
          )} />

          {/* Content Area */}
          <div className="relative z-10 max-w-lg w-full md:mx-auto select-none">
            {/* Tag / Category */}
            <div className="flex items-center gap-3 mb-3">
              <span className={cn(
                "text-[10px] font-black tracking-[0.2em] uppercase transition-colors px-2 py-0.5 rounded",
                isLight ? "text-violet-700 bg-violet-50" : "text-violet-400 bg-violet-950/40"
              )}>
                {b2cLabel}
              </span>
              {b2cStat && (
                <span className={cn(
                  "text-[9px] font-extrabold px-2 py-0.5 rounded border transition-all",
                  isLight 
                    ? "bg-amber-50/50 text-amber-800 border-amber-200" 
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                )}>
                  {b2cStat}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 
              className={cn(
                "text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 leading-[1.08] font-display transition-colors",
                isLight ? "text-violet-950" : "text-zinc-50"
              )}
              dangerouslySetInnerHTML={{ __html: b2cTitle.replace(/\\n/g, '<br/>') }}
            />

            {/* Description (Slide / Fade Reveal) */}
            <motion.div
              initial={false}
              animate={{
                height: (activePortal === 'b2c' || !isMounted) ? 'auto' : 0,
                opacity: (activePortal === 'b2c' || !isMounted) ? 1 : 0,
                marginBottom: (activePortal === 'b2c' || !isMounted) ? 24 : 0
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className={cn(
                "text-sm md:text-base max-w-md font-normal leading-relaxed",
                isLight ? "text-zinc-600" : "text-zinc-300"
              )}>
                {b2cDesc}
              </p>
            </motion.div>

            {/* CTA Button */}
            <div className="mt-2">
              <span className={cn(
                "inline-flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase transition-all duration-300 px-6 py-3 rounded-full border",
                isLight
                  ? "bg-violet-950 text-white border-transparent hover:bg-violet-900 shadow-sm"
                  : "bg-white/5 text-violet-300 border-violet-500/30 group-hover:border-violet-500/60 group-hover:bg-violet-500/10 group-focus:border-violet-500/60"
              )}>
                <span>{b2cCta}</span>
                <span className="transition-transform group-hover:translate-x-1.5 duration-300">
                  {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* B2B World */}
        <motion.div
          className={cn(
            "relative flex-1 flex flex-col justify-end md:justify-center p-8 md:p-16 overflow-hidden outline-none transition-colors duration-500 group",
            isLight 
              ? (activePortal === 'b2b' ? "bg-[#f1f3f6]" : "bg-[#f9fafb]") 
              : (activePortal === 'b2b' ? "bg-[#0b0f19]" : "bg-[#09090b]")
          )}
          tabIndex={0}
          onMouseEnter={() => setHoveredPortal('b2b')}
          onMouseLeave={() => setHoveredPortal(null)}
          onFocus={() => setFocusedPortal('b2b')}
          onBlur={() => setFocusedPortal(null)}
          onKeyDown={(e) => handleKeyDown(e, 'b2b')}
          onClick={() => handleSelect('b2b')}
          animate={{
            flex: activePortal === 'b2b' ? 1.6 : (activePortal === 'b2c' ? 0.95 : 1),
            opacity: selectedPortal === 'b2c' ? 0 : 1
          }}
          transition={reducedMotion ? { duration: 0.1 } : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          role="button"
          aria-label={b2bLabel + " " + b2bTitle}
        >
          {/* Cinematic Background Media */}
          <div className={cn(
            "absolute inset-0 z-0 transition-all duration-700 pointer-events-none",
            activePortal === 'b2b' ? "scale-100 opacity-30 md:opacity-45" : "scale-105 opacity-15 md:opacity-20"
          )} style={reducedMotion ? { transform: 'none' } : undefined}>
            {/* Desktop */}
            <div className="hidden md:block w-full h-full">
              <UniversalMediaHolder
                config={cmsData.b2bDesktopMedia}
                locale={locale}
                forceReducedMotion={reducedMotion}
              />
            </div>
            {/* Mobile */}
            <div className="block md:hidden w-full h-full">
              <UniversalMediaHolder
                config={cmsData.b2bMobileMedia}
                locale={locale}
                forceReducedMotion={reducedMotion}
              />
            </div>
          </div>

          {/* Protective Gradient Overlay */}
          <div className={cn(
            "absolute inset-0 z-0 pointer-events-none transition-opacity duration-500",
            isLight 
              ? "bg-gradient-to-t from-[#f1f3f6] via-[#f1f3f6]/90 to-transparent opacity-95" 
              : "bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent opacity-90"
          )} />

          {/* Content Area */}
          <div className="relative z-10 max-w-lg w-full md:mx-auto select-none">
            {/* Tag / Category */}
            <div className="flex items-center gap-3 mb-3">
              <span className={cn(
                "text-[10px] font-black tracking-[0.2em] uppercase transition-colors px-2 py-0.5 rounded",
                isLight ? "text-indigo-700 bg-indigo-50" : "text-indigo-400 bg-indigo-950/40"
              )}>
                {b2bLabel}
              </span>
              {b2bStat && (
                <span className={cn(
                  "text-[9px] font-extrabold px-2 py-0.5 rounded border transition-all",
                  isLight 
                    ? "bg-emerald-50/50 text-emerald-850 border-emerald-200" 
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                )}>
                  {b2bStat}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 
              className={cn(
                "text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 leading-[1.08] font-display transition-colors",
                isLight ? "text-indigo-950" : "text-zinc-50"
              )}
              dangerouslySetInnerHTML={{ __html: b2bTitle.replace(/\\n/g, '<br/>') }}
            />

            {/* Description (Slide / Fade Reveal) */}
            <motion.div
              initial={false}
              animate={{
                height: (activePortal === 'b2b' || !isMounted) ? 'auto' : 0,
                opacity: (activePortal === 'b2b' || !isMounted) ? 1 : 0,
                marginBottom: (activePortal === 'b2b' || !isMounted) ? 24 : 0
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className={cn(
                "text-sm md:text-base max-w-md font-normal leading-relaxed",
                isLight ? "text-zinc-600" : "text-zinc-300"
              )}>
                {b2bDesc}
              </p>
            </motion.div>

            {/* CTA Button */}
            <div className="mt-2">
              <span className={cn(
                "inline-flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase transition-all duration-300 px-6 py-3 rounded-full border",
                isLight
                  ? "bg-indigo-950 text-white border-transparent hover:bg-indigo-900 shadow-sm"
                  : "bg-white/5 text-emerald-400 border-emerald-500/30 group-hover:border-emerald-500/60 group-hover:bg-emerald-500/10 group-focus:border-emerald-500/60"
              )}>
                <span>{b2bCta}</span>
                <span className="transition-transform group-hover:translate-x-1.5 duration-300">
                  {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </span>
              </span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Visual Divider (Angled Skew Line between B2C and B2B) */}
      <div 
        className={cn(
          "absolute top-0 bottom-0 z-20 pointer-events-none hidden md:block w-[1px] transition-all duration-500",
          activePortal === 'b2c' ? "left-[61.5%]" : (activePortal === 'b2b' ? "left-[36.5%]" : "left-[50%]")
        )}
        style={{
          transform: 'translateX(-50%) skewX(-5deg)',
          backgroundColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'
        }}
      >
        <div className={cn(
          "w-[3px] h-32 absolute top-1/2 -translate-y-1/2 -left-[1px] transition-all duration-500 rounded-full",
          activePortal === 'b2c' 
            ? "bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.6)]" 
            : (activePortal === 'b2b' ? "bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]" : "bg-zinc-500/30")
        )} />
      </div>

      {/* Entry Transition Overlay */}
      <AnimatePresence>
        {selectedPortal && (
          <motion.div 
            className="absolute inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            style={{ backgroundColor: selectedPortal === 'b2c' ? (isLight ? '#fafafa' : '#140b1e') : (isLight ? '#f1f3f6' : '#0b0f19') }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
