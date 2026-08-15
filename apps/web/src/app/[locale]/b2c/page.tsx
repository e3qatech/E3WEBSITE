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
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleAr: true,
        descriptionEn: true,
        descriptionAr: true,
        icon: true,
        coverMediaUrl: true,
        coverMediaType: true,
        accentColor: true,
        orderIndex: true,
        isActive: true,
      }
    });
  } catch (error) {
    console.error("[B2C_PAGE_STORY_TYPES_FETCH_ERROR]", error);
  }

  if (cmsData) {
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
        nameEn: `${m.firstName || ''} ${m.lastName || ''}`.trim() || "Team Member",
        nameAr: m.firstNameAr ? `${m.firstNameAr} ${m.lastNameAr || ''}`.trim() : `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        roleEn: m.designation || "Executive",
        roleAr: m.designationAr || m.designation || "قيادي",
        bioEn: m.aboutSummary || m.tagline || "",
        bioAr: m.aboutSummaryAr || m.aboutSummary || m.tagline || "",
        portrait: m.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
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
