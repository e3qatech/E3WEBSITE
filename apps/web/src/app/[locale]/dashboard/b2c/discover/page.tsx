import { Metadata } from "next"
import db from "@/lib/db"
import { DiscoverPageManager } from "@/components/dashboard/b2c/DiscoverPageManager"

export const metadata: Metadata = {
  title: "B2C Discover CMS | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function B2CDiscoverPage() {
  const page = await db.pages.findUnique({
    where: { slug: "b2c-discover" }
  })
  
  const initialData = page?.content || {}

  return <DiscoverPageManager initialData={initialData as any} />
}
