import { Metadata } from "next"
import db from "@/lib/db"
import { Users, Plus, Globe, CheckCircle2 } from "lucide-react"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"

export const metadata: Metadata = {
  title: "Partners | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  const partners = await db.partner.findMany({
    orderBy: { orderIndex: "asc" }
  })

  return (
    <DashboardPageShell variant="wide">
      <DashboardPageHeader
        title="Partners & Sponsors Directory"
        description="Manage government agencies, corporate sponsors, and ecosystem partners displayed on the public portal."
        breadcrumbs={[
          { label: "B2B Ecosystem", href: "/dashboard/partners" },
          { label: "Partners & Sponsors" },
        ]}
        badge={{ label: `${partners.length} Partners`, variant: "indigo" }}
        primaryAction={{
          label: "Add Partner",
          href: "/dashboard/partners/new",
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex-1 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {partners.map((partner: any) => (
            <div key={partner.id} className="group relative bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:border-[var(--color-primary)]">
              
              <div className="absolute top-2 end-2">
                {partner.isVisible ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--border-default)]" />
                )}
              </div>

              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden mb-3 p-2 border border-[var(--border-default)]">
                {partner.logoUrl ? (
                  <img src={partner.logoUrl} alt={partner.name} className="w-full h-full object-contain" />
                ) : (
                  <Users className="w-8 h-8 text-[var(--text-tertiary)]" />
                )}
              </div>
              
              <h3 className="font-bold text-[var(--text-primary)] text-sm mb-1">{partner.name}</h3>
              <div className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--surface-active)] px-2 py-0.5 rounded-full mb-3">
                {partner.category}
              </div>
              
              {partner.website && (
                <a href={partner.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center text-xs">
                  <Globe className="w-3 h-3 me-1" /> Visit
                </a>
              )}
            </div>
          ))}

          {partners.length === 0 && (
            <div className="col-span-full py-12 text-center text-[var(--text-tertiary)] border-2 border-dashed border-[var(--border-default)] rounded-xl flex flex-col items-center justify-center">
              <Users className="w-12 h-12 mb-4 text-[var(--border-default)]" />
              <p className="font-bold">No partners added.</p>
              <p className="text-sm">Click &quot;Add Partner&quot; to get started.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardPageShell>
  )
}
