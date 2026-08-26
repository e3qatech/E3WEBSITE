"use client"

import { useState, useEffect } from "react"
import { Plus, Users, Share2, Award, Copy, Check, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

export function PackageReferralsManager({
  locale,
  dir
}: {
  locale: "en" | "ar"
  dir: "ltr" | "rtl"
}) {
  const isAr = locale === "ar"
  const [programmes, setProgrammes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreatingProg, setIsCreatingProg] = useState(false)
  const [isCreatingCode, setIsCreatingCode] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const [progForm, setProgForm] = useState({
    name: "",
    slug: "",
    description: "",
    rewardType: "COMMISSION_PERCENT",
    rewardValue: 5,
    refereeDiscountType: "PERCENTAGE",
    refereeDiscountValue: 10,
    isActive: true
  })

  const [codeForm, setCodeForm] = useState({
    code: "",
    programmeId: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerType: "CUSTOMER"
  })

  const fetchProgrammes = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/b2c/referrals")
      const json = await res.json()
      setProgrammes(Array.isArray(json.data) ? json.data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgrammes()
  }, [])

  const handleCreateProg = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/b2c/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progForm)
      })
      if (!res.ok) throw new Error("Failed to create referral programme")
      setIsCreatingProg(false)
      fetchProgrammes()
    } catch {
      alert("Failed to create referral programme")
    }
  }

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/b2c/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_code",
          ...codeForm
        })
      })
      if (!res.ok) throw new Error("Failed to create referral code")
      setIsCreatingCode(false)
      fetchProgrammes()
    } catch {
      alert("Failed to create referral code")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(text)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">
            {isAr ? "برامج الإحالة وتتبع الشركاء" : "Referral Programmes & Partner Attribution"}
          </h3>
          <p className="text-xs text-slate-400">
            {isAr ? "تتبع إحالات العملاء والمدارس والموظفين وحساب العوائد ومكافآت الحجوزات." : "Manage customer, school, corporate, and staff referral reward channels."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreatingCode(true)}
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAr ? "إصدار كود إحالة" : "Issue Referral Code"}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreatingProg(true)}
            className="gap-1.5 text-xs bg-emerald-500 text-slate-950 font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAr ? "برنامج إحالة جديد" : "New Programme"}
          </Button>
        </div>
      </div>

      {/* Create Programme Form */}
      {isCreatingProg && (
        <form onSubmit={handleCreateProg} className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4 shadow-sm">
          <h4 className="text-sm font-bold text-[var(--text-primary)]">Create New Referral Programme</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Programme Name *</label>
              <input
                type="text"
                required
                value={progForm.name}
                onChange={e => setProgForm({ ...progForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="e.g. School Ambassador Club"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Reward Type</label>
              <select
                value={progForm.rewardType}
                onChange={e => setProgForm({ ...progForm, rewardType: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="COMMISSION_PERCENT">Commission Percentage (%)</option>
                <option value="FIXED_CREDIT">Fixed Wallet Credit (QAR)</option>
                <option value="POINTS">Reward Points</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Reward Value *</label>
              <input
                type="number"
                required
                value={progForm.rewardValue}
                onChange={e => setProgForm({ ...progForm, rewardValue: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingProg(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs font-bold bg-[var(--color-primary)] text-white shadow-sm">
              Save Programme
            </Button>
          </div>
        </form>
      )}

      {/* Issue Code Form */}
      {isCreatingCode && (
        <form onSubmit={handleCreateCode} className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4 shadow-sm">
          <h4 className="text-sm font-bold text-[var(--text-primary)]">Issue New Referral Code</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Referral Code *</label>
              <input
                type="text"
                required
                value={codeForm.code}
                onChange={e => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono uppercase text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-[var(--color-primary)] font-bold"
                placeholder="e.g. REF-DOHA-SCH"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Programme *</label>
              <select
                required
                value={codeForm.programmeId}
                onChange={e => setCodeForm({ ...codeForm, programmeId: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Select Programme</option>
                {programmes.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Owner Name *</label>
              <input
                type="text"
                required
                value={codeForm.ownerName}
                onChange={e => setCodeForm({ ...codeForm, ownerName: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="e.g. Doha College Coordinator"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingCode(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs font-bold bg-[var(--color-primary)] text-white shadow-sm">
              Issue Code
            </Button>
          </div>
        </form>
      )}

      {/* Programmes List */}
      <div className="space-y-4">
        {programmes.map(prog => (
          <div key={prog.id} className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-[var(--text-primary)]">{prog.name}</h4>
                <p className="text-xs text-[var(--text-secondary)]">{prog.description || "Active referral reward programme"}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Reward: {prog.rewardValue}% ({prog.rewardType})
              </span>
            </div>

            {/* Codes List under programme */}
            {Array.isArray(prog.codes) && prog.codes.length > 0 ? (
              <div className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] overflow-hidden">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-level-1)] text-[var(--text-secondary)] font-mono uppercase text-[10px] bg-[var(--surface-hover)]/40">
                      <th className="p-3 text-start">Code</th>
                      <th className="p-3 text-start">Owner</th>
                      <th className="p-3 text-start">Leads Attributed</th>
                      <th className="p-3 text-start">Bookings Converted</th>
                      <th className="p-3 text-end">Copy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-level-1)]">
                    {prog.codes.map((c: any) => (
                      <tr key={c.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{c.code}</td>
                        <td className="p-3 text-[var(--text-primary)]">{c.ownerName} ({c.ownerType})</td>
                        <td className="p-3 font-mono text-[var(--text-secondary)]">{c.totalLeads}</td>
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{c.totalConversions}</td>
                        <td className="p-3 text-end">
                          <button
                            onClick={() => copyToClipboard(c.code)}
                            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg cursor-pointer transition-colors"
                          >
                            {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)] italic">No referral codes issued under this programme yet.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
