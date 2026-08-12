import { PackageLeadsManager } from "@/components/dashboard/leads/PackageLeadsManager"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Package Leads & Enquiries | E3 Qatar Dashboard",
  description: "Track birthday bookings, school group field trips, and corporate team-building enquiries.",
}

export default function DashboardPackageLeadsPage() {
  return <PackageLeadsManager />
}
