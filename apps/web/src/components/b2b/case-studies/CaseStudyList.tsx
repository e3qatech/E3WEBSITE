"use client"

import { useState } from "react"
import { CaseStudyCard, CaseStudy } from "./CaseStudyCard"
import { CaseStudyFilters } from "./CaseStudyFilters"

interface CaseStudyListProps {
  initialItems: CaseStudy[]
  locale: string
}

export function CaseStudyList({ initialItems, locale }: CaseStudyListProps) {
  const [filteredItems, setFilteredItems] = useState<CaseStudy[]>(initialItems)

  const handleFilterChange = (newItems: CaseStudy[]) => {
    setFilteredItems(newItems)
  }

  // The first item of the filtered list can be considered "Featured" 
  // if the user hasn't heavily filtered, but for simplicity, we'll feature the first item.
  const featuredItem = filteredItems.length > 0 ? filteredItems[0] : null
  const gridItems = filteredItems.length > 1 ? filteredItems.slice(1) : []

  return (
    <>
      <CaseStudyFilters 
        items={initialItems} 
        onFilterChange={handleFilterChange} 
        locale={locale} 
      />

      {filteredItems.length === 0 ? (
        <div className="text-center py-24 bg-[var(--surface-hover)] rounded-3xl border border-[var(--border-default)]">
          <p className="text-xl text-[var(--text-secondary)]">
            {locale === 'ar' ? 'لا توجد مشاريع تطابق بحثك.' : 'No projects match your search.'}
          </p>
        </div>
      ) : (
        <>
          {featuredItem && (
            <CaseStudyCard 
              caseStudy={featuredItem} 
              locale={locale} 
              isFeatured={true} 
            />
          )}

          {gridItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-12">
              {gridItems.map((item, index) => (
                <CaseStudyCard 
                  key={item.id} 
                  caseStudy={item} 
                  locale={locale} 
                  index={index} 
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
