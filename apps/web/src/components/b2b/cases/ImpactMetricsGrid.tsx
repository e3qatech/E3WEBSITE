"use client";

import React, { useEffect, useState, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricItem {
  valueEn?: string;
  valueAr?: string;
  value?: string;
  labelEn?: string;
  labelAr?: string;
  label?: string;
}

interface ImpactMetricsGridProps {
  locale?: string;
  metrics?: MetricItem[] | null;
}

function AnimatedCounter({ value, inView }: { value: string; inView: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!inView || shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    // Try extracting leading or trailing numbers (e.g. 50k+, 99.8%, 1,200)
    const match = value.match(/^([^\d]*)([\d,.]+)([^\d]*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1] || "";
    const rawNumberStr = match[2].replace(/,/g, "");
    const suffix = match[3] || "";
    const targetNum = parseFloat(rawNumberStr);

    if (isNaN(targetNum)) {
      setDisplayValue(value);
      return;
    }

    const isDecimal = match[2].includes(".");
    const duration = 1200; // ms
    const steps = 24;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const currentVal = targetNum * easeProgress;

      const formatted = isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal).toLocaleString();
      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value, inView, shouldReduceMotion]);

  return <span>{displayValue}</span>;
}

export function ImpactMetricsGrid({
  locale = "en",
  metrics = [],
}: ImpactMetricsGridProps) {
  const isAr = locale === "ar";
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return null;
  }

  return (
    <section
      id="impact"
      ref={ref}
      data-testid="impact-metrics-section"
      aria-label={isAr ? "الأثر والأرقام المحققة" : "Quantified Project Impact"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full bg-[#070a12] border-y border-white/10 py-16 sm:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-3 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isAr ? "الأثر ومؤشرات الأداء" : "QUANTIFIED IMPACT"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight font-syne">
            {isAr ? "مؤشرات النجاح والأرقام المحققة" : "Key Project Metrics & Scale"}
          </h2>
        </div>

        {/* Responsive Bento Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {metrics.map((metric, i) => {
            const rawValue = isAr
              ? metric.valueAr || metric.valueEn || metric.value || ""
              : metric.valueEn || metric.value || "";
            const rawLabel = isAr
              ? metric.labelAr || metric.labelEn || metric.label || ""
              : metric.labelEn || metric.label || "";

            const isLarge = i === 0 && metrics.length % 2 !== 0 && metrics.length > 2;

            return (
              <div
                key={i}
                data-testid={`metric-card-${i}`}
                className={cn(
                  "p-8 sm:p-10 rounded-3xl bg-[#0d1322] border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col items-center justify-center text-center shadow-xl group",
                  isLarge && "sm:col-span-2 lg:col-span-3"
                )}
              >
                <div
                  data-testid={`metric-value-${i}`}
                  className={cn(
                    "font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-300 font-syne tracking-tight mb-3 group-hover:scale-105 transition-transform duration-300",
                    isLarge ? "text-5xl sm:text-7xl lg:text-8xl" : "text-4xl sm:text-5xl lg:text-6xl"
                  )}
                >
                  <AnimatedCounter value={rawValue} inView={inView} />
                </div>
                <div
                  data-testid={`metric-label-${i}`}
                  className="text-xs sm:text-sm font-mono font-bold text-slate-300 uppercase tracking-widest max-w-sm"
                >
                  {rawLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
