"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Archive, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { BrandEditor } from "./BrandEditor"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function BrandsManager() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  const [editingBrand, setEditingBrand] = useState<any | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/b2c/brands')
      const data = await res.json()
      setBrands(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const filteredBrands = brands.filter(b => 
    b.nameEn.toLowerCase().includes(search.toLowerCase()) || 
    b.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this brand? It will become INACTIVE.")) return;
    try {
      await fetch(`/api/b2c/brands/${id}`, { method: 'DELETE' });
      fetchBrands();
    } catch (e) {
      console.error(e);
      alert("Failed to archive brand");
    }
  }

  if (editingBrand || isCreating) {
    return (
      <BrandEditor 
        initialData={editingBrand} 
        onClose={() => { setEditingBrand(null); setIsCreating(false); }} 
        onSave={() => { setEditingBrand(null); setIsCreating(false); fetchBrands(); }} 
      />
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search brands by name or slug..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl text-sm focus:border-[var(--color-primary)] focus:outline-none transition-colors"
          />
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> New Brand
        </Button>
      </div>

      <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-subtle)] border-b border-[var(--border-default)]">
              <tr>
                <th className="px-6 py-4 font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">Brand</th>
                <th className="px-6 py-4 font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">Lifecycle</th>
                <th className="px-6 py-4 font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">Placements</th>
                <th className="px-6 py-4 font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">Visibility</th>
                <th className="px-6 py-4 font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-tertiary)]">Loading brands...</td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                    No brands found.
                  </td>
                </tr>
              ) : (
                filteredBrands.map(brand => (
                  <tr key={brand.id} className="hover:bg-[var(--surface-hover)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-default)] flex items-center justify-center overflow-hidden shrink-0">
                          {brand.compactLogoUrl || brand.primaryLogoUrl ? (
                            <Image src={brand.compactLogoUrl || brand.primaryLogoUrl} alt={brand.nameEn} width={48} height={48} className="object-contain" />
                          ) : (
                            <span className="text-xs font-bold text-[var(--text-tertiary)]">{brand.nameEn.substring(0,2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{brand.nameEn}</div>
                          <div className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">{brand.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        brand.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      )}>
                        {brand.lifecycleStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[11px] font-medium text-[var(--text-secondary)]">
                        {brand.placements?.length || 0} Attractions<br/>
                        {brand.relationships?.map((r: any) => r.labelEn).join(", ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {brand.showOnB2C && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold">B2C</span>}
                        {brand.showOnB2B && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-bold">B2B</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingBrand(brand)} className="p-2 hover:bg-white rounded-lg text-blue-600 transition-colors tooltip-trigger" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleArchive(brand.id)} className="p-2 hover:bg-white rounded-lg text-red-600 transition-colors tooltip-trigger" title="Archive">
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
