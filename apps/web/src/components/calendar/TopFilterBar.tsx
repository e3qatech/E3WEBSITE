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
    <div className="bg-[#0F0F23]/90 backdrop-blur-xl border-b border-zinc-800 sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        
        {/* Top Row: Quick Picks & Month Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button 
              onClick={goToToday}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A2E]/80 backdrop-blur-md border border-zinc-800 hover:border-zinc-600 rounded-full text-sm font-bold text-white whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              <Calendar className="w-4 h-4 text-emerald-500" />
              {isAr ? 'اليوم' : 'Today'}
            </button>
            <button 
              onClick={onDiscountToggle}
              className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-bold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                isDiscountActive 
                  ? 'bg-emerald-500 border-emerald-500 text-zinc-950 font-black' 
                  : 'bg-[#1A1A2E]/80 backdrop-blur-md border-zinc-800 hover:border-zinc-600 text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              {isAr ? 'العروض والخصومات' : 'Offers & Discounts'}
            </button>
            <button 
              onClick={onBulkBookingClick}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 border border-zinc-100 rounded-full text-sm font-bold whitespace-nowrap transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              <Users className="w-4 h-4" />
              {isAr ? 'حجز المجموعات' : 'Group Booking'}
            </button>
            
            {(selectedAttractions.length > 0 || selectedEventTypes.length > 0 || isDiscountActive) && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase transition-colors bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white ms-auto focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              >
                {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
              </button>
            )}
            
            {/* Event Types */}
            <div className="w-px h-6 bg-zinc-800 mx-2 shrink-0 hidden md:block" />
            
            {(['REGULAR', 'SPECIAL', 'FESTIVAL', 'PRIVATE'] as EventType[]).map(type => (
              <button
                key={type}
                onClick={() => onEventTypeToggle(type)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                  selectedEventTypes.includes(type) 
                    ? 'bg-zinc-100 text-zinc-950 border-zinc-100' 
                    : 'bg-[#141414] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {isAr ? eventTypeLabels[type].ar : eventTypeLabels[type].en}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-lg font-black uppercase tracking-widest font-satoshi text-white">
              {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
            </span>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-2 bg-[#1A1A2E]/80 backdrop-blur-md hover:bg-zinc-800 rounded-full transition-colors border border-zinc-800 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none" aria-label={isAr ? "الشهر السابق" : "Previous month"}>
                <ChevronLeft className="w-4 h-4 text-zinc-300 rtl:rotate-180" />
              </button>
              <button onClick={nextMonth} className="p-2 bg-[#1A1A2E]/80 backdrop-blur-md hover:bg-zinc-800 rounded-full transition-colors border border-zinc-800 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none" aria-label={isAr ? "الشهر التالي" : "Next month"}>
                <ChevronRight className="w-4 h-4 text-zinc-300 rtl:rotate-180" />
              </button>
            </div>
          </div>
          
        </div>

        {/* Middle Row: Date Scroller */}
        <div className="relative">
          <div className="absolute start-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0C0C0C]/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute end-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0C0C0C]/90 to-transparent z-10 pointer-events-none" />
          
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
                    flex flex-col items-center justify-center min-w-[64px] h-[72px] rounded-2xl border transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none
                    ${isSelected 
                      ? 'bg-emerald-500 border-emerald-500 text-zinc-950 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)] font-bold' 
                      : isTodayDay
                        ? 'bg-[#1A1A2E]/80 backdrop-blur-md border-emerald-500/50 text-emerald-400 hover:bg-zinc-800'
                        : 'bg-[#1A1A2E]/80 backdrop-blur-md border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-700'
                    }
                  `}
                >
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                    {format(day, 'EEE', { locale: dateLocale })}
                  </span>
                  <span className={`text-xl font-black font-satoshi ${isSelected ? 'text-zinc-950' : 'text-white'}`}>
                    {format(day, 'd')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Row: QF-04-C Compact, Accessible Destination Filter */}
        {attractions.length > 0 ? (
          <div 
            role="group" 
            aria-label={isAr ? "فلترة حسب الوجهة" : "Filter by destination"}
            className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1"
          >
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 me-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {isAr ? 'الوجهات المجدولة:' : 'Destinations:'}
            </span>

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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                selectedAttractions.length === 0
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-sm'
                  : 'bg-[#141414] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                    isSelected 
                      ? 'bg-white text-zinc-950 border-white shadow-sm' 
                      : 'bg-[#141414] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-zinc-950" />}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        ) : null}

      </div>
    </div>
  );
}
