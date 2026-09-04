"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  FileText, 
  Send, 
  DollarSign, 
  Trash2, 
  Check, 
  Download, 
  Eye, 
  Calendar, 
  User,
  Share2,
  Mail,
  CreditCard,
  Sparkles,
  ExternalLink,
  Tag,
  Percent
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

export function PackageQuotationBuilder({
  locale,
  dir,
  initialLead
}: {
  locale: "en" | "ar"
  dir: "ltr" | "rtl"
  initialLead?: any
}) {
  const isAr = locale === "ar"
  const [quotations, setQuotations] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(Boolean(initialLead))
  const [viewingQuote, setViewingQuote] = useState<any | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [quoteForm, setQuoteForm] = useState({
    leadId: initialLead?.id || "",
    customerName: initialLead?.customerName || "",
    companyOrOrg: initialLead?.companyOrOrg || "",
    customerEmail: initialLead?.email || "",
    customerPhone: initialLead?.phone || "",
    packageId: initialLead?.packageId || "",
    title: initialLead?.package ? `Quotation for ${initialLead.package.titleEn}` : "E3 Experience Proposal & Quote",
    currency: "QAR",
    validDays: 14,
    discountType: "FIXED" as "FIXED" | "PERCENTAGE",
    discountPercent: 0,
    discountAmount: 0,
    depositPercentage: 50,
    customerNotes: "",
    internalNotes: "",
    items: [
      {
        titleEn: initialLead?.package?.titleEn || "Base Package Admission",
        titleAr: initialLead?.package?.titleAr || "رسوم الباقة الأساسية",
        itemType: "PACKAGE_TIER",
        unitPrice: initialLead?.estimatedValue || 2500,
        quantity: 1
      }
    ]
  })

  const fetchQuotations = async () => {
    setLoading(true)
    try {
      const [resQuotes, resPkgs] = await Promise.all([
        fetch("/api/b2c/quotations"),
        fetch("/api/b2c/packages?all=true")
      ])
      const [jsonQuotes, jsonPkgs] = await Promise.all([
        resQuotes.json(),
        resPkgs.json()
      ])
      setQuotations(Array.isArray(jsonQuotes.data) ? jsonQuotes.data : [])
      setPackages(Array.isArray(jsonPkgs.data) ? jsonPkgs.data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotations()
  }, [])

  // Currently selected package object
  const selectedPackageObj = packages.find(p => p.id === quoteForm.packageId)
  const packageAddOns: any[] = Array.isArray(selectedPackageObj?.addOns) ? selectedPackageObj.addOns : []
  const packageTiers: any[] = Array.isArray(selectedPackageObj?.tiers) ? selectedPackageObj.tiers : []

  const handleSelectPackage = (pkgId: string) => {
    if (!pkgId) {
      setQuoteForm(prev => ({ ...prev, packageId: "" }))
      return
    }
    const pkg = packages.find(p => p.id === pkgId)
    if (!pkg) return

    const basePrice = pkg.startingPrice || 1500
    setQuoteForm(prev => ({
      ...prev,
      packageId: pkg.id,
      title: `Quotation for ${pkg.titleEn}`,
      items: [
        {
          titleEn: `${pkg.titleEn} (Standard Admission)`,
          titleAr: `${pkg.titleAr || pkg.titleEn} (الدخول القياسي)`,
          itemType: "PACKAGE_TIER",
          unitPrice: basePrice,
          quantity: 1
        }
      ]
    }))
  }

  const handleImportTier = (tier: any) => {
    setQuoteForm(prev => ({
      ...prev,
      items: [
        {
          titleEn: `${selectedPackageObj?.titleEn || "Package"} - ${tier.nameEn || "Tier"}`,
          titleAr: `${selectedPackageObj?.titleAr || selectedPackageObj?.titleEn || "الباقة"} - ${tier.nameAr || tier.nameEn}`,
          itemType: "PACKAGE_TIER",
          unitPrice: tier.price || selectedPackageObj?.startingPrice || 1500,
          quantity: 1
        },
        ...prev.items.filter(it => it.itemType !== "PACKAGE_TIER")
      ]
    }))
  }

  const handleAddAddonItem = (addon: any) => {
    setQuoteForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          titleEn: addon.titleEn || addon.name || "Add-on Service",
          titleAr: addon.titleAr || addon.titleEn || "خدمة إضافية",
          itemType: "ADD_ON",
          unitPrice: addon.price || 250,
          quantity: 1
        }
      ]
    }))
  }

  const addCustomItem = () => {
    setQuoteForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          titleEn: "Custom Event Add-on",
          titleAr: "خدمة فعاليات مخصصة",
          itemType: "CUSTOM",
          unitPrice: 500,
          quantity: 1
        }
      ]
    }))
  }

  const removeItem = (idx: number) => {
    setQuoteForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }))
  }

  // Calculations
  const subtotal = quoteForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  const computedDiscount = quoteForm.discountType === "PERCENTAGE"
    ? Math.round((subtotal * Math.min(100, Math.max(0, quoteForm.discountPercent))) / 100)
    : Math.min(subtotal, Math.max(0, quoteForm.discountAmount))

  const grandTotal = Math.max(0, subtotal - computedDiscount)
  const depositAmount = Math.round((grandTotal * quoteForm.depositPercentage) / 100)

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + quoteForm.validDays)

      const res = await fetch("/api/b2c/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quoteForm,
          discountTotal: computedDiscount,
          depositAmount,
          validDays: quoteForm.validDays,
          items: quoteForm.items
        })
      })

      if (!res.ok) throw new Error("Failed to generate quotation")

      setIsCreating(false)
      fetchQuotations()
      setActionSuccess(isAr ? "تم إنشاء عرض السعر بنجاح!" : "Quotation generated successfully!")
      setTimeout(() => setActionSuccess(null), 3000)
    } catch {
      alert("Failed to generate quotation")
    }
  }

  const copyShareLink = (quote: any) => {
    const qNum = quote.quoteNumber || quote.referenceNumber || quote.id
    const url = `${window.location.origin}/${locale}/packages/quote/${qNum}`
    navigator.clipboard.writeText(url)
    setActionSuccess(isAr ? "تم نسخ رابط العرض!" : "Quote link copied!")
    setTimeout(() => setActionSuccess(null), 2500)
  }

  const copyPaymentLink = (quote: any) => {
    const qNum = quote.quoteNumber || quote.referenceNumber || quote.id
    const url = `${window.location.origin}/${locale}/packages/quote/${qNum}#payment`
    navigator.clipboard.writeText(url)
    setActionSuccess(isAr ? "تم نسخ رابط الدفع المباشر!" : "Direct payment link copied!")
    setTimeout(() => setActionSuccess(null), 2500)
  }

  const handleSendEmail = async (quote: any) => {
    setActionLoading(quote.id)
    try {
      const res = await fetch(`/api/b2c/quotations/${quote.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send email")
      setActionSuccess(isAr ? "تم إرسال عرض السعر بالبريد!" : "Quotation email dispatched!")
      setTimeout(() => setActionSuccess(null), 3000)
      fetchQuotations()
    } catch (err: any) {
      alert(err.message || "Failed to dispatch email")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6" dir={dir}>
      {actionSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl flex items-center gap-2 font-bold animate-in fade-in duration-200">
          <Check className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {isAr ? "منشئ عروض الأسعار الرسمية (Quotations Hub)" : "Official Package Quotations & Proposals"}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {isAr ? "إنشاء عروض أسعار تفصيلية، استيراد الباقات والإضافات، تطبيق الخصومات، ومشاركة روابط الدفع والـ PDF." : "Build modular quotations with premade packages, add-ons, dynamic discounts, shareable links, and payment CTAs."}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsCreating(true)}
          className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إنشاء عرض سعر جديد" : "Create Quotation"}
        </Button>
      </div>

      {/* Create Quote Form */}
      {isCreating && (
        <form onSubmit={handleSaveQuote} className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-[var(--color-primary)] uppercase block">
                {isAr ? "نموذج عرض سعر رسمي" : "Official E3 Quotation Builder"}
              </span>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                {isAr ? "إعداد المقترح المالي والبنود" : "New Experience Quotation & Financial Proposal"}
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-500 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Live Recalculation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                {isAr ? "اسم العميل أو الجهة *" : "Customer Name *"}
              </label>
              <input
                type="text"
                required
                value={quoteForm.customerName}
                onChange={e => setQuoteForm({ ...quoteForm, customerName: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="e.g. Maryam Al-Kuwari"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                {isAr ? "المؤسسة / المدرسة" : "Company / School"}
              </label>
              <input
                type="text"
                value={quoteForm.companyOrOrg}
                onChange={e => setQuoteForm({ ...quoteForm, companyOrOrg: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="e.g. Qatar Academy"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                {isAr ? "البريد الإلكتروني *" : "Customer Email *"}
              </label>
              <input
                type="email"
                required
                value={quoteForm.customerEmail}
                onChange={e => setQuoteForm({ ...quoteForm, customerEmail: e.target.value })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                placeholder="client@example.qa"
              />
            </div>

            {/* Premade Package Selector */}
            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                {isAr ? "اختيار باقة جاهزة (استيراد سريع)" : "Select Premade Package"}
              </label>
              <select
                value={quoteForm.packageId}
                onChange={e => handleSelectPackage(e.target.value)}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
              >
                <option value="">{isAr ? "باقة مخصصة (دون أساس ثابت)" : "Custom Proposal (No fixed package)"}</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.titleEn} ({p.startingPrice} QAR)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                {isAr ? "فترة الصلاحية (بالأيام)" : "Validity (Days)"}
              </label>
              <input
                type="number"
                value={quoteForm.validDays}
                onChange={e => setQuoteForm({ ...quoteForm, validDays: parseInt(e.target.value) || 14 })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                {isAr ? "نسبة الدفعة المقدمة (%)" : "Deposit Required (%)"}
              </label>
              <input
                type="number"
                value={quoteForm.depositPercentage}
                onChange={e => setQuoteForm({ ...quoteForm, depositPercentage: parseInt(e.target.value) || 50 })}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-500 focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Quick Import Tiers / Addons from Selected Package */}
          {selectedPackageObj && (
            <div className="p-4 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? `إضافات وفئات باقة ${selectedPackageObj.titleEn}:` : `Available Tiers & Add-ons for ${selectedPackageObj.titleEn}:`}</span>
              </div>

              {/* Tiers list */}
              {packageTiers.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono uppercase">{isAr ? "الفئات:" : "Tiers:"}</span>
                  {packageTiers.map((tier: any) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => handleImportTier(tier)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[var(--surface-default)] border border-[var(--border-level-1)] hover:border-[var(--color-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{isAr ? (tier.nameAr || tier.nameEn) : tier.nameEn}</span>
                      <span className="font-mono text-emerald-500 font-bold">{tier.price} QAR</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Add-ons list */}
              {packageAddOns.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border-level-1)]/50">
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono uppercase">{isAr ? "الإضافات:" : "Add-ons:"}</span>
                  {packageAddOns.map((addon: any) => (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => handleAddAddonItem(addon)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[var(--surface-default)] border border-[var(--border-level-1)] hover:border-emerald-500 text-[var(--text-secondary)] hover:text-emerald-400 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3 text-emerald-500" />
                      <span>{isAr ? (addon.titleAr || addon.titleEn) : addon.titleEn}</span>
                      <span className="font-mono text-emerald-500 font-bold">+{addon.price} QAR</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Line Items Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {isAr ? "بنود عرض السعر" : "Quotation Line Items"}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={addCustomItem} className="text-xs h-7 gap-1">
                <Plus className="w-3 h-3" />
                {isAr ? "إضافة بند مخصص" : "Add Line Item"}
              </Button>
            </div>

            <div className="space-y-2">
              {quoteForm.items.map((it, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={it.titleEn}
                      onChange={e => {
                        const next = [...quoteForm.items]
                        next[idx].titleEn = e.target.value
                        setQuoteForm({ ...quoteForm, items: next })
                      }}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                      placeholder="Item title / description"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      value={it.quantity}
                      onChange={e => {
                        const next = [...quoteForm.items]
                        next[idx].quantity = Math.max(1, parseInt(e.target.value) || 1)
                        setQuoteForm({ ...quoteForm, items: next })
                      }}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono text-center"
                      placeholder="Qty"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      value={it.unitPrice}
                      onChange={e => {
                        const next = [...quoteForm.items]
                        next[idx].unitPrice = Math.max(0, parseFloat(e.target.value) || 0)
                        setQuoteForm({ ...quoteForm, items: next })
                      }}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:border-[var(--color-primary)]"
                      placeholder="Unit Price"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                      {(it.quantity * it.unitPrice).toLocaleString()} QAR
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 text-[var(--text-tertiary)] hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Configuration */}
          <div className="p-4 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {isAr ? "تطبيق خصم تجاري أو ترويجي" : "Apply Proposal Discount"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuoteForm({ ...quoteForm, discountType: "FIXED" })}
                  className={cn(
                    "px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer",
                    quoteForm.discountType === "FIXED" ? "bg-[var(--color-primary)] text-white shadow-xs" : "bg-[var(--surface-default)] text-[var(--text-secondary)]"
                  )}
                >
                  Fixed (QAR)
                </button>
                <button
                  type="button"
                  onClick={() => setQuoteForm({ ...quoteForm, discountType: "PERCENTAGE" })}
                  className={cn(
                    "px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer",
                    quoteForm.discountType === "PERCENTAGE" ? "bg-[var(--color-primary)] text-white shadow-xs" : "bg-[var(--surface-default)] text-[var(--text-secondary)]"
                  )}
                >
                  Percentage (%)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {quoteForm.discountType === "PERCENTAGE" ? (
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] block mb-1">
                    {isAr ? "نسبة الخصم المئوية (%)" : "Discount Percentage (%)"}
                  </label>
                  <input
                    type="number"
                    value={quoteForm.discountPercent}
                    onChange={e => setQuoteForm({ ...quoteForm, discountPercent: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono font-bold text-rose-500"
                    placeholder="e.g. 15"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] block mb-1">
                    {isAr ? "مبلغ الخصم الثابت (QAR)" : "Fixed Discount Amount (QAR)"}
                  </label>
                  <input
                    type="number"
                    value={quoteForm.discountAmount}
                    onChange={e => setQuoteForm({ ...quoteForm, discountAmount: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs font-mono font-bold text-rose-500"
                    placeholder="e.g. 500"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">{isAr ? "إجمالي الخصم الفعلي:" : "Effective Discount:"}</span>
                <span className="font-mono font-bold text-rose-500">-{computedDiscount.toLocaleString()} QAR</span>
              </div>
            </div>
          </div>

          {/* Quotation Summary Card */}
          <div className="p-4 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs space-y-1 text-[var(--text-secondary)]">
              <div>Subtotal: <span className="font-mono text-[var(--text-primary)] font-bold">{subtotal.toLocaleString()} QAR</span></div>
              {computedDiscount > 0 && (
                <div>Discount: <span className="font-mono text-rose-500 font-bold">-{computedDiscount.toLocaleString()} QAR</span></div>
              )}
              <div>Required Deposit ({quoteForm.depositPercentage}%): <span className="font-mono text-amber-500 font-bold">{depositAmount.toLocaleString()} QAR</span></div>
            </div>
            <div className="text-end">
              <span className="text-[10px] text-[var(--text-tertiary)] block uppercase font-mono">Grand Total</span>
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{grandTotal.toLocaleString()} QAR</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)} className="text-xs">
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" size="sm" className="text-xs font-bold bg-[var(--color-primary)] text-white shadow-sm">
              {isAr ? "اعتماد وحفظ عرض السعر" : "Generate & Save Quotation"}
            </Button>
          </div>
        </form>
      )}

      {/* Quotations Table */}
      <div className="rounded-3xl border border-[var(--border-level-1)] bg-[var(--surface-default)] overflow-hidden shadow-sm">
        <table className="w-full text-start text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-level-1)] text-[var(--text-secondary)] font-mono uppercase text-[10px] bg-[var(--surface-hover)]/50">
              <th className="p-4 text-start">{isAr ? "رقم العرض" : "Quote Ref"}</th>
              <th className="p-4 text-start">{isAr ? "العميل / الجهة" : "Customer / Org"}</th>
              <th className="p-4 text-start">{isAr ? "المبلغ الإجمالي" : "Total Amount"}</th>
              <th className="p-4 text-start">{isAr ? "الدفعة المقدمة" : "Deposit"}</th>
              <th className="p-4 text-start">{isAr ? "الصلاحية" : "Valid Until"}</th>
              <th className="p-4 text-start">{isAr ? "الحالة" : "Status"}</th>
              <th className="p-4 text-end">{isAr ? "الإجراءات والمشاركة" : "Actions & Share"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-level-1)]">
            {quotations.map(quote => {
              const qNum = quote.quoteNumber || quote.referenceNumber || quote.id
              const totalVal = quote.grandTotal ?? quote.totalAmount ?? 0
              const depVal = quote.depositAmount ?? Math.round(totalVal * 0.5)

              return (
                <tr key={quote.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="p-4 font-mono font-bold text-[var(--color-primary)]">{qNum}</td>
                  <td className="p-4">
                    <div className="font-bold text-[var(--text-primary)]">{quote.customerName}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">{quote.companyOrOrg || quote.customerEmail}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[var(--text-primary)] text-sm">
                    {quote.currency || "QAR"} {totalVal.toLocaleString()}
                  </td>
                  <td className="p-4 font-mono font-semibold text-amber-500">
                    {depVal.toLocaleString()} QAR
                  </td>
                  <td className="p-4 text-[var(--text-secondary)] font-mono">
                    {new Date(quote.validUntil).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      quote.status === "SENT" ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30" :
                      quote.status === "ACCEPTED" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-[var(--surface-active)] text-[var(--text-secondary)] border border-[var(--border-level-1)]"
                    )}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="p-4 text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`/${locale}/packages/quote/${qNum}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-sky-500 rounded-lg cursor-pointer transition-colors"
                        title={isAr ? "عرض وتحميل PDF" : "View & Download PDF"}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => copyShareLink(quote)}
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-purple-500 rounded-lg cursor-pointer transition-colors"
                        title={isAr ? "نسخ رابط المشاركة" : "Copy Share Link"}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendEmail(quote)}
                        disabled={actionLoading === quote.id}
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-amber-500 rounded-lg cursor-pointer transition-colors"
                        title={isAr ? "إرسال العرض للعميل بالبريد" : "Email Quote to Customer"}
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyPaymentLink(quote)}
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-emerald-500 rounded-lg cursor-pointer transition-colors"
                        title={isAr ? "نسخ رابط الدفع المباشر" : "Copy Direct Payment Link"}
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewingQuote(quote)}
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg cursor-pointer transition-colors"
                        title={isAr ? "معاينة التفاصيل" : "Quick Preview"}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Quote Preview Modal */}
      {viewingQuote && (() => {
        const qNum = viewingQuote.quoteNumber || viewingQuote.referenceNumber || viewingQuote.id
        const totalVal = viewingQuote.grandTotal ?? viewingQuote.totalAmount ?? 0
        const depVal = viewingQuote.depositAmount ?? Math.round(totalVal * 0.5)

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-1)] p-6 sm:p-8 text-[var(--text-primary)] space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[var(--color-primary)] font-bold uppercase">E3 Qatar Experience Quotation</span>
                  <h3 className="text-xl font-bold">{viewingQuote.title || "Official Experience Proposal"}</h3>
                  <span className="font-mono text-xs text-[var(--text-tertiary)]">{qNum}</span>
                </div>
                <button onClick={() => setViewingQuote(null)} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-xl cursor-pointer">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[var(--text-tertiary)] block">Recipient</span>
                  <span className="font-bold text-[var(--text-primary)]">{viewingQuote.customerName}</span>
                  <div className="text-[var(--text-secondary)]">{viewingQuote.companyOrOrg}</div>
                </div>
                <div className="text-end">
                  <span className="text-[var(--text-tertiary)] block">Date Issued</span>
                  <span className="font-mono text-[var(--text-primary)]">{new Date(viewingQuote.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Items */}
              <div className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] overflow-hidden">
                <table className="w-full text-start text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-level-1)] text-[var(--text-tertiary)] font-mono text-[10px] bg-[var(--surface-hover)]/40">
                      <th className="p-3 text-start">Item</th>
                      <th className="p-3 text-start">Qty</th>
                      <th className="p-3 text-start">Unit Price</th>
                      <th className="p-3 text-end">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-level-1)]">
                    {viewingQuote.items?.map((it: any) => (
                      <tr key={it.id}>
                        <td className="p-3 text-[var(--text-primary)] font-semibold">{it.titleEn}</td>
                        <td className="p-3 font-mono">{it.quantity}</td>
                        <td className="p-3 font-mono">{it.unitPrice.toLocaleString()} QAR</td>
                        <td className="p-3 font-mono text-end font-bold text-emerald-600 dark:text-emerald-400">
                          {(it.totalPrice || it.lineTotal || it.unitPrice * it.quantity).toLocaleString()} QAR
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[var(--text-secondary)] block">Deposit Required (50%):</span>
                  <span className="font-mono font-bold text-amber-500">{depVal.toLocaleString()} QAR</span>
                </div>
                <div className="text-end">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono block">Grand Total</span>
                  <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{totalVal.toLocaleString()} QAR</span>
                </div>
              </div>

              {/* Action buttons inside preview */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`/${locale}/packages/quote/${qNum}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => copyShareLink(viewingQuote)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyPaymentLink(viewingQuote)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payment Link</span>
                  </button>
                </div>

                <Button onClick={() => setViewingQuote(null)} variant="outline" className="text-xs">
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
