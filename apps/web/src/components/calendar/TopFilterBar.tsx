'use client';

import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Tag, Check, Users, MapPin } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameDay, 
  isToday,
  startOfDay
} from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLocale } from '@/components/layout/LocaleProvider';

export type EventType = 'REGULAR' | 'SPECIAL' | 'FESTIVAL' | 'PRIVATE';
export type AvailabilityType = 'ALL' | 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT';

interface Attraction {
  id: string;
  nameEn: string;
  nameAr: string;
}

interface TopFilterBarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  attractions: Attraction[];
  selectedAttractions: string[];
  onAttractionToggle: (id: string) => void;
  selectedEventTypes: EventType[];
  onEventTypeToggle: (type: EventType) => void;
  isDiscountActive: boolean;
  onDiscountToggle: () => void;
  onResetFilters: () => void;
  onBulkBookingClick: () => void;
}

export function TopFilterBar({
  currentDate,
  onDateChange,
  attractions,
  selectedAttractions,
  onAttractionToggle,
  selectedEventTypes,
  onEventTypeToggle,
  isDiscountActive,
  onDiscountToggle,
  onResetFilters,
  onBulkBookingClick
}: TopFilterBarProps) {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const dateLocale = isAr ? ar : enUS;
  
  const today = startOfDay(new Date());
  const maxBookingDate = addMonths(today, 3);
  const monthStart = startOfMonth(currentDate);
  const endOfNextMonth = endOfMonth(addMonths(currentDate, 1));
  
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: endOfNextMonth }).filter(
    day => day >= today && day <= maxBookingDate
  );
  
  const dateScrollRef = useRef<HTMLDivElement>(null);

  const nextMonth = () => onDateChange(addMonths(currentDate, 1));
  const prevMonth = () => onDateChange(subMonths(currentDate, 1));
  const goToToday = () => onDateChange(new Date());

  const eventTypeLabels: Record<EventType, { en: string; ar: string }> = {
    REGULAR: { en: 'REGULAR', ar: 'عادية' },
    SPECIAL: { en: 'SPECIAL', ar: 'خاصة' },
    FESTIVAL: { en: 'FESTIVAL', ar: 'مهرجانات' },
    PRIVATE: { en: 'PRIVATE', ar: 'حصرية' },
  };

  // Auto-scroll to selected date on mount or date change
  useEffect(() => {
    if (dateScrollRef.current) {
      const selectedEl = dateScrollRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentDate]);

  return (
    <div className="bg-[var(--surface-default)]/95 backdrop-blur-xl border-b border-[var(--border-level-2)] sticky top-20 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        
        {/* Top Row: Quick Picks & Month Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--surface-default)]/90 backdrop-blur-md border border-[var(--border-level-2)] shadow-md">
              <button 
                onClick={goToToday}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isAr ? 'اليوم' : 'Today'}</span>
              </button>
              <button 
                onClick={onDiscountToggle}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer whitespace-nowrap ${
                  isDiscountActive 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] font-bold'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{isAr ? 'العروض والخصومات' : 'Offers & Discounts'}</span>
              </button>
              <button 
                onClick={onBulkBookingClick}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>{isAr ? 'حجز المجموعات' : 'Group Booking'}</span>
              </button>
            </div>
            
            {(selectedAttractions.length > 0 || selectedEventTypes.length > 0 || isDiscountActive) && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase transition-colors bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white ms-auto focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none cursor-pointer shadow-sm"
              >
                {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
              </button>
            )}
            
            {/* Event Types */}
            <div className="w-px h-6 bg-[var(--border-level-2)] mx-2 shrink-0 hidden md:block" />
            
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--surface-default)]/90 backdrop-blur-md border border-[var(--border-level-2)] shadow-md">
              {(['REGULAR', 'SPECIAL', 'FESTIVAL', 'PRIVATE'] as EventType[]).map(type => (
                <button
                  key={type}
                  onClick={() => onEventTypeToggle(type)}
                  className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer ${
                    selectedEventTypes.includes(type) 
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] font-bold'
                  }`}
                >
                  {isAr ? eventTypeLabels[type].ar : eventTypeLabels[type].en}
                </button>
              ))}
            </div>
          </div>

          {/* Month HUD Navigation Cluster */}
          <div className="inline-flex items-center gap-2 bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] rounded-2xl p-1.5 shadow-md backdrop-blur-md shrink-0">
            <button 
              onClick={prevMonth} 
              className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-emerald-500 hover:text-slate-950 text-[var(--text-secondary)] transition-all cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none" 
              aria-label={isAr ? "الشهر السابق" : "Previous month"}
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>

            <span className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-level-1)] text-xs font-mono font-bold text-[var(--text-primary)] border border-[var(--border-level-2)] shadow-inner">
              {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
            </span>

            <button 
              onClick={nextMonth} 
              className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-emerald-500 hover:text-slate-950 text-[var(--text-secondary)] transition-all cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none" 
              aria-label={isAr ? "الشهر التالي" : "Next month"}
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
          
        </div>

        {/* Middle Row: Date Scroller */}
        <div className="relative">
          <div className="absolute start-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--surface-default)] to-transparent z-10 pointer-events-none" />
          <div className="absolute end-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--surface-default)] to-transparent z-10 pointer-events-none" />
          
          <div 
            ref={dateScrollRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-2"
          >
            {daysInMonth.map(day => {
              const isSelected = isSameDay(day, currentDate);
              const isTodayDay = isToday(day);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => onDateChange(day)}
                  data-selected={isSelected}
                  className={`
                    flex flex-col items-center justify-center min-w-[64px] h-[72px] rounded-2xl border transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer
                    ${isSelected 
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)] font-black' 
                      : isTodayDay
                        ? 'bg-[var(--surface-hover)] border-emerald-500/60 text-emerald-500 hover:bg-[var(--surface-active)]'
                        : 'bg-[var(--surface-hover)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-active)] hover:text-[var(--text-primary)] hover:border-[var(--border-level-3)]'
                    }
                  `}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1 font-mono">
                    {format(day, 'EEE', { locale: dateLocale })}
                  </span>
                  <span className={`text-xl font-black font-satoshi ${isSelected ? 'text-slate-950 font-black' : 'text-[var(--text-primary)]'}`}>
                    {format(day, 'd')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Row: Destination Filter */}
        {attractions.length > 0 ? (
          <div 
            role="group" 
            aria-label={isAr ? "فلترة حسب الوجهة" : "Filter by destination"}
            className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1"
          >
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider shrink-0 flex items-center gap-1.5 me-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {isAr ? 'الوجهات المجدولة:' : 'Destinations:'}
            </span>

            <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-[var(--surface-default)]/90 backdrop-blur-md border border-[var(--border-level-2)] shadow-sm overflow-x-auto no-scrollbar">
              {/* All Destinations chip */}
              <button
                onClick={() => {
                  // Deselect all attractions
                  attractions.forEach(a => {
                    if (selectedAttractions.includes(a.id)) {
                      onAttractionToggle(a.id);
                    }
                  });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer ${
                  selectedAttractions.length === 0
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] font-bold'
                }`}
              >
                {isAr ? 'جميع الوجهات' : 'All Destinations'}
              </button>

              {/* Individual active scheduled destinations */}
              {attractions.map(attr => {
                const isSelected = selectedAttractions.includes(attr.id);
                const label = isAr ? (attr.nameAr || attr.nameEn) : attr.nameEn;
                return (
                  <button
                    key={attr.id}
                    onClick={() => onAttractionToggle(attr.id)}
                    aria-pressed={isSelected}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.35)]' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] font-bold'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
