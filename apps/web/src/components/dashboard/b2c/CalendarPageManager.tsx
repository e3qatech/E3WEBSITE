"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Save, Image as ImageIcon, CheckCircle2, Loader2, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/Button"

type PageSettings = {
  title: string
  tagline: string
  heroMediaType: string
  heroMediaUrl: string
}

type DiscountOffer = {
  id: string;
  code: string;
  discount: number;
  attraction: { nameEn: string };
}

export function CalendarPageManager() {
  const [activeTab, setActiveTab] = useState<"HERO" | "DISCOUNTS">("HERO")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [pageSettings, setPageSettings] = useState<PageSettings>({
    title: "Events Calendar",
    tagline: "Find your next experience. Browse upcoming special events, festivals, and exclusive private sessions.",
    heroMediaType: "IMAGE",
    heroMediaUrl: ""
  })

  const [discounts, setDiscounts] = useState<DiscountOffer[]>([])
  const [attractions, setAttractions] = useState<{ id: string, nameEn: string }[]>([])
  const [newDiscount, setNewDiscount] = useState({ attractionId: "", code: "", discount: "" })
  const [loadingDiscounts, setLoadingDiscounts] = useState(false)


  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, discountsRes, attractionsRes] = await Promise.all([
          fetch("/api/b2c/calendar-settings"),
          fetch("/api/b2c/offers"),
          fetch("/api/b2c/attractions/simple")
        ])
        
        if (settingsRes.ok) {
          const data = await settingsRes.json()
          if (data.pageSettings && Object.keys(data.pageSettings).length > 0) {
            setPageSettings(prev => ({ ...prev, ...data.pageSettings }))
          }
        }

        if (discountsRes.ok) {
          const data = await discountsRes.json()
          setDiscounts(data)
        }

        if (attractionsRes.ok) {
          const data = await attractionsRes.json()
          setAttractions(data)
          if (data.length > 0) {
            setNewDiscount(prev => ({ ...prev, attractionId: data[0].id }))
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
      const res = await fetch("/api/b2c/calendar-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageSettings })
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

  const handleCreateDiscount = async () => {
    if (!newDiscount.attractionId || !newDiscount.code || !newDiscount.discount) return;
    setLoadingDiscounts(true);
    try {
      const res = await fetch("/api/b2c/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDiscount)
      });
      if (res.ok) {
        const added = await res.json();
        setDiscounts([added, ...discounts]);
        setNewDiscount(prev => ({ ...prev, code: "", discount: "" }));
      } else {
        alert("Failed to create discount");
      }
    } catch (e) {
      console.error(e);
      alert("Error creating discount");
    } finally {
      setLoadingDiscounts(false);
    }
  }

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount?")) return;
    try {
      const res = await fetch(`/api/b2c/offers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDiscounts(discounts.filter(d => d.id !== id));
      } else {
        alert("Failed to delete discount");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting discount");
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Calendar Page Settings</h1>
          <p className="text-[var(--text-secondary)]">Manage the hero content for the B2C Events Calendar.</p>
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
          onClick={() => setActiveTab("DISCOUNTS")}
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${activeTab === "DISCOUNTS" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-white"}`}
        >
          Partner Discounts
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

      {/* Discounts Settings Content */}
      {activeTab === "DISCOUNTS" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-6">
            <h2 className="text-lg font-bold text-white mb-4">Add New Discount</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-zinc-400">Attraction</label>
                <select
                  value={newDiscount.attractionId}
                  onChange={e => setNewDiscount({ ...newDiscount, attractionId: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
                >
                  <option value="" disabled>Select an attraction...</option>
                  {attractions.map(a => (
                    <option key={a.id} value={a.id}>{a.nameEn}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400">Promo Code</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER20"
                  value={newDiscount.code}
                  onChange={e => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400">Discount (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={newDiscount.discount}
                  onChange={e => setNewDiscount({ ...newDiscount, discount: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleCreateDiscount} disabled={loadingDiscounts || !newDiscount.attractionId || !newDiscount.code || !newDiscount.discount}>
                {loadingDiscounts ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Plus className="w-4 h-4 me-2" />}
                Add Discount
              </Button>
            </div>
          </div>

          <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-900 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Attraction</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Promo Code</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Discount</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {discounts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                        No active discounts found.
                      </td>
                    </tr>
                  ) : (
                    discounts.map(offer => (
                      <tr key={offer.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">
                          {offer.attraction?.nameEn}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-mono text-sm font-bold">
                            {offer.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-emerald-500">{offer.discount}% OFF</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteDiscount(offer.id)}
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
