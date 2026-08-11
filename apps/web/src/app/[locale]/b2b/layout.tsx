import React from 'react'
import { B2BLayout } from '@/components/b2b/layout/B2BLayout'
import { PulseOrbitNav } from '@/components/b2c/nav/PulseOrbitNav'
import { getMergedCMSPageContent } from '@/lib/cms-default-pages'
import db from "@/lib/db"

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
  let settings: Record<string, string> = {}
  
  try {
    const settingModel = (db as any).siteSettings || (db as any).setting;
    if (settingModel) {
      const settingsRecords = await settingModel.findMany({
        where: { type: "GENERAL" }
      })
      settings = settingsRecords.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value as string
        return acc
      }, {} as Record<string, string>)
    }
  } catch (error) {
    console.error("Error loading B2B layout settings:", error)
  }

  let b2bOrbitPage: any = null;
  try {
    b2bOrbitPage = await db.pages.findUnique({
      where: { slug: "b2b-pulse-orbit" }
    });
  } catch (e) {
    console.warn("[B2B LAYOUT NOTICE] Failed to query b2b-pulse-orbit page:", e);
  }

  const b2bOrbitData = getMergedCMSPageContent("b2b-pulse-orbit", b2bOrbitPage?.content);

  return (
    <B2BLayout settings={settings} locale={locale} orbitData={b2bOrbitData}>
      {children}
    </B2BLayout>
  )
}
