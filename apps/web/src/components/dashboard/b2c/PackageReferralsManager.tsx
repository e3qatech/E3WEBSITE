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
        <form onSubmit={handleCreateProg} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white">Create New Referral Programme</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Programme Name *</label>
              <input
                type="text"
                required
                value={progForm.name}
                onChange={e => setProgForm({ ...progForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                placeholder="e.g. School Ambassador Club"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Reward Type</label>
              <select
                value={progForm.rewardType}
                onChange={e => setProgForm({ ...progForm, rewardType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="COMMISSION_PERCENT">Commission Percentage (%)</option>
                <option value="FIXED_CREDIT">Fixed Wallet Credit (QAR)</option>
                <option value="POINTS">Reward Points</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Reward Value *</label>
              <input
                type="number"
                required
                value={progForm.rewardValue}
                onChange={e => setProgForm({ ...progForm, rewardValue: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingProg(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs font-bold bg-emerald-500 text-slate-950">
              Save Programme
            </Button>
          </div>
        </form>
      )}

      {/* Issue Code Form */}
      {isCreatingCode && (
        <form onSubmit={handleCreateCode} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white">Issue New Referral Code</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Referral Code *</label>
              <input
                type="text"
                required
                value={codeForm.code}
                onChange={e => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono uppercase text-emerald-400"
                placeholder="e.g. REF-DOHA-SCH"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Programme *</label>
              <select
                required
                value={codeForm.programmeId}
                onChange={e => setCodeForm({ ...codeForm, programmeId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">Select Programme</option>
                {programmes.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Owner Name *</label>
              <input
                type="text"
                required
                value={codeForm.ownerName}
                onChange={e => setCodeForm({ ...codeForm, ownerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                placeholder="e.g. Doha College Coordinator"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingCode(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs font-bold bg-emerald-500 text-slate-950">
              Issue Code
            </Button>
          </div>
        </form>
      )}

      {/* Programmes List */}
      <div className="space-y-4">
        {programmes.map(prog => (
          <div key={prog.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">{prog.name}</h4>
                <p className="text-xs text-slate-400">{prog.description || "Active referral reward programme"}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400">
                Reward: {prog.rewardValue}% ({prog.rewardType})
              </span>
            </div>

            {/* Codes List under programme */}
            {Array.isArray(prog.codes) && prog.codes.length > 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-mono uppercase text-[10px]">
                      <th className="p-3 text-start">Code</th>
                      <th className="p-3 text-start">Owner</th>
                      <th className="p-3 text-start">Leads Attributed</th>
                      <th className="p-3 text-start">Bookings Converted</th>
                      <th className="p-3 text-end">Copy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {prog.codes.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-mono font-bold text-emerald-400">{c.code}</td>
                        <td className="p-3 text-white">{c.ownerName} ({c.ownerType})</td>
                        <td className="p-3 font-mono text-slate-300">{c.totalLeads}</td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">{c.totalConversions}</td>
                        <td className="p-3 text-end">
                          <button
                            onClick={() => copyToClipboard(c.code)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No referral codes issued under this programme yet.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
