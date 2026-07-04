"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Quote, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UniversalMediaRenderer as MediaRenderer } from "@/components/shared/UniversalMediaRenderer";

// Custom Animated Counter Hook
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Ease out expo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(easeProgress * end));
            
            if (progress < 1) {
              animationFrameId = window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.5 }
    );
    
    if (nodeRef.current) observer.observe(nodeRef.current);
    
    return () => {
      if (nodeRef.current) observer.unobserve(nodeRef.current);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration]);
  
  return { count, nodeRef };
}

// Animated Metric Component
function AnimatedMetric({ metric }: { metric: any }) {
  const numValue = parseInt(String(metric.value).replace(/,/g, ''));
  const isNumber = !isNaN(numValue);
  const { count, nodeRef } = useCountUp(isNumber ? numValue : 0, 2500);
  
  // Format the display value
  const displayValue = isNumber 
    ? count.toLocaleString()
    : metric.value;

  return (
    <div ref={nodeRef} className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-8 rounded-3xl text-center">
      <div className="text-sm font-bold tracking-widest uppercase text-[var(--color-primary)] mb-4">{metric.label}</div>
      <div className="text-4xl md:text-6xl font-black text-[var(--text-primary)] mb-2 flex items-center justify-center gap-1">
        {metric.prefix && <span className="text-3xl text-[var(--text-secondary)]">{metric.prefix}</span>}
        {displayValue}
        {metric.suffix && <span className="text-3xl text-[var(--text-secondary)]">{metric.suffix}</span>}
      </div>
      {metric.trend && <div className="text-[var(--text-secondary)]">{metric.trend}</div>}
    </div>
  );
}

// Custom Before/After Slider Component
function BeforeAfterSlider({ beforeUrl, afterUrl }: { beforeUrl: string, afterUrl: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleDrag = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }
    const percent = Math.min(Math.max(((clientX - left) / width) * 100, 0), 100);
    setSliderPosition(percent);
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-3xl overflow-hidden select-none cursor-ew-resize mt-12 shadow-2xl"
      onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
      onTouchMove={handleDrag}
      onMouseDown={handleDrag}
      onTouchStart={handleDrag}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0">
         <img src={afterUrl} alt="After" className="object-cover w-full h-full" />
         <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase">After</div>
      </div>
      
      {/* Before Image (Foreground, clipped) */}
      <div 
        className="absolute inset-0 border-r-2 border-white"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={beforeUrl} alt="Before" className="object-cover w-full h-full" />
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Before</div>
      </div>
      
      {/* Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-black pointer-events-none">
           <GripVertical size={20} />
        </div>
      </div>
    </div>
  );
}

export function CaseStudyDetailClient({ caseStudy, relatedCaseStudies }: { caseStudy: any, relatedCaseStudies: any[] }) {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  // Custom renderer for Rich Text
  const renderRichText = (contentStr: string) => {
    if (!contentStr) return null;
    return <div className="prose prose-invert prose-lg max-w-none text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: contentStr }} />;
  };

  const parseJsonSafe = (data: any) => {
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch { return null; }
    }
    return data;
  };

  const metrics = parseJsonSafe(caseStudy.metrics) || [];
  const testimonial = parseJsonSafe(caseStudy.testimonial);
  const beforeAfter = parseJsonSafe(caseStudy.beforeAfter);
  const gallery = parseJsonSafe(caseStudy.gallery) || [];
  const servicesUsed = parseJsonSafe(caseStudy.servicesUsed) || [];
  const technicalSpecs = parseJsonSafe(caseStudy.technicalSpecs) || [];

  return (
    <div className="relative w-full bg-[var(--surface-default)]">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden bg-black text-white">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <MediaRenderer
            src={caseStudy.heroImageUrl || caseStudy.thumbnailUrl || ""}
            type={(caseStudy.heroMediaType || "IMAGE") as any}
            alt={caseStudy.titleEn}
            fill
            className="object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-black/40 to-black/20" />
        </motion.div>
        
        {caseStudy.clientLogoUrl && (
          <div className="absolute top-8 right-8 md:top-12 md:right-12 z-20 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <MediaRenderer src={caseStudy.clientLogoUrl} type="IMAGE" alt={caseStudy.clientName} className="object-contain w-[120px] h-[60px]" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 md:px-8 pb-16 max-w-[1000px] mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span className="px-4 py-1.5 text-sm font-bold bg-[var(--color-primary)] text-white rounded-full uppercase tracking-wider">{caseStudy.category}</span>
            <span className="px-4 py-1.5 text-sm font-bold bg-white/10 backdrop-blur-md text-white rounded-full">{caseStudy.year}</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-4"
          >
            {caseStudy.titleEn}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 font-light"
          >
            Client: <span className="font-semibold text-white">{caseStudy.clientName}</span>
          </motion.p>
        </div>
      </section>

      {/* STICKY MINI-NAV */}
      <div className="sticky top-0 z-50 bg-[var(--surface-default)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]">
        <div className="max-w-[1000px] mx-auto px-4 py-4 flex justify-center gap-8 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
          <a href="#challenge" className="hover:text-[var(--color-primary)] transition-colors">Challenge</a>
          <a href="#solution" className="hover:text-[var(--color-primary)] transition-colors">Solution</a>
          <a href="#results" className="hover:text-[var(--color-primary)] transition-colors">Results</a>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-24 space-y-32">
        
        {/* 2. CHALLENGE */}
        <section id="challenge" className="scroll-mt-32">
          <h2 className="text-3xl md:text-5xl font-black mb-8 text-[var(--text-primary)]">The Challenge</h2>
          {renderRichText(caseStudy.challengeEn)}
        </section>

        {/* 3. SOLUTION */}
        <section id="solution" className="scroll-mt-32">
          <h2 className="text-3xl md:text-5xl font-black mb-8 text-[var(--text-primary)]">Our Solution</h2>
          
          {servicesUsed.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-12">
              <span className="text-[var(--text-secondary)] font-medium mr-2 flex items-center">Services utilized:</span>
              {servicesUsed.map((svc: string) => (
                <span key={svc} className="px-4 py-1.5 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-full text-sm font-bold text-[var(--text-primary)] hover:border-[var(--color-primary)] cursor-default transition-colors">
                  {svc}
                </span>
              ))}
            </div>
          )}

          {renderRichText(caseStudy.solutionEn)}
          
          {technicalSpecs.length > 0 && (
            <div className="mt-12 bg-[var(--surface-sunken)] p-8 rounded-3xl border border-[var(--border-subtle)]">
              <h3 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Technical Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {technicalSpecs.map((spec: any, idx: number) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-sm font-bold tracking-widest uppercase text-[var(--color-primary)] mb-1">{spec.label}</span>
                    <span className="text-lg text-[var(--text-primary)]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 4. RESULTS */}
        <section id="results" className="scroll-mt-32">
          <h2 className="text-3xl md:text-5xl font-black mb-12 text-[var(--text-primary)] text-center">The Results</h2>
          
          {/* Animated Metrics Grid */}
          {metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-24">
              {metrics.map((metric: any, idx: number) => (
                <AnimatedMetric key={idx} metric={metric} />
              ))}
            </div>
          )}
          
          {/* Custom Before/After Slider */}
          {beforeAfter?.beforeUrl && beforeAfter?.afterUrl && (
            <div className="mb-24">
              <h3 className="text-2xl font-bold mb-6 text-center text-[var(--text-primary)]">Transformation</h3>
              <BeforeAfterSlider beforeUrl={beforeAfter.beforeUrl} afterUrl={beforeAfter.afterUrl} />
            </div>
          )}

          {/* Testimonial */}
          {testimonial?.quote && (
            <div className="relative bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-3xl p-8 md:p-16 mt-24">
               <Quote className="absolute -top-8 left-12 w-16 h-16 text-[var(--color-primary)] opacity-50 bg-[var(--surface-default)] rounded-full p-2" />
               <p className="text-2xl md:text-3xl font-light italic leading-relaxed text-[var(--text-primary)] mb-8 relative z-10">
                 "{testimonial.quote}"
               </p>
               <div className="flex items-center gap-4">
                 {testimonial.authorImage ? (
                   <MediaRenderer src={testimonial.authorImage} type="IMAGE" alt={testimonial.authorName} className="w-16 h-16 rounded-full object-cover border-2 border-[var(--border-subtle)]" />
                 ) : (
                   <div className="w-16 h-16 rounded-full bg-[var(--surface-sunken)] border-2 border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                     <span className="text-xl font-bold">{testimonial.authorName?.[0]}</span>
                   </div>
                 )}
                 <div>
                   <h4 className="font-bold text-lg text-[var(--text-primary)]">{testimonial.authorName}</h4>
                   <p className="text-[var(--text-secondary)]">{testimonial.authorTitle}</p>
                 </div>
               </div>
            </div>
          )}
        </section>

      </div>

      {/* 5. RELATED CASE STUDIES */}
      {relatedCaseStudies.length > 0 && (
        <section className="py-24 px-4 md:px-8 bg-[var(--surface-sunken)] border-t border-[var(--border-subtle)]">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-12 text-center text-[var(--text-primary)]">Related Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedCaseStudies.map((cs) => (
                <Link key={cs.id} href={`/b2b/case-studies/${cs.slug}`} className="group block bg-[var(--surface-default)] rounded-3xl overflow-hidden border border-[var(--border-subtle)] hover:border-[var(--color-primary)] transition-colors">
                  <div className="relative h-48 overflow-hidden">
                    <MediaRenderer src={cs.thumbnailUrl || ""} type={(cs.thumbnailMediaType || "IMAGE") as any} alt={cs.titleEn} className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2 block">{cs.category}</span>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">{cs.titleEn}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. CTA */}
      <section className="py-32 px-4 text-center bg-gradient-to-t from-black to-[var(--surface-default)] relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_bottom,var(--color-primary)_0%,transparent_60%)]" />
         <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">Want Results Like These?</h2>
            <p className="text-xl text-gray-300 mb-12">Let's discuss how our engineering and creative teams can deliver impact for your next project.</p>
            <Button size="lg" variant="primary" asChild className="rounded-full h-14 px-10 text-lg shadow-[0_0_40px_var(--color-primary)]">
               <Link href="/b2b/contact">Start Your Project <ArrowRight className="ml-2" /></Link>
            </Button>
         </div>
      </section>

    </div>
  );
}
