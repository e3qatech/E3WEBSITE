import { Metadata } from "next"
import db from "@/lib/db"
import { ApplicationsManager } from "@/components/dashboard/careers/ApplicationsManager"

export const metadata: Metadata = {
  title: "Job Applications | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  const applications = await db.jobApplication.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return <ApplicationsManager initialApplications={applications} />
}
