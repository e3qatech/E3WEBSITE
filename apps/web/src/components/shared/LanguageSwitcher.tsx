"use client";

import React from 'react';
import { useLocale } from '../layout/LocaleProvider';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'full' | 'compact' | 'pill';
}

export function LanguageSwitcher({
  className,
  variant = 'full',
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();

  const handleToggle = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    setLocale(nextLocale);

    // Update document root direction immediately
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('lang', nextLocale);
      root.setAttribute('dir', nextLocale === 'ar' ? 'rtl' : 'ltr');

      // Update cookie for server middleware
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // Update current path if localized route prefix is present
      const pathname = window.location.pathname;
      if (pathname.startsWith('/en') || pathname.startsWith('/ar')) {
        const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
        window.history.pushState({}, '', newPath);
      }
    }
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-black',
        variant === 'pill'
          ? 'px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold tracking-wider'
          : 'p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] text-sm font-medium',
        className
      )}
      aria-label={locale === 'en' ? 'Switch to Arabic language (العربية)' : 'Switch to English language (EN)'}
      title={locale === 'en' ? 'التحويل إلى اللغة العربية' : 'Switch to English'}
    >
      <Globe className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
      <span className="font-semibold tracking-wide">
        {variant === 'compact'
          ? locale === 'en'
            ? 'ع'
            : 'EN'
          : locale === 'en'
          ? 'العربية'
          : 'English'}
      </span>
    </button>
  );
}
