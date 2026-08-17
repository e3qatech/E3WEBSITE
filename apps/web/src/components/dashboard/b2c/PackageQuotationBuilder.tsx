"use client"

import { useState, useEffect } from "react"
import { Plus, FileText, Send, DollarSign, Trash2, Check, Download, Eye, Calendar, User } from "lucide-react"
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
    discountAmount: 0,
    depositPercentage: 50,
    notes: "",
    items: [
      {
        titleEn: initialLead?.package?.titleEn || "Base Package Admission",
        titleAr: initialLead?.package?.titleAr || "رسوم الباقة الأساسية",
        itemType: "PACKAGE_TIER",
        unitPrice: initialLead?.estimatedValue || 2500,
        quantity: 1,
        unit: "package"
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

  const addItem = () => {
    setQuoteForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          titleEn: "Additional Add-On Service",
          titleAr: "خدمة إضافية",
          itemType: "ADD_ON",
          unitPrice: 500,
          quantity: 1,
          unit: "item"
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

  const subtotal = quoteForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  const total = Math.max(0, subtotal - quoteForm.discountAmount)
  const deposit = (total * quoteForm.depositPercentage) / 100

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
          validUntil: validUntil.toISOString()
        })
      })

      if (!res.ok) throw new Error("Failed to generate quotation")

      setIsCreating(false)
      fetchQuotations()
    } catch {
      alert("Failed to generate quotation")
    }
  }

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">
            {isAr ? "منشئ عروض الأسعار الرسمية (Quotations Hub)" : "Official Package Quotations & Proposals"}
          </h3>
          <p className="text-xs text-slate-400">
            {isAr ? "إنشاء عروض أسعار تفصيلية لعملاء الشركات والمدارس وحفلات VIP وحساب الدفعة المقدمة." : "Build modular quotations with dynamic line items, discount rules, and deposit schedules."}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsCreating(true)}
          className="gap-1.5 text-xs bg-emerald-500 text-slate-950 font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إنشاء عرض سعر جديد" : "Create Quotation"}
        </Button>
      </div>

      {/* Create Quote Form */}
      {isCreating && (
        <form onSubmit={handleSaveQuote} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h4 className="text-sm font-bold text-white">New E3 Package Quotation</h4>
            <span className="text-xs font-mono font-bold text-emerald-400">Auto-calculated</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={quoteForm.customerName}
                onChange={e => setQuoteForm({ ...quoteForm, customerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Company / School</label>
              <input
                type="text"
                value={quoteForm.companyOrOrg}
                onChange={e => setQuoteForm({ ...quoteForm, companyOrOrg: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Customer Email</label>
              <input
                type="email"
                value={quoteForm.customerEmail}
                onChange={e => setQuoteForm({ ...quoteForm, customerEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Base Package</label>
              <select
                value={quoteForm.packageId}
                onChange={e => setQuoteForm({ ...quoteForm, packageId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">Custom Package (No fixed base)</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>{p.titleEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Validity (Days)</label>
              <input
                type="number"
                value={quoteForm.validDays}
                onChange={e => setQuoteForm({ ...quoteForm, validDays: parseInt(e.target.value) || 7 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Discount Amount (QAR)</label>
              <input
                type="number"
                value={quoteForm.discountAmount}
                onChange={e => setQuoteForm({ ...quoteForm, discountAmount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Quotation Line Items</span>
              <Button type="button" size="sm" variant="outline" onClick={addItem} className="text-xs h-7 gap-1">
                <Plus className="w-3 h-3" />
                Add Line Item
              </Button>
            </div>

            <div className="space-y-2">
              {quoteForm.items.map((it, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={it.titleEn}
                      onChange={e => {
                        const next = [...quoteForm.items]
                        next[idx].titleEn = e.target.value
                        setQuoteForm({ ...quoteForm, items: next })
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      placeholder="Item description"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      value={it.quantity}
                      onChange={e => {
                        const next = [...quoteForm.items]
                        next[idx].quantity = parseInt(e.target.value) || 1
                        setQuoteForm({ ...quoteForm, items: next })
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      placeholder="Qty"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      value={it.unitPrice}
                      onChange={e => {
                        const next = [...quoteForm.items]
                        next[idx].unitPrice = parseFloat(e.target.value) || 0
                        setQuoteForm({ ...quoteForm, items: next })
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-emerald-400 font-bold"
                      placeholder="Unit Price"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">
                      {(it.quantity * it.unitPrice).toLocaleString()} QAR
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quotation Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs space-y-1 text-slate-400">
              <div>Subtotal: <span className="font-mono text-white">{subtotal.toLocaleString()} QAR</span></div>
              <div>Discount: <span className="font-mono text-rose-400">-{quoteForm.discountAmount.toLocaleString()} QAR</span></div>
              <div>Required Deposit ({quoteForm.depositPercentage}%): <span className="font-mono text-amber-400 font-bold">{deposit.toLocaleString()} QAR</span></div>
            </div>
            <div className="text-end">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Grand Total</span>
              <span className="text-2xl font-black font-mono text-emerald-400">{total.toLocaleString()} QAR</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs font-bold bg-emerald-500 text-slate-950">
              Generate & Save Quotation
            </Button>
          </div>
        </form>
      )}

      {/* Quotations Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-start text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <th className="p-4 text-start">Quote Ref</th>
              <th className="p-4 text-start">Customer / Organization</th>
              <th className="p-4 text-start">Total Amount</th>
              <th className="p-4 text-start">Valid Until</th>
              <th className="p-4 text-start">Status</th>
              <th className="p-4 text-end">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {quotations.map(quote => (
              <tr key={quote.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-mono font-bold text-emerald-400">{quote.referenceNumber}</td>
                <td className="p-4">
                  <div className="font-bold text-white">{quote.customerName}</div>
                  <div className="text-[11px] text-slate-400">{quote.companyOrOrg || quote.customerEmail}</div>
                </td>
                <td className="p-4 font-mono font-bold text-white text-sm">
                  {quote.currency} {quote.totalAmount.toLocaleString()}
                </td>
                <td className="p-4 text-slate-400 font-mono">
                  {new Date(quote.validUntil).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    quote.status === "SENT" ? "bg-sky-500/15 text-sky-400" :
                    quote.status === "ACCEPTED" ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-800 text-slate-400"
                  )}>
                    {quote.status}
                  </span>
                </td>
                <td className="p-4 text-end">
                  <button
                    onClick={() => setViewingQuote(quote)}
                    className="p-1.5 text-slate-400 hover:text-white"
                    title="View Quotation"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quote Preview Modal */}
      {viewingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 p-8 text-white space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">E3 Qatar Experience Quotation</span>
                <h3 className="text-xl font-bold">{viewingQuote.title}</h3>
                <span className="font-mono text-xs text-slate-400">{viewingQuote.referenceNumber}</span>
              </div>
              <button onClick={() => setViewingQuote(null)} className="p-2 text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Recipient</span>
                <span className="font-bold text-white">{viewingQuote.customerName}</span>
                <div className="text-slate-400">{viewingQuote.companyOrOrg}</div>
              </div>
              <div className="text-end">
                <span className="text-slate-500 block">Date Issued</span>
                <span className="font-mono text-white">{new Date(viewingQuote.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Items */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px]">
                    <th className="p-3 text-start">Item</th>
                    <th className="p-3 text-start">Qty</th>
                    <th className="p-3 text-start">Unit Price</th>
                    <th className="p-3 text-end">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {viewingQuote.items?.map((it: any) => (
                    <tr key={it.id}>
                      <td className="p-3 text-white font-semibold">{it.titleEn}</td>
                      <td className="p-3 font-mono">{it.quantity}</td>
                      <td className="p-3 font-mono">{it.unitPrice.toLocaleString()} QAR</td>
                      <td className="p-3 font-mono text-end font-bold text-emerald-400">{it.lineTotal.toLocaleString()} QAR</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Total Proposal Value:</span>
              <span className="text-xl font-black font-mono text-emerald-400">{viewingQuote.totalAmount.toLocaleString()} QAR</span>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setViewingQuote(null)} className="text-xs bg-slate-800 text-white">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
