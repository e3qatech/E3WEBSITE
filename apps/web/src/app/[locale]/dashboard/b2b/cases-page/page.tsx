import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { B2BCasesEditor } from "@/components/dashboard/b2b/B2BCasesEditor"

export const metadata = {
  title: "B2B Case Studies Page Editor | E3 Admin",
}

export default async function CasesPageEditor() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const page = await db.pages.findUnique({
    where: { slug: 'b2b-cases' }
  })

  return <B2BCasesEditor initialData={page?.content || {}} />
}
