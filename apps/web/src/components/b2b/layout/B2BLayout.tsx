"use client"

import React, { useEffect, useState } from 'react'
import { B2BHeader } from './B2BHeader'
import { B2BFooter } from './B2BFooter'
import { cn } from '@/lib/utils'

export function B2BLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Simple mount state to avoid hydration mismatch with themes
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Here we would sync with Zustand theme store to set body classes
    // e.g. document.documentElement.classList.add('dark')
  }, [])

  if (!mounted) return null // Or a skeleton

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-sans bg-zinc-950 text-zinc-100",
      "b2b-portal-root" // Marker class for scoped global styles if needed
    )}>
      <B2BHeader />
      
      <main className="flex-1 flex flex-col pt-[88px] relative z-10">
        {children}
      </main>
      
      <B2BFooter />
    </div>
  )
}
