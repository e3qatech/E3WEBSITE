import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { PartnersClient } from "@/components/dashboard/b2b/PartnersClient"

export const metadata = {
  title: "B2B Partners | E3 Admin",
}

export default async function PartnersPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const partners = await db.partner.findMany({
    orderBy: [
      { category: 'asc' },
      { orderIndex: 'asc' },
      { name: 'asc' }
    ]
  })

  return <PartnersClient initialData={partners} />
}
