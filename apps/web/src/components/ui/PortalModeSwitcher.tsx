'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface PortalModeSwitcherProps {
  locale?: string;
  customerLabelEn?: string;
  customerLabelAr?: string;
  organizerLabelEn?: string;
  organizerLabelAr?: string;
  customerUrl?: string;
  organizerUrl?: string;
  showOrganizerLogin?: boolean;
  organizerLoginLabelEn?: string;
  organizerLoginLabelAr?: string;
  organizerLoginUrl?: string;
  className?: string;
  onNavigate?: () => void;
}

export function PortalModeSwitcher({
  locale = 'en',
  customerLabelEn = 'Customer',
  customerLabelAr = 'الزائر',
  organizerLabelEn = 'Organizer',
  organizerLabelAr = 'المنظّم',
  customerUrl = '/b2c',
  organizerUrl = '/b2b',
  showOrganizerLogin = true,
  organizerLoginLabelEn = 'Organizer Login',
  organizerLoginLabelAr = 'تسجيل دخول المنظم',
  organizerLoginUrl = '/login/business',
  className,
  onNavigate,
}: PortalModeSwitcherProps) {
  const pathname = usePathname() || '';

  // Extract current locale from pathname if possible
  const currentLocale = pathname.startsWith('/ar') ? 'ar' : (locale || 'en');
  const isAr = currentLocale === 'ar';

  // Determine if B2C is active based on pathname
  const isB2C = pathname.includes('/b2c') || !pathname.includes('/b2b');

  const b2cTarget = `/${currentLocale}${customerUrl.startsWith('/') ? customerUrl : '/' + customerUrl}`;
  const b2bTarget = `/${currentLocale}${organizerUrl.startsWith('/') ? organizerUrl : '/' + organizerUrl}`;
  const loginTarget = `/${currentLocale}${organizerLoginUrl.startsWith('/') ? organizerLoginUrl : '/' + organizerLoginUrl}`;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Customer / Organizer Portal Link Switcher */}
      <nav 
        aria-label={isAr ? 'مبدل البوابة' : 'Portal Mode Switcher'} 
        className="flex items-center gap-1 p-1 rounded-full border border-[var(--border-level-2,rgba(255,255,255,0.1))] bg-[var(--surface-default,rgba(15,23,42,0.9))] backdrop-blur-md min-h-[44px]"
      >
        <Link
          href={b2cTarget}
          aria-current={isB2C ? 'page' : undefined}
          onClick={onNavigate}
          className={cn(
            'flex items-center justify-center rounded-full px-4 py-2 text-xs font-extrabold transition-all min-h-[44px] select-none cursor-pointer',
            isB2C
              ? 'bg-[var(--e3-royal-blue,rgba(26,31,214,0.2))] text-[var(--e3-royal-blue,#38bdf8)] border border-[var(--e3-royal-blue,rgba(26,31,214,0.4))] shadow-md'
              : 'text-[var(--text-secondary,rgba(255,255,255,0.6))] hover:text-[var(--text-primary,#fff)]'
          )}
        >
          {isAr ? customerLabelAr : customerLabelEn}
        </Link>

        <Link
          href={b2bTarget}
          aria-current={!isB2C ? 'page' : undefined}
          onClick={onNavigate}
          className={cn(
            'flex items-center justify-center rounded-full px-4 py-2 text-xs font-extrabold transition-all min-h-[44px] select-none cursor-pointer',
            !isB2C
              ? 'bg-[var(--e3-purple,rgba(75,0,143,0.2))] text-[var(--e3-purple,#34d399)] border border-[var(--e3-purple,rgba(75,0,143,0.4))] shadow-md'
              : 'text-[var(--text-secondary,rgba(255,255,255,0.6))] hover:text-[var(--text-primary,#fff)]'
          )}
        >
          {isAr ? organizerLabelAr : organizerLabelEn}
        </Link>
      </nav>

      {/* Organizer Login Secondary Action (Visible when in B2B Context) */}
      {!isB2C && showOrganizerLogin && (
        <Link
          href={loginTarget}
          onClick={onNavigate}
          className="hidden sm:flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-extrabold text-amber-400 hover:bg-amber-500/20 transition-all min-h-[44px]"
        >
          <span>{isAr ? organizerLoginLabelAr : organizerLoginLabelEn}</span>
        </Link>
      )}
    </div>
  );
}
