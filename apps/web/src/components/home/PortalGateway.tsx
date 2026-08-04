"use client";

import { useState, useEffect } from "react";
import { useMounted } from "@/hooks/useMounted";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useLocale } from "@/components/layout/LocaleProvider";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { UniversalMediaHolder } from "@/components/shared/UniversalMediaHolder";
import { GatewayCustomizationPayload, DEFAULT_GATEWAY_CMS_PAYLOAD } from "@/types/gateway-cms";

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
  const isAr = locale === 'ar';
  const [hoveredPortal, setHoveredPortal] = useState<'b2c' | 'b2b' | null>(null);
  const [selectedPortal, setSelectedPortal] = useState<'b2c' | 'b2b' | null>(null);
  useMounted();

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

  useEffect(() => {
    const stored = localStorage.getItem('e3_preferred_portal');
    if (stored === 'b2c' || stored === 'b2b') {
      // Preference preserved
    }
  }, []);

  const handleSelect = (portal: 'b2c' | 'b2b') => {
    setSelectedPortal(portal);
    localStorage.setItem('e3_preferred_portal', portal);

    setTimeout(() => {
      router.push(`/${locale}/${portal}`);
    }, 600);
  };

  return (
    <div
      className="relative min-h-screen w-full bg-[#09090b] text-white overflow-hidden font-sans"
      dir={dir}
      role="region"
      aria-label={ariaLabel || 'E3 Qatar Portal Gateway'}
    >
      {/* 3D Background */}
      {cmsData.visual.backgroundStyle === 'wireframe' && <WireframeBackground />}

      {/* TOP BRANDING & LANGUAGE SWITCHER HEADER */}
      <div className="absolute top-6 inset-x-0 z-30 px-6 md:px-12 flex items-center justify-between pointer-events-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="font-black text-2xl tracking-tighter text-white drop-shadow-xl font-display">
            E3 <span className="text-[var(--color-primary)]">QATAR</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-white/10 text-white/80 rounded-full border border-white/10">
              {eyebrow}
            </span>
            <span className="hidden lg:inline-block text-xs font-bold text-zinc-400 border-s border-white/10 ps-3">
              {headline}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher variant="pill" />
        </div>
      </div>

      {/* Main UI Overlay */}
      <div className="relative z-10 min-h-screen pt-20 flex flex-col md:flex-row items-stretch">
        
        {/* B2C Card (Left / Right depending on RTL) */}
        <motion.div 
          className="flex-1 flex flex-col justify-center p-8 md:p-16 relative group cursor-pointer border-b md:border-b-0 md:border-e border-white/10 overflow-hidden"
          onMouseEnter={() => setHoveredPortal('b2c')}
          onMouseLeave={() => setHoveredPortal(null)}
          onClick={() => handleSelect('b2c')}
          initial={{ opacity: 0, x: isAr ? 50 : -50 }}
          animate={{ 
            opacity: selectedPortal === 'b2b' ? 0 : 1, 
            x: selectedPortal === 'b2b' ? (isAr ? 100 : -100) : 0,
            flex: hoveredPortal === 'b2c' ? 1.15 : 1 
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Universal Media Background for B2C Desktop */}
          <div className="absolute inset-0 hidden md:block opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
            <UniversalMediaHolder
              config={cmsData.b2cDesktopMedia}
              locale={locale}
              forceReducedMotion={cmsData.visual.reducedMotionDefault}
            />
          </div>

          {/* Universal Media Background for B2C Mobile */}
          <div className="absolute inset-0 block md:hidden opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
            <UniversalMediaHolder
              config={cmsData.b2cMobileMedia}
              locale={locale}
              forceReducedMotion={cmsData.visual.reducedMotionDefault}
            />
          </div>

          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent" />
          
          <div className="relative z-10 max-w-md mx-auto w-full">
            <motion.div 
              className="text-xs font-bold tracking-[0.25em] uppercase text-[var(--color-primary)] mb-4 flex items-center justify-between"
              animate={{ y: hoveredPortal === 'b2c' ? -4 : 0 }}
            >
              <span>{b2cLabel}</span>
              {b2cStat && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                  {b2cStat}
                </span>
              )}
            </motion.div>

            <motion.h2 
              className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-zinc-50 leading-[1.1] font-display"
              animate={{ y: hoveredPortal === 'b2c' ? -4 : 0 }}
              dangerouslySetInnerHTML={{ __html: b2cTitle.replace(/\\n/g, '<br/>') }}
            />

            <motion.p 
              className="text-zinc-300 text-base md:text-lg mb-8 max-w-sm font-normal leading-relaxed"
              animate={{ opacity: hoveredPortal === 'b2c' ? 1 : 0.8 }}
            >
              {b2cDesc}
            </motion.p>
            
            <motion.div 
              className="inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-[var(--color-primary)] bg-white/5 hover:bg-white/15 border border-white/10 px-5 py-3 rounded-full backdrop-blur-md"
              animate={{ x: hoveredPortal === 'b2c' ? (isAr ? -8 : 8) : 0 }}
            >
              <span>{b2cCta}</span>
              <span className="text-lg">{isAr ? '←' : '→'}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* B2B Card (Right / Left depending on RTL) */}
        <motion.div 
          className="flex-1 flex flex-col justify-center p-8 md:p-16 relative group cursor-pointer overflow-hidden"
          onMouseEnter={() => setHoveredPortal('b2b')}
          onMouseLeave={() => setHoveredPortal(null)}
          onClick={() => handleSelect('b2b')}
          initial={{ opacity: 0, x: isAr ? -50 : 50 }}
          animate={{ 
            opacity: selectedPortal === 'b2c' ? 0 : 1, 
            x: selectedPortal === 'b2c' ? (isAr ? -100 : 100) : 0,
            flex: hoveredPortal === 'b2b' ? 1.15 : 1 
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Universal Media Background for B2B Desktop */}
          <div className="absolute inset-0 hidden md:block opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
            <UniversalMediaHolder
              config={cmsData.b2bDesktopMedia}
              locale={locale}
              forceReducedMotion={cmsData.visual.reducedMotionDefault}
            />
          </div>

          {/* Universal Media Background for B2B Mobile */}
          <div className="absolute inset-0 block md:hidden opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
            <UniversalMediaHolder
              config={cmsData.b2bMobileMedia}
              locale={locale}
              forceReducedMotion={cmsData.visual.reducedMotionDefault}
            />
          </div>

          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent" />
          
          <div className="relative z-10 max-w-md mx-auto w-full">
            <motion.div 
              className="text-xs font-bold tracking-[0.25em] uppercase text-emerald-400 mb-4 flex items-center justify-between"
              animate={{ y: hoveredPortal === 'b2b' ? -4 : 0 }}
            >
              <span>{b2bLabel}</span>
              {b2bStat && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  {b2bStat}
                </span>
              )}
            </motion.div>

            <motion.h2 
              className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-zinc-50 leading-[1.1] font-display"
              animate={{ y: hoveredPortal === 'b2b' ? -4 : 0 }}
              dangerouslySetInnerHTML={{ __html: b2bTitle.replace(/\\n/g, '<br/>') }}
            />

            <motion.p 
              className="text-zinc-300 text-base md:text-lg mb-8 max-w-sm font-normal leading-relaxed"
              animate={{ opacity: hoveredPortal === 'b2b' ? 1 : 0.8 }}
            >
              {b2bDesc}
            </motion.p>
            
            <motion.div 
              className="inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-emerald-400 bg-white/5 hover:bg-white/15 border border-white/10 px-5 py-3 rounded-full backdrop-blur-md"
              animate={{ x: hoveredPortal === 'b2b' ? (isAr ? -8 : 8) : 0 }}
            >
              <span>{b2bCta}</span>
              <span className="text-lg">{isAr ? '←' : '→'}</span>
            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* Transition Overlay */}
      <AnimatePresence>
        {selectedPortal && (
          <motion.div 
            className="absolute inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ backgroundColor: selectedPortal === 'b2c' ? '#fafafa' : '#09090b' }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
