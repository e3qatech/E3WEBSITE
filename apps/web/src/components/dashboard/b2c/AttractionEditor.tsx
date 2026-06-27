"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Save, 
  ArrowLeft,
  Settings,
  DollarSign,
  Tag,
  HelpCircle,
  Plus,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

export function AttractionEditor({ 
  initialData 
}: { 
  initialData?: any 
}) {
  const router = useRouter()
  const isEditing = !!initialData
  
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  
  // General Info
  const [nameEn, setNameEn] = useState(initialData?.nameEn || "")
  const [nameAr, setNameAr] = useState(initialData?.nameAr || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn || "")
  const [descriptionAr, setDescriptionAr] = useState(initialData?.descriptionAr || "")

  // Pricing
  const [pricing, setPricing] = useState<any[]>(initialData?.pricing || [])
  
  // FAQs
  const [faqs, setFaqs] = useState<any[]>(initialData?.faqs || [])

  const handleSave = async () => {
    if (!nameEn || !slug) return alert("English Name and Slug are required")
    
    setIsSaving(true)
    try {
      const payload = {
        nameEn,
        nameAr,
        slug,
        descriptionEn,
        descriptionAr,
        pricing,
        faqs
      }
      
      const url = isEditing 
        ? `/api/b2c/attractions/${initialData.id}/full` 
        : `/api/b2c/attractions`
        
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error("Failed to save")
      
      router.push("/dashboard/b2c/attractions")
      router.refresh()
    } catch (error) {
      alert("Error saving attraction")
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: "general", label: "General Info", icon: Settings },
    { id: "pricing", label: "Pricing Tiers", icon: DollarSign },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between bg-[var(--surface-default)] p-4 rounded-xl border border-[var(--border-default)] shadow-sm sticky top-6 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors text-[var(--text-secondary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {isEditing ? "Edit Attraction" : "New Attraction"}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">{nameEn || "Untitled"}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                  activeTab === tab.id 
                    ? "bg-[var(--color-primary)] text-white shadow-sm" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl shadow-sm p-6">
          
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-primary)]">Attraction Name (EN) *</label>
                  <input 
                    type="text" 
                    value={nameEn}
                    onChange={e => {
                      setNameEn(e.target.value)
                      if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
                    }}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                    placeholder="e.g., InflataPark FEC"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-primary)]">Attraction Name (AR)</label>
                  <input 
                    type="text" 
                    dir="rtl"
                    value={nameAr}
                    onChange={e => setNameAr(e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none font-arabic"
                    placeholder="إنفلاتا بارك"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-primary)]">URL Slug *</label>
                <input 
                  type="text" 
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none font-mono text-sm"
                  placeholder="inflatapark-fec"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-primary)]">Description (EN)</label>
                <textarea 
                  value={descriptionEn}
                  onChange={e => setDescriptionEn(e.target.value)}
                  rows={4}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none resize-y"
                  placeholder="Describe the attraction..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-primary)]">Description (AR)</label>
                <textarea 
                  dir="rtl"
                  value={descriptionAr}
                  onChange={e => setDescriptionAr(e.target.value)}
                  rows={4}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none resize-y font-arabic"
                  placeholder="وصف الفعالية..."
                />
              </div>
            </div>
          )}

          {/* PRICING TAB */}
          {activeTab === "pricing" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Pricing Tiers</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Define ticket prices and passes.</p>
                </div>
                <Button 
                  onClick={() => setPricing([...pricing, { id: Date.now().toString(), titleEn: "", titleAr: "", price: 0, currency: "QAR", type: "GENERAL" }])}
                  variant="outline" size="sm" className="gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Tier
                </Button>
              </div>

              {pricing.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-tertiary)]">
                  No pricing tiers defined.
                </div>
              ) : (
                <div className="space-y-4">
                  {pricing.map((tier, index) => (
                    <div key={tier.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] items-start">
                      <div className="md:col-span-4 space-y-2">
                        <input 
                          type="text" placeholder="Title (EN)" value={tier.titleEn}
                          onChange={e => {
                            const newP = [...pricing]; newP[index].titleEn = e.target.value; setPricing(newP);
                          }}
                          className="w-full bg-white dark:bg-neutral-900 border border-[var(--border-default)] rounded-md px-3 py-1.5 text-sm"
                        />
                        <input 
                          type="text" placeholder="Title (AR)" dir="rtl" value={tier.titleAr}
                          onChange={e => {
                            const newP = [...pricing]; newP[index].titleAr = e.target.value; setPricing(newP);
                          }}
                          className="w-full bg-white dark:bg-neutral-900 border border-[var(--border-default)] rounded-md px-3 py-1.5 text-sm font-arabic"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1.5 text-[var(--text-tertiary)] text-sm">QAR</span>
                          <input 
                            type="number" placeholder="0.00" value={tier.price}
                            onChange={e => {
                              const newP = [...pricing]; newP[index].price = parseFloat(e.target.value); setPricing(newP);
                            }}
                            className="w-full pl-12 bg-white dark:bg-neutral-900 border border-[var(--border-default)] rounded-md px-3 py-1.5 text-sm"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-4 space-y-2">
                        <select 
                          value={tier.type}
                          onChange={e => {
                            const newP = [...pricing]; newP[index].type = e.target.value; setPricing(newP);
                          }}
                          className="w-full bg-white dark:bg-neutral-900 border border-[var(--border-default)] rounded-md px-3 py-2 text-sm"
                        >
                          <option value="GENERAL">General Admission</option>
                          <option value="VIP">VIP</option>
                          <option value="GROUP">Group Pass</option>
                          <option value="FAMILY">Family Pass</option>
                        </select>
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <button 
                          onClick={() => setPricing(pricing.filter((_, i) => i !== index))}
                          className="p-2 text-[var(--color-error)] hover:bg-[#EF444415] rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FAQs TAB */}
          {activeTab === "faqs" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Frequently Asked Questions</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Manage bilingual FAQs for this attraction.</p>
                </div>
                <Button 
                  onClick={() => setFaqs([...faqs, { id: Date.now().toString(), questionEn: "", questionAr: "", answerEn: "", answerAr: "" }])}
                  variant="outline" size="sm" className="gap-2"
                >
                  <Plus className="w-4 h-4" /> Add FAQ
                </Button>
              </div>

              {faqs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-tertiary)]">
                  No FAQs added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={faq.id} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] space-y-4 relative">
                      <button 
                        onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                        className="absolute top-4 right-4 p-1.5 text-[var(--color-error)] hover:bg-[#EF444415] rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 pr-8 md:pr-0">
                          <input 
                            type="text" placeholder="Question (EN)" value={faq.questionEn}
                            onChange={e => { const n = [...faqs]; n[index].questionEn = e.target.value; setFaqs(n); }}
                            className="w-full bg-white dark:bg-neutral-900 border border-[var(--border-default)] rounded-md px-3 py-2 text-sm font-medium"
                          />
                          <textarea 
                            placeholder="Answer (EN)" value={faq.answerEn} rows={3}
                            onChange={e => { const n = [...faqs]; n[index].answerEn = e.target.value; setFaqs(n); }}
                            className="w-full bg-white dark:bg-neutral-900 border border-[var(--border-default)] rounded-md px-3 py-2 text-sm resize-none"
                          />
                        </div>
                        <div className="space-y-3">
                          <input 
                            type="text" placeholder="السؤال (AR)" dir="rtl" value={faq.questionAr}
                            onChange={e => { const n = [...faqs]; n[index].questionAr = e.target.value; setFaqs(n); }}
                            className="w-full bg-white dark:bg-neutral-900 border border-[var(--border-default)] rounded-md px-3 py-2 text-sm font-medium font-arabic"
                          />
                          <textarea 
                            placeholder="الجواب (AR)" dir="rtl" value={faq.answerAr} rows={3}
                            onChange={e => { const n = [...faqs]; n[index].answerAr = e.target.value; setFaqs(n); }}
                            className="w-full bg-white dark:bg-neutral-900 border border-[var(--border-default)] rounded-md px-3 py-2 text-sm resize-none font-arabic"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
