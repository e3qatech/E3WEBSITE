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

    // Match leading/trailing units (e.g., "+", "%", "K", "M", " QAR")
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

  let normalizedMetrics: MetricItem[] = [];
  if (Array.isArray(metrics)) {
    normalizedMetrics = metrics;
  } else if (metrics && typeof metrics === "object") {
    normalizedMetrics = Object.entries(metrics).map(([key, val]) => ({
      labelEn: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      labelAr: key,
      valueEn: String(val),
      valueAr: String(val),
    }));
  }

  if (normalizedMetrics.length === 0) {
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

        {/* 4-column desktop, 2-column mobile results grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {normalizedMetrics.map((metric, i) => {
            const rawValue = isAr
              ? metric.valueAr || metric.valueEn || metric.value || ""
              : metric.valueEn || metric.value || "";
            const rawLabel = isAr
              ? metric.labelAr || metric.labelEn || metric.label || ""
              : metric.labelEn || metric.label || "";

            return (
              <div
                key={i}
                data-testid={`metric-card-${i}`}
                className="p-6 sm:p-8 rounded-3xl bg-[#0d1322] border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col items-center justify-center text-center shadow-xl group"
              >
                <div
                  data-testid={`metric-value-${i}`}
                  className="font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-300 font-syne tracking-tight mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-300 text-3xl sm:text-4xl lg:text-5xl"
                >
                  <AnimatedCounter value={rawValue} inView={inView} />
                </div>
                <div
                  data-testid={`metric-label-${i}`}
                  className="text-[11px] sm:text-xs font-mono font-bold text-slate-300 uppercase tracking-widest max-w-xs"
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
