import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TeamGrid } from '@/components/b2b/team/TeamGrid';
import { Button } from '@/components/ui/Button';
import db from '@/lib/db';
import { filterAndResolvePublicTeamMembers } from '@/lib/team/team-resolver';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  return {
    title: locale === 'ar' ? 'فريق العمل | E3 Qatar' : 'Our Team | E3 Qatar',
    description:
      locale === 'ar'
        ? 'تعرف على نخبة المهندسين والمبدعين والمخططين في E3 قطر.'
        : 'Meet the engineers, creatives, and tacticians who deliver world-class entertainment in Qatar.',
  };
}

export default async function B2BTeamPage(props: PageProps) {
  const { locale } = await props.params;
  const isRTL = locale === 'ar';

  // 1. Fetch active EmployeeProfiles safely from canonical database
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
    console.error('[B2B_TEAM_PAGE_ERROR]', error);
  }

  // 2. Canonical public resolution with deterministic sort, Arabic parity, and contact privacy
  const safePublicTeam = filterAndResolvePublicTeamMembers(
    employeeProfiles,
    locale === 'ar' ? 'ar' : 'en'
  );

  return (
    <main className="bg-[var(--surface-default)] min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] mb-6">
              {locale === 'ar' ? 'العقول المدبرة' : 'The Masterminds'}
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl">
              {locale === 'ar'
                ? 'تعرف على المهندسين والمبدعين والمخططين الذين يجعلون المستحيل ممكناً.'
                : 'Meet the engineers, creatives, and tacticians who make the impossible happen every day.'}
            </p>
          </div>

          <Button variant="outline" size="lg" asChild className="shrink-0 gap-2">
            <Link href={`/${locale}/careers`}>
              {locale === 'ar' ? 'انضم لفريقنا' : 'Join Our Team'}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </Button>
        </div>

        {/* Team Grid Client Component */}
        <TeamGrid members={safePublicTeam} locale={locale} />
      </div>
    </main>
  );
}
