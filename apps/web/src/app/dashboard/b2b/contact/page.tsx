import { Metadata } from "next"
import db from "@/lib/db"
import { B2BContactEditor } from "@/components/dashboard/b2b/B2BContactEditor"

export const metadata: Metadata = {
  title: "B2B Contact CMS | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function B2BContactPage() {
  const page = await db.pages.findUnique({
    where: { slug: "b2b-contact" }
  })
  
  const initialData = page?.content || {}

  return <B2BContactEditor initialData={initialData} />
}
