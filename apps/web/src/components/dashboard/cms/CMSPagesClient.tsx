"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { AdminFormLayout } from "@/components/dashboard/ui/AdminFormLayout"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { useLocale } from "@/components/layout/LocaleProvider"
import { localizeHref } from "@/lib/url-helper"
import { getManagedCMSPage, getAllManagedCMSPages, isManagedCMSPage } from "@/lib/cms-ownership"
import { ExternalLink, Sparkles, Layers, FileText, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"

export interface CMSPagesClientProps {
  initialPages?: any[]
  initialLoading?: boolean
}

export function CMSPagesClient({ initialPages, initialLoading = false }: CMSPagesClientProps = {}) {
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

  const [pages, setPages] = useState<any[]>(() => {
    if (initialPages && initialPages.length > 0) {
      const managed = getAllManagedCMSPages()
      const existingSlugs = new Set(initialPages.map((p: any) => p.slug))
      const combined = [...initialPages]
      for (const m of managed) {
        if (!existingSlugs.has(m.slug)) {
          combined.unshift({
            id: `virtual-${m.slug}`,
            slug: m.slug,
            status: 'PUBLISHED',
            updatedAt: new Date().toISOString(),
            isManagedVirtual: true,
          })
        }
      }
      return combined
    }
    const managed = getAllManagedCMSPages()
    return managed.map(m => ({
      id: `virtual-${m.slug}`,
      slug: m.slug,
      status: 'PUBLISHED',
      updatedAt: new Date().toISOString(),
      isManagedVirtual: true,
    }))
  })

  const [loading, setLoading] = useState(initialLoading)
  const [editingPage, setEditingPage] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const fetchPages = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cms/pages")
      const json = await res.json()
      if (json.data) {
        const managed = getAllManagedCMSPages()
        const existingSlugs = new Set(json.data.map((p: any) => p.slug))
        
        const combined = [...json.data]
        for (const m of managed) {
          if (!existingSlugs.has(m.slug)) {
            combined.unshift({
              id: `virtual-${m.slug}`,
              slug: m.slug,
              status: 'PUBLISHED',
              updatedAt: new Date().toISOString(),
              isManagedVirtual: true,
            })
          }
        }
        setPages(combined)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Expected pattern for initial data synchronization
      fetchPages()
    }
  }, [initialPages])

  const handleSave = async () => {
    if (!editingPage?.slug) {
      toast(isAr ? "المسار مطلوب" : "Slug is required", "error")
      return
    }

    if (isManagedCMSPage(editingPage.slug)) {
      toast(
        isAr 
          ? "هذه صفحة مخصصة ويجب تعديلها عبر المحرر المخصص فقط" 
          : "This is a specialized managed page. Please use its dedicated editor.",
        "error"
      )
      return
    }
    
    setSaving(true)
    try {
      const res = await fetch(`/api/cms/pages/${editingPage.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: editingPage.title,
          content: editingPage.content,
          seo: editingPage.seo 
        })
      })
      if (!res.ok) throw new Error("Failed to save")
      toast(
        isAr 
          ? `تم حفظ الصفحة ${editingPage.slug} بنجاح.` 
          : `Page ${editingPage.slug} saved successfully.`, 
        "success"
      )
      setEditingPage(null)
      fetchPages()
    } catch (e) {
      console.error(e)
      toast(isAr ? "فشل حفظ الصفحة." : "Failed to save page.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleContentChange = (val: string) => {
    try {
      const parsed = JSON.parse(val)
      setEditingPage({ ...editingPage, content: parsed })
    } catch {
      // Allow invalid JSON while typing
    }
  }

  // If editing an unmanaged page (or if a managed page was somehow requested, route to specialized handoff)
  if (editingPage) {
    const managedInfo = getManagedCMSPage(editingPage.slug)

    // Managed pages MUST NOT expose generic JSON editing or generic save
    if (managedInfo) {
      const localizedEditorPath = localizeHref(managedInfo.specializedEditorPath, locale)
      return (
        <div dir={dir} className="flex flex-col gap-6 h-full p-6" data-testid="managed-page-guard-view">
          <AdminPageHeader 
            title={isAr ? `صفحة مخصصة: ${managedInfo.nameAr}` : `Specialized Page: ${managedInfo.nameEn}`}
            description={
              isAr
                ? "هذه الصفحة تتبع لمحرر بصري مخصص ولا يمكن تعديلها كـ JSON عام لحماية الحقول الهيكلية."
                : "This page is managed by a specialized visual editor and cannot be edited as raw JSON."
            }
            action={
              <div className="flex items-center gap-3">
                <AdminButton variant="outline" onClick={() => setEditingPage(null)}>
                  {isAr ? "العودة للقائمة" : "Back to List"}
                </AdminButton>
                <Link
                  href={localizedEditorPath}
                  data-testid="managed-editor-redirect-link"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAr ? "فتح المحرر المخصص" : "Open Dedicated Editor"}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            }
          />

          <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? managedInfo.nameAr : managedInfo.nameEn}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isAr ? managedInfo.descriptionAr : managedInfo.descriptionEn}
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href={localizedEditorPath}
                className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300"
              >
                <span>{isAr ? "الانتقال المباشر للمحرر" : "Direct Link to Editor"}</span>
                {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // Normal Unmanaged Generic Page Editor
    return (
      <div dir={dir} className="flex flex-col gap-6 h-full p-6" data-testid="generic-page-editor-view">
        <AdminPageHeader 
          title={
            editingPage.id 
              ? (isAr ? `تعديل الصفحة: ${editingPage.slug}` : `Edit Page: ${editingPage.slug}`)
              : (isAr ? "إنشاء صفحة ديناميكية جديدة" : "Create New Page")
          }
          description={
            isAr
              ? "تعديل محتوى الصفحة والبيانات الوصفية (SEO)."
              : "Edit dynamic page JSON content and SEO metadata."
          }
          action={
            <div className="flex items-center gap-3">
              <AdminButton variant="outline" onClick={() => setEditingPage(null)} disabled={saving}>
                {isAr ? "إلغاء" : "Cancel"}
              </AdminButton>
              <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ الصفحة" : "Save Page")}
              </AdminButton>
            </div>
          }
        />
        
        <AdminFormLayout>
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  {isAr ? "المسار (Slug)" : "Slug"}
                </label>
                <input 
                  type="text" 
                  value={editingPage.slug || ''}
                  onChange={e => setEditingPage({ ...editingPage, slug: e.target.value })}
                  disabled={Boolean(editingPage.id)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none disabled:opacity-50"
                  placeholder={isAr ? "مثال: terms-of-service" : "e.g. new-page-slug"}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  {isAr ? "محتوى الـ JSON" : "JSON Content"}
                </label>
                <textarea 
                  defaultValue={JSON.stringify(editingPage.content || {}, null, 2)}
                  onChange={e => handleContentChange(e.target.value)}
                  className="w-full h-96 font-mono text-xs bg-surface-hover border border-border-default rounded-lg px-4 py-4 text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </AdminFormLayout>
      </div>
    )
  }

  return (
    <div dir={dir} className="flex flex-col h-full" data-testid="cms-pages-index-view">
      <AdminPageHeader 
        title={isAr ? "سجل صفحات ومحتوى الموقع (CMS)" : "CMS Pages & Content Registry"} 
        description={
          isAr
            ? "إدارة الصفحات الديناميكية، المحررات المخصصة للواجهات، وسجلات المحتوى الهيكلي."
            : "Manage dynamic pages, specialized layout editors, and structured CMS documents."
        }
        action={
          <AdminButton 
            variant="primary" 
            onClick={() => setEditingPage({ slug: '', title: {}, content: {}, seo: {} })}
          >
            {isAr ? "إنشاء صفحة جديدة" : "Create New Page"}
          </AdminButton>
        }
      />

      <div className="p-8 flex-1 overflow-y-auto space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border-default rounded-xl">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              {isAr ? "لا توجد صفحات" : "No pages found"}
            </h3>
            <p className="text-text-secondary mb-6 text-center max-w-sm">
              {isAr ? "أنشئ أول صفحة ديناميكية لتخزين المحتوى." : "Create your first dynamic page to store content."}
            </p>
            <AdminButton 
              variant="outline" 
              onClick={() => setEditingPage({ slug: '', title: {}, content: {}, seo: {} })}
            >
              {isAr ? "إنشاء صفحة" : "Create Page"}
            </AdminButton>
          </div>
        ) : (
          <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-text-secondary rtl:text-right">
              <thead className="bg-surface-hover border-b border-border-default text-xs uppercase text-text-tertiary">
                <tr>
                  <th className="px-6 py-4 font-bold">{isAr ? "الصفحة / المسار" : "Page / Slug"}</th>
                  <th className="px-6 py-4 font-bold">{isAr ? "نوع المحرر" : "Editor Type"}</th>
                  <th className="px-6 py-4 font-bold">{isAr ? "الحالة" : "Status"}</th>
                  <th className="px-6 py-4 font-bold">{isAr ? "آخر تحديث" : "Updated"}</th>
                  <th className="px-6 py-4 font-bold text-right rtl:text-left">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {pages.map((page) => {
                  const managed = getManagedCMSPage(page.slug)
                  const isManaged = Boolean(managed)
                  const specializedHref = managed ? localizeHref(managed.specializedEditorPath, locale) : ''

                  return (
                    <tr 
                      key={page.id || page.slug} 
                      data-testid={`cms-page-row-${page.slug}`}
                      className="hover:bg-surface-hover/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-text-primary">
                        <div className="flex items-center gap-2.5">
                          {isManaged ? (
                            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-slate-500/10 border border-slate-500/30 text-slate-400 flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-text-primary">
                              {managed ? (isAr ? managed.nameAr : managed.nameEn) : page.slug}
                            </div>
                            <div className="text-[11px] font-mono text-text-tertiary">
                              /{page.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isManaged ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">
                            <Layers className="w-3 h-3" />
                            <span>
                              {isAr ? `محرر مخصص (${managed?.domain})` : `Specialized (${managed?.domain})`}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-500/10 border border-slate-500/30 text-slate-400 text-xs font-bold">
                            <span>{isAr ? "صفحة ديناميكية عامة" : "Generic Dynamic"}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isAr ? "منشور" : (page.status || 'PUBLISHED')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString(locale === 'ar' ? 'ar-QA' : 'en-US') : (isAr ? 'نشط' : 'Active')}
                      </td>
                      <td className="px-6 py-4 text-right rtl:text-left">
                        <div className="flex items-center justify-end rtl:justify-start gap-2">
                          {isManaged ? (
                            <Link
                              href={specializedHref}
                              data-testid={`open-editor-btn-${page.slug}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm"
                            >
                              <span>{isAr ? "فتح المحرر" : "Open Editor"}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            <button 
                              onClick={() => setEditingPage(page)}
                              data-testid={`edit-generic-page-btn-${page.slug}`}
                              className="text-primary hover:text-primary-hover font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                            >
                              {isAr ? "تعديل الصفحة" : "Edit Page"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
