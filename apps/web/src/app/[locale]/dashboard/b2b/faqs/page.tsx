import { Metadata } from "next"
import db from "@/lib/db"
import { B2BFAQsEditor } from "@/components/dashboard/b2b/B2BFAQsEditor"

export const metadata: Metadata = {
  title: "B2B FAQs CMS | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function B2BFAQsPage() {
  const page = await db.pages.findUnique({
    where: { slug: "b2b-faqs" }
  })
  
  const initialData = page?.content || {}

  return <B2BFAQsEditor initialData={initialData} />
}
