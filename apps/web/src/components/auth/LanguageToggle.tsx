"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LanguageToggle({ currentLocale }: { currentLocale: 'en' | 'ar' }) {
  const pathname = usePathname();
  const targetLocale = currentLocale === 'en' ? 'ar' : 'en';

  let targetPath = pathname;
  if (pathname.startsWith('/en/')) {
    targetPath = pathname.replace('/en/', '/ar/');
  } else if (pathname.startsWith('/ar/')) {
    targetPath = pathname.replace('/ar/', '/en/');
  } else {
    targetPath = `/${targetLocale}${pathname}`;
  }

  return (
    <Link
      href={targetPath}
      className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center gap-1.5"
    >
      <Globe className="w-3.5 h-3.5 text-emerald-400" />
      <span>{currentLocale === 'en' ? 'العربية (RTL)' : 'English (LTR)'}</span>
    </Link>
  );
}
