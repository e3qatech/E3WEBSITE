"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { AdminFormLayout } from "@/components/dashboard/ui/AdminFormLayout"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { getManagedCMSPage, getAllManagedCMSPages } from "@/lib/cms-ownership"
import { ExternalLink, Sparkles, Layers, FileText, CheckCircle2 } from "lucide-react"

export function CMSPagesClient() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const fetchPages = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cms/pages")
      const json = await res.json()
      if (json.data) {
        // Ensure all canonical managed pages are listed even if not yet saved in DB
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Expected pattern for initial data synchronization
    fetchPages()
  }, [])

  const handleSave = async () => {
    if (!editingPage?.slug) {
      toast("Slug is required", "error")
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
      toast(`Page ${editingPage.slug} saved successfully.`, "success")
      setEditingPage(null)
      fetchPages()
    } catch (e) {
      console.error(e)
      toast("Failed to save page.", "error")
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

  if (editingPage) {
    const managedInfo = getManagedCMSPage(editingPage.slug)

    return (
      <div className="flex flex-col gap-6 h-full p-6">
        <AdminPageHeader 
          title={editingPage.id ? `Edit Page: ${editingPage.slug}` : "Create New Page"}
          description={
            managedInfo
              ? `Managed Page: ${managedInfo.nameEn} — For best results use the dedicated editor.`
              : "Edit page content and metadata."
          }
          action={
            <div className="flex items-center gap-3">
              {managedInfo && (
                <Link
                  href={managedInfo.specializedEditorPath}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Dedicated Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
              <AdminButton variant="outline" onClick={() => setEditingPage(null)} disabled={saving}>
                Cancel
              </AdminButton>
              <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Page"}
              </AdminButton>
            </div>
          }
        />

        {managedInfo && (
          <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Specialized Editor Available</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono uppercase">
                  {managedInfo.domain}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                This page has a dedicated visual manager at{' '}
                <Link href={managedInfo.specializedEditorPath} className="text-purple-400 font-bold hover:underline">
                  {managedInfo.specializedEditorPath}
                </Link>
                . Any raw JSON edits saved here are safely deep-merged with the canonical structured schema to prevent field loss.
              </p>
            </div>
          </div>
        )}
        
        <AdminFormLayout>
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Slug</label>
                <input 
                  type="text" 
                  value={editingPage.slug || ''}
                  onChange={e => setEditingPage({ ...editingPage, slug: e.target.value })}
                  disabled={Boolean(editingPage.id || managedInfo)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none disabled:opacity-50"
                  placeholder="e.g. new-page-slug"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">JSON Content</label>
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
    <div className="flex flex-col h-full">
      <AdminPageHeader 
        title="CMS Pages & Content Registry" 
        description="Manage dynamic pages, specialized layout editors, and structured CMS documents."
        action={
          <AdminButton 
            variant="primary" 
            onClick={() => setEditingPage({ slug: '', title: {}, content: {}, seo: {} })}
          >
            Create New Page
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
            <h3 className="text-lg font-bold text-text-primary mb-2">No pages found</h3>
            <p className="text-text-secondary mb-6 text-center max-w-sm">
              Create your first dynamic page to store content.
            </p>
            <AdminButton 
              variant="outline" 
              onClick={() => setEditingPage({ slug: '', title: {}, content: {}, seo: {} })}
            >
              Create Page
            </AdminButton>
          </div>
        ) : (
          <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-surface-hover border-b border-border-default text-xs uppercase text-text-tertiary">
                <tr>
                  <th className="px-6 py-4 font-bold">Page / Slug</th>
                  <th className="px-6 py-4 font-bold">Editor Type</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Updated</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {pages.map((page) => {
                  const managed = getManagedCMSPage(page.slug)
                  const isManaged = Boolean(managed)

                  return (
                    <tr key={page.id || page.slug} className="hover:bg-surface-hover/50 transition-colors">
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
                              {managed?.nameEn || page.slug}
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
                            <span>Specialized ({managed?.domain})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-500/10 border border-slate-500/30 text-slate-400 text-xs font-bold">
                            <span>Generic Dynamic</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{page.status || 'PUBLISHED'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isManaged ? (
                            <>
                              <Link
                                href={managed!.specializedEditorPath}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm"
                              >
                                <span>Open Editor</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                              <button 
                                onClick={() => setEditingPage(page)}
                                className="text-text-tertiary hover:text-text-primary text-xs font-medium px-2 py-1"
                                title="Edit raw JSON fallback"
                              >
                                Raw JSON
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => setEditingPage(page)}
                              className="text-primary hover:text-primary-hover font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                            >
                              Edit Page
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
