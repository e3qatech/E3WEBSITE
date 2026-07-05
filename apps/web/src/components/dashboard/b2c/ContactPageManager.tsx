"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Save, CheckCircle2, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/Button"

type PageSettings = {
  title: string
  tagline: string
  heroMediaType: string
  heroMediaUrl: string
}

type GeneralFaq = {
  id: string
  questionEn: string
  answerEn: string
}

export function ContactPageManager() {
  const [activeTab, setActiveTab] = useState<"HERO" | "FAQS">("HERO")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [pageSettings, setPageSettings] = useState<PageSettings>({
    title: "How Can We Help?",
    tagline: "Need support with a ticket, want to leave feedback, or just have a general question? We're here for you.",
    heroMediaType: "IMAGE",
    heroMediaUrl: ""
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const file = target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setPageSettings(prev => ({ ...prev, heroMediaUrl: data.url }))
      } else {
        alert("Upload failed: " + data.error)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload file.")
    } finally {
      setUploading(false)
      if (target) {
        target.value = ""
      }
    }
  }

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
    const faqToAdd = {
      id: Math.random().toString(36).substring(7),
      ...newFaq
    }
    setFaqs([...faqs, faqToAdd])
    setNewFaq({ questionEn: "", answerEn: "" })
  }

  const handleDeleteFaq = (id: string) => {
    if (!confirm("Delete this FAQ?")) return
    setFaqs(faqs.filter(f => f.id !== id))
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Contact Page Settings</h1>
          <p className="text-[var(--text-secondary)]">Manage the hero content and general FAQs for the B2C Contact Page.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving} className="shrink-0 flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex items-center gap-4 border-b border-[var(--border-default)]">
        <button
          onClick={() => setActiveTab("HERO")}
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${activeTab === "HERO" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-white"}`}
        >
          Hero Settings
        </button>
        <button
          onClick={() => setActiveTab("FAQS")}
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${activeTab === "FAQS" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-white"}`}
        >
          General FAQs
        </button>
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Settings saved successfully!
        </div>
      )}

      {/* Hero Settings Content */}
      {activeTab === "HERO" && (
        <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-primary)]">Heading Title</label>
                  <input
                    type="text"
                    value={pageSettings.title}
                    onChange={e => setPageSettings({ ...pageSettings, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-primary)]">Sub-heading (Tagline)</label>
                  <textarea
                    value={pageSettings.tagline}
                    onChange={e => setPageSettings({ ...pageSettings, tagline: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white resize-none h-24"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-primary)]">Background Media Type</label>
                  <select
                    value={pageSettings.heroMediaType}
                    onChange={e => setPageSettings({ ...pageSettings, heroMediaType: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="MODEL_3D">3D Model / Spline</option>
                    <option value="IFRAME">Iframe Embed</option>
                    <option value="LOTTIE">Lottie Animation</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-primary)]">Media URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={pageSettings.heroMediaUrl}
                      onChange={e => setPageSettings({ ...pageSettings, heroMediaUrl: e.target.value })}
                      className="flex-1 px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
                    />
                    <label className="shrink-0 flex items-center justify-center px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl cursor-pointer transition-colors relative">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span className="ms-2 font-bold text-sm">{uploading ? 'Uploading...' : 'Upload'}</span>
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Note: Make sure to click "Save Changes" after editing to apply the settings to the frontend.</p>
            </div>
        </div>
      )}

      {/* FAQs Settings Content */}
      {activeTab === "FAQS" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-6">
            <h2 className="text-lg font-bold text-white mb-4">Add General FAQ</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400">Question</label>
                <input
                  type="text"
                  placeholder="e.g. How do I get a refund?"
                  value={newFaq.questionEn}
                  onChange={e => setNewFaq({ ...newFaq, questionEn: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400">Answer</label>
                <textarea
                  placeholder="Provide the answer..."
                  value={newFaq.answerEn}
                  onChange={e => setNewFaq({ ...newFaq, answerEn: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white resize-none h-24"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleAddFaq} disabled={!newFaq.questionEn || !newFaq.answerEn}>
                <Plus className="w-4 h-4 me-2" />
                Add FAQ
              </Button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-4">Note: Make sure to click "Save Changes" at the top right after adding or deleting FAQs.</p>
          </div>

          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.id} className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-white mb-2">{faq.questionEn}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{faq.answerEn}</p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {faqs.length === 0 && (
              <p className="text-center py-8 text-[var(--text-secondary)] bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)]">
                No general FAQs added yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
