"use client";

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useMotionCapability } from '@/lib/motion/capability-context';
import { Reveal } from '@/components/motion/Reveal';
import { WebGLBoundary } from '@/components/motion/WebGLBoundary';
import { Layers, Sparkles, Cpu, Compass, ShieldCheck } from 'lucide-react';

export interface B2BBlueprintDepthSectionProps {
  locale: string;
  data?: any;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Compass,
  Layers,
  ShieldCheck,
  Cpu,
  Sparkles,
};

export function B2BBlueprintDepthSection({ locale, data }: B2BBlueprintDepthSectionProps) {
  if (data?.enabled === false) {
    return null;
  }

  const isAr = locale === 'ar';
  const { tier, isReducedMotion } = useMotionCapability();
  const isFull = tier === 'full' && !isReducedMotion;

  const [mode, setMode] = useState<'split' | 'blueprint' | 'live'>('split');
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100 percentage

  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt physics for 'full' tier
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 180 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFull || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    if (!isFull) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  // Content resolution
  const eyebrow = isAr 
    ? (data?.eyebrowAr || "الهندسة المعمارية التفاعلية") 
    : (data?.eyebrowEn || data?.eyebrow || "SPATIAL ARCHITECTURE & DEPTH");
  
  const title = isAr 
    ? (data?.titleAr || "من المخطط الهندسي إلى الواقع الحي") 
    : (data?.titleEn || data?.title || "From Blueprint to Landmark Reality");
  
  const description = isAr 
    ? (data?.descriptionAr || "شاهد كيف تتحول الحسابات الإنشائية ومخططات تدفق الجماهير ثلاثية الأبعاد إلى تجارب ترفيهية متكاملة تنبض بالحياة.") 
    : (data?.descriptionEn || data?.description || "Explore how rigorous structural engineering, spatial telemetry, and crowd logistics transform into world-class entertainment destinations.");

  const cadTabLabel = isAr 
    ? (data?.cadTabLabelAr || "01. المخطط الهيكلي") 
    : (data?.cadTabLabelEn || "01. CAD Blueprint");

  const splitTabLabel = isAr 
    ? (data?.splitTabLabelAr || "02. المقارنة التفاعلية") 
    : (data?.splitTabLabelEn || "02. Interactive Split");

  const liveTabLabel = isAr 
    ? (data?.liveTabLabelAr || "03. الإنتاج الواقعي") 
    : (data?.liveTabLabelEn || "03. Live Experience");

  const schematicTitle = isAr 
    ? (data?.schematicTitleAr || "المخطط المكاني لإي ثري // قطر") 
    : (data?.schematicTitleEn || "E3 SPATIAL SCHEMATIC // QATAR");

  const schematicSpec1 = isAr 
    ? (data?.schematicSpec1Ar || "نسبة التسامح: ±0.5 مم | الحمل: 4.8 كيلو نيوتن/م²") 
    : (data?.schematicSpec1En || "TOLERANCE: ±0.5mm | LOAD: 4.8 kN/m²");

  const schematicSpec2 = isAr 
    ? (data?.schematicSpec2Ar || "السعة الاستيعابية: 12,500 زائر/ساعة") 
    : (data?.schematicSpec2En || "CROWD CAPACITY: 12,500 PAX/HR");

  const systemId = data?.systemId || "SYSTEM ID: E3-B2B-ENG-2026";

  const liveBadgeText = isAr 
    ? (data?.liveBadgeTextAr || "الإنتاج المباشر — جاهز للتشغيل") 
    : (data?.liveBadgeTextEn || "LIVE COMMISSIONED VENUE");

  const liveImageUrl = data?.liveImageUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80";

  const defaultFeatures = [
    {
      icon: "Compass",
      title: isAr ? "دقة التصميم الإنشائي" : "Structural Precision",
      desc: isAr ? "مخططات هندسية متكاملة تتوافق مع أعلى معايير السلامة القطرية." : "Full engineering blueprints certified for municipal and crowd safety compliance."
    },
    {
      icon: "Layers",
      title: isAr ? "محاكاة الإضاءة والصوت" : "Acoustic & Lighting Staging",
      desc: isAr ? "محاكاة بصرية وصوتية متقدمة تضمن تجربة استثنائية في كل نقطة." : "Advanced ray-traced spatial audio and DMX lighting simulations."
    },
    {
      icon: "ShieldCheck",
      title: isAr ? "تسليم تشغيلي متكامل" : "Turnkey Commissioning",
      desc: isAr ? "من الفكرة إلى حفل الافتتاح وإدارة العمليات اليومية وإصدار التذاكر." : "Zero-gap handover with live crowd telemetry, staff operations, and ticketing."
    }
  ];

  const features = Array.isArray(data?.features) && data.features.length > 0
    ? data.features.map((f: any, idx: number) => ({
        icon: f.icon || defaultFeatures[idx % defaultFeatures.length].icon,
        title: isAr ? (f.titleAr || f.title || defaultFeatures[idx % defaultFeatures.length].title) : (f.titleEn || f.title || defaultFeatures[idx % defaultFeatures.length].title),
        desc: isAr ? (f.descAr || f.desc || defaultFeatures[idx % defaultFeatures.length].desc) : (f.descEn || f.desc || defaultFeatures[idx % defaultFeatures.length].desc),
      }))
    : defaultFeatures;

  return (
    <section className="py-24 md:py-32 bg-[var(--bg-level-1)] border-y border-[var(--border-level-1)] relative overflow-hidden transition-colors" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Ambient background glows */}
      <div className="absolute top-1/3 start-1/4 w-96 h-96 bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-cyan-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal direction="slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs uppercase tracking-widest mb-4">
              <Cpu className="w-3.5 h-3.5" />
              <span>{eyebrow}</span>
            </div>
          </Reveal>

          <Reveal direction="slide-up" delay={0.1}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-4">
              {title}
            </h2>
          </Reveal>

          <Reveal direction="slide-up" delay={0.2}>
            <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
              {description}
            </p>
          </Reveal>

          {/* Interactive Mode Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <button
              onClick={() => { setMode('blueprint'); setSliderPosition(100); }}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                mode === 'blueprint'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>{cadTabLabel}</span>
              </span>
            </button>

            <button
              onClick={() => { setMode('split'); setSliderPosition(50); }}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                mode === 'split'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>{splitTabLabel}</span>
              </span>
            </button>

            <button
              onClick={() => { setMode('live'); setSliderPosition(0); }}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                mode === 'live'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{liveTabLabel}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Blueprint-to-Live Interactive Showcase Canvas */}
        <WebGLBoundary
          title={isAr ? "من المخطط الهندسي إلى المشهد المكاني الحي" : "Blueprint to Live Spatial Scene"}
          description={
            isAr
              ? "يعمل هذا القسم التفاعلي في وضع العرض ثنائي الأبعاد عالي التوافق لضمان الأداء السلس والتوافق التام مع جميع الأجهزة."
              : "This interactive section operates in accessible 2D display mode to ensure seamless performance and universal device compatibility."
          }
          badgeText={isAr ? "وضع الأداء العالي وسهولة الوصول" : "High-Performance Accessible Mode"}
          locale={locale}
          minHeight="520px"
        >
          <Reveal direction="fade" delay={0.3}>
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative max-w-5xl mx-auto aspect-[16/9] min-h-[460px] md:min-h-[540px] rounded-3xl border border-[var(--border-level-2)] bg-[var(--surface-default)] overflow-hidden shadow-2xl transition-shadow duration-500 hover:shadow-[0_0_60px_rgba(16,185,129,0.12)] group perspective-1000"
            >
              <motion.div
                style={{
                  rotateX: isFull ? rotateX : 0,
                  rotateY: isFull ? rotateY : 0,
                  transformStyle: 'preserve-3d',
                }}
                className="w-full h-full relative"
              >
                {/* 1. Underlayer: CAD Blueprint Wireframe Layer */}
                <div className="absolute inset-0 bg-[#070b14] overflow-hidden flex items-center justify-center select-none">
                  {/* Blueprint Grid Lines */}
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgba(6,182,212,0.3) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(6,182,212,0.3) 1px, transparent 1px)
                      `,
                      backgroundSize: '40px 40px',
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgba(6,182,212,0.6) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(6,182,212,0.6) 1px, transparent 1px)
                      `,
                      backgroundSize: '200px 200px',
                    }}
                  />

                  {/* Architectural Vector Schematic Overlay */}
                  <svg className="absolute inset-0 w-full h-full opacity-40 text-cyan-400" preserveAspectRatio="none">
                    <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="10%" y1="80%" x2="90%" y2="20%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="50%" cy="50%" r="180" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
                    <circle cx="50%" cy="50%" r="80" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="6 6" />
                    <rect x="25%" y="25%" width="50%" height="50%" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>

                  {/* Technical Metadata Badges */}
                  <div className="absolute top-6 start-6 flex flex-col gap-1 text-cyan-400 font-mono text-[11px] bg-black/60 backdrop-blur-md p-3 rounded-xl border border-cyan-500/30">
                    <span className="font-bold flex items-center gap-1.5 text-xs text-white">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{schematicTitle}</span>
                    </span>
                    <span>{schematicSpec1}</span>
                    <span>{schematicSpec2}</span>
                  </div>

                  <div className="absolute bottom-6 end-6 text-cyan-400/80 font-mono text-[10px] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/20">
                    {systemId}
                  </div>
                </div>

                {/* 2. Top Layer: Live Photorealistic Experience Render */}
                <div
                  className="absolute inset-0 overflow-hidden select-none transition-all duration-300"
                  style={{
                    clipPath: isAr
                      ? `polygon(0 0, ${100 - sliderPosition}% 0, ${100 - sliderPosition}% 100%, 0 100%)`
                      : `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`,
                  }}
                >
                  <img
                    src={liveImageUrl}
                    alt="E3 Live Event Experience"
                    className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/30" />

                  {/* Live Status Overlay */}
                  <div className="absolute top-6 end-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs backdrop-blur-md shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{liveBadgeText}</span>
                  </div>
                </div>

                {/* 3. Interactive Split Scrubber Line */}
                {mode === 'split' && (
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                    style={{
                      left: isAr ? `${100 - sliderPosition}%` : `${sliderPosition}%`,
                    }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl font-black text-xs pointer-events-none">
                      ⇄
                    </div>
                  </div>
                )}

                {/* Range Slider Overlay for accessibility & touch scrubbing */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => {
                    setSliderPosition(Number(e.target.value));
                    setMode('split');
                  }}
                  aria-label={isAr ? "محدد المقارنة بين المخطط والواقع" : "Blueprint to Live Slider"}
                  className="absolute inset-x-0 bottom-0 opacity-0 cursor-ew-resize h-16 z-30 w-full"
                />
              </motion.div>
            </div>
          </Reveal>
        </WebGLBoundary>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          {features.map((feat: any, idx: number) => {
            const IconComp: any = ICON_MAP[feat.icon] || Compass;
            const accentColors = [
              "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
              "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
              "bg-amber-500/10 border-amber-500/30 text-amber-400"
            ];
            const colorClass = accentColors[idx % accentColors.length];

            return (
              <div key={idx} className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${colorClass}`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">{feat.title}</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
