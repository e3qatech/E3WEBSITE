import React from 'react';
import { db } from '@/lib/db';
import { CalendarView } from '@/components/calendar/CalendarView';

// Use Edge runtime for better performance, wait - Prisma doesn't work in Edge.
// We must use Node runtime since we fetch from Prisma.
// The config here is fine by default.
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate attractions every minute

export default async function CalendarPage() {
  // Fetch active attractions for the filter
  const attractions = await db.attraction.findMany({
    where: {
      isPublished: true,
      isHidden: false,
    },
    select: {
      id: true,
      nameEn: true,
      nameAr: true,
    },
    orderBy: {
      nameEn: 'asc',
    },
  });

  return (
    <div className="pt-20">
      <CalendarView initialAttractions={attractions} />
    </div>
  );
}
