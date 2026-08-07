import { db } from "@/lib/db"
import { SubscribersList } from "@/components/dashboard/crm/SubscribersList"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Subscribers | CRM | E3 Admin",
}

export default async function SubscribersPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SALES", "MARKETING", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const subscribers = await db.subscriber.findMany({
    orderBy: { createdAt: "desc" }
  })

  // Format dates for client
  const formattedSubscribers = subscribers.map(s => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    verifiedAt: s.verifiedAt?.toISOString() || null
  }))

  return <SubscribersList initialSubscribers={formattedSubscribers as any} />
}
