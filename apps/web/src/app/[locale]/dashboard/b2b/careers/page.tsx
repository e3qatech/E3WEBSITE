import { Metadata } from "next"
import db from "@/lib/db"
import { B2BCareersEditor } from "@/components/dashboard/b2b/B2BCareersEditor"

export const metadata: Metadata = {
  title: "B2B Careers CMS | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function B2BCareersPage() {
  const page = await db.pages.findUnique({
    where: { slug: "b2b-careers" }
  })
  
  const initialData = page?.content || {}

  return <B2BCareersEditor initialData={initialData} />
}
