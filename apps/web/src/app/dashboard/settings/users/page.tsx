import { Metadata } from "next"
import db from "@/lib/db"
import { UsersSettingsView } from "@/components/dashboard/settings/UsersSettingsView"
import { requireRole } from "@/lib/auth-helpers"

export const metadata: Metadata = {
  title: "User Management | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function UsersSettingsPage() {
  // Validate that the user is authenticated, active, and has one of the allowed admin/support roles
  await requireRole(["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"])

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  })

  return <UsersSettingsView initialUsers={users} />
}
