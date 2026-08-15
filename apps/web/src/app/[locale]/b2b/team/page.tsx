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

  return {
    title: isAr
      ? cmsContent?.titleAr || 'فريق العمل والقيادة | E3 Qatar'
      : cmsContent?.titleEn || 'Our Team & Leadership | E3 Qatar',
    description: isAr
      ? cmsContent?.descAr || 'تعرف على نخبة المهندسين والمبدعين والمخططين في E3 قطر.'
      : cmsContent?.descEn || 'Meet the engineers, creatives, and tacticians who deliver world-class entertainment in Qatar.',
  };
}

export default async function B2BTeamPage(props: PageProps) {
  const { locale } = await props.params;

  // 1. Fetch CMS payload for page copy and hero rotating words
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

  return (
    <main className="min-h-screen bg-[var(--surface-default)]">
      <B2BTeamClient
        members={safePublicTeam}
        locale={locale}
        cmsContent={cmsContent}
      />
    </main>
  );
}
