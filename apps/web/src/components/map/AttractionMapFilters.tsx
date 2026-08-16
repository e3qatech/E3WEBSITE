"use client";

import React from 'react';
import { Search, Locate } from 'lucide-react';

interface AttractionMapFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onNearMeClick: () => void;
  locating: boolean;
  userCoordsActive: boolean;
  locale: string;
}

export function AttractionMapFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onNearMeClick,
  locating,
  userCoordsActive,
  locale
}: AttractionMapFiltersProps) {
  const isAr = locale === 'ar';

  const categories = [
    { id: 'ALL', labelEn: 'All Attractions', labelAr: 'جميع الوجهات' },
    { id: 'OPEN_NOW', labelEn: 'Open Now', labelAr: 'مفتوح الآن' },
    { id: 'PERMANENT_ATTRACTION', labelEn: 'Permanent Worlds', labelAr: 'وجهات دائمية' },
    { id: 'MALL_ACTIVATION', labelEn: 'Mall Activations', labelAr: 'فعاليات المولات' },
    { id: 'SEASONAL_ATTRACTION', labelEn: 'Seasonal & Splash', labelAr: 'تجارب موسمية' },
    { id: 'EVENT', labelEn: 'Special Events', labelAr: 'فعاليات خاصة' },
  ];

  return (
    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 w-full">
      {/* Category Pills with smooth horizontal scroll and zero clipping */}
      <div className="relative flex-1 min-w-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 scrollbar-none snap-x py-1 px-0.5">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer shrink-0 snap-start select-none ${
                  isActive
                    ? 'bg-[var(--e3-royal-blue)] text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/40'
                    : 'bg-[var(--surface-default)] text-[var(--text-secondary)] border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] shadow-xs'
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Near Me & Search Box */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
        <button
          type="button"
          onClick={onNearMeClick}
          disabled={locating}
          className={`px-4 py-2 rounded-xl border text-xs font-mono font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2 shrink-0 ${
            userCoordsActive
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-[var(--surface-default)] text-[var(--text-primary)] border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Locate className={`w-3.5 h-3.5 text-[var(--e3-royal-blue)] ${locating ? 'animate-spin' : ''}`} />
          <span className="whitespace-nowrap">
            {locating
              ? (isAr ? "جاري التحديد..." : "Locating...")
              : userCoordsActive
              ? (isAr ? "موقعك نشط" : "Near Me Active")
              : (isAr ? "القريب مني" : "Near Me")}
          </span>
        </button>

        <div className="relative w-full sm:w-[240px] shrink-0">
          <Search className="w-4 h-4 absolute top-2.5 start-3 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="text"
            placeholder={isAr ? "ابحث عن وجهة أو موقع..." : "Search venue or address..."}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full ps-9 pe-4 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--e3-royal-blue)] focus:ring-1 focus:ring-[var(--e3-royal-blue)] placeholder:text-[var(--text-tertiary)] shadow-inner transition-all"
          />
        </div>
      </div>
    </div>
  );
}
