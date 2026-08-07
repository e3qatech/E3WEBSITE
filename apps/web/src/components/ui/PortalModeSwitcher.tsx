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
  const pathname = usePathname();
  const isAr = locale === 'ar';
  const isB2C = pathname?.includes('/b2c') || !pathname?.includes('/b2b');

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Customer / Organizer Portal Link Switcher */}
      <nav 
        aria-label={isAr ? 'مبدل البوابة' : 'Portal Mode Switcher'} 
        className="flex items-center gap-1 p-1 rounded-full border border-slate-800 bg-slate-900/90 backdrop-blur-md min-h-[44px]"
      >
        <Link
          href={`/${locale}${customerUrl}`}
          aria-current={isB2C ? 'page' : undefined}
          onClick={onNavigate}
          className={cn(
            'flex items-center justify-center rounded-full px-4 py-2 text-xs font-extrabold transition-all min-h-[44px] select-none cursor-pointer',
            isB2C
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-md'
              : 'text-slate-400 hover:text-white'
          )}
        >
          {isAr ? customerLabelAr : customerLabelEn}
        </Link>

        <Link
          href={`/${locale}${organizerUrl}`}
          aria-current={!isB2C ? 'page' : undefined}
          onClick={onNavigate}
          className={cn(
            'flex items-center justify-center rounded-full px-4 py-2 text-xs font-extrabold transition-all min-h-[44px] select-none cursor-pointer',
            !isB2C
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md'
              : 'text-slate-400 hover:text-white'
          )}
        >
          {isAr ? organizerLabelAr : organizerLabelEn}
        </Link>
      </nav>

      {/* Organizer Login Secondary Action (Visible when in B2B Context) */}
      {!isB2C && showOrganizerLogin && (
        <Link
          href={`/${locale}${organizerLoginUrl}`}
          onClick={onNavigate}
          className="hidden sm:flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-extrabold text-amber-400 hover:bg-amber-500/20 transition-all min-h-[44px]"
        >
          <span>{isAr ? organizerLoginLabelAr : organizerLoginLabelEn}</span>
        </Link>
      )}
    </div>
  );
}
