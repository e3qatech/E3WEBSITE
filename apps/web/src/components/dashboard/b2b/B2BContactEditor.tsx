"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { MediaUploader } from "@/components/shared/MediaUploader"

export function B2BContactEditor({ initialData }: { initialData: any }) {
  const [data, setData] = useState({
    header: {
      titleEn: initialData?.header?.titleEn || "",
      titleAr: initialData?.header?.titleAr || "",
      subtitleEn: initialData?.header?.subtitleEn || "",
      subtitleAr: initialData?.header?.subtitleAr || "",
      mediaType: initialData?.header?.mediaType || "IMAGE",
      mediaUrl: initialData?.header?.mediaUrl || "",
    },
    inquiries: {
      business: initialData?.inquiries?.business || "",
      careers: initialData?.inquiries?.careers || "",
      phone: initialData?.inquiries?.phone || "",
    },
    headquarters: {
      addressEn: initialData?.headquarters?.addressEn || "",
      addressAr: initialData?.headquarters?.addressAr || "",
    },
    careersCta: {
      titleEn: initialData?.careersCta?.titleEn || "Join Our Team",
      titleAr: initialData?.careersCta?.titleAr || "انضم لفريقنا",
      descriptionEn: initialData?.careersCta?.descriptionEn || "Discover new opportunities to build extraordinary experiences.",
      descriptionAr: initialData?.careersCta?.descriptionAr || "اكتشف فرصاً جديدة لبناء تجارب استثنائية.",
      ctaTextEn: initialData?.careersCta?.ctaTextEn || "Explore Careers",
      ctaTextAr: initialData?.careersCta?.ctaTextAr || "استكشف الوظائف",
      ctaLink: initialData?.careersCta?.ctaLink || "mailto:careers@e3.qa",
      mediaType: initialData?.careersCta?.mediaType || "IMAGE",
      mediaUrl: initialData?.careersCta?.mediaUrl || "",
    },
    feedbackCta: {
      titleEn: initialData?.feedbackCta?.titleEn || "Suggestions & Feedback",
      titleAr: initialData?.feedbackCta?.titleAr || "اقتراحات وملاحظات",
      descriptionEn: initialData?.feedbackCta?.descriptionEn || "Help us improve by sharing your thoughts.",
      descriptionAr: initialData?.feedbackCta?.descriptionAr || "ساعدنا في التحسين من خلال مشاركة أفكارك.",
      ctaTextEn: initialData?.feedbackCta?.ctaTextEn || "Share Feedback",
      ctaTextAr: initialData?.feedbackCta?.ctaTextAr || "شارك الملاحظات",
      ctaLink: initialData?.feedbackCta?.ctaLink || "/feedback",
      mediaType: initialData?.feedbackCta?.mediaType || "IMAGE",
      mediaUrl: initialData?.feedbackCta?.mediaUrl || "",
    },
    faqCta: {
      titleEn: initialData?.faqCta?.titleEn || "B2B FAQs",
      titleAr: initialData?.faqCta?.titleAr || "الأسئلة الشائعة",
      descriptionEn: initialData?.faqCta?.descriptionEn || "Find answers to commonly asked questions about our services and processes.",
      descriptionAr: initialData?.faqCta?.descriptionAr || "ابحث عن إجابات للأسئلة الشائعة حول خدماتنا وعملياتنا.",
      ctaTextEn: initialData?.faqCta?.ctaTextEn || "View FAQs",
      ctaTextAr: initialData?.faqCta?.ctaTextAr || "عرض الأسئلة",
      ctaLink: initialData?.faqCta?.ctaLink || "/b2b/faqs",
      mediaType: initialData?.faqCta?.mediaType || "IMAGE",
      mediaUrl: initialData?.faqCta?.mediaUrl || "",
    }
  })

  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2b-contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data })
      })
      if (!res.ok) throw new Error("Failed to save")
      toast("B2B Contact page updated successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save B2B Contact page.", "error")
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
    <div className="flex flex-col gap-6 h-full p-6">
      <AdminPageHeader 
        title="B2B Contact / RFP"
        description="Manage contact information, RFP settings, and CTA cards."
        action={
          <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </AdminButton>
        }
      />

      <AdminFormLayout>
        {/* Header Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Header Section</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
                <input 
                  type="text" 
                  value={data.header.titleEn}
                  onChange={e => handleChange('header', 'titleEn', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.header.titleAr}
                  onChange={e => handleChange('header', 'titleAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (En)</label>
                <textarea 
                  value={data.header.subtitleEn}
                  onChange={e => handleChange('header', 'subtitleEn', e.target.value)}
                  className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle (Ar)</label>
                <textarea 
                  dir="rtl"
                  value={data.header.subtitleAr}
                  onChange={e => handleChange('header', 'subtitleAr', e.target.value)}
                  className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>
            
            <div className="space-y-4 border-t lg:border-t-0 lg:border-s border-border-default pt-4 lg:pt-0 lg:ps-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Background Media Type</label>
                <select 
                  value={data.header.mediaType}
                  onChange={e => handleChange('header', 'mediaType', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Upload Background</label>
                <MediaUploader 
                  value={data.header.mediaUrl}
                  onChange={(url) => handleChange('header', 'mediaUrl', url)} 
                  accept={data.header.mediaType === 'VIDEO' ? "video/*" : "image/*"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Direct Inquiries Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Direct Inquiries</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Business Email</label>
              <input 
                type="email" 
                value={data.inquiries.business}
                onChange={e => handleChange('inquiries', 'business', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Careers Email</label>
              <input 
                type="email" 
                value={data.inquiries.careers}
                onChange={e => handleChange('inquiries', 'careers', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Phone Number</label>
              <input 
                type="tel" 
                value={data.inquiries.phone}
                onChange={e => handleChange('inquiries', 'phone', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Headquarters Section */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Headquarters Address</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Address (En)</label>
              <textarea 
                value={data.headquarters.addressEn}
                onChange={e => handleChange('headquarters', 'addressEn', e.target.value)}
                className="w-full h-32 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Address (Ar)</label>
              <textarea 
                dir="rtl"
                value={data.headquarters.addressAr}
                onChange={e => handleChange('headquarters', 'addressAr', e.target.value)}
                className="w-full h-32 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Careers CTA */}
        <CtaEditorBlock 
          title="Careers CTA Card"
          data={data.careersCta} 
          onChange={(field, value) => handleChange('careersCta', field, value)} 
        />
        
        {/* Feedback CTA */}
        <CtaEditorBlock 
          title="Suggestions & Feedback CTA Card"
          data={data.feedbackCta} 
          onChange={(field, value) => handleChange('feedbackCta', field, value)} 
        />
        
        {/* FAQs CTA */}
        <CtaEditorBlock 
          title="B2B FAQs CTA Card"
          data={data.faqCta} 
          onChange={(field, value) => handleChange('faqCta', field, value)} 
        />

      </AdminFormLayout>
    </div>
  )
}

function CtaEditorBlock({ title, data, onChange }: { title: string, data: any, onChange: (field: string, value: any) => void }) {
  return (
    <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
              <input type="text" value={data.titleEn} onChange={e => onChange('titleEn', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
              <input type="text" dir="rtl" value={data.titleAr} onChange={e => onChange('titleAr', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description (En)</label>
              <textarea value={data.descriptionEn} onChange={e => onChange('descriptionEn', e.target.value)} className="w-full h-20 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description (Ar)</label>
              <textarea dir="rtl" value={data.descriptionAr} onChange={e => onChange('descriptionAr', e.target.value)} className="w-full h-20 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">CTA Text (En)</label>
              <input type="text" value={data.ctaTextEn} onChange={e => onChange('ctaTextEn', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">CTA Text (Ar)</label>
              <input type="text" dir="rtl" value={data.ctaTextAr} onChange={e => onChange('ctaTextAr', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Link</label>
              <input type="text" value={data.ctaLink} onChange={e => onChange('ctaLink', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4 border-t lg:border-t-0 lg:border-s border-border-default pt-4 lg:pt-0 lg:ps-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Background Media Type</label>
            <select value={data.mediaType} onChange={e => onChange('mediaType', e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none">
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Upload Background</label>
            <MediaUploader 
              value={data.mediaUrl}
              onChange={(url) => onChange('mediaUrl', url)} 
              accept={data.mediaType === 'VIDEO' ? "video/*" : "image/*"}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

