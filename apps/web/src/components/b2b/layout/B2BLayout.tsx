"use client"

import React, { useEffect } from 'react'
import { PulseOrbitNav } from '@/components/b2c/nav/PulseOrbitNav'
import { B2BFooter } from './B2BFooter'
import { cn } from '@/lib/utils'
import { useMounted } from '@/hooks/useMounted'

import { B2CExperienceProvider } from '@/components/b2c/runtime/B2CExperienceRuntime'

export function B2BLayout({
  children,
  settings = {},
  locale = 'en',
  orbitData
}: {
  children: React.ReactNode
  settings?: Record<string, string>
  locale?: string
  orbitData?: any
}) {
  useMounted();

  useEffect(() => {
    // Ensure data-portal="b2b" is applied to root element when in B2B layout
    document.documentElement.setAttribute("data-portal", "b2b");
    return () => {
      document.documentElement.removeAttribute("data-portal");
    };
  }, []);

  return (
    <B2CExperienceProvider>
      <div 
        data-portal="b2b"
        className={cn(
          "min-h-screen flex flex-col font-sans bg-[var(--bg-level-1)] text-[var(--text-primary)] transition-colors duration-300",
          "b2b-portal-root"
        )}
      >
        <PulseOrbitNav locale={locale} settings={settings} orbitData={orbitData} type="b2b" />
        
        <main className="flex-1 flex flex-col pt-20 relative z-10">
          {children}
        </main>
        
        <B2BFooter settings={settings} />
      </div>
    </B2CExperienceProvider>
  )
}
