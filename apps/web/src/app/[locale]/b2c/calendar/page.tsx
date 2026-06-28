import React from 'react';
import { db } from '@/lib/db';
import { CalendarView } from '@/components/calendar/CalendarView';

// Use Edge runtime for better performance, wait - Prisma doesn't work in Edge.
// We must use Node runtime since we fetch from Prisma.
// The config here is fine by default.
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Revalidate attractions every minute

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
      offers: true,
    },
    orderBy: {
      nameEn: 'asc',
    },
  });

  // Fetch UI settings for Hero Background
  const settingsRecords = await db.setting.findMany({
    where: { type: "UI" }
  });
  const uiSettings = settingsRecords.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);
  const discounts = attractions.flatMap(a => 
    a.offers.map(o => ({
      id: o.id,
      title: a.nameEn,
      description: `Special offer for ${a.nameEn}`,
      discount: `${o.discount}% OFF`,
      promoCode: o.code
    }))
  );

  return (
    <div className="pt-20">
      <CalendarView 
        initialAttractions={attractions} 
        heroMediaType={uiSettings.B2C_CALENDAR_PAGE_SETTINGS?.heroMediaType || "IMAGE"}
        heroMediaUrl={uiSettings.B2C_CALENDAR_PAGE_SETTINGS?.heroMediaUrl || ""}
        title={uiSettings.B2C_CALENDAR_PAGE_SETTINGS?.title}
        tagline={uiSettings.B2C_CALENDAR_PAGE_SETTINGS?.tagline}
        discounts={discounts}
      />
    </div>
  );
}
