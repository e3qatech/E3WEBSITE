"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Search, ExternalLink, Briefcase, Users } from "lucide-react"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"
import { MediaUploader } from "@/components/shared/MediaUploader"
import { useLocale } from "@/components/layout/LocaleProvider"
import { localizeHref } from "@/lib/url-helper"

export function PartnersClient({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  let locale: 'en' | 'ar' = 'en'
  let dir: 'ltr' | 'rtl' = 'ltr'
  try {
    const localeCtx = useLocale()
    if (localeCtx) {
      locale = (localeCtx.locale as 'en' | 'ar') || 'en'
      dir = localeCtx.dir || (locale === 'ar' ? 'rtl' : 'ltr')
    }
  } catch {
    // Fallback if rendered outside LocaleProvider
  }

  const isAr = locale === 'ar'
  const [partners, setPartners] = useState(initialData || [])
  const [search, setSearch] = useState("")
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddNew = () => {
    setEditForm({
      name: "",
      website: "",
      category: "TECHNOLOGY",
      description: "",
      logoUrl: "",
      isVisible: true,
      orderIndex: 0
    })
    setIsEditing("new")
  }

  const handleEdit = (partner: any) => {
    setEditForm({ ...partner })
    setIsEditing(partner.id)
  }

  const handleSave = async () => {
    if (!editForm.name) {
      alert(isAr ? "اسم الشريك / العميل مطلوب" : "Name is required")
      return
    }

    setIsSaving(true)
    try {
      const isNew = isEditing === "new"
      const url = isNew ? `/api/b2b/partners` : `/api/b2b/partners/${isEditing}`
      const method = isNew ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })

      if (!res.ok) throw new Error("Failed to save")

      const data = await res.json()
      
      if (isNew) {
        setPartners([...partners, data.partner])
      } else {
        setPartners(partners.map(p => p.id === isEditing ? data.partner : p))
      }

      setIsEditing(null)
      router.refresh()
    } catch {
      alert(isAr ? "فشل حفظ الشريك" : "Failed to save partner")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذا الشريك؟" : "Are you sure you want to delete this partner?")) return

    try {
      const res = await fetch(`/api/b2b/partners/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      
      setPartners(partners.filter(p => p.id !== id))
      router.refresh()
    } catch {
      alert(isAr ? "فشل حذف الشريك" : "Failed to delete partner")
    }
  }

  return (
    <DashboardPageShell variant="wide">
      <div dir={dir} className="space-y-6">
        <DashboardPageHeader 
          title={isAr ? "دليل الشركاء والعملاء للواجهة العامة" : "Corporate Clients & Partners Directory"}
          description={
            isAr
              ? "إدارة شركاء الأعمال، شعارات العملاء المؤسسيين، الترتيب العام، وبيانات الثقة على الموقع."
              : "Manage corporate partners, enterprise client logos, brand credentials, and trust marks."
          }
          breadcrumbs={[
            { label: isAr ? "محتوى B2B" : "B2B Content", href: "/dashboard/b2b/services" },
            { label: isAr ? "دليل العملاء والشركاء" : "Clients Directory" },
          ]}
          badge={{ 
            label: isAr ? `${partners.length} شريك / عميل` : `${partners.length} Clients`, 
            variant: "indigo" 
          }}
          primaryAction={{
            label: isAr ? "إضافة عميل / شريك" : "Add Client",
            onClick: handleAddNew,
            icon: <Plus className="w-4 h-4" />,
          }}
        />

        {/* Architectural Ownership Separation Notice */}
        <div
          dir={dir}
          data-testid="b2b-clients-boundary-banner"
          className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>
                  {isAr
                    ? 'منظومة الحسابات والشركات في CRM'
                    : 'Tenant Accounts & CRM Clients Database'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono uppercase">
                  {isAr ? 'حدود النظام' : 'System Boundary'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 max-w-2xl leading-relaxed">
                {isAr ? (
                  <>
                    يتحكم هذا الدليل حصرياً في{' '}
                    <strong className="text-zinc-200">عرض الشعارات، الهوية العامة للشركاء، الترتيب والظهور في الموقع</strong>.
                    لإدارة حسابات المؤسسات المعتمدة، عضويات المستخدمين، طلبات العروض (RFP)، والعقود التجارية، انتقل إلى إدارة عملاء CRM.
                  </>
                ) : (
                  <>
                    This directory manages <strong>public brand credentials, partner logos, visibility, and website showcase ranking</strong>.
                    To manage authenticated organization tenant accounts, client user memberships, RFPs, and commercial contracts, use the central CRM Clients Manager.
                  </>
                )}
              </p>
            </div>
          </div>

          <Link
            href={localizeHref('/dashboard/crm/clients', locale)}
            data-testid="b2b-crm-clients-link"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-md"
          >
            <span>{isAr ? 'إدارة عملاء CRM' : 'CRM Clients Database'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? "البحث في الشركاء والعملاء..." : "Search partners..."}
            className="w-full bg-surface-default border border-border-default rounded-xl py-3 ps-10 pe-4 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map(partner => (
            <div key={partner.id} className="bg-surface-default border border-border-default rounded-2xl overflow-hidden hover:border-primary/30 transition-colors flex flex-col group relative">
              <div className="aspect-[3/2] bg-surface-hover flex items-center justify-center p-6 relative border-b border-border-default">
                {partner.logoUrl ? (
                  <img src={partner.logoUrl} alt={partner.name} className="max-w-full max-h-full object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                ) : (
                  <div className="text-text-tertiary font-bold flex flex-col items-center gap-2">
                    <Briefcase className="w-8 h-8 opacity-50" />
                    <span>{partner.name}</span>
                  </div>
                )}
                <div className="absolute top-3 end-3 flex items-center gap-2">
                  {partner.isVisible ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-surface-active rounded-full" />
                  ) : (
                    <XCircle className="w-5 h-5 text-text-tertiary bg-surface-active rounded-full" />
                  )}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-bold text-text-primary line-clamp-1">{partner.name}</h3>
                    <div className="text-xs font-bold text-primary mt-1 tracking-wider uppercase">{partner.category.replace(/_/g, ' ')}</div>
                  </div>
                </div>
                
                {partner.description && (
                  <p className="text-sm text-text-secondary line-clamp-2 mt-2">{partner.description}</p>
                )}
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border-default">
                  {partner.website ? (
                    <a href={partner.website} target="_blank" rel="noreferrer" className="text-xs text-text-tertiary hover:text-primary flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> {isAr ? "زيارة الموقع" : "Visit Site"}
                    </a>
                  ) : <span />}
                  
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(partner)} className="p-2 text-text-secondary hover:text-primary bg-surface-subtle hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(partner.id)} className="p-2 text-text-secondary hover:text-error bg-surface-subtle hover:bg-error/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredPartners.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-tertiary border-2 border-dashed border-border-default rounded-2xl font-medium">
              {isAr ? 'لم يتم العثور على شركاء. انقر "إضافة عميل / شريك" للبدء.' : 'No partners found. Click "Add Client" to get started.'}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div dir={dir} className="bg-surface-default border border-border-default rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="sticky top-0 bg-surface-default/80 backdrop-blur-md border-b border-border-default px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-text-primary">
                  {isEditing === "new" ? (isAr ? "إضافة عميل / شريك جديد" : "Add Client") : (isAr ? "تعديل بيانات الشريك" : "Edit Client")}
                </h2>
                <button onClick={() => setIsEditing(null)} className="p-2 text-text-tertiary hover:text-text-primary rounded-lg transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary">{isAr ? "الاسم *" : "Name *"}</label>
                    <input 
                      type="text" 
                      value={editForm.name || ""} 
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm"
                      placeholder={isAr ? "اسم المؤسسة أو الشريك" : "e.g. Qatar Airways"}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary">{isAr ? "التصنيف" : "Category"}</label>
                    <select 
                      value={editForm.category || "TECHNOLOGY"} 
                      onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm"
                    >
                      <option value="TECHNOLOGY">{isAr ? "تكنولوجيا وتقنية" : "TECHNOLOGY"}</option>
                      <option value="GOVERNMENT">{isAr ? "جهات حكومية" : "GOVERNMENT"}</option>
                      <option value="ENTERTAINMENT">{isAr ? "ترفيه وسياحة" : "ENTERTAINMENT"}</option>
                      <option value="SPONSOR">{isAr ? "رعاة رسميون" : "SPONSOR"}</option>
                      <option value="VENDOR">{isAr ? "موردون وشركاء تنفيذ" : "VENDOR"}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary">{isAr ? "الموقع الإلكتروني" : "Website"}</label>
                    <input 
                      type="url" 
                      value={editForm.website || ""} 
                      onChange={e => setEditForm({ ...editForm, website: e.target.value })}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary">{isAr ? "ترتيب العرض" : "Order Index"}</label>
                    <input 
                      type="number" 
                      value={editForm.orderIndex || 0} 
                      onChange={e => setEditForm({ ...editForm, orderIndex: parseInt(e.target.value) || 0 })}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary">{isAr ? "الوصف المختصر" : "Description"}</label>
                  <textarea 
                    value={editForm.description || ""} 
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-surface-hover border border-border-default rounded-xl p-4 text-text-primary focus:outline-none focus:border-primary text-sm resize-none h-24"
                    placeholder={isAr ? "وصف دور الشريك أو طبيعة التعاون..." : "Brief summary of the partnership..."}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary">{isAr ? "شعار الشريك" : "Logo Image"}</label>
                  <MediaUploader 
                    value={editForm.logoUrl}
                    onChange={url => setEditForm({ ...editForm, logoUrl: url })}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="isVisible" 
                    checked={editForm.isVisible ?? true} 
                    onChange={e => setEditForm({ ...editForm, isVisible: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="isVisible" className="text-sm font-bold text-text-primary">
                    {isAr ? "عرض الشعار على الموقع العام" : "Visible on Public Website"}
                  </label>
                </div>
              </div>

              <div className="sticky bottom-0 bg-surface-default/80 backdrop-blur-md border-t border-border-default px-6 py-4 flex items-center justify-end gap-3 z-10">
                <button onClick={() => setIsEditing(null)} className="px-5 py-2.5 text-text-secondary hover:text-text-primary font-bold text-sm transition-colors">
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all shadow-md">
                  {isSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ الشريك" : "Save Partner")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardPageShell>
  )
}
