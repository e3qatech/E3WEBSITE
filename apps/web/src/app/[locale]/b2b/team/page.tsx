import { Metadata } from 'next';
import db from '@/lib/db';
import { filterAndResolvePublicTeamMembers } from '@/lib/team/team-resolver';
import { getCMSPageContentServer } from '@/lib/cms-server';
import { B2BTeamClient } from '@/components/b2b/team/B2BTeamClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === 'ar';

  let cmsContent: any = {};
  try {
    cmsContent = await getCMSPageContentServer('b2b-team-page');
  } catch (_e) {
    // Fallback to default
  }

  const title = isAr
    ? cmsContent?.titleAr || 'فريق العمل والقيادة | E3 Qatar'
    : cmsContent?.titleEn || 'The People Behind Every E3 Experience | E3 Qatar';

  const description = isAr
    ? cmsContent?.descAr || 'تعرف على نخبة المهندسين والمبدعين والمنتجين والمخططين في E3 قطر الذين يصنعون أضخم التجارب والفعاليات الحية.'
    : cmsContent?.descEn || 'Meet the strategists, designers, producers, technicians and operators who build world-class live experiences in Qatar.';

  const canonicalUrl = `https://eeeqa.com/${locale}/b2b/team`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: 'https://eeeqa.com/en/b2b/team',
        ar: 'https://eeeqa.com/ar/b2b/team',
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: isAr ? 'إي ثري قطر' : 'E3 Experiences Qatar',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function B2BTeamPage(props: PageProps) {
  const { locale } = await props.params;
  const isAr = locale === 'ar';

  // 1. Fetch CMS payload for page copy and hero media
  let cmsContent: any = {};
  try {
    cmsContent = await getCMSPageContentServer('b2b-team-page');
  } catch (error) {
    console.error('[B2B_TEAM_PAGE_CMS_ERROR]', error);
  }

  // 2. Fetch active EmployeeProfiles safely from canonical database
  let employeeProfiles: any[] = [];
  try {
    employeeProfiles = await db.employeeProfile.findMany({
      where: {
        isActive: true,
        showOnTeamPage: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  } catch (error) {
    console.error('[B2B_TEAM_PAGE_DB_ERROR]', error);
  }

  // 3. Canonical public resolution with deterministic sort, Arabic parity, 6 presentation groups, and duplicate suppression
  const safePublicTeam = filterAndResolvePublicTeamMembers(
    employeeProfiles,
    locale === 'ar' ? 'ar' : 'en'
  );

  // 4. Fetch published Case Studies with verified relationships for "PEOPLE × PROJECTS"
  let publishedCaseStudies: any[] = [];
  try {
    publishedCaseStudies = await db.caseStudy.findMany({
      where: {
        isPublished: true,
      },
      include: {
        teamMembers: {
          include: {
            employeeProfile: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { year: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 6,
    });
  } catch (error) {
    console.error('[B2B_TEAM_PAGE_CASE_STUDIES_ERROR]', error);
  }

  // 5. JSON-LD Structured Data (Organization + ItemList of Person schemas)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isAr ? 'فريق عمل وقيادة إي ثري قطر' : 'E3 Qatar Team & Leadership',
    description: isAr
      ? 'نخبة المهندسين والمبدعين والمنتجين في E3 قطر'
      : 'The strategists, designers, producers, and operators of E3 Qatar',
    numberOfItems: safePublicTeam.length,
    itemListElement: safePublicTeam.map((member, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Person',
        name: isAr && member.nameAr ? member.nameAr : member.nameEn || member.name,
        jobTitle: isAr && member.designationAr ? member.designationAr : member.designation,
        worksFor: {
          '@type': 'Organization',
          name: 'E3 Experiences Qatar',
          url: 'https://eeeqa.com',
        },
        image: member.profileImage || undefined,
        url: `https://eeeqa.com/${locale}/b2b/team/${member.slug}`,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#080b12]">
      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <B2BTeamClient
        members={safePublicTeam}
        caseStudies={publishedCaseStudies}
        locale={locale}
        cmsContent={cmsContent}
      />
    </main>
  );
}
