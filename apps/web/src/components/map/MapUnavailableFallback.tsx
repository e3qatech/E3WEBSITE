"use client";

import React from 'react';
import { MapPin, AlertCircle, Compass, ExternalLink } from 'lucide-react';

interface MapUnavailableFallbackProps {
  locale: string;
}

export function MapUnavailableFallback({ locale }: MapUnavailableFallbackProps) {
  const isAr = locale === 'ar';

  return (
    <div className="w-full h-full min-h-[440px] rounded-3xl border border-[var(--border-level-2)] bg-[var(--surface-default)] p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
      <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
        <Compass className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-bold font-display uppercase text-[var(--text-primary)]">
        {isAr ? "الخريطة الحية غير متاحة مؤقتاً" : "Interactive Map Temporarily Unavailable"}
      </h3>

      <p className="text-xs text-[var(--text-secondary)] font-medium max-w-md leading-relaxed">
        {isAr
          ? "يمكنك الاستمرار في تصفح كافة الوجهات والفعاليات، الحصول على الاتجاهات، وحجز التذاكر مباشرة من القائمة."
          : "You can continue exploring all active destinations, getting Google Maps directions, and booking tickets directly from the list."}
      </p>

      <div className="pt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-[10px] font-mono text-[var(--text-tertiary)] uppercase">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
        <span>{isAr ? "نمط العرض الاحتياطي الآمن" : "Safe List Fallback Mode Active"}</span>
      </div>
    </div>
  );
}
