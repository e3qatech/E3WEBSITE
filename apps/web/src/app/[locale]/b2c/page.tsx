import { Metadata } from 'next';
import db from '@/lib/db';
import { getCMSPageContentServer } from '@/lib/cms-server';
import { B2CLandingClient } from '@/components/b2c/B2CLandingClient';

export const metadata: Metadata = {
  title: 'Experiences | E3 Qatar',
  description: 'Immersive entertainment landmarks, InflataRUN world records, and kinetic attraction worlds in Qatar.'
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function B2CLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const cmsData = await getCMSPageContentServer("b2c-landing");

  let attractions: any[] = [];
  try {
    attractions = await db.attraction.findMany({
      where: { isPublished: true },
      include: {
        gallery: {
          orderBy: { orderIndex: 'asc' },
          take: 1
        },
        pricing: {
          take: 1
        }
      },
      take: 50
    });
  } catch (error) {
    console.error("[B2C_PAGE_ATTRACTIONS_FETCH_ERROR]", error);
    attractions = [];
  }

  let dbBrands: any[] = [];
  try {
    const { getLiveB2CBrandsFromDB } = await import('@/lib/cms-brands-db');
    dbBrands = await getLiveB2CBrandsFromDB();
  } catch (error) {
    console.error("[B2C_PAGE_BRANDS_FETCH_ERROR]", error);
  }

  let dbEmployees: any[] = [];
  try {
    dbEmployees = await db.employeeProfile.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
  } catch (error) {
    console.error("[B2C_PAGE_EMPLOYEES_FETCH_ERROR]", error);
  }

  let dbStoryTypes: any[] = [];
  try {
    dbStoryTypes = await db.storyType.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
      include: {
        features: {
          include: {
            attraction: {
              select: {
                heroThumbnailUrl: true,
                heroMediaUrl: true,
                isPublished: true,
                slug: true,
                nameEn: true,
                nameAr: true,
                taglineEn: true,
                taglineAr: true,
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("[B2C_PAGE_STORY_TYPES_FETCH_ERROR]", error);
  }

  if (cmsData) {
    if (attractions.length > 0) {
      cmsData.attractions = attractions;
      cmsData.act3Worlds = attractions.map((attr: any) => {
        const minPrice = Array.isArray(attr.pricing) && attr.pricing.length > 0
          ? Math.min(...attr.pricing.map((p: any) => p.price))
          : 45;

        const ops = (attr.operations as any) || {};
        const venue = ops.venueName 
          || ops.venueAddressEn 
          || (locale === 'ar' ? "الدوحة، قطر" : "Doha, Qatar");

        const rawBadge = ops.materialType || "E3 WORLD";
        const safeBadge = (rawBadge === "STAGE_RIBBON" || !rawBadge) ? "E3 WORLD" : rawBadge;

        return {
          id: attr.id,
          slug: attr.slug,
          nameEn: attr.nameEn,
          nameAr: attr.nameAr || attr.nameEn,
          taglineEn: attr.taglineEn || attr.descriptionEn?.substring(0, 90) || "Flagship E3 Interactive World",
          taglineAr: attr.taglineAr || attr.descriptionAr?.substring(0, 90) || "وجهة إي ثري التفاعلية",
          locationEn: venue,
          locationAr: venue,
          statusEn: "OPEN NOW",
          statusAr: "مفتوح الآن",
          materialType: safeBadge,
          accentColor: ops.accentColor || "#10b981",
          mediaUrl: attr.heroThumbnailUrl || attr.heroMediaUrl || attr.heroFallbackUrl || attr.gallery?.[0]?.url || "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop",
          mediaType: attr.heroMediaType || "IMAGE",
          audienceEn: ops.audienceEn || (locale === 'ar' ? "العائلات والأصدقاء" : "Families & Groups"),
          audienceAr: ops.audienceAr || (locale === 'ar' ? "العائلات والأصدقاء" : "Families & Groups"),
          timingsEn: ops.timingsEn || "02:00 PM - 12:00 AM",
          timingsAr: ops.timingsAr || "٠٢:٠٠ م - ١٢:٠٠ ص",
          price: minPrice,
          currency: "QAR",
          ctaEn: "Book Pass & Ticket",
          ctaAr: "احجز التذكرة والمواعيد"
        };
      });
    }

    if (!cmsData.storyDiscovery) cmsData.storyDiscovery = {};
    if (dbStoryTypes.length > 0) {
      cmsData.storyDiscovery.storyTypes = dbStoryTypes;
      cmsData.storyTypes = dbStoryTypes;
    }

    if (!cmsData.ourBrands) cmsData.ourBrands = {};
    if (dbBrands.length > 0) {
      cmsData.ourBrands.brands = dbBrands;
    }

    if (!cmsData.coreTeam) cmsData.coreTeam = {};
    const selectedIds: string[] = Array.isArray(cmsData.coreTeam.selectedMemberIds)
      ? cmsData.coreTeam.selectedMemberIds
      : (Array.isArray(cmsData.coreTeam.members) ? cmsData.coreTeam.members.map((m: any) => m.id) : []);

    if (dbEmployees.length > 0) {
      const selectedEmployees = selectedIds.length > 0
        ? selectedIds
            .map(id => dbEmployees.find(m =>
              m.id === id ||
              m.slug === id ||
              `team-${m.slug}` === id ||
              (typeof id === 'string' && (id.includes(m.id) || m.id.includes(id)))
            ))
            .filter(Boolean)
        : [];

      const activeEmployees = selectedEmployees.length > 0 ? selectedEmployees : dbEmployees;

      cmsData.coreTeam.members = activeEmployees.map(m => ({
        id: m.id,
        slug: m.slug || m.id,
        nameEn: m.nameEn || m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || "Team Member",
        nameAr: m.nameAr || (m.firstNameAr ? `${m.firstNameAr} ${m.lastNameAr || ''}`.trim() : (m.name || m.nameEn || `${m.firstName || ''} ${m.lastName || ''}`.trim())),
        roleEn: m.roleEn || m.designation || "Executive",
        roleAr: m.roleAr || m.designationAr || m.designation || "قيادي",
        bioEn: m.bioEn || m.aboutSummary || m.tagline || "",
        bioAr: m.bioAr || m.aboutSummaryAr || m.bioEn || m.aboutSummary || m.tagline || "",
        portrait: m.portrait || m.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
        showProfileLink: true,
        profileCtaLabelEn: "View Profile",
        profileCtaLabelAr: "عرض الملف",
        featureOnB2CLanding: true,
        isCoreTeam: true,
        b2cOrder: 1,
        b2cVisibility: true,
        status: 'PUBLISHED'
      }));
    }
  }

  return (
    <B2CLandingClient
      locale={locale}
      cmsData={cmsData}
      initialAttractions={attractions as any}
    />
  );
}
