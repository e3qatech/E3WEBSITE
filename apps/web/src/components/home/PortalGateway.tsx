"use client";

import { useState, useCallback, useMemo } from "react";
import { useMounted } from "@/hooks/useMounted";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowRight, Bug, ShieldCheck, Sparkles } from "lucide-react";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useTheme } from "@/components/layout/ThemeProvider";
import { UniversalMediaHolder } from "@/components/shared/UniversalMediaHolder";
import {
  GatewayCustomizationPayload,
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  PreviewSimulationState,
  AtmosphereRendererType,
  GatewayAtmospherePreset,
  GatewayWeatherRule,
} from "@/types/gateway-cms";
import { AtmosphereEngine } from "@/components/atmosphere/AtmosphereEngine";
import { E3Logo } from "@/components/shared/E3Logo";
import { cn } from "@/lib/utils";

const WireframeBackground = dynamic(
  () => import('./WireframeBackground').then(mod => mod.WireframeBackground),
  { ssr: false }
);

export interface PortalGatewayProps {
  cmsData?: GatewayCustomizationPayload;
  previewMode?: boolean;
  previewConfig?: GatewayCustomizationPayload;
  simulation?: PreviewSimulationState;
}

export function PortalGateway({
  cmsData: initialCmsData = DEFAULT_GATEWAY_CMS_PAYLOAD,
  previewMode = false,
  previewConfig,
  simulation,
}: PortalGatewayProps) {
  const router = useRouter();
  const { locale: contextLocale } = useLocale();
  const { theme: contextTheme } = useTheme();

  const [hoveredPortal, setHoveredPortal] = useState<'b2c' | 'b2b' | null>(null);
  const [, setSelectedPortal] = useState<'b2c' | 'b2b' | null>(null);
  const [focusedPortal, setFocusedPortal] = useState<'b2c' | 'b2b' | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(true);
  const isMounted = useMounted();

  // In Preview Mode, prefer supplied draft config
  const activeCmsData = previewMode && previewConfig ? previewConfig : initialCmsData;

  // Focus Protection Settings
  const focusProtection = activeCmsData.focusProtection || DEFAULT_GATEWAY_CMS_PAYLOAD.focusProtection!;

  // INTERACTION FOCUS MODE ACTIVATION
  const isFocusActive = Boolean(hoveredPortal || focusedPortal);

  // Resolve active locale and theme
  const activeLocale = simulation?.locale || contextLocale || 'en';
  const isAr = activeLocale === 'ar';
  const activeDir = isAr ? 'rtl' : 'ltr';

  const resolvedTheme = simulation?.theme || contextTheme || 'dark';
  const isLight = resolvedTheme === 'light';

  // LIVE WEATHER & RULE RESOLUTION ENGINE FOR PREVIEW
  const resolvedWeatherState = useMemo(() => {
    if (!simulation) {
      return {
        presetType: (activeCmsData.experienceConfig?.defaultScenePreset || 'clear-day') as AtmosphereRendererType,
        matchedRule: null as GatewayWeatherRule | null,
        matchedPreset: null as GatewayAtmospherePreset | null,
        waterHeight: activeCmsData.waterAndSandPhysics?.waterEnabled ? activeCmsData.waterAndSandPhysics.waterMaxHeightPercent : 0,
        sandHeight: activeCmsData.waterAndSandPhysics?.sandEnabled ? activeCmsData.waterAndSandPhysics.sandMaxHeightPercent : 0,
      };
    }

    if (!simulation.webglAvailable || !simulation.weatherApiAvailable || simulation.reducedMotion) {
      return {
        presetType: 'static-fallback' as AtmosphereRendererType,
        matchedRule: null,
        matchedPreset: null,
        waterHeight: 0,
        sandHeight: 0,
      };
    }

    const rules = activeCmsData.weatherRules || DEFAULT_GATEWAY_CMS_PAYLOAD.weatherRules || [];
    const presets = activeCmsData.atmospherePresets || DEFAULT_GATEWAY_CMS_PAYLOAD.atmospherePresets || [];

    let matchedRule: GatewayWeatherRule | null = null;
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (!rule.enabled) continue;

      let matches = false;

      if (simulation.heavyRainOverride && rule.presetId === 'heavy-rain') {
        matches = true;
      } else if (rule.rainMinMm !== undefined && simulation.rain >= rule.rainMinMm) {
        matches = true;
      } else if (rule.pm10Min !== undefined && simulation.pm10 >= rule.pm10Min) {
        matches = true;
      } else if (rule.apparentTempMinC !== undefined && simulation.apparentTemperature >= rule.apparentTempMinC) {
        matches = true;
      } else if (rule.tempMinC !== undefined && simulation.temperature >= rule.tempMinC) {
        matches = true;
      } else if (rule.windMinKmh !== undefined && simulation.windSpeed >= rule.windMinKmh) {
        matches = true;
      }

      if (matches) {
        matchedRule = rule;
        break;
      }
    }

    let presetType: AtmosphereRendererType = matchedRule ? matchedRule.presetId : 'clear-day';
    if (!matchedRule) {
      if (simulation.temperature <= 0) presetType = 'snow';
      else if (!simulation.isDay) presetType = 'night';
      else if (simulation.temperature >= 38) presetType = 'heat';
      else if (simulation.rain > 0.5) presetType = 'rain';
      else if (simulation.windSpeed >= 35) presetType = 'wind';
    }

    const matchedPreset = presets.find((p) => p.rendererType === presetType) || null;

    // Calculate water and sand heights (capped by safety ceilings: water <= 25% near cards, sand <= 20% outer edges)
    let waterHeight = 0;
    if (presetType === 'rain' || presetType === 'heavy-rain') {
      const baseMax = activeCmsData.waterAndSandPhysics?.waterMaxHeightPercent || 15;
      waterHeight = Math.min(baseMax, 25);
    }

    let sandHeight = 0;
    if (presetType === 'sandstorm' || presetType === 'dust') {
      const baseMax = activeCmsData.waterAndSandPhysics?.sandMaxHeightPercent || 10;
      sandHeight = Math.min(baseMax, 20);
    }

    return {
      presetType,
      matchedRule,
      matchedPreset,
      waterHeight,
      sandHeight,
    };
  }, [simulation, activeCmsData]);

  const en = activeCmsData.english;
  const ar = activeCmsData.arabic;

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

  const activeCampaign = useMemo(() => {
    if (simulation?.selectedCampaignId && simulation.selectedCampaignId !== 'none') {
      return activeCmsData.campaigns?.find((c) => c.id === simulation.selectedCampaignId) || activeCmsData.campaigns?.[0];
    }
    return activeCmsData.campaigns?.[0];
  }, [simulation, activeCmsData]);

  const ariaLabel = isAr ? activeCmsData.seoAccess.ariaGatewayLabelAr : activeCmsData.seoAccess.ariaGatewayLabelEn;

  const handleSelect = useCallback(
    (portal: 'b2c' | 'b2b') => {
      setSelectedPortal(portal);
      if (!previewMode) {
        localStorage.setItem('e3_preferred_portal', portal);
        setTimeout(() => {
          router.push(`/${activeLocale}/${portal}`);
        }, 600);
      }
    },
    [router, activeLocale, previewMode]
  );

  // Viewport Container Dimensions for Frame Resizing
  const viewportWidthClass = useMemo(() => {
    if (!simulation) return 'w-full h-full min-h-screen';
    switch (simulation.viewport) {
      case 'small-mobile-320':
        return 'w-[320px] h-[568px] mx-auto rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden';
      case 'mobile-390':
        return 'w-[390px] h-[720px] mx-auto rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden';
      case 'tablet-768':
        return 'w-[768px] h-[780px] mx-auto rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden';
      case 'laptop-1280':
        return 'w-[1280px] h-[720px] mx-auto rounded-lg border border-slate-700 shadow-2xl overflow-hidden';
      case 'desktop-1440':
      default:
        return 'w-full h-full min-h-screen';
    }
  }, [simulation]);

  return (
    <div
      className={cn(
        "relative overflow-hidden transition-all duration-500",
        viewportWidthClass,
        isLight ? "bg-[#f8f9fa]" : "bg-[#09090b]"
      )}
      dir={activeDir}
      role="region"
      aria-label={ariaLabel || 'E3 Qatar Portal Gateway'}
    >
      {/* ATMOSPHERE ENGINE CANVAS LAYER (STRICTLY BEHIND CONTENT ZONES - z-0) */}
      <AtmosphereEngine
        rendererType={resolvedWeatherState.presetType}
        particleCount={resolvedWeatherState.matchedPreset?.particleCount || 60}
        particleSpeed={resolvedWeatherState.matchedPreset?.particleSpeed || 5}
        particleOpacity={resolvedWeatherState.matchedPreset?.particleOpacity || 0.5}
        waterHeightPercent={resolvedWeatherState.waterHeight}
        sandHeightPercent={resolvedWeatherState.sandHeight}
        windSpeedKmh={simulation?.windSpeed || 15}
        windDirectionDeg={simulation?.windDirection || 45}
        isNight={simulation ? !simulation.isDay : false}
        isReducedMotion={simulation?.reducedMotion || activeCmsData.visual.reducedMotionDefault}
        isWebGlAvailable={simulation ? simulation.webglAvailable : true}
        isFocusActive={isFocusActive}
        atmosphereAttenuation={focusProtection.atmosphereAroundCards}
      />

      {/* Wireframe Background Layer (z-0) */}
      {isMounted && activeCmsData.visual.backgroundStyle === 'wireframe' && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-40">
          <WireframeBackground />
        </div>
      )}

      {/* 1. FIRST-VIEWPORT REQUIREMENT: HEADER & E3 WELCOME BRANDING (z-40) */}
      <header className="absolute top-0 inset-x-0 z-40 px-6 py-6 md:px-12 flex flex-wrap items-center justify-between pointer-events-none gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pointer-events-auto">
          <E3Logo isLight={isLight} size="md" />
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-full border transition-all shadow-sm",
                isLight ? "bg-zinc-100 text-zinc-800 border-zinc-200" : "bg-slate-900/90 text-white/90 border-white/20 backdrop-blur-md"
              )}
            >
              {eyebrow}
            </span>
            <span
              className={cn(
                "hidden lg:inline-block text-xs font-bold border-s ps-3 transition-colors drop-shadow-sm",
                isLight ? "text-zinc-600 border-zinc-300" : "text-slate-200 border-white/20"
              )}
            >
              {headline}
            </span>
          </div>
        </div>

        {/* CAMPAIGN STRIP BADGE (STABLE DECORATION) */}
        {activeCampaign && (
          <div className="pointer-events-auto hidden md:flex items-center gap-2 rounded-full border border-amber-500/30 bg-slate-950/80 px-3.5 py-1 text-xs font-medium text-amber-300 backdrop-blur-md shadow-lg">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>{isAr ? activeCampaign.titleAr : activeCampaign.titleEn}</span>
          </div>
        )}
      </header>

      {/* 2. PROTECTED DUAL PORTAL CARDS GRID (z-30) */}
      <div className="relative z-30 min-h-screen w-full flex flex-col md:flex-row pt-20 pb-8 px-4 md:px-10 gap-6 items-stretch justify-center">
        {/* B2C PORTAL HERO CARD */}
        <div
          onMouseEnter={() => setHoveredPortal('b2c')}
          onMouseLeave={() => setHoveredPortal(null)}
          onFocus={() => setFocusedPortal('b2c')}
          onBlur={() => setFocusedPortal(null)}
          onClick={() => handleSelect('b2c')}
          tabIndex={0}
          role="button"
          aria-label={b2cTitle}
          className={cn(
            "relative flex-1 flex flex-col justify-end p-8 md:p-12 cursor-pointer transition-all duration-300 ease-out rounded-2xl border backdrop-blur-md shadow-2xl overflow-hidden",
            hoveredPortal === 'b2c'
              ? "border-sky-400/80 bg-slate-950/95 scale-[1.015] shadow-sky-950/50"
              : hoveredPortal === 'b2b'
              ? "border-slate-800 bg-slate-950/70 opacity-65 scale-[0.99]"
              : "border-slate-800/90 bg-slate-950/85 opacity-100"
          )}
        >
          <div className="absolute inset-0 z-0">
            <UniversalMediaHolder
              config={activeCmsData.b2cDesktopMedia}
              locale={activeLocale}
              className="h-full w-full object-cover opacity-30 transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* PROTECTED CONTENT ZONE - HIGH CONTRAST & WCAG AA COMPLIANCE */}
          <div className="relative z-10 space-y-4 max-w-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-sky-500/25 text-sky-200 border border-sky-400/40 backdrop-blur-sm">
                {b2cLabel}
              </span>
              {b2cStat && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white border border-white/20 backdrop-blur-sm">
                  {b2cStat}
                </span>
              )}
            </div>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">{b2cTitle}</h2>
            <p className="text-sm text-slate-200 font-medium leading-relaxed drop-shadow-sm">{b2cDesc}</p>

            {/* STABLE, NON-MOVING PRIMARY CTA BUTTON */}
            <div className="pt-3">
              <span className="inline-flex items-center gap-2.5 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-950/50 transition-all hover:bg-sky-500">
                <span>{b2cCta}</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* B2B PORTAL HERO CARD */}
        <div
          onMouseEnter={() => setHoveredPortal('b2b')}
          onMouseLeave={() => setHoveredPortal(null)}
          onFocus={() => setFocusedPortal('b2b')}
          onBlur={() => setFocusedPortal(null)}
          onClick={() => handleSelect('b2b')}
          tabIndex={0}
          role="button"
          aria-label={b2bTitle}
          className={cn(
            "relative flex-1 flex flex-col justify-end p-8 md:p-12 cursor-pointer transition-all duration-300 ease-out rounded-2xl border backdrop-blur-md shadow-2xl overflow-hidden",
            hoveredPortal === 'b2b'
              ? "border-purple-400/80 bg-slate-950/95 scale-[1.015] shadow-purple-950/50"
              : hoveredPortal === 'b2c'
              ? "border-slate-800 bg-slate-950/70 opacity-65 scale-[0.99]"
              : "border-slate-800/90 bg-slate-950/85 opacity-100"
          )}
        >
          <div className="absolute inset-0 z-0">
            <UniversalMediaHolder
              config={activeCmsData.b2bDesktopMedia}
              locale={activeLocale}
              className="h-full w-full object-cover opacity-30 transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* PROTECTED CONTENT ZONE - HIGH CONTRAST & WCAG AA COMPLIANCE */}
          <div className="relative z-10 space-y-4 max-w-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-purple-500/25 text-purple-200 border border-purple-400/40 backdrop-blur-sm">
                {b2bLabel}
              </span>
              {b2bStat && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white border border-white/20 backdrop-blur-sm">
                  {b2bStat}
                </span>
              )}
            </div>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">{b2bTitle}</h2>
            <p className="text-sm text-slate-200 font-medium leading-relaxed drop-shadow-sm">{b2bDesc}</p>

            {/* STABLE, NON-MOVING PRIMARY CTA BUTTON */}
            <div className="pt-3">
              <span className="inline-flex items-center gap-2.5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-950/50 transition-all hover:bg-purple-500">
                <span>{b2bCta}</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN PREVIEW DEBUG OVERLAY PANEL */}
      {previewMode && (
        <div className="absolute bottom-4 right-4 z-50 rounded-xl border border-slate-700/80 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-md text-[11px] font-mono text-slate-200 max-w-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Bug className="h-3.5 w-3.5" /> Telemetry & Focus Protection
            </div>
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="text-slate-400 hover:text-white"
            >
              {showDebugPanel ? 'Hide' : 'Show'}
            </button>
          </div>

          {showDebugPanel && (
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center gap-1 font-bold text-sky-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Focus Protection: ACTIVE ({focusProtection.selectionFocusProtection})</span>
              </div>
              <div>
                <span className="text-slate-500">Interaction Mode:</span>{' '}
                <span className={cn("font-bold", isFocusActive ? "text-amber-300" : "text-slate-300")}>
                  {isFocusActive ? 'FOCUS ACTIVE (Particles Attenuated -70%)' : 'STANDBY (Full Ambient)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Input Weather:</span> {simulation?.temperature || 34}°C | Rain: {simulation?.rain || 0}mm | PM10: {simulation?.pm10 || 45} | Wind: {simulation?.windSpeed || 15} km/h
              </div>
              <div>
                <span className="text-slate-500">Preset:</span>{' '}
                <span className="text-emerald-300 font-bold">{resolvedWeatherState.presetType.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-500">Physics Ceilings:</span> Water {resolvedWeatherState.waterHeight}% (Max 25%) | Sand {resolvedWeatherState.sandHeight}% (Max 20%)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
