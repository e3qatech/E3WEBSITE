"use client";

import React from 'react';
import { Search, Locate, Compass, Filter } from 'lucide-react';

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
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 w-full overflow-hidden">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar min-w-0 flex-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[var(--e3-royal-blue)] text-white shadow-lg'
                  : 'bg-[var(--surface-default)] text-[var(--text-secondary)] border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] hover:text-white'
              }`}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          );
        })}
      </div>

      {/* Near Me & Search Box */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
        <button
          onClick={onNearMeClick}
          disabled={locating}
          className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2 shrink-0 ${
            userCoordsActive
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-[var(--surface-default)] text-[var(--text-primary)] border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)]'
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

        <div className="relative w-full sm:w-[220px] shrink-0">
          <Search className="w-4 h-4 absolute top-2.5 start-3 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder={isAr ? "ابحث عن وجهة أو موقع..." : "Search venue or address..."}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full ps-9 pe-4 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--e3-royal-blue)] placeholder:text-[var(--text-tertiary)] shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}
