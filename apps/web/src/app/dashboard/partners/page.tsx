import { Metadata } from "next"
import db from "@/lib/db"
import { Users, Plus, Globe, CheckCircle2, ToggleRight, ToggleLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Partners | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  const partners = await db.partner.findMany({
    orderBy: { orderIndex: "asc" }
  })

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Partners & Sponsors</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage B2B partners visible on the public website.</p>
        </div>
        
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Partner
        </Button>
      </div>

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex-1 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {partners.map(partner => (
            <div key={partner.id} className="group relative bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:border-[var(--color-primary)]">
              
              <div className="absolute top-2 right-2">
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
                  <Globe className="w-3 h-3 mr-1" /> Visit
                </a>
              )}
            </div>
          ))}

          {partners.length === 0 && (
            <div className="col-span-full py-12 text-center text-[var(--text-tertiary)] border-2 border-dashed border-[var(--border-default)] rounded-xl flex flex-col items-center justify-center">
              <Users className="w-12 h-12 mb-4 text-[var(--border-default)]" />
              <p className="font-bold">No partners added.</p>
              <p className="text-sm">Click "Add Partner" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
