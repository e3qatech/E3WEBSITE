"use client";

import React from 'react';
import { PortalConfig } from './PortalConfigs';
import { ShieldCheck, Users, Building2, UserCheck, Lock } from 'lucide-react';
import { E3Logo } from '@/components/shared/E3Logo';
import { cn } from '@/lib/utils';

interface PortalIdentityPanelProps {
  config: PortalConfig;
  isAr: boolean;
}

export function PortalIdentityPanel({ config, isAr }: PortalIdentityPanelProps) {
  const Icon =
    config.portalKey === 'admin'
      ? ShieldCheck
      : config.portalKey === 'staff'
      ? Users
      : config.portalKey === 'business'
      ? Building2
      : UserCheck;

  return (
    <div
      className={cn(
        'relative hidden lg:flex flex-col justify-between p-12 overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-500 bg-gradient-to-br',
        config.bgGradient
      )}
    >
      {/* Ambient background glow matching accent */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: config.accentColor }}
      />

      {/* Header Logo & Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <E3Logo isLight={false} size="md" />

        <span
          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md"
          style={{
            borderColor: `${config.accentColor}40`,
            backgroundColor: `${config.accentColor}15`,
            color: config.accentColor,
          }}
        >
          {isAr ? config.badgeAr : config.badgeEn}
        </span>
      </div>

      {/* Main Title & Hero Messaging */}
      <div className="relative z-10 my-12 space-y-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl backdrop-blur-xl"
          style={{
            borderColor: `${config.accentColor}40`,
            backgroundColor: `${config.accentColor}20`,
            color: config.accentColor,
          }}
        >
          <Icon className="w-8 h-8" />
        </div>

        <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight font-display">
          {isAr ? config.titleAr : config.titleEn}
        </h2>

        <p className="text-zinc-300 text-sm xl:text-base max-w-md font-normal leading-relaxed">
          {isAr ? config.descriptionAr : config.descriptionEn}
        </p>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'مصادقة موحدة عالي الأمان' : 'Unified End-to-End Authentication Engine'}</span>
        </div>
        <span className="font-mono text-[11px] text-zinc-400">E3-QA-v2.5</span>
      </div>
    </div>
  );
}
