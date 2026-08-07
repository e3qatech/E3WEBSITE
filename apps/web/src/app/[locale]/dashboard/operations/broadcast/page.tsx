import { Metadata } from "next"
import db from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BroadcastManager } from "@/components/dashboard/operations/BroadcastManager"

export const metadata: Metadata = {
  title: "Broadcast | Operations | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function BroadcastPage() {
  const session = await auth()
  const userRole = (session?.user as any)?.role

  if (!session || !["SUPER_ADMIN", "OPERATIONS"].includes(userRole)) {
    redirect("/login")
  }

  const broadcasts = await db.systemBroadcast.findMany({
    orderBy: { createdAt: "desc" },
  })

  // Format dates for client
  const formattedBroadcasts = broadcasts.map(b => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }))

  return <BroadcastManager initialBroadcasts={formattedBroadcasts as any} />
}

