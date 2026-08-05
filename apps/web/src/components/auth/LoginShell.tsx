"use client";

import React from 'react';
import { PortalKey } from '@/lib/auth-roles';
import { PORTAL_CONFIGS } from './PortalConfigs';
import { PortalIdentityPanel } from './PortalIdentityPanel';
import { LoginForm } from './LoginForm';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '@/components/layout/ThemeProvider';
import { Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginShellProps {
  portalKey: PortalKey;
  locale: 'en' | 'ar';
}

export function LoginShell({ portalKey, locale }: LoginShellProps) {
  const config = PORTAL_CONFIGS[portalKey] || PORTAL_CONFIGS.admin;
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className={cn(
        'min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-500',
        isLight ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-950 text-white'
      )}
      dir={dir}
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Branded Identity Panel (Desktop) */}
        <PortalIdentityPanel config={config} isAr={isAr} />

        {/* Right Form Container */}
        <div className="bg-zinc-900/80 border border-white/10 p-6 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl flex flex-col justify-between space-y-8">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {isAr ? config.badgeAr : config.badgeEn}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LanguageToggle currentLocale={locale} />
            </div>
          </div>

          {/* Form Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display mb-2">
              {isAr ? config.titleAr : config.titleEn}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm">
              {isAr ? config.descriptionAr : config.descriptionEn}
            </p>
          </div>

          {/* Core Login Form */}
          <LoginForm config={config} locale={locale} />

          {/* Security Assurance Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isAr
                  ? 'محمي بواسطة مراقبة الجلسات المشفرة ومصادقة RBAC'
                  : 'Protected by encrypted session revocation & RBAC policy'}
              </span>
            </div>
            <span>© 2026 E3 QATAR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
