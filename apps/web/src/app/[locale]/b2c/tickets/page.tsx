import { TicketsClient } from "@/components/b2c/TicketsClient";
import { db } from "@/lib/db";

export const metadata = {
  title: "Tickets | E3 Qatar",
  description: "Get tickets to Qatar's most exciting attractions.",
};

export const dynamic = 'force-dynamic';

async function getTicketsData() {
  try {
    const attractions = await db.attraction.findMany({
      where: {
        isPublished: true,
        isHidden: false,
      },
      include: {
        pricing: true,
        schedules: {
          where: {
            startTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            endTime: { lte: new Date(new Date().setHours(23, 59, 59, 999)) }
          }
        }
      }
    });

    return attractions.map(attraction => {
      let isAvailableToday = true;
      if (attraction.schedules && attraction.schedules.length > 0) {
        isAvailableToday = attraction.schedules.some(s => s.currentCount < s.capacityGate);
      }

      const pricingTiers = attraction.pricing.map(p => ({
        id: p.id,
        ticketType: p.type,
        titleEn: p.titleEn,
        titleAr: p.titleAr,
        price: p.price,
        currency: p.currency,
        isAvailable: isAvailableToday
      }));

      return {
        attractionId: attraction.id,
        attractionNameEn: attraction.nameEn || '',
        attractionNameAr: attraction.nameAr || '',
        attractionSlug: attraction.slug,
        descriptionEn: attraction.descriptionEn || undefined,
        descriptionAr: attraction.descriptionAr || undefined,
        heroMediaUrl: attraction.heroMediaUrl || undefined,
        bookingUrl: attraction.ticketingUrl || `https://bookingqube.com/e3/${attraction.slug}`,
        pricingTiers,
      };
    });
  } catch (e) {
    console.warn("[TICKETS PAGE DB NOTICE] Failed to query attractions directly:", e);
    return [];
  }
}

export default async function TicketsPage() {
  const ticketsData = await getTicketsData();

  let settings = null;
  try {
    const settingModel = (db as any).siteSettings || (db as any).setting;
    if (settingModel) {
      const setting = await settingModel.findUnique({
        where: { key: "B2C_TICKETS_PAGE_SETTINGS" }
      });
      settings = setting ? (typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value) : null;
    }
  } catch (e) {
    console.warn("[TICKETS PAGE DB NOTICE] Failed to query siteSettings:", e);
  }

  return (
    <div className="min-h-screen bg-[var(--surface-default)] pt-20">
      <TicketsClient ticketsData={ticketsData} initialSettings={settings} />
    </div>
  );
}
