import { db } from "@/lib/db"
import { InquiriesInbox } from "@/components/dashboard/crm/InquiriesInbox"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Inquiries Inbox | CRM | E3 Admin",
}

export default async function InquiriesPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SALES", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const inquiries = await db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      lead: { select: { id: true, name: true } }
    }
  })

  // Format dates for client
  const formattedInquiries = inquiries.map(i => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
  }))

  return <InquiriesInbox initialInquiries={formattedInquiries as any} />
}
