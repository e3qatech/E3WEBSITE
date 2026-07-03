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

  // Do not throw notFound() so the editor can load even if the DB hasn't been seeded yet.
  return <B2BHomeEditor initialData={pageData || { slug: 'b2b-home', content: {} }} />
}
