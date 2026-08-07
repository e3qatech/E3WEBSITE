import { Metadata } from "next"
import db from "@/lib/db"
import { B2BFeedbackEditor } from "@/components/dashboard/b2b/B2BFeedbackEditor"

export const metadata: Metadata = {
  title: "B2B Feedback CMS | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function B2BFeedbackPage() {
  const page = await db.pages.findUnique({
    where: { slug: "b2b-feedback" }
  })
  
  const initialData = page?.content || {}

  return <B2BFeedbackEditor initialData={initialData} />
}
