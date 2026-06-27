"use client"

import { useState, useEffect } from "react"
import { Filter } from "lucide-react"
import type { CaseStudy } from "./CaseStudyCard"

interface CaseStudyFiltersProps {
  items: CaseStudy[]
  onFilterChange: (filteredItems: CaseStudy[]) => void
  locale: string
}

export function CaseStudyFilters({ items, onFilterChange, locale }: CaseStudyFiltersProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeYear, setActiveYear] = useState('All')

  // Extract unique categories and years
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))].filter(Boolean)
  const years = ['All', ...Array.from(new Set(items.map(item => item.year)))].filter(Boolean).sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : b.localeCompare(a)))

  useEffect(() => {
    let filtered = items

    if (activeCategory !== 'All') {
      filtered = filtered.filter(item => item.category === activeCategory)
    }

    if (activeYear !== 'All') {
      filtered = filtered.filter(item => item.year === activeYear)
    }

    onFilterChange(filtered)
  }, [activeCategory, activeYear, items])

  return (
    <div className="bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-2xl p-4 md:p-6 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      
      <div className="flex items-center gap-3 text-[var(--text-primary)] font-bold">
        <Filter className="w-5 h-5 text-[var(--color-primary)]" />
        {locale === 'ar' ? 'تصفية المشاريع' : 'Filter Projects'}
      </div>

      <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
        
        {/* Category Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            {locale === 'ar' ? 'الفئة' : 'Category'}
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--surface-default)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]/50 border border-[var(--border-default)]'
                }`}
              >
                {cat === 'All' ? (locale === 'ar' ? 'الكل' : 'All') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Year Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            {locale === 'ar' ? 'السنة' : 'Year'}
          </label>
          <select 
            value={activeYear}
            onChange={(e) => setActiveYear(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-[var(--surface-default)] text-[var(--text-secondary)] border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year === 'All' ? (locale === 'ar' ? 'جميع السنوات' : 'All Years') : year}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  )
}
