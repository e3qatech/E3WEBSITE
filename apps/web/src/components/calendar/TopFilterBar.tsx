'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Tag, Filter, Check, Users } from 'lucide-react';
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
    <div className="bg-[#0C0C0C]/90 backdrop-blur-xl border-b border-zinc-800 sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        
        {/* Top Row: Quick Picks & Month Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button 
              onClick={goToToday}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-full text-sm font-bold text-white whitespace-nowrap transition-colors"
            >
              <Calendar className="w-4 h-4 text-amber-500" />
              Today
            </button>
            <button 
              onClick={onDiscountToggle}
              className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                isDiscountActive 
                  ? 'bg-amber-500 border-amber-500 text-black' 
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              Offers & Discounts
            </button>
            <button 
              onClick={onBulkBookingClick}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-black border border-zinc-100 rounded-full text-sm font-bold whitespace-nowrap transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              <Users className="w-4 h-4" />
              Group Booking
            </button>
            
            {(selectedAttractions.length > 0 || selectedEventTypes.length > 0 || isDiscountActive) && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase transition-colors bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white ml-auto"
              >
                Reset Filters
              </button>
            )}
            
            {/* Event Types */}
            <div className="w-px h-6 bg-zinc-800 mx-2 shrink-0 hidden md:block" />
            
            {(['REGULAR', 'SPECIAL', 'FESTIVAL', 'PRIVATE'] as EventType[]).map(type => (
              <button
                key={type}
                onClick={() => onEventTypeToggle(type)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                  selectedEventTypes.includes(type) 
                    ? 'bg-zinc-100 text-black border-zinc-100' 
                    : 'bg-[#141414] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-lg font-black uppercase tracking-widest font-satoshi text-white">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors border border-zinc-800">
                <ChevronLeft className="w-4 h-4 text-zinc-300" />
              </button>
              <button onClick={nextMonth} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors border border-zinc-800">
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </button>
            </div>
          </div>
          
        </div>

        {/* Middle Row: Date Scroller */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0C0C0C]/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0C0C0C]/90 to-transparent z-10 pointer-events-none" />
          
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
                    flex flex-col items-center justify-center min-w-[64px] h-[72px] rounded-2xl border transition-all shrink-0
                    ${isSelected 
                      ? 'bg-amber-500 border-amber-500 text-black scale-105 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                      : isTodayDay
                        ? 'bg-zinc-900/50 border-amber-500/50 text-amber-500 hover:bg-zinc-800'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-700'
                    }
                  `}
                >
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-xl font-black font-satoshi ${isSelected ? 'text-black' : 'text-white'}`}>
                    {format(day, 'd')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Row: Attractions Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest shrink-0 flex items-center gap-2 mr-2">
            <Filter className="w-3 h-3" /> Attractions
          </span>
          {attractions.map(attr => (
            <button
              key={attr.id}
              onClick={() => onAttractionToggle(attr.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border shrink-0 ${
                selectedAttractions.includes(attr.id) 
                  ? 'bg-white text-black border-white font-bold' 
                  : 'bg-[#141414] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {selectedAttractions.includes(attr.id) && <Check className="w-3 h-3" />}
              {attr.nameEn}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
