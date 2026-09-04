"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Tag, 
  Percent, 
  RefreshCw, 
  Copy, 
  Check, 
  Calendar, 
  ArrowRight,
  Clock,
  ShieldAlert,
  Users,
  DollarSign,
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

export function PackagePromotionsManager({
  locale,
  dir
}: {
  locale: "en" | "ar"
  dir: "ltr" | "rtl"
}) {
  const isAr = locale === "ar"
  const [promotions, setPromotions] = useState<any[]>([])
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState<"promotions" | "coupons">("promotions")

  const [isCreatingPromo, setIsCreatingPromo] = useState(false)
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false)

  // Promotion Form State with Time Bounds, Min Spend & Max Discount Caps
  const [promoForm, setPromoForm] = useState({
    name: "",
    code: "",
    labelEn: "",
    labelAr: "",
    discountType: "PERCENTAGE",
    discountValue: 15,
    maxDiscount: "",
    minSpend: "",
    minGuests: "",
    maxGuests: "",
    validFrom: "",
    validTo: "",
    usageLimit: "",
    isActive: true
  })

  // Coupon Form State with Time Bounds & Minimum Spend
  const [couponForm, setCouponForm] = useState({
    code: "",
    promotionId: "",
    description: "",
    usageLimit: 50,
    minSpend: "",
    validFrom: "",
    validTo: "",
    bulkCount: 1,
    prefix: "E3"
  })

  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resPromos, resCoupons] = await Promise.all([
        fetch("/api/b2c/package-promotions"),
        fetch("/api/b2c/coupons")
      ])
      const [jsonPromos, jsonCoupons] = await Promise.all([
        resPromos.json(),
        resCoupons.json()
      ])
      setPromotions(Array.isArray(jsonPromos.data) ? jsonPromos.data : [])
      setCoupons(Array.isArray(jsonCoupons.data) ? jsonCoupons.data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/b2c/package-promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...promoForm,
          discountValue: parseFloat(promoForm.discountValue as any) || 0,
          maxDiscount: promoForm.maxDiscount ? parseFloat(promoForm.maxDiscount) : undefined,
          minSpend: promoForm.minSpend ? parseFloat(promoForm.minSpend) : undefined,
          minGuests: promoForm.minGuests ? parseInt(promoForm.minGuests) : undefined,
          maxGuests: promoForm.maxGuests ? parseInt(promoForm.maxGuests) : undefined,
          usageLimit: promoForm.usageLimit ? parseInt(promoForm.usageLimit) : undefined,
          validFrom: promoForm.validFrom ? new Date(promoForm.validFrom).toISOString() : undefined,
          validTo: promoForm.validTo ? new Date(promoForm.validTo).toISOString() : undefined
        })
      })
      if (!res.ok) throw new Error("Failed to create promotion")
      setIsCreatingPromo(false)
      fetchData()
    } catch (_e) {
      alert("Failed to create promotion")
    }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/b2c/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...couponForm,
          usageLimit: parseInt(couponForm.usageLimit as any) || 50,
          minSpend: couponForm.minSpend ? parseFloat(couponForm.minSpend) : undefined,
          validFrom: couponForm.validFrom ? new Date(couponForm.validFrom).toISOString() : undefined,
          validTo: couponForm.validTo ? new Date(couponForm.validTo).toISOString() : undefined
        })
      })
      if (!res.ok) throw new Error("Failed to create coupon")
      setIsCreatingCoupon(false)
      fetchData()
    } catch (_e) {
      alert("Failed to create coupon")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(text)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  // Calculate time status for a promotion or coupon
  const getTimeStatus = (validFrom?: string | null, validTo?: string | null, isActive: boolean = true) => {
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
    return { label: isAr ? "نشط حالياً" : "Active", variant: "emerald" }
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Sub Tabs Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-level-1)]">
          <button
            onClick={() => setActiveSubTab("promotions")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
              activeSubTab === "promotions"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>{isAr ? "قواعد العروض والخصومات" : "Promotion Rules"}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono font-black">{promotions.length}</span>
          </button>
          <button
            onClick={() => setActiveSubTab("coupons")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
              activeSubTab === "coupons"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{isAr ? "مدير أكواد الكوبونات" : "Promo Code Manager"}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono font-black">{coupons.length}</span>
          </button>
        </div>

        {activeSubTab === "promotions" ? (
          <Button
            size="sm"
            onClick={() => setIsCreatingPromo(true)}
            className="gap-1.5 text-xs bg-[var(--color-primary)] hover:opacity-90 text-white font-bold shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAr ? "إنشاء عرض ترويجي" : "New Promotion"}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => setIsCreatingCoupon(true)}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAr ? "إصدار كود برومو جديد" : "Generate Promo Code"}
          </Button>
        )}
      </div>

      {/* Promotions Tab */}
      {activeSubTab === "promotions" && (
        <div className="space-y-4">
          {isCreatingPromo && (
            <form onSubmit={handleCreatePromo} className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4 shadow-sm">
              <div className="border-b border-[var(--border-level-1)] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold uppercase block">
                    {isAr ? "حملة ترويجية جديدة" : "Time-Bound Promotion"}
                  </span>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    {isAr ? "تحديد حدود الخصم والمواعيد" : "Configure Discount Rules, Time Bounds & Caps"}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Promotion Name *</label>
                  <input
                    type="text"
                    required
                    value={promoForm.name}
                    onChange={e => setPromoForm({ ...promoForm, name: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="e.g. Back-to-School 20% Special"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Badge Label (EN) *</label>
                  <input
                    type="text"
                    required
                    value={promoForm.labelEn}
                    onChange={e => setPromoForm({ ...promoForm, labelEn: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="20% OFF Limited Time"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Badge Label (AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={promoForm.labelAr}
                    onChange={e => setPromoForm({ ...promoForm, labelAr: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-arabic text-right"
                    placeholder="خصم ٢٠٪ لفترة محدودة"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Discount Type</label>
                  <select
                    value={promoForm.discountType}
                    onChange={e => setPromoForm({ ...promoForm, discountType: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                  >
                    <option value="PERCENTAGE">Percentage (% Off)</option>
                    <option value="FIXED">Fixed Amount (QAR Off)</option>
                    <option value="EARLY_BIRD">Early Bird Offer</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={promoForm.discountValue}
                    onChange={e => setPromoForm({ ...promoForm, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "الحد الأقصى للخصم (سقف الخصم QAR)" : "Max Discount Limit (Cap QAR)"}
                  </label>
                  <input
                    type="number"
                    value={promoForm.maxDiscount}
                    onChange={e => setPromoForm({ ...promoForm, maxDiscount: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-500 focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="e.g. 500 QAR max"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "الحد الأدنى للإنفاق (QAR)" : "Minimum Spend (QAR)"}
                  </label>
                  <input
                    type="number"
                    value={promoForm.minSpend}
                    onChange={e => setPromoForm({ ...promoForm, minSpend: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="e.g. 1500 QAR"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "يبدأ من تاريخ (Start Date)" : "Valid From (Start Date)"}
                  </label>
                  <input
                    type="date"
                    value={promoForm.validFrom}
                    onChange={e => setPromoForm({ ...promoForm, validFrom: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "ينتهي بتاريخ (End Date)" : "Valid To (Expiration Date)"}
                  </label>
                  <input
                    type="date"
                    value={promoForm.validTo}
                    onChange={e => setPromoForm({ ...promoForm, validTo: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "الحد الأدنى لعدد الضيوف" : "Min Guest Capacity"}
                  </label>
                  <input
                    type="number"
                    value={promoForm.minGuests}
                    onChange={e => setPromoForm({ ...promoForm, minGuests: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="e.g. 15"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "الحد الأقصى لعدد الاستخدامات" : "Total Redemptions Limit"}
                  </label>
                  <input
                    type="number"
                    value={promoForm.usageLimit}
                    onChange={e => setPromoForm({ ...promoForm, usageLimit: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="e.g. 100 uses"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-primary)]">
                    <input
                      type="checkbox"
                      checked={promoForm.isActive}
                      onChange={e => setPromoForm({ ...promoForm, isActive: e.target.checked })}
                      className="rounded text-[var(--color-primary)] w-4 h-4 cursor-pointer"
                    />
                    <span>{isAr ? "تفعيل العرض فوراً" : "Activate Immediately"}</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingPromo(false)} className="text-xs">
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" size="sm" className="text-xs font-bold bg-[var(--color-primary)] text-white shadow-sm">
                  {isAr ? "حفظ العرض الترويجي" : "Save Promotion Rule"}
                </Button>
              </div>
            </form>
          )}

          <div className="rounded-3xl border border-[var(--border-level-1)] bg-[var(--surface-default)] overflow-hidden shadow-sm">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-level-1)] text-[var(--text-secondary)] font-mono uppercase text-[10px] bg-[var(--surface-hover)]/50">
                  <th className="p-4 text-start">{isAr ? "اسم العرض" : "Promotion"}</th>
                  <th className="p-4 text-start">{isAr ? "نسبة/قيمة الخصم" : "Discount Value"}</th>
                  <th className="p-4 text-start">{isAr ? "سقف الخصم والإنفاق" : "Caps & Spend"}</th>
                  <th className="p-4 text-start">{isAr ? "الفترة الزمنية" : "Time Bounds"}</th>
                  <th className="p-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-level-1)]">
                {promotions.map(promo => {
                  const timeStatus = getTimeStatus(promo.validFrom, promo.validTo, promo.isActive)
                  return (
                    <tr key={promo.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[var(--text-primary)]">{promo.name}</div>
                        <div className="text-[11px] text-[var(--text-tertiary)]">{promo.labelEn}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}% OFF` : `QAR ${promo.discountValue} OFF`}
                      </td>
                      <td className="p-4 space-y-0.5 text-[11px] font-mono">
                        <div>
                          <span className="text-[var(--text-tertiary)]">Min: </span>
                          <span className="text-[var(--text-primary)]">{promo.minSpend ? `QAR ${promo.minSpend}` : "None"}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-tertiary)]">Cap: </span>
                          <span className="text-amber-500 font-bold">{promo.maxDiscount ? `QAR ${promo.maxDiscount}` : "Unlimited"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-[11px] font-mono text-[var(--text-secondary)]">
                        {promo.validFrom || promo.validTo ? (
                          <div>
                            {promo.validFrom ? new Date(promo.validFrom).toLocaleDateString() : "Start"} → {promo.validTo ? new Date(promo.validTo).toLocaleDateString() : "Ongoing"}
                          </div>
                        ) : (
                          <span className="text-[var(--text-tertiary)]">No expiration</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          timeStatus.variant === "emerald" ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30" :
                          timeStatus.variant === "amber" ? "bg-amber-500/15 text-amber-500 border border-amber-500/30" :
                          timeStatus.variant === "rose" ? "bg-rose-500/15 text-rose-500 border border-rose-500/30" :
                          "bg-[var(--surface-active)] text-[var(--text-secondary)] border border-[var(--border-level-1)]"
                        )}>
                          {timeStatus.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeSubTab === "coupons" && (
        <div className="space-y-4">
          {isCreatingCoupon && (
            <form onSubmit={handleCreateCoupon} className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4 shadow-sm">
              <div className="border-b border-[var(--border-level-1)] pb-3">
                <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase block">
                  {isAr ? "كوبون خصم ترويجي جديد" : "New Promotional Promo Code"}
                </span>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  {isAr ? "توليد كود برومو مرتبط أو مستقل مع قيود الاستخدام" : "Generate Single or Bulk Codes with Expiry & Spend Rules"}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono uppercase text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-[var(--color-primary)] font-bold"
                    placeholder="e.g. E3-SUMMER26"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Linked Promotion Rule</label>
                  <select
                    value={couponForm.promotionId}
                    onChange={e => setCouponForm({ ...couponForm, promotionId: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
                  >
                    <option value="">None / Standalone Code</option>
                    {promotions.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.discountValue}{p.discountType === 'PERCENTAGE' ? '%' : ' QAR'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={e => setCouponForm({ ...couponForm, usageLimit: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "الحد الأدنى للإنفاق (QAR)" : "Minimum Spend (QAR)"}
                  </label>
                  <input
                    type="number"
                    value={couponForm.minSpend}
                    onChange={e => setCouponForm({ ...couponForm, minSpend: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    placeholder="e.g. 1000"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "صالح من تاريخ" : "Valid From Date"}
                  </label>
                  <input
                    type="date"
                    value={couponForm.validFrom}
                    onChange={e => setCouponForm({ ...couponForm, validFrom: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "تاريخ انتهاء الصلاحية" : "Expiration Date"}
                  </label>
                  <input
                    type="date"
                    value={couponForm.validTo}
                    onChange={e => setCouponForm({ ...couponForm, validTo: e.target.value })}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingCoupon(false)} className="text-xs">
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" size="sm" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm">
                  {isAr ? "إصدار الكود" : "Generate Promo Code"}
                </Button>
              </div>
            </form>
          )}

          <div className="rounded-3xl border border-[var(--border-level-1)] bg-[var(--surface-default)] overflow-hidden shadow-sm">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-level-1)] text-[var(--text-secondary)] font-mono uppercase text-[10px] bg-[var(--surface-hover)]/50">
                  <th className="p-4 text-start">{isAr ? "كود الكوبون" : "Promo Code"}</th>
                  <th className="p-4 text-start">{isAr ? "العرض المرتبط" : "Linked Promotion"}</th>
                  <th className="p-4 text-start">{isAr ? "الاستخدامات" : "Usage"}</th>
                  <th className="p-4 text-start">{isAr ? "الحد الأدنى" : "Min Spend"}</th>
                  <th className="p-4 text-start">{isAr ? "الصلاحية" : "Validity"}</th>
                  <th className="p-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                  <th className="p-4 text-end">{isAr ? "نسخ" : "Copy"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-level-1)]">
                {coupons.map(cpn => {
                  const timeStatus = getTimeStatus(cpn.validFrom, cpn.validTo, cpn.status === "ACTIVE")

                  return (
                    <tr key={cpn.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {cpn.code}
                      </td>
                      <td className="p-4 text-[var(--text-secondary)]">
                        {cpn.promotion?.name || cpn.description || "Standalone Coupon"}
                      </td>
                      <td className="p-4 font-mono text-[var(--text-secondary)]">
                        {cpn.usedCount} / {cpn.usageLimit || "∞"}
                      </td>
                      <td className="p-4 font-mono text-[var(--text-tertiary)]">
                        {cpn.minSpend ? `QAR ${cpn.minSpend}` : "None"}
                      </td>
                      <td className="p-4 text-[11px] font-mono text-[var(--text-secondary)]">
                        {cpn.validFrom || cpn.validTo ? (
                          <div>
                            {cpn.validFrom ? new Date(cpn.validFrom).toLocaleDateString() : "Start"} → {cpn.validTo ? new Date(cpn.validTo).toLocaleDateString() : "End"}
                          </div>
                        ) : (
                          <span className="text-[var(--text-tertiary)]">Indefinite</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          timeStatus.variant === "emerald" ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30" :
                          timeStatus.variant === "amber" ? "bg-amber-500/15 text-amber-500 border border-amber-500/30" :
                          timeStatus.variant === "rose" ? "bg-rose-500/15 text-rose-500 border border-rose-500/30" :
                          "bg-[var(--surface-active)] text-[var(--text-secondary)] border border-[var(--border-level-1)]"
                        )}>
                          {timeStatus.label}
                        </span>
                      </td>
                      <td className="p-4 text-end">
                        <button
                          onClick={() => copyToClipboard(cpn.code)}
                          className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors rounded-lg cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedCode === cpn.code ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
