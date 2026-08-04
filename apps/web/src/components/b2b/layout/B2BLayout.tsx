"use client"

import React, { useEffect } from 'react'
import { B2BHeader } from './B2BHeader'
import { B2BFooter } from './B2BFooter'
import { cn } from '@/lib/utils'
import { useMounted } from '@/hooks/useMounted'

export function B2BLayout({
  children,
  settings = {},
}: {
  children: React.ReactNode
  settings?: Record<string, string>
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
    <div 
      data-portal="b2b"
      className={cn(
        "min-h-screen flex flex-col font-sans bg-[var(--bg-level-1)] text-[var(--text-primary)] transition-colors duration-300",
        "b2b-portal-root"
      )}
    >
      <B2BHeader settings={settings} />
      
      <main className="flex-1 flex flex-col pt-[88px] relative z-10">
        {children}
      </main>
      
      <B2BFooter settings={settings} />
    </div>
  )
}
