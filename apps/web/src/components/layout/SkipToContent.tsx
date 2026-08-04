'use client';

import React from 'react';
import { useLocale } from './LocaleProvider';

export function SkipToContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-emerald-500 focus:text-zinc-950 focus:font-black focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950 uppercase tracking-widest text-sm transition-all"
    >
      {isAr ? 'الانتقال إلى المحتوى الرئيسي' : 'Skip to main content'}
    </a>
  );
}
