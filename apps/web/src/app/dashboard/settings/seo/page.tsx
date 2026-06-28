import { Metadata } from "next"
import db from "@/lib/db"
import { SeoSettingsView } from "@/components/dashboard/settings/SeoSettingsView"

export const metadata: Metadata = {
  title: "SEO Settings | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function SeoSettingsPage() {
  const settingsRecords = await db.siteSettings.findMany({
    where: { type: "SEO" }
  })
  
  // Convert array to object { key: value }
  const settings = settingsRecords.reduce((acc, curr) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, any>)

  return <SeoSettingsView initialSettings={settings} />
}
