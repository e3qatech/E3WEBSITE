import { Plus, Clock, AlertTriangle, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/Button"
import db from "@/lib/db"
import { format } from "date-fns"

export const metadata = {
  title: "Temporal Rules | Operations | E3 Admin",
}

export default async function TemporalRulesPage() {
  const rules = await db.attractionTemporalRule.findMany({
    include: {
      attraction: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'RECURRING': return <Clock className="w-5 h-5 text-[var(--color-primary)]" />;
      case 'CLOSURE': return <AlertTriangle className="w-5 h-5 text-[var(--color-error)]" />;
      case 'OVERRIDE': return <CalendarDays className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5" />;
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8 pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Temporal Rules</h1>
          <p className="text-[var(--text-secondary)]">Manage opening hours, seasonal closures, and special events.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Create Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface-hover)] border-b border-[var(--border-default)]">
                <th className="p-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Attraction</th>
                <th className="p-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Schedule</th>
                <th className="p-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Dates</th>
                <th className="p-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {rules.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">
                    No temporal rules configured yet.
                  </td>
                </tr>
              )}
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[var(--surface-hover)]/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getRuleIcon(rule.ruleType)}
                      <span className="font-bold text-sm text-[var(--text-primary)]">{rule.ruleType}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-[var(--text-primary)]">
                    {rule.attraction.nameEn}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">
                    {rule.openTime && rule.closeTime ? `${rule.openTime} - ${rule.closeTime}` : "All Day"}
                    {rule.daysOfWeek && (
                      <div className="mt-1 text-xs text-[var(--text-tertiary)]">
                        Days: {(rule.daysOfWeek as number[]).join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">
                    {rule.startDate ? format(rule.startDate, "MMM dd, yyyy") : "Always"} 
                    {rule.endDate ? ` to ${format(rule.endDate, "MMM dd, yyyy")}` : ""}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
