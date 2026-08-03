import { Metadata } from "next"
import db from "@/lib/db"
import { GeneralSettingsView } from "@/components/dashboard/settings/GeneralSettingsView"
import { requireRole } from "@/lib/auth-helpers"

export const metadata: Metadata = {
  title: "General Settings | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function GeneralSettingsPage() {
  // Validate that the user is authenticated, active, and has one of the allowed admin roles
  await requireRole(["SUPER_ADMIN", "SALES_ADMIN"])

  const settingsRecords = await db.setting.findMany({
    where: { type: "GENERAL" }
  })
  
  const settings = settingsRecords.reduce((acc, curr) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, any>)

  return <GeneralSettingsView initialSettings={settings} />
}
