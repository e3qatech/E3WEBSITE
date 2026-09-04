import { Metadata } from 'next';
import db from '@/lib/db';
import { getCMSPageContentServer } from '@/lib/cms-server';
import { B2CLandingClient } from '@/components/b2c/B2CLandingClient';
import { formatLocalizedText } from '@/lib/utils';
import { memoryCache } from '@/lib/cache/memory-cache';
import { getLiveB2CBrandsFromDB } from '@/lib/cms-brands-db';

export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === 'ar';

  let cmsData: any = null;
  try {
    cmsData = await getCMSPageContentServer("b2c-landing");
  } catch (error) {
    console.warn("[B2C Landing Metadata] Failed to query CMS content:", error);
  }

  const seo = cmsData?.seo || {};

  const titleEn = seo.metaTitleEn || 'Experiences | E3 Qatar';
  const titleAr = seo.metaTitleAr || 'التجارب | إي ثري قطر | خبراء هندسة الفعاليات';

  const descEn = seo.metaDescriptionEn || 'Immersive entertainment landmarks, InflataRUN world records, and kinetic attraction worlds in Qatar.';
  const descAr = seo.metaDescriptionAr || 'وجهات ترفيهية غامرة، أرقام قياسية عالمية مع إنفلاتارن، وعوالم تفاعلية حركية في قطر.';

  return {
    title: isAr ? { absolute: titleAr } : titleEn,
    description: isAr ? descAr : descEn,
    keywords: isAr ? seo.keywordsAr : seo.keywordsEn,
    alternates: {
      canonical: `/${locale}/b2c`,
      languages: {
        en: '/en/b2c',
        ar: '/ar/b2c',
      },
    },
    openGraph: {
      title: isAr ? titleAr : titleEn,
      description: isAr ? descAr : descEn,
      locale: isAr ? 'ar_QA' : 'en_US',
      alternateLocale: isAr ? ['en_US'] : ['ar_QA'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: isAr ? titleAr : titleEn,
      description: isAr ? descAr : descEn,
    },
  };
}

export default async function B2CLandingPage(props: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await props.params;
  const searchParams: Record<string, string | string[] | undefined> = props.searchParams
    ? await props.searchParams
    : {};
  const cmsData = await getCMSPageContentServer("b2c-landing");

  const [attractions, dbBrands, dbEmployees, dbStoryTypes] = await Promise.all([
    memoryCache.getOrSet('b2c_page_attractions', 60_000, async () => {
      try {
        return await db.attraction.findMany({
          where: { isPublished: true },
          include: {
            gallery: {
              orderBy: { orderIndex: 'asc' },
              take: 3
            },
            pricing: {
              orderBy: { price: 'asc' }
            },
            offers: true,
            attractionLocations: {
              include: {
                location: true
              }
            }
          },
          orderBy: [
            { isFeatured: 'desc' },
            { createdAt: 'desc' }
          ],
          take: 50
        });
      } catch (error) {
        console.error("[B2C_PAGE_ATTRACTIONS_FETCH_ERROR]", error);
        return [];
      }
    }),
    getLiveB2CBrandsFromDB(),
    memoryCache.getOrSet('b2c_page_employees', 60_000, async () => {
      try {
        return await db.employeeProfile.findMany({
          where: { isActive: true },
          orderBy: { order: 'asc' }
        });
      } catch (error) {
        console.error("[B2C_PAGE_EMPLOYEES_FETCH_ERROR]", error);
        return [];
      }
    }),
    memoryCache.getOrSet('b2c_page_story_types', 60_000, async () => {
      try {
        return await db.storyType.findMany({
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
        return [];
      }
    }),
  ]);

  if (cmsData) {
    if (attractions.length > 0) {
      const { calculateQatarOperatingStatus, getTodayTimingDisplay, calculateAttractionStartingPrice } = await import('@/lib/operating-schedule-helper');
      const { resolveBookingUrl, isAttractionActiveByDate } = await import('@/lib/cms-attractions');

      const activeAttractions = attractions.filter((attr: any) => isAttractionActiveByDate(attr));
      cmsData.attractions = activeAttractions;
      cmsData.act3Worlds = activeAttractions.map((attr: any) => {
        const minPrice = calculateAttractionStartingPrice(attr, attr.price || 35);

        const ops = (attr.operations as any) || {};
        const primaryLoc = attr.attractionLocations?.[0]?.location;
        const venueEn = formatLocalizedText(primaryLoc?.nameEn || primaryLoc?.addressEn || ops.venueName || ops.venueAddressEn || "Doha, Qatar", 'en') || "Doha, Qatar";
        const venueAr = formatLocalizedText(primaryLoc?.nameAr || primaryLoc?.addressAr || ops.venueName || ops.venueAddressAr || "الدوحة، قطر", 'ar') || "الدوحة، قطر";
        const nameEn = formatLocalizedText(attr.nameEn, 'en') || "Attraction";
        const nameAr = formatLocalizedText(attr.nameAr || attr.nameEn, 'ar') || "وجهة ترفيهية";
        const taglineEn = formatLocalizedText(attr.taglineEn || attr.descriptionEn?.substring(0, 90) || "Flagship E3 Interactive World", 'en');
        const taglineAr = formatLocalizedText(attr.taglineAr || attr.descriptionAr?.substring(0, 90) || "وجهة إي ثري التفاعلية", 'ar');
        const audienceEn = formatLocalizedText(ops.audienceEn || "Families & Groups", 'en');
        const audienceAr = formatLocalizedText(ops.audienceAr || "العائلات والأصدقاء", 'ar');
        
        const todayTiming = getTodayTimingDisplay(attr.temporalStatus, locale);
        const timingsEn = formatLocalizedText(todayTiming.timingsEn, 'en');
        const timingsAr = formatLocalizedText(todayTiming.timingsAr, 'ar');

        const liveStatus = calculateQatarOperatingStatus(attr.temporalStatus);
        const statusEn = liveStatus.statusTextEn || (attr.isPublished ? "OPEN NOW" : "COMING SOON");
        const statusAr = liveStatus.statusTextAr || (attr.isPublished ? "مفتوح الآن" : "قريباً");

        const rawBadge = ops.materialType || (attr.isFeatured ? "FEATURED ATTRACTION" : "E3 WORLD");
        const safeBadge = formatLocalizedText((rawBadge === "STAGE_RIBBON" || !rawBadge) ? (attr.isFeatured ? "FEATURED WORLD" : "E3 WORLD") : rawBadge, 'en');
        const bookingLink = resolveBookingUrl(attr, locale);

        return {
          id: attr.id,
          slug: attr.slug,
          nameEn,
          nameAr,
          taglineEn,
          taglineAr,
          locationEn: venueEn,
          locationAr: venueAr,
          statusEn,
          statusAr,
          materialType: safeBadge,
          accentColor: ops.accentColor || "#10b981",
          mediaUrl: attr.heroThumbnailUrl || attr.heroMediaUrl || attr.heroFallbackUrl || attr.gallery?.[0]?.url || "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop",
          mediaType: attr.heroMediaType || "IMAGE",
          audienceEn,
          audienceAr,
          timingsEn,
          timingsAr,
          price: minPrice,
          currency: "QAR",
          ctaEn: "Book Pass & Ticket",
          ctaAr: "احجز التذكرة والمواعيد",
          ticketingUrl: bookingLink,
          isFeatured: Boolean(attr.isFeatured),
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
            .map(id => dbEmployees.find((m: any) =>
              m.id === id ||
              m.slug === id ||
              `team-${m.slug}` === id ||
              (typeof id === 'string' && (id.includes(m.id) || m.id.includes(id)))
            ))
            .filter(Boolean)
        : [];

      const activeEmployees = selectedEmployees.length > 0 ? selectedEmployees : dbEmployees;

      cmsData.coreTeam.members = activeEmployees.map((m: any) => ({
        id: m.id,
        slug: m.slug || m.id,
        nameEn: m.nameEn || m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || "Team Member",
        nameAr: m.nameAr || (m.firstNameAr ? `${m.firstNameAr} ${m.lastNameAr || ''}`.trim() : (m.name || m.nameEn || `${m.firstName || ''} ${m.lastName || ''}`.trim())),
        roleEn: m.roleEn || m.designation || "Executive",
        roleAr: m.roleAr || m.designationAr || m.designation || "قيادي",
        bioEn: m.bioEn || m.aboutSummary || m.tagline || "",
        bioAr: m.bioAr || m.aboutSummaryAr || m.bioEn || m.aboutSummary || m.tagline || "",
        portrait: m.portrait || m.profileImage || "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC01674.jpg",
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
