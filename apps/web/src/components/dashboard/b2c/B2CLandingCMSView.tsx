"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminMediaPicker } from "../ui/AdminMediaPicker"
import { AdminButton } from "../ui/AdminButton"
import { Plus, Trash2, Box, MonitorPlay } from "lucide-react"
import { useToast } from "@/components/dashboard/ui/ToastProvider"

export function B2CLandingCMSView({ initialData }: { initialData: any }) {
  const [data, setData] = useState({
    hero: {
      mediaType: initialData?.hero?.mediaType || "IMAGE",
      mediaUrl: initialData?.hero?.mediaUrl || "",
      headerEn: initialData?.hero?.headerEn || "",
      headerAr: initialData?.hero?.headerAr || "",
      subHeaderEn: initialData?.hero?.subHeaderEn || "",
      subHeaderAr: initialData?.hero?.subHeaderAr || "",
      showSearch: initialData?.hero?.showSearch ?? true
    },
    featuredTitleEn: initialData?.featuredTitleEn || "",
    featuredTitleAr: initialData?.featuredTitleAr || "",
    gridTitleEn: initialData?.gridTitleEn || "",
    gridTitleAr: initialData?.gridTitleAr || "",
    subscribe: {
      titleEn: initialData?.subscribe?.titleEn || "",
      titleAr: initialData?.subscribe?.titleAr || "",
      subtitleEn: initialData?.subscribe?.subtitleEn || "",
      subtitleAr: initialData?.subscribe?.subtitleAr || "",
    },
    cta: {
      titleEn: initialData?.cta?.titleEn || "",
      titleAr: initialData?.cta?.titleAr || "",
      buttonTextEn: initialData?.cta?.buttonTextEn || "",
      buttonTextAr: initialData?.cta?.buttonTextAr || "",
      buttonUrl: initialData?.cta?.buttonUrl || ""
    },
    careersCta: {
      titleEn: initialData?.careersCta?.titleEn || "",
      titleAr: initialData?.careersCta?.titleAr || "",
      subtitleEn: initialData?.careersCta?.subtitleEn || "",
      subtitleAr: initialData?.careersCta?.subtitleAr || "",
      buttonTextEn: initialData?.careersCta?.buttonTextEn || "",
      buttonTextAr: initialData?.careersCta?.buttonTextAr || "",
      buttonUrl: initialData?.careersCta?.buttonUrl || ""
    },
    faqs: initialData?.faqs || []
  })

  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data })
      })
      if (!res.ok) throw new Error("Failed to save")
      toast("B2C Landing Page updated successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save B2C Landing Page.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (section: keyof typeof data, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }))
  }

  const handleSimpleChange = (field: keyof typeof data, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleFaqChange = (index: number, field: string, value: string) => {
    setData(prev => {
      const newFaqs = [...prev.faqs]
      newFaqs[index] = { ...newFaqs[index], [field]: value }
      return { ...prev, faqs: newFaqs }
    })
  }

  const addFaq = () => {
    setData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { questionEn: "", questionAr: "", answerEn: "", answerAr: "" }]
    }))
  }

  const removeFaq = (index: number) => {
    setData(prev => {
      const newFaqs = [...prev.faqs]
      newFaqs.splice(index, 1)
      return { ...prev, faqs: newFaqs }
    })
  }

  return (
    <div className="flex flex-col gap-6 h-full p-6 max-w-6xl mx-auto">
      <AdminPageHeader 
        title="B2C Landing Page"
        description="Manage the content for the main consumer portal."
        action={
          <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </AdminButton>
        }
      />

      <AdminFormLayout>
        {/* Hero Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Hero Section</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Background Media Type</label>
              <div className="flex gap-4">
                <select
                  value={data.hero.mediaType}
                  onChange={e => handleChange('hero', 'mediaType', e.target.value)}
                  className="w-1/3 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="IMAGE">Image / Media ID</option>
                  <option value="IFRAME">External iFrame</option>
                  <option value="MODEL_3D">3D Model (.glb / .gltf)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Media</label>
              {(data.hero.mediaType === 'IFRAME' || data.hero.mediaType === 'MODEL_3D') ? (
                <input 
                  type="text" 
                  value={data.hero.mediaUrl || ''} 
                  onChange={e => handleChange("hero", "mediaUrl", e.target.value)} 
                  placeholder="https://my.spline.design/..." 
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              ) : (
                <AdminMediaPicker 
                  value={data.hero.mediaUrl}
                  onChange={url => handleChange('hero', 'mediaUrl', url)}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border-default">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Header (En)</label>
                <input 
                  type="text" 
                  value={data.hero.headerEn}
                  onChange={e => handleChange('hero', 'headerEn', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Header (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.hero.headerAr}
                  onChange={e => handleChange('hero', 'headerAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Sub-Header (En)</label>
                <textarea 
                  value={data.hero.subHeaderEn}
                  onChange={e => handleChange('hero', 'subHeaderEn', e.target.value)}
                  className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Sub-Header (Ar)</label>
                <textarea 
                  dir="rtl"
                  value={data.hero.subHeaderAr}
                  onChange={e => handleChange('hero', 'subHeaderAr', e.target.value)}
                  className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-4 bg-surface-hover rounded-xl border border-border-default">
              <input 
                type="checkbox" 
                checked={data.hero.showSearch}
                onChange={e => handleChange("hero", "showSearch", e.target.checked)}
                className="w-5 h-5 rounded border-border-default text-primary focus:ring-primary"
              />
              <span className="text-sm font-bold text-text-primary">Show Search Bar in Hero</span>
            </label>
          </div>
        </div>

        {/* Section Titles */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Section Titles</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Featured Title (En)</label>
              <input 
                type="text" 
                value={data.featuredTitleEn}
                onChange={e => handleSimpleChange('featuredTitleEn', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Featured Title (Ar)</label>
              <input 
                type="text" 
                dir="rtl"
                value={data.featuredTitleAr}
                onChange={e => handleSimpleChange('featuredTitleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Grid Title (En)</label>
              <input 
                type="text" 
                value={data.gridTitleEn}
                onChange={e => handleSimpleChange('gridTitleEn', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Grid Title (Ar)</label>
              <input 
                type="text" 
                dir="rtl"
                value={data.gridTitleAr}
                onChange={e => handleSimpleChange('gridTitleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Subscribe Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Subscribe Section</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
              <input 
                type="text" 
                value={data.subscribe.titleEn}
                onChange={e => handleChange('subscribe', 'titleEn', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
              <input 
                type="text" 
                dir="rtl"
                value={data.subscribe.titleAr}
                onChange={e => handleChange('subscribe', 'titleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (En)</label>
              <textarea 
                value={data.subscribe.subtitleEn}
                onChange={e => handleChange('subscribe', 'subtitleEn', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (Ar)</label>
              <textarea 
                dir="rtl"
                value={data.subscribe.subtitleAr}
                onChange={e => handleChange('subscribe', 'subtitleAr', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">CTA Section</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
              <input 
                type="text" 
                value={data.cta.titleEn}
                onChange={e => handleChange('cta', 'titleEn', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
              <input 
                type="text" 
                dir="rtl"
                value={data.cta.titleAr}
                onChange={e => handleChange('cta', 'titleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button Text (En)</label>
              <input 
                type="text" 
                value={data.cta.buttonTextEn}
                onChange={e => handleChange('cta', 'buttonTextEn', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button Text (Ar)</label>
              <input 
                type="text" 
                dir="rtl"
                value={data.cta.buttonTextAr}
                onChange={e => handleChange('cta', 'buttonTextAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button URL</label>
              <input 
                type="text" 
                value={data.cta.buttonUrl}
                onChange={e => handleChange('cta', 'buttonUrl', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-primary">FAQs</h2>
            <button 
              onClick={addFaq}
              className="px-4 py-2 bg-surface-hover border border-border-default text-text-primary rounded-lg text-sm font-bold flex items-center hover:bg-surface-active"
            >
              <Plus size={16} className="mr-2" />
              Add FAQ
            </button>
          </div>
          
          <div className="space-y-4">
            {data.faqs.map((faq: any, idx: number) => (
              <div key={idx} className="p-4 bg-surface-hover border border-border-default rounded-lg relative">
                <button 
                  onClick={() => removeFaq(idx)}
                  className="absolute top-4 right-4 p-2 text-text-tertiary hover:text-error hover:bg-error/10 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-2 gap-4 pr-12">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Question (En)</label>
                    <input 
                      type="text" 
                      value={faq.questionEn}
                      onChange={e => handleFaqChange(idx, 'questionEn', e.target.value)}
                      className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Question (Ar)</label>
                    <input 
                      type="text" 
                      dir="rtl"
                      value={faq.questionAr}
                      onChange={e => handleFaqChange(idx, 'questionAr', e.target.value)}
                      className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Answer (En)</label>
                    <textarea 
                      value={faq.answerEn}
                      onChange={e => handleFaqChange(idx, 'answerEn', e.target.value)}
                      className="w-full h-20 bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Answer (Ar)</label>
                    <textarea 
                      dir="rtl"
                      value={faq.answerAr}
                      onChange={e => handleFaqChange(idx, 'answerAr', e.target.value)}
                      className="w-full h-20 bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
            {data.faqs.length === 0 && (
              <div className="text-center py-8 text-text-tertiary text-sm">
                No FAQs added.
              </div>
            )}
          </div>
        </div>

      </AdminFormLayout>
    </div>
  )
}
