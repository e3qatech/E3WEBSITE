import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { B2BPartnersEditor } from "@/components/dashboard/b2b/B2BPartnersEditor"

export const metadata = {
  title: "B2B Partners Page Editor | E3 Admin",
}

export default async function PartnersPageEditor() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const page = await db.pages.findUnique({
    where: { slug: 'b2b-partners' }
  })

  return <B2BPartnersEditor initialData={page?.content || {}} />
}
