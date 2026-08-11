"use client"

import { Button } from "@/components/ui/Button"
import { CheckCircle2, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { AdminSeoCustomizer } from "../ui/AdminSeoCustomizer"
import { DEFAULT_UNIVERSAL_MEDIA, UniversalMediaConfig, UniversalMediaSectionEditor } from "../ui/UniversalMediaSectionEditor"

type PageSettings = {
  title: string
  tagline: string
  heroMediaType: string
  heroMediaUrl: string
  heroMedia?: UniversalMediaConfig
  footerMedia?: UniversalMediaConfig
  seo?: any
}

type GeneralFaq = {
  id: string
  questionEn: string
  answerEn: string
}

export function ContactPageManager() {
  const [activeTab, setActiveTab] = useState<"HERO" | "FAQS" | "SEO">("HERO")
  const [, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [_uploading, _setUploading] = useState(false)

  const [pageSettings, setPageSettings] = useState<PageSettings>({
    title: "How Can We Help?",
    tagline: "Need support with a ticket, want to leave feedback, or just have a general question? We're here for you.",
    heroMediaType: "IMAGE",
    heroMediaUrl: "",
    heroMedia: { ...DEFAULT_UNIVERSAL_MEDIA, mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=1200&auto=format&fit=crop' },
    footerMedia: { ...DEFAULT_UNIVERSAL_MEDIA, mediaType: 'VIDEO', mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4' },
    seo: {}
  })

  const [faqs, setFaqs] = useState<GeneralFaq[]>([])
  const [newFaq, setNewFaq] = useState({ questionEn: "", answerEn: "" })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/b2c/contact-settings")
        if (res.ok) {
          const data = await res.json()
          if (data.pageSettings && Object.keys(data.pageSettings).length > 0) {
            setPageSettings(prev => ({ ...prev, ...data.pageSettings }))
          }
          if (data.faqs) {
            setFaqs(data.faqs)
          }
        }
      } catch (error) {
        console.error("Failed to load settings", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      const res = await fetch("/api/b2c/contact-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageSettings, faqs })
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Error saving settings", error)
      alert("Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  const handleAddFaq = () => {
    if (!newFaq.questionEn || !newFaq.answerEn) return
    setFaqs([...faqs, { ...newFaq, id: Date.now().toString() }])
    setNewFaq({ questionEn: "", answerEn: "" })
  }

  const handleDeleteFaq = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id))
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 text-[var(--text-primary)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-level-1)] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Contact Page Settings</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage the hero content, universal media, and general FAQs for the B2C Contact Page.</p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white gap-2 rounded-xl px-5 py-2.5 font-bold cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <div className="flex items-center gap-4 border-b border-[var(--border-level-1)]">
        <button
          onClick={() => setActiveTab("HERO")}
          className={`pb-3 px-3 font-bold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "HERO"
              ? "border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Hero & Media Settings
        </button>
        <button
          onClick={() => setActiveTab("FAQS")}
          className={`pb-3 px-3 font-bold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "FAQS"
              ? "border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          General FAQs
        </button>
        <button
          onClick={() => setActiveTab("SEO")}
          className={`pb-3 px-3 font-bold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "SEO"
              ? "border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          SEO Settings
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center gap-2 text-sm font-bold">
          <CheckCircle2 className="w-5 h-5" />
          Settings saved successfully!
        </div>
      )}

      {/* Hero Settings Content */}
      {activeTab === "HERO" && (
        <div className="space-y-6">
          <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-level-1)] p-6 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-primary)]">Heading Title</label>
                <input
                  type="text"
                  value={pageSettings.title}
                  onChange={e => setPageSettings({ ...pageSettings, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-tertiary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-primary)]">Sub-heading (Tagline)</label>
                <textarea
                  value={pageSettings.tagline}
                  onChange={e => setPageSettings({ ...pageSettings, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-[var(--text-primary)] resize-none h-24 focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-tertiary)]"
                />
              </div>
            </div>
          </div>

          <UniversalMediaSectionEditor
            title="Contact Hero Media"
            subtitle="Universal hero media supporting Image, Video, 3D Canvas, IFrame Embeds, and Fallback Images."
            value={pageSettings.heroMedia || { mediaType: 'IMAGE', mediaUrl: pageSettings.heroMediaUrl }}
            onChange={(heroMedia: UniversalMediaConfig) => setPageSettings(prev => ({ ...prev, heroMedia, heroMediaUrl: heroMedia.mediaUrl }))}
            accentColor="amber"
          />

          <UniversalMediaSectionEditor
            title="Contact Footer Banner Media"
            subtitle="Universal footer media supporting Image, Video, 3D Canvas, IFrame Embeds, and Fallback Images."
            value={pageSettings.footerMedia || { mediaType: 'VIDEO', mediaUrl: '' }}
            onChange={(footerMedia: UniversalMediaConfig) => setPageSettings(prev => ({ ...prev, footerMedia }))}
            accentColor="indigo"
          />
        </div>
      )}

      {/* General FAQs Tab */}
      {activeTab === "FAQS" && (
        <div className="space-y-6">
          <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-level-1)] p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-[var(--text-primary)]">Add New FAQ</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Question (English)</label>
                <input
                  type="text"
                  value={newFaq.questionEn}
                  onChange={e => setNewFaq({ ...newFaq, questionEn: e.target.value })}
                  placeholder="e.g. What are your opening hours?"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-tertiary)] text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Answer (English)</label>
                <textarea
                  value={newFaq.answerEn}
                  onChange={e => setNewFaq({ ...newFaq, answerEn: e.target.value })}
                  placeholder="Provide detailed answer..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-[var(--text-primary)] resize-none h-20 focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-tertiary)] text-xs"
                />
              </div>
              <Button
                onClick={handleAddFaq}
                disabled={!newFaq.questionEn || !newFaq.answerEn}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4 me-1" /> Add FAQ Item
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Configured FAQs ({faqs.length})</h3>
            {faqs.map(faq => (
              <div key={faq.id} className="p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-default)] flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-xs text-[var(--text-primary)]">{faq.questionEn}</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{faq.answerEn}</p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="text-[var(--text-tertiary)] hover:text-rose-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === "SEO" && (
        <AdminSeoCustomizer
          formData={pageSettings}
          setFormData={setPageSettings}
          seo={pageSettings.seo}
          setSeo={(seoData: any) => setPageSettings((prev: PageSettings) => ({ ...prev, seo: seoData }))}
        />
      )}
    </div>
  )
}
