"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminMediaPicker } from "../ui/AdminMediaPicker"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"

export function DiscoverPageManager({ initialData }: { initialData: any }) {
  const [data, setData] = useState({
    hero: {
      titleEn: initialData?.hero?.titleEn || "",
      titleAr: initialData?.hero?.titleAr || "",
      subtitleEn: initialData?.hero?.subtitleEn || "",
      subtitleAr: initialData?.hero?.subtitleAr || "",
      mediaType: initialData?.hero?.mediaType || "IMAGE",
      mediaUrl: initialData?.hero?.mediaUrl || "",
    },
    heritage: {
      titleEn: initialData?.heritage?.titleEn || initialData?.heritage?.title || "",
      titleAr: initialData?.heritage?.titleAr || initialData?.heritage?.title || "",
      descriptionEn: initialData?.heritage?.descriptionEn || initialData?.heritage?.description || "",
      descriptionAr: initialData?.heritage?.descriptionAr || initialData?.heritage?.description || "",
      visionEn: initialData?.heritage?.visionEn || initialData?.heritage?.vision || "",
      visionAr: initialData?.heritage?.visionAr || initialData?.heritage?.vision || "",
      missionEn: initialData?.heritage?.missionEn || initialData?.heritage?.mission || "",
      missionAr: initialData?.heritage?.missionAr || initialData?.heritage?.mission || "",
      valuesEn: initialData?.heritage?.valuesEn || initialData?.heritage?.values || "",
      valuesAr: initialData?.heritage?.valuesAr || initialData?.heritage?.values || ""
    },
  })

  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2c-discover', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data })
      })
      if (!res.ok) throw new Error("Failed to save")
      toast("B2C Discover Page updated successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save B2C Discover Page.", "error")
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

  return (
    <div className="flex flex-col gap-6 h-full p-6 max-w-6xl mx-auto">
      <AdminPageHeader 
        title="B2C Discover Page"
        description="Manage the content for the Discover page."
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
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
              <input 
                type="text" 
                value={data.hero.titleEn}
                onChange={e => handleChange('hero', 'titleEn', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
              <input 
                type="text" 
                dir="rtl"
                value={data.hero.titleAr}
                onChange={e => handleChange('hero', 'titleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (En)</label>
              <textarea 
                value={data.hero.subtitleEn}
                onChange={e => handleChange('hero', 'subtitleEn', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (Ar)</label>
              <textarea 
                dir="rtl"
                value={data.hero.subtitleAr}
                onChange={e => handleChange('hero', 'subtitleAr', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="col-span-2 space-y-4 pt-4 border-t border-border-default">
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
            </div>
          </div>
        </div>

        {/* Heritage Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Heritage Section</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
              <input 
                type="text" 
                value={data.heritage.titleEn}
                onChange={e => handleChange('heritage', 'titleEn', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
              <input 
                type="text" 
                dir="rtl"
                value={data.heritage.titleAr}
                onChange={e => handleChange('heritage', 'titleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description (En)</label>
              <textarea 
                value={data.heritage.descriptionEn}
                onChange={e => handleChange('heritage', 'descriptionEn', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description (Ar)</label>
              <textarea 
                dir="rtl"
                value={data.heritage.descriptionAr}
                onChange={e => handleChange('heritage', 'descriptionAr', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Vision (En)</label>
              <textarea 
                value={data.heritage.visionEn}
                onChange={e => handleChange('heritage', 'visionEn', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Vision (Ar)</label>
              <textarea 
                dir="rtl"
                value={data.heritage.visionAr}
                onChange={e => handleChange('heritage', 'visionAr', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Mission (En)</label>
              <textarea 
                value={data.heritage.missionEn}
                onChange={e => handleChange('heritage', 'missionEn', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Mission (Ar)</label>
              <textarea 
                dir="rtl"
                value={data.heritage.missionAr}
                onChange={e => handleChange('heritage', 'missionAr', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Values (En)</label>
              <textarea 
                value={data.heritage.valuesEn}
                onChange={e => handleChange('heritage', 'valuesEn', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Values (Ar)</label>
              <textarea 
                dir="rtl"
                value={data.heritage.valuesAr}
                onChange={e => handleChange('heritage', 'valuesAr', e.target.value)}
                className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

      </AdminFormLayout>
    </div>
  )
}
