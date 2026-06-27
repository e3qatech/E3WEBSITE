import { db } from "@/lib/db"
import { PartnersManager } from "@/components/dashboard/b2b/PartnersManager"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Partners Directory | E3 Admin",
}

export default async function B2BPartnersPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const partners = await db.partner.findMany({
    orderBy: { orderIndex: "asc" }
  })

  // Format model data
  const formattedPartners = partners.map(p => ({
    id: p.id,
    name: p.name,
    website: p.website,
    category: p.category,
    description: p.description,
    logoUrl: p.logoUrl,
    isVisible: p.isVisible,
    orderIndex: p.orderIndex
  }))

  return <PartnersManager initialPartners={formattedPartners} />
}
