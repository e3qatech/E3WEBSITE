"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useMounted } from "@/hooks/useMounted";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowRight, ArrowLeft, Sun, Moon, Globe } from "lucide-react";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useTheme } from "@/components/layout/ThemeProvider";
import { UniversalMediaHolder } from "@/components/shared/UniversalMediaHolder";
import {
  GatewayCustomizationPayload,
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  GatewayPreviewSimulationState,
} from "@/types/gateway-cms";
import { E3Logo } from "@/components/shared/E3Logo";
import { cn } from "@/lib/utils";

const WireframeBackground = dynamic(
  () => import("./WireframeBackground").then((mod) => mod.WireframeBackground),
  { ssr: false }
);

export interface PortalGatewayProps {
  cmsData?: GatewayCustomizationPayload;
  previewMode?: boolean;
  previewConfig?: GatewayCustomizationPayload;
  simulation?: GatewayPreviewSimulationState;
}

export function PortalGateway({
  cmsData: initialCmsData = DEFAULT_GATEWAY_CMS_PAYLOAD,
  previewMode = false,
  previewConfig,
  simulation,
}: PortalGatewayProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale: contextLocale, setLocale } = useLocale();
  const { theme: contextTheme, setTheme } = useTheme();

  const [hoveredPortal, setHoveredPortal] = useState<"b2c" | "b2b" | null>(null);
  const [focusedPortal, setFocusedPortal] = useState<"b2c" | "b2b" | null>(null);
  const [selectedPortal, setSelectedPortal] = useState<"b2c" | "b2b" | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(false);
  const isMounted = useMounted();

  // Handle mobile viewport detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // In Preview Mode, prefer draft config
  const activeCmsData = previewMode && previewConfig ? previewConfig : initialCmsData;

  // Resolve locale (simulation > context > fallback)
  const activeLocale = simulation?.locale || contextLocale || "en";
  const isAr = activeLocale === "ar";
  const activeDir = isAr ? "rtl" : "ltr";

  // Resolve theme (simulation > context > visual setting > dark)
  const resolvedTheme = simulation?.theme || contextTheme || activeCmsData.visual?.themeMode || "dark";
  const isLight = resolvedTheme === "light";

  // Active portal logic
  const activeFocus = simulation?.portalFocus !== "none" ? simulation?.portalFocus || null : hoveredPortal || focusedPortal;

  // Content bindings
  const en = activeCmsData.english || DEFAULT_GATEWAY_CMS_PAYLOAD.english;
  const ar = activeCmsData.arabic || DEFAULT_GATEWAY_CMS_PAYLOAD.arabic;
  const logo = activeCmsData.logo || DEFAULT_GATEWAY_CMS_PAYLOAD.logo;
  const visual = activeCmsData.visual || DEFAULT_GATEWAY_CMS_PAYLOAD.visual;
  const seo = activeCmsData.seoAccess || DEFAULT_GATEWAY_CMS_PAYLOAD.seoAccess;

  const eyebrow = isAr ? ar.eyebrowAr || en.eyebrowEn : en.eyebrowEn || ar.eyebrowAr;
  const headline = isAr ? ar.headlineAr || en.headlineEn : en.headlineEn || ar.headlineAr;
  const supportingText = isAr ? ar.supportingTextAr || en.supportingTextEn : en.supportingTextEn || ar.supportingTextAr;

  // B2C Content
  const b2cLabel = isAr ? ar.b2cLabelAr || en.b2cLabelEn : en.b2cLabelEn || ar.b2cLabelAr;
  const b2cTitle = isAr ? ar.b2cTitleAr || en.b2cTitleEn : en.b2cTitleEn || ar.b2cLabelAr;
  const b2cDesc = isAr ? ar.b2cDescAr || en.b2cDescEn : en.b2cDescEn || ar.b2cDescAr;
  const b2cCta = isAr ? ar.b2cCtaLabelAr || en.b2cCtaLabelEn : en.b2cCtaLabelEn || ar.b2cCtaLabelAr;
  const b2cStat = isAr ? ar.b2cStatLabelAr || en.b2cStatLabelEn : en.b2cStatLabelEn || ar.b2cStatLabelAr;
  const b2cDest = isAr
    ? ar.b2cDestinationUrl || en.b2cDestinationUrl || "/ar/b2c"
    : en.b2cDestinationUrl || ar.b2cDestinationUrl || "/b2c";
  const b2cAria = isAr ? ar.b2cAriaLabelAr || seo.b2cAriaLabelAr : en.b2cAriaLabelEn || seo.b2cAriaLabelEn;

  // B2B Content
  const b2bLabel = isAr ? ar.b2bLabelAr || en.b2bLabelEn : en.b2bLabelEn || ar.b2bLabelAr;
  const b2bTitle = isAr ? ar.b2bTitleAr || en.b2bTitleEn : en.b2bTitleEn || ar.b2bLabelAr;
  const b2bDesc = isAr ? ar.b2bDescAr || en.b2bDescEn : en.b2bDescEn || ar.b2bDescAr;
  const b2bCta = isAr ? ar.b2bCtaLabelAr || en.b2bCtaLabelEn : en.b2bCtaLabelEn || ar.b2bCtaLabelAr;
  const b2bStat = isAr ? ar.b2bStatLabelAr || en.b2bStatLabelEn : en.b2bStatLabelEn || ar.b2bStatLabelAr;
  const b2bDest = isAr
    ? ar.b2bDestinationUrl || en.b2bDestinationUrl || "/ar/b2b"
    : en.b2bDestinationUrl || ar.b2bDestinationUrl || "/b2b";
  const b2bAria = isAr ? ar.b2bAriaLabelAr || seo.b2bAriaLabelAr : en.b2bAriaLabelEn || seo.b2bAriaLabelEn;

  const ariaGatewayLabel = isAr ? seo.ariaGatewayLabelAr : seo.ariaGatewayLabelEn;

  // Navigation action
  const handleSelect = useCallback(
    (portal: "b2c" | "b2b") => {
      setSelectedPortal(portal);
      if (!previewMode) {
        try {
          localStorage.setItem("e3_preferred_portal", portal);
        } catch (_e) {}
        const destination = portal === "b2c" ? b2cDest : b2bDest;
        setTimeout(() => {
          router.push(destination);
        }, 350);
      }
    },
    [router, previewMode, b2cDest, b2bDest]
  );

  // Language switcher toggle
  const toggleLanguage = useCallback(() => {
    const nextLocale = activeLocale === "en" ? "ar" : "en";
    if (setLocale) setLocale(nextLocale);
    if (!previewMode && pathname) {
      const newPath = pathname.replace(`/${activeLocale}`, `/${nextLocale}`);
      router.push(newPath.startsWith("/") ? newPath : `/${nextLocale}`);
    }
  }, [activeLocale, setLocale, previewMode, pathname, router]);

  // Viewport Container Dimensions for CMS Live Preview Frame Resizing
  const viewportWidthClass = useMemo(() => {
    if (!simulation) return "w-full min-h-screen h-screen overflow-hidden";
    switch (simulation.viewport) {
      case "small-mobile-320":
        return "w-[320px] h-[568px] mx-auto rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden";
      case "mobile-390":
        return "w-[390px] h-[720px] mx-auto rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden";
      case "tablet-768":
        return "w-[768px] h-[780px] mx-auto rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden";
      case "laptop-1280":
        return "w-[1280px] h-[720px] mx-auto rounded-lg border border-slate-700 shadow-2xl overflow-hidden";
      case "desktop-1440":
      default:
        return "w-full min-h-screen h-screen overflow-hidden";
    }
  }, [simulation]);

  const isReducedMotion = simulation?.reducedMotion || visual.reducedMotionDefault;

  // Mobile Portal Ordering
  const showB2CFirstOnMobile = visual.mobilePortalOrder !== "b2b_first";

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between transition-colors duration-500 font-sans select-none",
        viewportWidthClass,
        isLight ? "bg-[#f4f4f6] text-slate-900" : "bg-[#09090b] text-white"
      )}
      dir={activeDir}
      role="region"
      aria-label={ariaGatewayLabel || "E3 Qatar Portal Selection Gateway"}
    >
      {/* Background Wireframe / Treatment Layer */}
      {isMounted && visual.backgroundStyle === "wireframe" && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-15 dark:opacity-30">
          <WireframeBackground />
        </div>
      )}

      {/* Atmospheric Ambient Gradient */}
      <div
        className={cn(
          "absolute inset-0 z-0 pointer-events-none transition-opacity duration-700",
          isLight
            ? "bg-gradient-to-b from-white/80 via-purple-50/20 to-slate-100/90"
            : "bg-gradient-to-b from-slate-950/90 via-purple-950/20 to-black/95"
        )}
      />

      {/* 1. MINIMAL TRANSPARENT HEADER LAYER */}
      <header className="relative z-40 w-full px-6 py-5 md:px-12 flex items-center justify-between pointer-events-auto">
        {/* E3 Official Logo */}
        <a
          href={logo?.destinationUrl || "/"}
          onClick={(e) => {
            if (previewMode) e.preventDefault();
          }}
          className="inline-flex items-center gap-3 transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1"
          aria-label={isAr ? logo?.altAr || "شعار إي ثري قطر" : logo?.altEn || "E3 Qatar Official Logo"}
        >
          <E3Logo
            isLight={isLight}
            lightLogoUrl={isLight ? logo?.lightLogoUrl || logo?.defaultLogoUrl : undefined}
            darkLogoUrl={!isLight ? logo?.darkLogoUrl || logo?.defaultLogoUrl : undefined}
            size={isMobileViewport ? "sm" : "md"}
          />
        </a>

        {/* Header Controls: Language Switcher & Theme Control */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          {visual.languageSwitcherVisible !== false && (
            <button
              onClick={toggleLanguage}
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500",
                isLight
                  ? "bg-white/80 text-slate-800 border-slate-300/80 hover:bg-white hover:border-purple-400"
                  : "bg-slate-900/80 text-slate-200 border-slate-700/80 hover:bg-slate-800 hover:border-purple-500/50"
              )}
              aria-label={isAr ? "Switch to English" : "التحويل إلى العربية"}
            >
              <Globe className="h-3.5 w-3.5 text-purple-400" />
              <span>{isAr ? "English" : "العربية"}</span>
            </button>
          )}

          {/* Theme Control */}
          {visual.themeSwitcherVisible !== false && (
            <button
              onClick={() => setTheme && setTheme(isLight ? 'dark' : 'light')}
              type="button"
              className={cn(
                "inline-flex items-center justify-center p-2 rounded-full text-xs transition-all border shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500",
                isLight
                  ? "bg-white/80 text-slate-800 border-slate-300/80 hover:bg-white"
                  : "bg-slate-900/80 text-slate-200 border-slate-700/80 hover:bg-slate-800"
              )}
              aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {isLight ? (
                <Moon className="h-4 w-4 text-purple-600" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* 2. BILINGUAL GATEWAY INTRODUCTION */}
      <section className="relative z-30 w-full px-6 md:px-12 pt-2 pb-4 text-center max-w-4xl mx-auto flex flex-col items-center">
        {eyebrow && (
          <span
            className={cn(
              "inline-block px-3 py-1 mb-2 text-[10px] md:text-xs font-extrabold uppercase tracking-widest rounded-full border shadow-sm backdrop-blur-md transition-all",
              isLight
                ? "bg-purple-100/90 text-purple-900 border-purple-200"
                : "bg-purple-950/80 text-purple-300 border-purple-500/30"
            )}
          >
            {eyebrow}
          </span>
        )}

        <h1
          className={cn(
            "text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight transition-colors",
            isLight ? "text-slate-900" : "text-white"
          )}
        >
          {headline}
        </h1>

        {supportingText && (
          <p
            className={cn(
              "mt-2 text-xs md:text-sm font-medium leading-relaxed max-w-2xl text-balance transition-colors",
              isLight ? "text-slate-600" : "text-slate-300"
            )}
          >
            {supportingText}
          </p>
        )}
      </section>

      {/* 3. CINEMATIC 50/50 B2C & B2B SPLIT CONTAINER */}
      <main className="relative z-30 flex-1 w-full px-4 md:px-10 pb-6 flex flex-col md:flex-row items-stretch justify-center gap-3 md:gap-0 overflow-hidden">
        {/* PORTAL RENDER ORDER ON MOBILE */}
        {(showB2CFirstOnMobile ? ["b2c", "b2b"] : ["b2b", "b2c"]).map((portalKey) => {
          const isB2C = portalKey === "b2c";
          const title = isB2C ? b2cTitle : b2bTitle;
          const label = isB2C ? b2cLabel : b2bLabel;
          const desc = isB2C ? b2cDesc : b2bDesc;
          const cta = isB2C ? b2cCta : b2bCta;
          const stat = isB2C ? b2cStat : b2bStat;
          const aria = isB2C ? b2cAria : b2bAria;

          const desktopMedia = isB2C
            ? activeCmsData.b2cDesktopMedia
            : activeCmsData.b2bDesktopMedia;
          const mobileMedia = isB2C
            ? activeCmsData.b2cMobileMedia || activeCmsData.b2cDesktopMedia
            : activeCmsData.b2bMobileMedia || activeCmsData.b2bDesktopMedia;

          const activeMedia =
            isMobileViewport && mobileMedia?.mediaUrl ? mobileMedia : desktopMedia;

          const isHovered = hoveredPortal === portalKey;
          const isFocused = focusedPortal === portalKey;
          const isSelected = selectedPortal === portalKey;
          const isOtherHovered =
            hoveredPortal !== null && hoveredPortal !== portalKey;
          const isOtherFocused =
            focusedPortal !== null && focusedPortal !== portalKey;

          // Flex allocation on desktop: Default 50/50, Active 63/37
          let flexClass = "md:flex-[50]";
          if (activeFocus === portalKey) {
            flexClass = "md:flex-[63]";
          } else if (activeFocus && activeFocus !== portalKey) {
            flexClass = "md:flex-[37]";
          }

          return (
            <div
              key={portalKey}
              onMouseEnter={() => setHoveredPortal(portalKey as "b2c" | "b2b")}
              onMouseLeave={() => setHoveredPortal(null)}
              onFocus={() => setFocusedPortal(portalKey as "b2c" | "b2b")}
              onBlur={() => setFocusedPortal(null)}
              onClick={() => handleSelect(portalKey as "b2c" | "b2b")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(portalKey as "b2c" | "b2b");
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={aria || title}
              className={cn(
                "relative group flex-1 flex flex-col justify-end p-6 md:p-10 cursor-pointer rounded-2xl md:rounded-none overflow-hidden transition-all ease-out",
                isReducedMotion ? "duration-200" : "duration-500",
                flexClass,
                // Divider styling on desktop
                isB2C
                  ? "md:rounded-s-3xl md:border-e border-purple-500/20"
                  : "md:rounded-e-3xl md:border-s border-purple-500/20",
                // Mobile height constraints
                "min-h-[42vh] md:min-h-0",
                // Active vs Inactive visual emphasis
                isHovered || isFocused || isSelected
                  ? "z-20 shadow-2xl ring-2 ring-purple-500/60"
                  : isOtherHovered || isOtherFocused
                  ? "z-10 opacity-75 grayscale-[20%]"
                  : "z-10 opacity-100",
                // Theme background styling
                isLight
                  ? isB2C
                    ? "bg-gradient-to-br from-violet-900/90 via-purple-950/95 to-slate-950 text-white"
                    : "bg-gradient-to-br from-slate-900/95 via-indigo-950/95 to-slate-950 text-white"
                  : isB2C
                  ? "bg-gradient-to-br from-violet-950/90 via-purple-950/95 to-black text-white"
                  : "bg-gradient-to-br from-slate-950/95 via-zinc-900/95 to-black text-white"
              )}
            >
              {/* MEDIA BACKGROUND LAYER */}
              <div className="absolute inset-0 z-0">
                <UniversalMediaHolder
                  config={
                    simulation?.useFallbackMedia
                      ? {
                          ...activeMedia,
                          mediaUrl: activeMedia.fallbackImageUrl,
                          mediaType: "IMAGE",
                        }
                      : activeMedia
                  }
                  locale={activeLocale}
                  className={cn(
                    "h-full w-full object-cover transition-transform ease-out opacity-45 group-hover:opacity-60",
                    isReducedMotion ? "duration-200" : "duration-700",
                    isHovered ? "scale-105" : "scale-100"
                  )}
                />

                {/* TEXT PROTECTION GRADIENT OVERLAY */}
                <div
                  className={cn(
                    "absolute inset-0 pointer-events-none transition-opacity duration-500",
                    isB2C
                      ? "bg-gradient-to-t from-violet-950/95 via-purple-950/60 to-transparent"
                      : "bg-gradient-to-t from-slate-950/95 via-indigo-950/60 to-transparent"
                  )}
                  style={{
                    opacity: visual.overlayStrength ?? 0.6,
                  }}
                />
              </div>

              {/* CURVED / ANGLED RESTRAINED E3 BRAND DIVIDER (DESKTOP INTERFACE) */}
              <div
                className={cn(
                  "hidden md:block absolute top-0 bottom-0 z-10 w-1 pointer-events-none transition-colors duration-500",
                  isB2C ? "right-0 bg-gradient-to-b from-purple-500/0 via-purple-400/50 to-purple-500/0" : "left-0 bg-gradient-to-b from-indigo-500/0 via-indigo-400/50 to-indigo-500/0"
                )}
              />

              {/* PROTECTED CONTENT ZONE */}
              <div className="relative z-20 space-y-3 max-w-xl">
                {/* Eyebrow / Category Tag & Optional Stat Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-block px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider border shadow-sm backdrop-blur-md",
                      isB2C
                        ? "bg-purple-500/30 text-purple-200 border-purple-400/40"
                        : "bg-indigo-500/30 text-indigo-200 border-indigo-400/40"
                    )}
                  >
                    {label}
                  </span>

                  {stat && visual.statisticsVisible !== false && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white/90 border border-white/20 backdrop-blur-md">
                      {stat}
                    </span>
                  )}
                </div>

                {/* Main Title */}
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md">
                  {title}
                </h2>

                {/* Description */}
                <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed drop-shadow-sm line-clamp-3 md:line-clamp-none">
                  {desc}
                </p>

                {/* CTA BUTTON */}
                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(portalKey as "b2c" | "b2b");
                    }}
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-2.5 rounded-xl px-5 py-3 text-xs md:text-sm font-bold text-white shadow-xl transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-white",
                      isB2C
                        ? "bg-purple-600 hover:bg-purple-500 shadow-purple-950/50"
                        : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/50",
                      isHovered && !isReducedMotion && "translate-x-1 rtl:-translate-x-1"
                    )}
                  >
                    <span>{cta}</span>
                    {isAr ? (
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
