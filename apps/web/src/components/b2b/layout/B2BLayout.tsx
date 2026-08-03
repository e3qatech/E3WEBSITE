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
  // Simple mount state to avoid hydration mismatch with themes
  useMounted();

  useEffect(() => {
    // Here we would sync with Zustand theme store to set body classes
  }, [])

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-sans bg-zinc-950 text-zinc-100",
      "b2b-portal-root" // Marker class for scoped global styles if needed
    )}>
      <B2BHeader settings={settings} />
      
      <main className="flex-1 flex flex-col pt-[88px] relative z-10">
        {children}
      </main>
      
      <B2BFooter settings={settings} />
    </div>
  )
}
