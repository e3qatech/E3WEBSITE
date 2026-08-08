import { Metadata } from "next"
import db from "@/lib/db"
import { TemporalRulesManager } from "@/components/dashboard/operations/TemporalRulesManager"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Temporal Rules | Operations | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function TemporalRulesPage() {
  const session = await auth()
  const userRole = (session?.user as any)?.role

  if (!session || !["SUPER_ADMIN", "OPERATIONS", "SALES_ADMIN"].includes(userRole)) {
    redirect("/login")
  }

  const [rules, attractions] = await Promise.all([
    db.attractionTemporalRule.findMany({
      include: {
        attraction: { select: { id: true, nameEn: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    db.attraction.findMany({
      select: { id: true, nameEn: true },
      orderBy: { nameEn: "asc" }
    })
  ]);

  // Format dates for client
  const formattedRules = rules.map(rule => ({
    ...rule,
    startDate: rule.startDate?.toISOString() || null,
    endDate: rule.endDate?.toISOString() || null,
  }))

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <TemporalRulesManager initialRules={formattedRules as any} attractions={attractions} />
    </div>
  )
}
