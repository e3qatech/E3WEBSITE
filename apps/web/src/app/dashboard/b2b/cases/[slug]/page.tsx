import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { CaseEditor } from "@/components/dashboard/b2b/CaseEditor"

export const metadata = {
  title: "Case Study Editor | E3 Admin",
}

export default async function EditCasePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const { slug } = await params
  
  if (slug === "new") {
    return <CaseEditor />
  }

  const caseStudy = await db.caseStudy.findUnique({
    where: { slug }
  })

  if (!caseStudy) {
    notFound()
  }

  return <CaseEditor initialData={caseStudy} />
}
