"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, SkipForward, Globe } from 'lucide-react';
import { SpatialSection } from './spatial-experience.types';
import { cn } from '@/lib/utils';
import { localizeHref } from '@/lib/url-helper';

export interface SpatialNavigationProps {
  activeSection: SpatialSection;
  locale?: string;
  onSkip: () => void;
  fallbackBackUrl?: string;
}

export function SpatialNavigation({
  activeSection,
  locale = 'en',
  onSkip,
  fallbackBackUrl = '/en/b2c',
}: SpatialNavigationProps) {
  const router = useRouter();
  const isAr = locale === 'ar';

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(localizeHref(fallbackBackUrl, locale));
    }
  };

  const otherLocale = isAr ? 'en' : 'ar';
  const otherLocaleLabel = isAr ? 'English' : 'العربية';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 md:px-10 flex items-center justify-between pointer-events-none backdrop-blur-xs">
      {/* 1. Left: Back Button & E3 Brand Emblem */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <button
          onClick={handleBack}
          aria-label={isAr ? "الرجوع إلى الصفحة السابقة" : "Back to previous page"}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all text-xs font-medium backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-zinc-400"
        >
          {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{isAr ? "الرئيسية" : "Home"}</span>
        </button>

        <Link
          href={localizeHref('/b2c', locale)}
          className="flex items-center gap-2 text-white font-black tracking-wider text-sm md:text-base group"
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeSection.accentColor }} />
          <span className="font-mono">E3 QATAR</span>
          <span className="hidden sm:inline text-xs text-zinc-500 font-normal">| {isAr ? "الأسطوانة التفاعلية" : "Spatial Barrel"}</span>
        </Link>
      </div>

      {/* 2. Right: Skip Experience Button & Language Toggle */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={onSkip}
          aria-label={isAr ? "تخطي العرض التفاعلي والانتقال إلى محتوى الصفحة" : "Skip spatial experience"}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all text-xs font-mono backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-zinc-400"
        >
          <span>{isAr ? "تخطي العرض" : "Skip 3D"}</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <Link
          href={`/${otherLocale}/b2c`}
          className="p-2 rounded-xl bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono backdrop-blur-md"
        >
          {otherLocale.toUpperCase()}
        </Link>
      </div>
    </header>
  );
}
