"use client"

import { useState } from "react"
import { Save, CheckCircle2, Image as ImageIcon, Video, Box, MonitorPlay, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

export function B2CLandingCMSView({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(false)
  
  const [data, setData] = useState({
    hero: {
      mediaType: initialData?.hero?.mediaType || "IMAGE",
      mediaUrl: initialData?.hero?.mediaUrl || "",
      headerEn: initialData?.hero?.headerEn || "Discover Experiences",
      headerAr: initialData?.hero?.headerAr || "اكتشف التجارب",
      subHeaderEn: initialData?.hero?.subHeaderEn || "Explore Qatar's most exciting attractions, powered by real-time telemetry and industrial precision.",
      subHeaderAr: initialData?.hero?.subHeaderAr || "استكشف أروع مناطق الجذب في قطر",
      showSearch: initialData?.hero?.showSearch ?? true
    },
    featuredTitleEn: initialData?.featuredTitleEn || "Featured Attractions",
    featuredTitleAr: initialData?.featuredTitleAr || "مناطق الجذب المميزة",
    gridTitleEn: initialData?.gridTitleEn || "All Experiences",
    gridTitleAr: initialData?.gridTitleAr || "جميع التجارب",
    subscribe: {
      titleEn: initialData?.subscribe?.titleEn || "Never Miss the Fun!",
      titleAr: initialData?.subscribe?.titleAr || "لا تفوت المرح!",
      subtitleEn: initialData?.subscribe?.subtitleEn || "Subscribe to get exclusive access to early-bird tickets and announcements for our next big pop-up park.",
      subtitleAr: initialData?.subscribe?.subtitleAr || "اشترك للحصول على وصول حصري",
    },
    cta: {
      titleEn: initialData?.cta?.titleEn || "Have a question?",
      titleAr: initialData?.cta?.titleAr || "هل لديك سؤال؟",
      buttonTextEn: initialData?.cta?.buttonTextEn || "Contact Us",
      buttonTextAr: initialData?.cta?.buttonTextAr || "اتصل بنا",
      buttonUrl: initialData?.cta?.buttonUrl || "/contact"
    },
    faqs: initialData?.faqs || []
  })

  const handleChange = (section: keyof typeof data, field: string, value: any) => {
    setData(prev => {
      if (typeof prev[section] === 'object' && prev[section] !== null && !Array.isArray(prev[section])) {
        return {
          ...prev,
          [section]: {
            ...prev[section] as any,
            [field]: value
          }
        }
      }
      return { ...prev, [section]: value }
    })
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

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "B2C_LANDING_PAGE", value: data, type: "B2C" })
      })
      setToast(true)
      setTimeout(() => setToast(false), 3000)
      router.refresh()
    } catch (error) {
      console.error("Failed to save settings", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-[1200px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">B2C Landing Page CMS</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage the hero section, subscriptions, FAQs, and layout settings.</p>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      {toast && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Landing page settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Hero Section</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">Background Media Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'IMAGE', icon: ImageIcon, label: 'Image' },
                    { id: 'VIDEO', icon: Video, label: 'Video' },
                    { id: 'MODEL_3D', icon: Box, label: '3D Model' },
                    { id: 'IFRAME', icon: MonitorPlay, label: 'Iframe' },
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleChange('hero', 'mediaType', type.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border ${
                        data.hero.mediaType === type.id 
                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]' 
                        : 'bg-[var(--surface-hover)] border-[var(--border-default)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <type.icon size={20} className="mb-1" />
                      <span className="text-[10px] font-bold">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Media URL</label>
                <input 
                  type="text" 
                  value={data.hero.mediaUrl} 
                  onChange={e => handleChange("hero", "mediaUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Header (En)</label>
                  <input 
                    type="text" 
                    value={data.hero.headerEn} 
                    onChange={e => handleChange("hero", "headerEn", e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Header (Ar)</label>
                  <input 
                    type="text" 
                    value={data.hero.headerAr} 
                    onChange={e => handleChange("hero", "headerAr", e.target.value)}
                    dir="rtl"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Sub-Header (En)</label>
                  <textarea 
                    value={data.hero.subHeaderEn} 
                    onChange={e => handleChange("hero", "subHeaderEn", e.target.value)}
                    className="w-full h-20 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Sub-Header (Ar)</label>
                  <textarea 
                    value={data.hero.subHeaderAr} 
                    onChange={e => handleChange("hero", "subHeaderAr", e.target.value)}
                    dir="rtl"
                    className="w-full h-20 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none text-right"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 bg-[var(--surface-hover)] rounded-xl border border-[var(--border-default)]">
                <input 
                  type="checkbox" 
                  checked={data.hero.showSearch}
                  onChange={e => handleChange("hero", "showSearch", e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm font-bold text-[var(--text-primary)]">Show Search Bar in Hero</span>
              </label>
            </div>
          </div>

          {/* Titles Section */}
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Section Titles</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Featured Title (En)</label>
                  <input 
                    type="text" 
                    value={data.featuredTitleEn} 
                    onChange={e => handleSimpleChange("featuredTitleEn", e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Featured Title (Ar)</label>
                  <input 
                    type="text" 
                    value={data.featuredTitleAr} 
                    onChange={e => handleSimpleChange("featuredTitleAr", e.target.value)}
                    dir="rtl"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-right"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Grid Title (En)</label>
                  <input 
                    type="text" 
                    value={data.gridTitleEn} 
                    onChange={e => handleSimpleChange("gridTitleEn", e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Grid Title (Ar)</label>
                  <input 
                    type="text" 
                    value={data.gridTitleAr} 
                    onChange={e => handleSimpleChange("gridTitleAr", e.target.value)}
                    dir="rtl"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-right"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Subscribe Section */}
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Subscribe Section</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Title (En)</label>
                  <input 
                    type="text" 
                    value={data.subscribe.titleEn} 
                    onChange={e => handleChange("subscribe", "titleEn", e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Title (Ar)</label>
                  <input 
                    type="text" 
                    value={data.subscribe.titleAr} 
                    onChange={e => handleChange("subscribe", "titleAr", e.target.value)}
                    dir="rtl"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-right"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Subtitle (En)</label>
                  <textarea 
                    value={data.subscribe.subtitleEn} 
                    onChange={e => handleChange("subscribe", "subtitleEn", e.target.value)}
                    className="w-full h-20 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Subtitle (Ar)</label>
                  <textarea 
                    value={data.subscribe.subtitleAr} 
                    onChange={e => handleChange("subscribe", "subtitleAr", e.target.value)}
                    dir="rtl"
                    className="w-full h-20 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none text-right"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">CTA Section</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Title (En)</label>
                  <input 
                    type="text" 
                    value={data.cta.titleEn} 
                    onChange={e => handleChange("cta", "titleEn", e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Title (Ar)</label>
                  <input 
                    type="text" 
                    value={data.cta.titleAr} 
                    onChange={e => handleChange("cta", "titleAr", e.target.value)}
                    dir="rtl"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-right"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Button Text (En)</label>
                  <input 
                    type="text" 
                    value={data.cta.buttonTextEn} 
                    onChange={e => handleChange("cta", "buttonTextEn", e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Button Text (Ar)</label>
                  <input 
                    type="text" 
                    value={data.cta.buttonTextAr} 
                    onChange={e => handleChange("cta", "buttonTextAr", e.target.value)}
                    dir="rtl"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-right"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Button URL</label>
                <input 
                  type="text" 
                  value={data.cta.buttonUrl} 
                  onChange={e => handleChange("cta", "buttonUrl", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">FAQs</h2>
              <Button onClick={addFaq} variant="outline" size="sm" className="h-8">
                <Plus className="w-4 h-4 mr-1" /> Add FAQ
              </Button>
            </div>
            
            <div className="space-y-6">
              {data.faqs.map((faq: any, index: number) => (
                <div key={index} className="p-4 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl relative">
                  <button 
                    onClick={() => removeFaq(index)}
                    className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-500/10 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Question (En)</label>
                        <input 
                          type="text" 
                          value={faq.questionEn} 
                          onChange={e => handleFaqChange(index, "questionEn", e.target.value)}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Question (Ar)</label>
                        <input 
                          type="text" 
                          value={faq.questionAr} 
                          onChange={e => handleFaqChange(index, "questionAr", e.target.value)}
                          dir="rtl"
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-right"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Answer (En)</label>
                        <textarea 
                          value={faq.answerEn} 
                          onChange={e => handleFaqChange(index, "answerEn", e.target.value)}
                          className="w-full h-16 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Answer (Ar)</label>
                        <textarea 
                          value={faq.answerAr} 
                          onChange={e => handleFaqChange(index, "answerAr", e.target.value)}
                          dir="rtl"
                          className="w-full h-16 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none text-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {data.faqs.length === 0 && (
                <div className="text-center py-6 text-[var(--text-tertiary)] text-sm">
                  No FAQs added yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
