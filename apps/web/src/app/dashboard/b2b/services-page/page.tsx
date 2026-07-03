import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { B2BServicesEditor } from "@/components/dashboard/b2b/B2BServicesEditor"

export const metadata = {
  title: "B2B Services Page Editor | E3 Admin",
}

export default async function ServicesPageEditor() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const page = await db.pages.findUnique({
    where: { slug: 'b2b-services' }
  })

  return <B2BServicesEditor initialData={page?.content || {}} />
}
