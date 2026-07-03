import { B2BHomeEditor } from "@/components/dashboard/b2b/B2BHomeEditor"
import db from "@/lib/db"
import { notFound } from "next/navigation"

export const metadata = {
  title: "B2B Homepage Editor | E3 Command Center"
}

export default async function DashboardB2BHomePage() {
  const pageData = await db.pages.findUnique({
    where: { slug: 'b2b-home' }
  })

  if (!pageData) {
    // If it doesn't exist, we fallback or throw notFound
    // but in a proper setup, it should be seeded.
    notFound()
  }

  return <B2BHomeEditor initialData={pageData} />
}
