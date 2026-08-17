"use client"

import { useState, useEffect } from "react"
import { Plus, Tag, Percent, RefreshCw, Copy, Check, Calendar, ArrowRight } from "lucide-react"
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

  // Promotion Form State
  const [promoForm, setPromoForm] = useState({
    name: "",
    code: "",
    labelEn: "",
    labelAr: "",
    discountType: "PERCENTAGE",
    discountValue: 10,
    maxDiscount: "",
    minSpend: "",
    minGuests: "",
    isActive: true
  })

  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: "",
    promotionId: "",
    description: "",
    usageLimit: 50,
    minSpend: "",
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
        body: JSON.stringify(promoForm)
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
        body: JSON.stringify(couponForm)
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

  return (
    <div className="space-y-6" dir={dir}>
      {/* Sub Tabs Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab("promotions")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeSubTab === "promotions"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            )}
          >
            {isAr ? "قواعد الخصومات والعروض" : "Promotion Rules"} ({promotions.length})
          </button>
          <button
            onClick={() => setActiveSubTab("coupons")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeSubTab === "coupons"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            )}
          >
            {isAr ? "أكواد الكوبونات الترويجية" : "Coupon Codes"} ({coupons.length})
          </button>
        </div>

        {activeSubTab === "promotions" ? (
          <Button
            size="sm"
            onClick={() => setIsCreatingPromo(true)}
            className="gap-1.5 text-xs bg-emerald-500 text-slate-950 font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAr ? "إنشاء عرض جديد" : "New Promotion"}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => setIsCreatingCoupon(true)}
            className="gap-1.5 text-xs bg-emerald-500 text-slate-950 font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAr ? "توليد كود كوبون" : "Generate Coupon"}
          </Button>
        )}
      </div>

      {/* Promotions Tab */}
      {activeSubTab === "promotions" && (
        <div className="space-y-4">
          {isCreatingPromo && (
            <form onSubmit={handleCreatePromo} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white">Create New Promotion Rule</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Promotion Name *</label>
                  <input
                    type="text"
                    required
                    value={promoForm.name}
                    onChange={e => setPromoForm({ ...promoForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="e.g. Summer Camp 15% Early Bird"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Label (English) *</label>
                  <input
                    type="text"
                    required
                    value={promoForm.labelEn}
                    onChange={e => setPromoForm({ ...promoForm, labelEn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="15% OFF Summer Special"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Label (Arabic)</label>
                  <input
                    type="text"
                    value={promoForm.labelAr}
                    onChange={e => setPromoForm({ ...promoForm, labelAr: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="خصم ١٥٪ عرض الصيف"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Discount Type</label>
                  <select
                    value={promoForm.discountType}
                    onChange={e => setPromoForm({ ...promoForm, discountType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="PERCENTAGE">Percentage (% Discount)</option>
                    <option value="FIXED">Fixed Amount (QAR)</option>
                    <option value="EARLY_BIRD">Early Bird Offer</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={promoForm.discountValue}
                    onChange={e => setPromoForm({ ...promoForm, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Min Spend (QAR)</label>
                  <input
                    type="number"
                    value={promoForm.minSpend}
                    onChange={e => setPromoForm({ ...promoForm, minSpend: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="Optional minimum spend"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingPromo(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs font-bold bg-emerald-500 text-slate-950">
                  Save Promotion
                </Button>
              </div>
            </form>
          )}

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="p-4 text-start">Promotion Name</th>
                  <th className="p-4 text-start">Type & Value</th>
                  <th className="p-4 text-start">Linked Coupons</th>
                  <th className="p-4 text-start">Min Spend</th>
                  <th className="p-4 text-start">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {promotions.map(promo => (
                  <tr key={promo.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{promo.name}</div>
                      <div className="text-[11px] text-slate-400">{promo.labelEn}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}% OFF` : `QAR ${promo.discountValue} OFF`}
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {promo._count?.coupons || 0} coupons
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {promo.minSpend ? `QAR ${promo.minSpend}` : "None"}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        promo.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-800 text-slate-400"
                      )}>
                        {promo.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeSubTab === "coupons" && (
        <div className="space-y-4">
          {isCreatingCoupon && (
            <form onSubmit={handleCreateCoupon} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white">Generate Promotional Coupon</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono uppercase text-emerald-400"
                    placeholder="e.g. E3-SUMMER26"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Linked Promotion</label>
                  <select
                    value={couponForm.promotionId}
                    onChange={e => setCouponForm({ ...couponForm, promotionId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">None / Standalone</option>
                    {promotions.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={e => setCouponForm({ ...couponForm, usageLimit: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreatingCoupon(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs font-bold bg-emerald-500 text-slate-950">
                  Generate Coupon
                </Button>
              </div>
            </form>
          )}

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="p-4 text-start">Coupon Code</th>
                  <th className="p-4 text-start">Promotion</th>
                  <th className="p-4 text-start">Uses</th>
                  <th className="p-4 text-start">Total Discount Delivered</th>
                  <th className="p-4 text-start">Status</th>
                  <th className="p-4 text-end">Copy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {coupons.map(cpn => (
                  <tr key={cpn.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                      {cpn.code}
                    </td>
                    <td className="p-4 text-slate-300">
                      {cpn.promotion?.name || cpn.description || "General Coupon"}
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {cpn.usedCount} / {cpn.usageLimit || "∞"}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      QAR {cpn.discountDelivered.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400">
                        {cpn.status}
                      </span>
                    </td>
                    <td className="p-4 text-end">
                      <button
                        onClick={() => copyToClipboard(cpn.code)}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        title="Copy Code"
                      >
                        {copiedCode === cpn.code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
