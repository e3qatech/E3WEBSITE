"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Check, Sparkles, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

export function PackageCategoriesManager({
  locale,
  dir
}: {
  locale: "en" | "ar"
  dir: "ltr" | "rtl"
}) {
  const isAr = locale === "ar"
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCat, setEditingCat] = useState<any | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    slug: "",
    descriptionEn: "",
    descriptionAr: "",
    theme: "emerald",
    icon: "Sparkles",
    sortOrder: 0,
    isActive: true,
    isFeatured: false
  })

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/b2c/package-categories?all=true")
      const json = await res.json()
      setCategories(Array.isArray(json.data) ? json.data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleEdit = (cat: any) => {
    setEditingCat(cat)
    setForm({
      nameEn: cat.nameEn || "",
      nameAr: cat.nameAr || "",
      slug: cat.slug || "",
      descriptionEn: cat.descriptionEn || "",
      descriptionAr: cat.descriptionAr || "",
      theme: cat.theme || "emerald",
      icon: cat.icon || "Sparkles",
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
      isFeatured: Boolean(cat.isFeatured)
    })
    setIsCreating(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCat ? `/api/b2c/package-categories/${editingCat.id}` : "/api/b2c/package-categories"
      const method = editingCat ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      if (!res.ok) throw new Error("Failed to save category")

      setEditingCat(null)
      setIsCreating(false)
      fetchCategories()
    } catch (_e) {
      alert("Failed to save category")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذه الفئة؟" : "Are you sure you want to delete/deactivate this category?")) return
    try {
      await fetch(`/api/b2c/package-categories/${id}`, { method: "DELETE" })
      fetchCategories()
    } catch {
      alert("Failed to delete category")
    }
  }

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">
            {isAr ? "دليل فئات الباقات (Package Taxonomy)" : "Package Category Taxonomy"}
          </h3>
          <p className="text-xs text-slate-400">
            {isAr ? "إدارة وتصنيف باقات الفعاليات والأنشطة الترفيهية وترتيب ظهورها." : "Manage public category tabs, titles, themes, and sort orders."}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingCat(null)
            setForm({
              nameEn: "",
              nameAr: "",
              slug: "",
              descriptionEn: "",
              descriptionAr: "",
              theme: "emerald",
              icon: "Sparkles",
              sortOrder: categories.length + 1,
              isActive: true,
              isFeatured: false
            })
            setIsCreating(true)
          }}
          className="gap-1.5 text-xs bg-emerald-500 text-slate-950 font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إضافة فئة جديدة" : "Add Category"}
        </Button>
      </div>

      {/* Editor Form Modal or Inline Card */}
      {(isCreating || editingCat) && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white">
            {editingCat ? (isAr ? "تعديل الفئة" : "Edit Category") : (isAr ? "إنشاء فئة جديدة" : "Create New Category")}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Name (EN) *</label>
              <input
                type="text"
                required
                value={form.nameEn}
                onChange={e => setForm({ ...form, nameEn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">الاسم (بالعربية) *</label>
              <input
                type="text"
                required
                value={form.nameAr}
                onChange={e => setForm({ ...form, nameAr: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Slug *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Description (EN / AR)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <textarea
                  rows={2}
                  value={form.descriptionEn}
                  onChange={e => setForm({ ...form, descriptionEn: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white resize-none"
                  placeholder="English description"
                />
                <textarea
                  rows={2}
                  value={form.descriptionAr}
                  onChange={e => setForm({ ...form, descriptionAr: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white resize-none"
                  placeholder="الوصف بالعربية"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded text-emerald-500"
                />
                <span>Active / مفعل</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded text-emerald-500"
                />
                <span>Featured / مميز</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditingCat(null); setIsCreating(false); }} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-bold bg-emerald-500 text-slate-950">
                Save Category
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="w-full text-start text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <th className="p-4 text-start">Order</th>
              <th className="p-4 text-start">Category Name</th>
              <th className="p-4 text-start">Slug</th>
              <th className="p-4 text-start">Packages Count</th>
              <th className="p-4 text-start">Status</th>
              <th className="p-4 text-end">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-mono font-bold text-slate-500">{cat.sortOrder}</td>
                <td className="p-4">
                  <div className="font-bold text-white">{cat.nameEn}</div>
                  <div className="text-[11px] text-slate-400">{cat.nameAr}</div>
                </td>
                <td className="p-4 font-mono text-emerald-400">{cat.slug}</td>
                <td className="p-4 font-mono text-slate-300">
                  {cat._count?.packages || 0}
                </td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                    cat.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-800 text-slate-400"
                  )}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-end">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
