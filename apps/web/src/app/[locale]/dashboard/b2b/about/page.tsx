import { Metadata } from "next"
import db from "@/lib/db"
import { B2BAboutEditor } from "@/components/dashboard/b2b/B2BAboutEditor"

export const metadata: Metadata = {
  title: "B2B About Us CMS | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function B2BAboutPage() {
  const page = await db.pages.findUnique({
    where: { slug: "b2b-about" }
  })
  
  const initialData = page?.content || {}

  return <B2BAboutEditor initialData={initialData} />
}
