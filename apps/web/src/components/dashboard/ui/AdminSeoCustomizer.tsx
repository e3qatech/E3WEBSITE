import React from "react"

interface AdminSeoCustomizerProps {
  formData: any;
  setFormData: (data: any) => void;
  // If the editor has a separate seo object (like ServicesEditor)
  seo?: any;
  setSeo?: (seo: any) => void;
}

export function AdminSeoCustomizer({ formData, setFormData, seo, setSeo }: AdminSeoCustomizerProps) {
  // If the component passes a dedicated `seo` state, use it.
  // Otherwise, fallback to formData.seo (if it exists) or formData directly.
  const seoData = seo || formData?.seo || formData;

  const handleChange = (field: string, value: string) => {
    if (setSeo) {
      setSeo({ ...seoData, [field]: value });
    } else {
      setFormData({
        ...formData,
        seo: { ...seoData, [field]: value }
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-black text-[var(--text-primary)]">SEO Settings</h2>
        <p className="text-sm text-[var(--text-secondary)]">Customize search engine metadata for this page.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 border p-4 rounded-xl border-border-default bg-surface-default">
          <div className="flex items-center justify-between border-b border-border-default pb-2">
            <h4 className="font-bold text-emerald-500">English (EN)</h4>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary">Meta Title</label>
            <input 
              type="text" 
              value={seoData?.metaTitleEn || ""} 
              onChange={e => handleChange("metaTitleEn", e.target.value)} 
              className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm focus:border-accent focus:outline-none" 
              placeholder="e.g. Services | E3" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary">Meta Description</label>
            <textarea 
              value={seoData?.metaDescriptionEn || ""} 
              onChange={e => handleChange("metaDescriptionEn", e.target.value)} 
              rows={3} 
              className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm focus:border-accent focus:outline-none resize-none" 
              placeholder="Brief description for search engines..." 
            />
          </div>
        </div>

        <div className="space-y-4 border p-4 rounded-xl border-border-default bg-surface-default">
          <div className="flex items-center justify-between border-b border-border-default pb-2">
            <h4 className="font-bold text-emerald-500 font-arabic" dir="rtl">العربية (AR)</h4>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary text-right block font-arabic" dir="rtl">عنوان الميتا</label>
            <input 
              type="text" 
              dir="rtl" 
              value={seoData?.metaTitleAr || ""} 
              onChange={e => handleChange("metaTitleAr", e.target.value)} 
              className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm focus:border-accent focus:outline-none font-arabic" 
              placeholder="مثال: الخدمات | إي ثري" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary text-right block font-arabic" dir="rtl">وصف الميتا</label>
            <textarea 
              dir="rtl" 
              value={seoData?.metaDescriptionAr || ""} 
              onChange={e => handleChange("metaDescriptionAr", e.target.value)} 
              rows={3} 
              className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm focus:border-accent focus:outline-none resize-none font-arabic" 
              placeholder="وصف موجز لمحركات البحث..." 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
