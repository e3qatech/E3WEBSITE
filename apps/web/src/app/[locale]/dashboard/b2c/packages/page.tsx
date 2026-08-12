import { PackagesManager } from "@/components/dashboard/b2c/PackagesManager"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Packages & Birthday CMS | E3 Qatar Dashboard",
  description: "Manage E3 celebration packages, group outings, microsite sections, and tiers.",
}

export default function DashboardPackagesPage() {
  return <PackagesManager />
}
