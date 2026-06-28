'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isToday 
} from 'date-fns';

interface Attraction {
  id: string;
  nameEn: string;
  nameAr: string;
}

export type EventType = 'REGULAR' | 'SPECIAL' | 'FESTIVAL' | 'PRIVATE';
export type AvailabilityType = 'ALL' | 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT';

interface CalendarSidebarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  attractions: Attraction[];
  selectedAttractions: string[];
  onAttractionToggle: (id: string) => void;
  selectedEventTypes: EventType[];
  onEventTypeToggle: (type: EventType) => void;
  availabilityFilter: AvailabilityType;
  onAvailabilityChange: (av: AvailabilityType) => void;
  isMobileFilterOpen: boolean;
  setMobileFilterOpen: (open: boolean) => void;
}

export function CalendarSidebar({
  currentDate,
  onDateChange,
  attractions,
  selectedAttractions,
  onAttractionToggle,
  selectedEventTypes,
  onEventTypeToggle,
  availabilityFilter,
  onAvailabilityChange,
  isMobileFilterOpen,
  setMobileFilterOpen
}: CalendarSidebarProps) {
  
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(currentDate));

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    onDateChange(today);
  };

  // Build calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = "d";
  const rows: React.ReactNode[] = [];
  let days: React.ReactNode[] = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isSelectedDay = isSameDay(day, currentDate);
      const isTodayDay = isToday(day);

      days.push(
        <button
          key={day.toString()}
          onClick={() => onDateChange(cloneDay)}
          className={`
            p-2 w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium font-mono transition-colors
            ${!isCurrentMonth ? 'text-zinc-600' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}
            ${isSelectedDay ? 'bg-amber-500 text-black font-bold hover:bg-amber-400' : ''}
            ${isTodayDay && !isSelectedDay ? 'border border-amber-500/50 text-amber-500' : ''}
          `}
        >
          {formattedDate}
        </button>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-1 mb-1" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 text-white p-6 md:p-0 md:bg-transparent md:h-auto overflow-y-auto">
      <div className="flex justify-between items-center mb-8 md:hidden">
        <h2 className="text-xl font-bold uppercase tracking-widest">Filters</h2>
        <button onClick={() => setMobileFilterOpen(false)} className="p-2 bg-zinc-900 rounded-full">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Mini Calendar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">{format(currentMonth, "MMMM yyyy")}</h3>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs text-zinc-500 font-bold uppercase">
          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
        
        <div className="mb-4">
          {rows}
        </div>

        <button 
          onClick={goToToday}
          className="w-full py-2 bg-[#141414] border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 rounded-md text-sm font-bold tracking-widest uppercase transition-colors text-zinc-300"
        >
          Today
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-8">
        
        {/* Attraction Filter */}
        <div>
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Attractions</h4>
          <div className="flex flex-wrap gap-2">
            {attractions.map(attr => (
              <button
                key={attr.id}
                onClick={() => onAttractionToggle(attr.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors border ${
                  selectedAttractions.includes(attr.id) 
                    ? 'bg-amber-500 text-black border-amber-500 font-bold' 
                    : 'bg-[#141414] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {attr.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Event Type Filter */}
        <div>
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Event Type</h4>
          <div className="flex flex-wrap gap-2">
            {(['REGULAR', 'SPECIAL', 'FESTIVAL', 'PRIVATE'] as EventType[]).map(type => (
              <button
                key={type}
                onClick={() => onEventTypeToggle(type)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors border ${
                  selectedEventTypes.includes(type) 
                    ? 'bg-amber-500 text-black border-amber-500 font-bold' 
                    : 'bg-[#141414] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Availability Filter */}
        <div>
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Availability</h4>
          <div className="flex flex-col gap-2">
            {(['ALL', 'AVAILABLE', 'LIMITED', 'SOLD_OUT'] as AvailabilityType[]).map(av => (
              <label key={av} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  availabilityFilter === av ? 'bg-amber-500 border-amber-500' : 'bg-[#141414] border-zinc-700 group-hover:border-zinc-500'
                }`}>
                  {availabilityFilter === av && <div className="w-2 h-2 bg-black rounded-sm" />}
                </div>
                <span className={`text-sm font-mono uppercase tracking-widest ${availabilityFilter === av ? 'text-white font-bold' : 'text-zinc-500'}`}>
                  {av.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Modal */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-zinc-950 z-50 md:hidden shadow-2xl border-r border-zinc-800"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
