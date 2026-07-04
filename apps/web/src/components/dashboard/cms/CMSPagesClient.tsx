"use client"

import { useState, useEffect } from "react"
import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { AdminFormLayout } from "@/components/dashboard/ui/AdminFormLayout"
import { useToast } from "@/components/dashboard/ui/ToastProvider"

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
        setPages(json.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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
    } catch (e) {
      // Allow invalid JSON while typing, maybe store as string in a separate state if needed,
      // but for simplicity, we just won't update the object until valid.
    }
  }

  if (editingPage) {
    return (
      <div className="flex flex-col gap-6 h-full p-6">
        <AdminPageHeader 
          title={editingPage.id ? `Edit Page: ${editingPage.slug}` : "Create New Page"}
          description="Edit the raw JSON content of the CMS page."
          action={
            <div className="flex items-center gap-3">
              <AdminButton variant="outline" onClick={() => setEditingPage(null)} disabled={saving}>
                Cancel
              </AdminButton>
              <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Page"}
              </AdminButton>
            </div>
          }
        />
        
        <AdminFormLayout>
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Slug</label>
                <input 
                  type="text" 
                  value={editingPage.slug || ''}
                  onChange={e => setEditingPage({ ...editingPage, slug: e.target.value })}
                  disabled={!!editingPage.id} // cannot edit slug of existing page easily in this simple UI
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
        title="CMS Pages" 
        description="Manage dynamic pages stored in the CMS."
        action={
          <AdminButton 
            variant="primary" 
            onClick={() => setEditingPage({ slug: '', title: {}, content: {}, seo: {} })}
          >
            Create New Page
          </AdminButton>
        }
      />

      <div className="p-8 flex-1 overflow-y-auto">
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
          <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-surface-hover border-b border-border-default text-xs uppercase text-text-tertiary">
                <tr>
                  <th className="px-6 py-4 font-bold">Slug</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Updated</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {page.slug}
                    </td>
                    <td className="px-6 py-4">
                      {page.status}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setEditingPage(page)}
                        className="text-primary hover:text-primary-hover font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
