import { InsightsManager } from "@/components/dashboard/insights/InsightsManager"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Insights, News & Press Manager | E3 Qatar Dashboard",
  description: "Central website-wide management portal for E3 articles, news, press releases, and announcements.",
}

export default function InsightsDashboardPage() {
  return <InsightsManager />
}
