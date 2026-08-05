"use client";

import React from 'react';
import { ShieldCheck, Building2, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortalSelectorProps {
  activeWorkspace: 'super' | 'b2b' | 'b2c';
  onChange: (workspace: 'super' | 'b2b' | 'b2c') => void;
  isAr: boolean;
}

export function PortalSelector({ activeWorkspace, onChange, isAr }: PortalSelectorProps) {
  const workspaces = [
    {
      key: 'super',
      labelEn: 'Super Admin',
      labelAr: 'المشرف العام',
      icon: ShieldCheck,
    },
    {
      key: 'b2b',
      labelEn: 'B2B Enterprise',
      labelAr: 'إدارة الشركات',
      icon: Building2,
    },
    {
      key: 'b2c',
      labelEn: 'B2C Experiences',
      labelAr: 'إدارة الترفيه',
      icon: Ticket,
    },
  ] as const;

  return (
    <div className="space-y-2 mb-6">
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
        {isAr ? 'اختر بيئة العمل الإدارية المستهدفة' : 'Select Target Administrative Workspace'}
      </label>
      <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-1.5 rounded-xl border border-white/10">
        {workspaces.map((ws) => {
          const Icon = ws.icon;
          const isActive = activeWorkspace === ws.key;
          return (
            <button
              key={ws.key}
              type="button"
              onClick={() => onChange(ws.key)}
              className={cn(
                'flex flex-col items-center justify-center p-2.5 rounded-lg text-xs font-bold transition-all gap-1 border',
                isActive
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'bg-zinc-900/60 border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-full">{isAr ? ws.labelAr : ws.labelEn}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-zinc-400 px-1">
        {isAr
          ? 'ملاحظة: اختيار بيئة العمل يحدد وجهة الدخول الافتراضية ولا يمنح صلاحيات إضافية.'
          : 'Note: Workspace selection sets initial destination and does not bypass role authorization.'}
      </p>
    </div>
  );
}
