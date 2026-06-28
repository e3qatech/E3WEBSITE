"use client"

import { useState } from "react"
import { Save, CheckCircle2, Palette, Layout, Code } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

export function UiSettingsView({ initialSettings }: { initialSettings: Record<string, any> }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(false)
  const [data, setData] = useState({
    colorPrimary: initialSettings.colorPrimary || "#ff3b00",
    colorSecondary: initialSettings.colorSecondary || "#1a1a1a",
    colorAccent: initialSettings.colorAccent || "#00e676",
    fontFamily: initialSettings.fontFamily || "Inter",
    defaultTheme: initialSettings.defaultTheme || "dark",
    enable3DMap: initialSettings.enable3DMap !== undefined ? initialSettings.enable3DMap : true,
    enableLiveOccupancy: initialSettings.enableLiveOccupancy !== undefined ? initialSettings.enableLiveOccupancy : true,
    enableSocialPreviews: initialSettings.enableSocialPreviews !== undefined ? initialSettings.enableSocialPreviews : true,
    customCss: initialSettings.customCss || ""
  })

  const handleChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const promises = Object.entries(data).map(([key, value]) =>
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value, type: "UI" })
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
          <h1 className="text-3xl font-black text-[var(--text-primary)]">UI & Theming</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage brand colors, fonts, and feature flags.</p>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      {toast && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          <div className="glass rounded-3xl border-gradient p-6 relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="relative z-10">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Palette className="w-5 h-5 mr-2 text-pink-500" /> Brand Colors
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 transition-colors hover:border-zinc-700">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)]">Primary Color</label>
                  <span className="text-xs text-[var(--text-secondary)] font-mono">{data.colorPrimary}</span>
                </div>
                <input 
                  type="color" 
                  value={data.colorPrimary} 
                  onChange={e => handleChange("colorPrimary", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 transition-colors hover:border-zinc-700">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)]">Secondary Color</label>
                  <span className="text-xs text-[var(--text-secondary)] font-mono">{data.colorSecondary}</span>
                </div>
                <input 
                  type="color" 
                  value={data.colorSecondary} 
                  onChange={e => handleChange("colorSecondary", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 transition-colors hover:border-zinc-700">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)]">Accent Color</label>
                  <span className="text-xs text-[var(--text-secondary)] font-mono">{data.colorAccent}</span>
                </div>
                <input 
                  type="color" 
                  value={data.colorAccent} 
                  onChange={e => handleChange("colorAccent", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
              </div>
            </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="glass rounded-3xl border-gradient p-6 relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="relative z-10">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Layout className="w-5 h-5 mr-2 text-blue-500" /> Interface Options
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Font Family</label>
                <select 
                  value={data.fontFamily} 
                  onChange={e => handleChange("fontFamily", e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                >
                  <option value="Inter">Inter (Sans-Serif)</option>
                  <option value="Roboto">Roboto (Sans-Serif)</option>
                  <option value="Playfair Display">Playfair Display (Serif)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Default Theme</label>
                <select 
                  value={data.defaultTheme} 
                  onChange={e => handleChange("defaultTheme", e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                >
                  <option value="system">System Preference</option>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[var(--border-default)] space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={data.enable3DMap} onChange={e => handleChange("enable3DMap", e.target.checked)} className="form-checkbox h-5 w-5 rounded border-zinc-800/50 text-[var(--color-primary)] bg-zinc-900/50 focus:ring-[var(--color-primary)]" />
                  <span className="text-sm font-bold text-[var(--text-primary)]">Enable 3D Map View</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={data.enableLiveOccupancy} onChange={e => handleChange("enableLiveOccupancy", e.target.checked)} className="form-checkbox h-5 w-5 rounded border-[var(--border-default)] text-[var(--color-primary)] bg-[var(--surface-hover)]" />
                  <span className="text-sm font-bold text-[var(--text-primary)]">Show Live Occupancy to Visitors</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={data.enableSocialPreviews} onChange={e => handleChange("enableSocialPreviews", e.target.checked)} className="form-checkbox h-5 w-5 rounded border-[var(--border-default)] text-[var(--color-primary)] bg-[var(--surface-hover)]" />
                  <span className="text-sm font-bold text-[var(--text-primary)]">Enable Social Feed Previews</span>
                </label>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl border-gradient p-6 relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="relative z-10">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Code className="w-5 h-5 mr-2 text-green-500" /> Custom CSS
            </h2>
            <div>
              <p className="text-xs text-[var(--text-secondary)] mb-2">Inject custom CSS into the global stylesheet. Use with caution.</p>
              <textarea 
                value={data.customCss} 
                onChange={e => handleChange("customCss", e.target.value)}
                placeholder="/* CSS goes here */"
                className="w-full h-32 bg-[#0a0a0a] text-blue-400 border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] font-mono resize-none"
              />
            </div>
          </div>
          </div>
          </div>

        </div>
      </div>
    </div>
  )
}
