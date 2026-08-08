import { Metadata } from "next"
import db from "@/lib/db"
import { PulseOrbitCMSView } from "@/components/dashboard/b2c/PulseOrbitCMSView"

export const metadata: Metadata = {
  title: "Pulse Orbit CMS | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function PulseOrbitCMSPage() {
  const page = await db.pages.findUnique({
    where: { slug: "pulse-orbit" }
  })

  const initialData = page?.content || {}

  return <PulseOrbitCMSView initialData={initialData as any} />
}
