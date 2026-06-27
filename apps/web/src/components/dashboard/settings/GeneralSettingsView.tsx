"use client"

import { useState } from "react"
import { Save, CheckCircle2, Building, Mail, MapPin, Share2, Key } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

export function GeneralSettingsView({ initialSettings }: { initialSettings: Record<string, any> }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(false)
  
  const [data, setData] = useState({
    siteNameEn: initialSettings.siteNameEn || "E3",
    siteNameAr: initialSettings.siteNameAr || "إي ثري",
    contactEmail: initialSettings.contactEmail || "",
    contactPhone: initialSettings.contactPhone || "",
    contactWhatsapp: initialSettings.contactWhatsapp || "",
    addressEn: initialSettings.addressEn || "",
    addressAr: initialSettings.addressAr || "",
    workingHours: initialSettings.workingHours || "Mon-Fri: 9am - 6pm",
    socialInstagram: initialSettings.socialInstagram || "",
    socialTwitter: initialSettings.socialTwitter || "",
    socialLinkedin: initialSettings.socialLinkedin || "",
    bookingQubeApiKey: initialSettings.bookingQubeApiKey || "",
    mapsApiKey: initialSettings.mapsApiKey || "",
    emailGatewayKey: initialSettings.emailGatewayKey || ""
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
          body: JSON.stringify({ key, value, type: "GENERAL" })
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
          <h1 className="text-3xl font-black text-[var(--text-primary)]">General Settings</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage global site identity, contact info, and API keys.</p>
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
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Building className="w-5 h-5 mr-2 text-blue-500" /> Site Identity
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Site Name (English)</label>
                <input 
                  type="text" 
                  value={data.siteNameEn} 
                  onChange={e => handleChange("siteNameEn", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Site Name (Arabic)</label>
                <input 
                  type="text" 
                  value={data.siteNameAr} 
                  onChange={e => handleChange("siteNameAr", e.target.value)}
                  dir="rtl"
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-right"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Mail className="w-5 h-5 mr-2 text-amber-500" /> Contact Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Public Email</label>
                  <input 
                    type="email" 
                    value={data.contactEmail} 
                    onChange={e => handleChange("contactEmail", e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Public Phone</label>
                  <input 
                    type="text" 
                    value={data.contactPhone} 
                    onChange={e => handleChange("contactPhone", e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">WhatsApp Number</label>
                <input 
                  type="text" 
                  value={data.contactWhatsapp} 
                  onChange={e => handleChange("contactWhatsapp", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="+974..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Office Address (English)</label>
                <textarea 
                  value={data.addressEn} 
                  onChange={e => handleChange("addressEn", e.target.value)}
                  className="w-full h-16 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Office Address (Arabic)</label>
                <textarea 
                  value={data.addressAr} 
                  onChange={e => handleChange("addressAr", e.target.value)}
                  dir="rtl"
                  className="w-full h-16 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none text-right"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Working Hours</label>
                <input 
                  type="text" 
                  value={data.workingHours} 
                  onChange={e => handleChange("workingHours", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Share2 className="w-5 h-5 mr-2 text-pink-500" /> Social Media Links
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Instagram URL</label>
                <input 
                  type="url" 
                  value={data.socialInstagram} 
                  onChange={e => handleChange("socialInstagram", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Twitter / X URL</label>
                <input 
                  type="url" 
                  value={data.socialTwitter} 
                  onChange={e => handleChange("socialTwitter", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">LinkedIn URL</label>
                <input 
                  type="url" 
                  value={data.socialLinkedin} 
                  onChange={e => handleChange("socialLinkedin", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Key className="w-5 h-5 mr-2 text-purple-500" /> API Integrations
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">BookingQube API Key</label>
                <input 
                  type="password" 
                  value={data.bookingQubeApiKey} 
                  onChange={e => handleChange("bookingQubeApiKey", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Maps API Key</label>
                <input 
                  type="password" 
                  value={data.mapsApiKey} 
                  onChange={e => handleChange("mapsApiKey", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Email / SMS Gateway Key</label>
                <input 
                  type="password" 
                  value={data.emailGatewayKey} 
                  onChange={e => handleChange("emailGatewayKey", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
