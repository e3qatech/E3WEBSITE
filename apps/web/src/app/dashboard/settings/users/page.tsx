import { Metadata } from "next"
import db from "@/lib/db"
import { UsersSettingsView } from "@/components/dashboard/settings/UsersSettingsView"

export const metadata: Metadata = {
  title: "User Management | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function UsersSettingsPage() {
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
