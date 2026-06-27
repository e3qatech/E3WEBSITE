import { Metadata } from "next"
import db from "@/lib/db"
import { RecapGeneratorView } from "@/components/dashboard/operations/RecapGeneratorView"

export const metadata: Metadata = {
  title: "Recap Engine | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function RecapEnginePage() {
  const attractions = await db.attraction.findMany({
    select: { id: true, nameEn: true },
    orderBy: { nameEn: "asc" }
  })

  return <RecapGeneratorView attractions={attractions} />
}
