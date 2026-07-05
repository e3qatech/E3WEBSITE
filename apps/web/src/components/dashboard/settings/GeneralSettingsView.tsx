"use client"

import { useState } from "react"
import { Save, CheckCircle2, Building, Mail, MapPin, Share2, Key, Image as ImageIcon, LayoutTemplate } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"
import { MediaUploader } from "@/components/shared/MediaUploader"

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
    socialYoutube: initialSettings.socialYoutube || "",
    socialSnapchat: initialSettings.socialSnapchat || "",
    socialFacebook: initialSettings.socialFacebook || "",
    bookingqubeWebsite: initialSettings.bookingqubeWebsite || "",
    bookingQubeApiKey: initialSettings.bookingQubeApiKey || "",
    mapsApiKey: initialSettings.mapsApiKey || "",
    emailGatewayKey: initialSettings.emailGatewayKey || "",
    lightLogoUrl: initialSettings.lightLogoUrl || "",
    darkLogoUrl: initialSettings.darkLogoUrl || "",
    faviconUrl: initialSettings.faviconUrl || "",
    gatewayB2CTitle: initialSettings.gatewayB2CTitle || "PRISTINE\\nSNOW",
    gatewayB2CDesc: initialSettings.gatewayB2CDesc || "Discover Qatar's premier live events, permanent attractions, and immersive experiences.",
    gatewayB2BTitle: initialSettings.gatewayB2BTitle || "COSMIC\\nVOID",
    gatewayB2BDesc: initialSettings.gatewayB2BDesc || "End-to-end event engineering, stage fabrication, and B2B spatial technologies."
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
          <CheckCircle2 className="w-5 h-5 me-2" />
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
              <Building className="w-5 h-5 me-2 text-blue-500" /> Site Identity
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
                  className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-right transition-colors"
                />
              </div>
            </div>
            </div>
          </div>

          <div className="glass rounded-3xl border-gradient p-6 relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="relative z-10">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Mail className="w-5 h-5 me-2 text-amber-500" /> Contact Details
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
                  className="w-full h-16 bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Office Address (Arabic)</label>
                <textarea 
                  value={data.addressAr} 
                  onChange={e => handleChange("addressAr", e.target.value)}
                  dir="rtl"
                  className="w-full h-16 bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none transition-colors text-right"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Working Hours</label>
                <input 
                  type="text" 
                  value={data.workingHours} 
                  onChange={e => handleChange("workingHours", e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>
            </div>
          </div>

          <div className="glass rounded-3xl border-gradient p-6 relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="relative z-10">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center">
              <ImageIcon className="w-5 h-5 me-2 text-[var(--color-primary)]" /> Logo Assets
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Light Mode Logo</label>
                <MediaUploader value={data.lightLogoUrl} onChange={(val) => handleChange("lightLogoUrl", val)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Dark Mode Logo</label>
                <MediaUploader value={data.darkLogoUrl} onChange={(val) => handleChange("darkLogoUrl", val)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Site Favicon</label>
                <MediaUploader value={data.faviconUrl} onChange={(val) => handleChange("faviconUrl", val)} />
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Recommended: 32x32px or 64x64px ICO/PNG</p>
              </div>
            </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center mb-4">
              <Share2 className="w-5 h-5 me-2 text-pink-500" /> Social Media Links
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
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">YouTube URL</label>
                <input 
                  type="url" 
                  value={data.socialYoutube} 
                  onChange={e => handleChange("socialYoutube", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Snapchat URL</label>
                <input 
                  type="url" 
                  value={data.socialSnapchat} 
                  onChange={e => handleChange("socialSnapchat", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Facebook URL</label>
                <input 
                  type="url" 
                  value={data.socialFacebook} 
                  onChange={e => handleChange("socialFacebook", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">BookingQube Website URL</label>
                <input 
                  type="url" 
                  value={data.bookingqubeWebsite} 
                  onChange={e => handleChange("bookingqubeWebsite", e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[var(--text-primary)] mb-6 flex items-center border-b border-[var(--border-default)] pb-4">
              <Key className="w-5 h-5 me-2 text-[var(--color-primary)]" /> API Integrations
            </h3>
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
                  className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[var(--text-primary)] mb-6 flex items-center border-b border-[var(--border-default)] pb-4">
              <LayoutTemplate className="w-5 h-5 me-2 text-indigo-500" /> Gateway Customization
            </h3>
            <div className="space-y-6">
              <div className="space-y-4 border-b border-[var(--border-default)] pb-4">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Public Portal (B2C)</h4>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Title</label>
                  <textarea 
                    value={data.gatewayB2CTitle.replace(/\\n/g, '\n')} 
                    onChange={e => handleChange("gatewayB2CTitle", e.target.value.replace(/\n/g, '\\n'))}
                    className="w-full h-16 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Description</label>
                  <textarea 
                    value={data.gatewayB2CDesc} 
                    onChange={e => handleChange("gatewayB2CDesc", e.target.value)}
                    className="w-full h-20 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Enterprise Solutions (B2B)</h4>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Title</label>
                  <textarea 
                    value={data.gatewayB2BTitle.replace(/\\n/g, '\n')} 
                    onChange={e => handleChange("gatewayB2BTitle", e.target.value.replace(/\n/g, '\\n'))}
                    className="w-full h-16 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Description</label>
                  <textarea 
                    value={data.gatewayB2BDesc} 
                    onChange={e => handleChange("gatewayB2BDesc", e.target.value)}
                    className="w-full h-20 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
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
