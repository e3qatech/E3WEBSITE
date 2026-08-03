import { Metadata } from "next"
import db from "@/lib/db"
import { SeoSettingsView } from "@/components/dashboard/settings/SeoSettingsView"
import { requireRole } from "@/lib/auth-helpers"

export const metadata: Metadata = {
  title: "SEO Settings | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function SeoSettingsPage() {
  // Validate that the user is authenticated, active, and has one of the allowed admin roles
  await requireRole(["SUPER_ADMIN", "SALES_ADMIN"])

  const settingsRecords = await db.setting.findMany({
    where: { type: "SEO" }
  })
  
  // Convert array to object { key: value }
  const settings = settingsRecords.reduce((acc, curr) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, any>)

  return <SeoSettingsView initialSettings={settings} />
}
