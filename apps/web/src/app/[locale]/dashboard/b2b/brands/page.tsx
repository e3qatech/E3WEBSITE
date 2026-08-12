import { UnifiedBrandsManager } from "@/components/dashboard/shared/UnifiedBrandsManager"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "B2B Brand Portfolio & IP Manager | E3 Qatar Dashboard",
  description: "Manage E3 corporate brand portfolio, IP licensing, and B2B partner brands.",
}

export default function B2BBrandsPage() {
  return <UnifiedBrandsManager defaultPortalFilter="b2b" />
}
