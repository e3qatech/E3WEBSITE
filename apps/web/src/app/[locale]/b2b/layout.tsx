 
import React from 'react'
import { B2BLayout } from '@/components/b2b/layout/B2BLayout'
import { getMergedCMSPageContent } from '@/lib/cms-default-pages'
import db from "@/lib/db"

import { getCMSPageContentServer } from '@/lib/cms-server'
import { getPublicSettingsServer } from '@/lib/settings/public-settings'

export const metadata = {
  title: 'E3 Corporate - Events & Entertainment Enterprises',
  description: 'E3 turns ideas into landmark experiences through creative design, fabrication, ticketing, staffing, operations, and measurable delivery.',
}

export default async function RootB2BLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Run both calls in parallel with in-memory caching
  const [settings, b2bOrbitData] = await Promise.all([
    getPublicSettingsServer().catch(() => ({} as any)),
    getCMSPageContentServer("b2b-pulse-orbit").catch(() => null),
  ]);

  return (
    <B2BLayout settings={settings} locale={locale} orbitData={b2bOrbitData}>
      {children}
    </B2BLayout>
  )
}
