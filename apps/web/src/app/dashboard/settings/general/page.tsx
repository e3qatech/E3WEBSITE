import { Metadata } from "next"
import db from "@/lib/db"
import { GeneralSettingsView } from "@/components/dashboard/settings/GeneralSettingsView"

export const metadata: Metadata = {
  title: "General Settings | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function GeneralSettingsPage() {
  const settingsRecords = await db.siteSettings.findMany({
    where: { type: "GENERAL" }
  })
  
  const settings = settingsRecords.reduce((acc, curr) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, any>)

  return <GeneralSettingsView initialSettings={settings} />
}
