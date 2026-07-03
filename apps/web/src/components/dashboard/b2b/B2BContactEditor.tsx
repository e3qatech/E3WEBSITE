"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"

export function B2BContactEditor({ initialData }: { initialData: any }) {
  const [data, setData] = useState({
    header: {
      titleEn: initialData?.header?.titleEn || "",
      titleAr: initialData?.header?.titleAr || "",
      subtitleEn: initialData?.header?.subtitleEn || "",
      subtitleAr: initialData?.header?.subtitleAr || "",
    },
    inquiries: {
      business: initialData?.inquiries?.business || "",
      careers: initialData?.inquiries?.careers || "",
      phone: initialData?.inquiries?.phone || "",
    },
    headquarters: {
      addressEn: initialData?.headquarters?.addressEn || "",
      addressAr: initialData?.headquarters?.addressAr || "",
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
        description="Manage contact information and RFP settings."
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
          <div className="grid grid-cols-2 gap-6">
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

      </AdminFormLayout>
    </div>
  )
}
