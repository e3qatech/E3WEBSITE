'use client';

import React from 'react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Loader2, CalendarX2 } from 'lucide-react';
import { EventCard, CalendarEvent } from './EventCard';
import { useLocale } from '@/components/layout/LocaleProvider';
import { getBentoCardSpan } from '@/lib/bento-grid';

interface EventListProps {
  currentDate: Date;
  events: CalendarEvent[];
  loading: boolean;
  onSelectTickets: (event: CalendarEvent) => void;
}

export function EventList({
  currentDate,
  events,
  loading,
  onSelectTickets,
}: EventListProps) {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const dateLocale = isAr ? ar : enUS;

  // Group events by day, ONLY for the currentDate
  const targetDayStr = format(currentDate, 'yyyy-MM-dd');
  
  const targetDateStart = new Date(currentDate);
  targetDateStart.setHours(0, 0, 0, 0);
  const targetDateEnd = new Date(currentDate);
  targetDateEnd.setHours(23, 59, 59, 999);

  const groupedEvents = events.reduce((acc, event) => {
    const evStart = new Date(event.startTime);
    evStart.setHours(0, 0, 0, 0);
    const evEnd = new Date(event.endTime);
    evEnd.setHours(23, 59, 59, 999);

    if (targetDateStart.getTime() <= evEnd.getTime() && targetDateEnd.getTime() >= evStart.getTime()) {
      if (!acc[targetDayStr]) acc[targetDayStr] = [];
      acc[targetDayStr].push(event);
    }
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const sortedDays = Object.keys(groupedEvents).sort();

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
        <p className="font-bold uppercase tracking-widest text-sm">
          {isAr ? 'جاري تحميل الفعاليات...' : 'Loading Events...'}
        </p>
      </div>
    );
  }

  if (events.length === 0 || sortedDays.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-[var(--text-tertiary)] border border-dashed border-[var(--border-level-2)] rounded-3xl bg-[var(--surface-default)] shadow-inner p-8 text-center">
        <CalendarX2 className="w-12 h-12 mb-4 text-[var(--text-tertiary)]" />
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-satoshi">
          {isAr ? 'لا توجد فعاليات مجدولة لهذا اليوم' : 'No Events Scheduled For This Date'}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-md">
          {isAr
            ? 'تصفح التواريخ الأخرى في التقويم أو استكشف الوجهات والمعارض عبر قائمة الفلاتر.'
            : 'Try adjusting your filters or selecting a different date from the calendar.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {sortedDays.map(dayStr => {
        const dayEvents = groupedEvents[dayStr];
        const [year, month, day] = dayStr.split('-');
        const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        
        const groupedByAttraction = Object.values(
          dayEvents.reduce((acc, ev) => {
            const groupKey = ev.attractionId || ev.id;
            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(ev);
            return acc;
          }, {} as Record<string, CalendarEvent[]>)
        );
        const totalAttractions = groupedByAttraction.length;

        return (
          <div key={dayStr} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-[var(--text-primary)] font-satoshi">
                {format(dateObj, 'EEEE, MMMM d', { locale: dateLocale })}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[var(--border-level-2)] to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-stretch">
              {groupedByAttraction.map((group, idx) => {
                const { spanClass, isFeatured } = getBentoCardSpan(idx, totalAttractions);
                return (
                  <EventCard 
                    key={group[0].id} 
                    events={group} 
                    onSelectTickets={onSelectTickets} 
                    isFeatured={isFeatured}
                    spanClass={spanClass}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
