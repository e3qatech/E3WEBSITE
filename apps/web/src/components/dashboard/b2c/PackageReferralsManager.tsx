"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Users, 
  Share2, 
  Award, 
  Copy, 
  Check, 
  DollarSign,
  Calendar,
  Clock,
  Tag,
  ShieldCheck,
  Percent
} from "lucide-react"
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
    ownerType: "CUSTOMER",
    rewardType: "COMMISSION",
    referrerReward: "5% Commission",
    referredCustomerReward: "10% Discount",
    validFrom: "",
    validTo: "",
    minSpend: "",
    maxDiscount: "",
    usageLimit: ""
  })

  const [codeForm, setCodeForm] = useState({
    code: "",
    programmeId: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: ""
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
        body: JSON.stringify({
          ...progForm,
          minSpend: progForm.minSpend ? parseFloat(progForm.minSpend) : undefined,
          maxDiscount: progForm.maxDiscount ? parseFloat(progForm.maxDiscount) : undefined,
          usageLimit: progForm.usageLimit ? parseInt(progForm.usageLimit) : undefined,
          validFrom: progForm.validFrom ? new Date(progForm.validFrom).toISOString() : undefined,
          validTo: progForm.validTo ? new Date(progForm.validTo).toISOString() : undefined
        })
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
          type: "code",
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

  const getTimeStatus = (validFrom?: string | null, validTo?: string | null, status: string | boolean = "ACTIVE") => {
    const isActive = typeof status === "boolean" ? status : status === "ACTIVE"
    if (!isActive) {
      return { label: isAr ? "معطل" : "Inactive", variant: "neutral" }
    }
    const now = new Date()
    if (validFrom && now < new Date(validFrom)) {
      return { label: isAr ? "مجدول قريباً" : "Scheduled", variant: "amber" }
    }
    if (validTo && now > new Date(validTo)) {
      return { label: isAr ? "منتهي الصلاحية" : "Expired", variant: "rose" }
    }
    return { label: isAr ? "نشط" : "Active", variant: "emerald" }
  }

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {isAr ? "برامج الإحالة وتتبع الشركاء (Referral Programs)" : "Referral Programmes & Partner Attribution"}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {isAr ? "إدارة برامج الإحالة المحددة زمنياً للعملاء والمدارس ومندوبي المبيعات مع حدود الخصم والإنفاق." : "Manage time-bound referral programs, minimum spend thresholds, and maximum discount caps."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreatingCode(true)}
            className="gap-1.5 text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAr ? "إصدار كود إحالة" : "Issue Referral Code"}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreatingProg(true)}
            className="gap-1.5 text-xs bg-[var(--color-primary)] text-white font-bold cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAr ? "برنامج إحالة جديد" : "New Programme"}
          </Button>
        </div>
      </div>

      {/* Create Programme Form */}
      {isCreatingProg && (
        <form onSubmit={handleCreateProg} className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4 shadow-sm">
          <div className="border-b border-[var(--border-level-1)] pb-3">
            <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold uppercase block">
              {isAr ? "برنامج إحالة محدد زمنياً" : "Time-Bound Referral Campaign"}
            </span>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              {isAr ? "إنشاء برنامج حوافز وإحالة جديد" : "Create New Referral Programme with Time Bounds & Caps"}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Programme Name *</label>
              <input
                type="text"
                required
                value={progForm.name}
                onChange={e => setProgForm({ ...progForm, name: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="e.g. Summer School Ambassador Program"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Target Owner Type</label>
              <select
                value={progForm.ownerType}
                onChange={e => setProgForm({ ...progForm, ownerType: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
              >
                <option value="CUSTOMER">Customer / Ambassador</option>
                <option value="SCHOOL">School / Teacher</option>
                <option value="CORPORATE">Corporate Partner</option>
                <option value="STAFF">Internal Staff</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Reward Type</label>
              <select
                value={progForm.rewardType}
                onChange={e => setProgForm({ ...progForm, rewardType: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
              >
                <option value="COMMISSION">Commission (%)</option>
                <option value="DISCOUNT">Mutual Discount (%)</option>
                <option value="CASH">Fixed Cash / Credit (QAR)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                {isAr ? "مكافأة صاحب الكود (Referrer Reward)" : "Referrer Reward"}
              </label>
              <input
                type="text"
                value={progForm.referrerReward}
                onChange={e => setProgForm({ ...progForm, referrerReward: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                placeholder="e.g. 5% commission or 100 QAR credit"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                {isAr ? "خصم العميل المحال (Referee Discount)" : "Referred Customer Discount"}
              </label>
              <input
                type="text"
                value={progForm.referredCustomerReward}
                onChange={e => setProgForm({ ...progForm, referredCustomerReward: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                placeholder="e.g. 10% discount on package"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                {isAr ? "سقف الخصم الأقصى (Max Discount Cap QAR)" : "Max Discount Limit (Cap QAR)"}
              </label>
              <input
                type="number"
                value={progForm.maxDiscount}
                onChange={e => setProgForm({ ...progForm, maxDiscount: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-500 focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="e.g. 400 QAR cap"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                {isAr ? "الحد الأدنى لقيمة الحجز (Min Spend QAR)" : "Min Booking Spend (QAR)"}
              </label>
              <input
                type="number"
                value={progForm.minSpend}
                onChange={e => setProgForm({ ...progForm, minSpend: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="e.g. 1200 QAR"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                {isAr ? "صالح من تاريخ (Start Date)" : "Valid From (Start Date)"}
              </label>
              <input
                type="date"
                value={progForm.validFrom}
                onChange={e => setProgForm({ ...progForm, validFrom: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                {isAr ? "ينتهي بتاريخ (End Date)" : "Valid To (End Date)"}
              </label>
              <input
                type="date"
                value={progForm.validTo}
                onChange={e => setProgForm({ ...progForm, validTo: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingProg(false)} className="text-xs">
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" size="sm" className="text-xs font-bold bg-[var(--color-primary)] text-white shadow-sm">
              {isAr ? "حفظ البرنامج" : "Save Programme"}
            </Button>
          </div>
        </form>
      )}

      {/* Issue Code Form */}
      {isCreatingCode && (
        <form onSubmit={handleCreateCode} className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4 shadow-sm">
          <div className="border-b border-[var(--border-level-1)] pb-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              {isAr ? "إصدار كود إحالة شريك أو عميل" : "Issue Referral Code to Partner or Ambassador"}
            </h4>
          </div>

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
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
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
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Owner Email</label>
              <input
                type="email"
                value={codeForm.ownerEmail}
                onChange={e => setCodeForm({ ...codeForm, ownerEmail: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                placeholder="coordinator@school.qa"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Owner Phone</label>
              <input
                type="text"
                value={codeForm.ownerPhone}
                onChange={e => setCodeForm({ ...codeForm, ownerPhone: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                placeholder="+974 5555 1234"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingCode(false)} className="text-xs">
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" size="sm" className="text-xs font-bold bg-[var(--color-primary)] text-white shadow-sm">
              {isAr ? "إصدار الكود" : "Issue Code"}
            </Button>
          </div>
        </form>
      )}

      {/* Programmes and Codes List */}
      <div className="space-y-4">
        {programmes.map(prog => {
          const timeStatus = getTimeStatus(prog.validFrom, prog.validTo, prog.status === "ACTIVE")

          return (
            <div key={prog.id} className="p-6 rounded-3xl border border-[var(--border-level-1)] bg-[var(--surface-default)] space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-level-1)] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{prog.name}</h4>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      timeStatus.variant === "emerald" ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30" :
                      timeStatus.variant === "amber" ? "bg-amber-500/15 text-amber-500 border border-amber-500/30" :
                      "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                    )}>
                      {timeStatus.label}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1 flex flex-wrap items-center gap-3">
                    <span>Reward: <strong className="text-emerald-500 font-mono">{prog.referrerReward || "Standard"}</strong></span>
                    <span>•</span>
                    <span>Referee Perk: <strong className="text-sky-500 font-mono">{prog.referredCustomerReward || "None"}</strong></span>
                    {prog.validFrom || prog.validTo ? (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                          {prog.validFrom ? new Date(prog.validFrom).toLocaleDateString() : "Now"} → {prog.validTo ? new Date(prog.validTo).toLocaleDateString() : "Indefinite"}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="text-start sm:text-end">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase block">Assigned Codes</span>
                  <span className="text-lg font-mono font-black text-[var(--color-primary)]">
                    {prog.codes?.length || 0}
                  </span>
                </div>
              </div>

              {/* Codes in this programme */}
              {Array.isArray(prog.codes) && prog.codes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {prog.codes.map((c: any) => (
                    <div key={c.id} className="p-3.5 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] flex items-center justify-between gap-2">
                      <div>
                        <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">{c.code}</div>
                        <div className="text-[11px] text-[var(--text-secondary)] font-medium">{c.ownerName}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
                          {c.usedCount || 0} uses • {c.leadsGenerated || 0} leads
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(c.code)}
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        {copiedCode === c.code ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[var(--text-tertiary)] italic p-3 text-center rounded-2xl bg-[var(--bg-level-1)]">
                  {isAr ? "لا توجد أكواد إحالة مصدرة في هذا البرنامج بعد." : "No referral codes issued for this programme yet."}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
