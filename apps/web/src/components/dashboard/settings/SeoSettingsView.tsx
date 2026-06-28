"use client"

import { useState } from "react"
import { Save, CheckCircle2, Globe, FileJson, Search } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

export function SeoSettingsView({ initialSettings }: { initialSettings: Record<string, any> }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(false)
  const [data, setData] = useState({
    metaTitleEn: initialSettings.metaTitleEn || "E3 - Event Engineering Experts",
    metaTitleAr: initialSettings.metaTitleAr || "إي ثري - خبراء هندسة الفعاليات",
    metaDescriptionEn: initialSettings.metaDescriptionEn || "",
    metaDescriptionAr: initialSettings.metaDescriptionAr || "",
    googleAnalyticsId: initialSettings.googleAnalyticsId || "",
    tagManagerId: initialSettings.tagManagerId || "",
    robotsTxt: initialSettings.robotsTxt || "User-agent: *\nAllow: /",
    llmsTxt: initialSettings.llmsTxt || "# E3 Documentation\n\nWelcome to E3.",
    jsonLdOrganization: initialSettings.jsonLdOrganization || "{}"
  })

  const handleChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const promises = Object.entries(data).map(([key, value]) =>
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value, type: "SEO" })
        })
      )
      await Promise.all(promises)
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
          <h1 className="text-3xl font-black text-[var(--text-primary)]">SEO & Analytics</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage search engine visibility and tracking IDs.</p>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      {toast && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Settings saved successfully and cache cleared.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass rounded-3xl border-gradient p-6 relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="relative z-10">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Globe className="w-5 h-5 mr-2 text-blue-500" /> Global Meta Tags
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Meta Title (English)</label>
                <input 
                  type="text" 
                  value={data.metaTitleEn} 
                  onChange={e => handleChange("metaTitleEn", e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Meta Title (Arabic)</label>
                <input 
                  type="text" 
                  value={data.metaTitleAr} 
                  onChange={e => handleChange("metaTitleAr", e.target.value)}
                  dir="rtl"
                  className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-right transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Meta Description (English)</label>
                <textarea 
                  value={data.metaDescriptionEn} 
                  onChange={e => handleChange("metaDescriptionEn", e.target.value)}
                  className="w-full h-24 bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Meta Description (Arabic)</label>
                <textarea 
                  value={data.metaDescriptionAr} 
                  onChange={e => handleChange("metaDescriptionAr", e.target.value)}
                  dir="rtl"
                  className="w-full h-24 bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none text-right transition-colors"
                />
              </div>
            </div>
            </div>
          </div>

          <div className="glass rounded-3xl border-gradient p-6 relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="relative z-10">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Search className="w-5 h-5 mr-2 text-amber-500" /> Tracking IDs
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Google Analytics ID (G-XXXXX)</label>
                <input 
                  type="text" 
                  value={data.googleAnalyticsId} 
                  onChange={e => handleChange("googleAnalyticsId", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Google Tag Manager ID (GTM-XXXXX)</label>
                <input 
                  type="text" 
                  value={data.tagManagerId} 
                  onChange={e => handleChange("tagManagerId", e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono transition-colors"
                />
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl border-gradient p-6 relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="relative z-10">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-4">
              <FileJson className="w-5 h-5 mr-2 text-green-500" /> Advanced SEO
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Robots.txt Content</label>
                <textarea 
                  value={data.robotsTxt} 
                  onChange={e => handleChange("robotsTxt", e.target.value)}
                  className="w-full h-32 bg-[#0a0a0a] text-green-400 border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] font-mono resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">LLMs.txt Content</label>
                <textarea 
                  value={data.llmsTxt} 
                  onChange={e => handleChange("llmsTxt", e.target.value)}
                  className="w-full h-32 bg-[#0a0a0a] text-blue-400 border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] font-mono resize-none"
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Exposed at /llms.txt for AI crawlers.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">JSON-LD (Organization schema)</label>
                <textarea 
                  value={data.jsonLdOrganization} 
                  onChange={e => handleChange("jsonLdOrganization", e.target.value)}
                  className="w-full h-32 bg-[#0a0a0a] text-yellow-400 border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] font-mono resize-none"
                />
              </div>
              
              <div className="pt-4 border-t border-[var(--border-default)]">
                <Button variant="outline" className="w-full text-xs">
                  Generate Sitemap Now
                </Button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
