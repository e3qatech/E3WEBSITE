import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ServicesListClient } from "@/components/dashboard/b2b/ServicesListClient"

export const metadata = {
  title: "B2B Services | E3 Admin",
}

export default async function ServicesPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const services = await db.service.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return <ServicesListClient initialData={services} />
}
