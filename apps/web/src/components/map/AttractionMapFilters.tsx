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
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--surface-default)]/90 backdrop-blur-md border border-[var(--border-level-2)] shadow-md overflow-x-auto max-w-full no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 select-none ${
                  isActive
                    ? 'font-black bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : 'font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
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
          className={`px-4 py-2 rounded-full border text-xs font-mono font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2 shrink-0 ${
            userCoordsActive
              ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
              : 'bg-[var(--surface-default)] text-[var(--text-primary)] border border-[var(--border-level-2)] hover:border-emerald-500/50 hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Locate className={`w-3.5 h-3.5 ${userCoordsActive ? 'text-slate-950' : 'text-emerald-500'} ${locating ? 'animate-spin' : ''}`} />
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
            className="w-full ps-9 pe-4 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-full text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-[var(--text-tertiary)] shadow-inner transition-all"
          />
        </div>
      </div>
    </div>
  );
}
