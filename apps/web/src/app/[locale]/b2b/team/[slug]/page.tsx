import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import db from '@/lib/db';
import {
  resolvePublicTeamMember,
  isTeamMemberPubliclyEligible,
} from '@/lib/team/team-resolver';
import { TimelineEntry } from '@/components/b2b/team/ExperienceTimeline';
import { CinematicTeamProfileClient } from '@/components/b2b/team/profile/CinematicTeamProfileClient';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const isAr = locale === 'ar';

  try {
    let rawMember = await db.employeeProfile.findUnique({
      where: { slug },
    });
    if (!rawMember) {
      rawMember = await db.employeeProfile.findUnique({
        where: { id: slug },
      });
    }

    if (!rawMember || !isTeamMemberPubliclyEligible(rawMember).eligible) {
      return {
        title: isAr ? 'الملف الشخصي غير موجود | E3 Qatar' : 'Team Member Not Found | E3 Qatar',
      };
    }

    const member = resolvePublicTeamMember(rawMember, isAr ? 'ar' : 'en');
    return {
      title: `${member.name} - ${member.designation} | E3 Qatar`,
      description: member.aboutSummary || member.tagline || undefined,
    };
  } catch {
    return {
      title: isAr ? 'فريق العمل | E3 Qatar' : 'Our Team | E3 Qatar',
    };
  }
}

export default async function TeamMemberDetailPage(props: PageProps) {
  const { locale, slug } = await props.params;
  const isAr = locale === 'ar';

  // 1. Query database for team member by slug
  const rawMember = await db.employeeProfile.findUnique({
    where: { slug },
  });

  // 2. Legacy CUID resolution & permanent redirect helper
  if (!rawMember) {
    const legacyMember = await db.employeeProfile.findUnique({
      where: { id: slug },
    });
    if (legacyMember && isTeamMemberPubliclyEligible(legacyMember).eligible && legacyMember.slug) {
      permanentRedirect(`/${locale}/b2b/team/${legacyMember.slug}`);
    }
  }

  // 3. Strict 404 for missing, inactive, or malformed records — NEVER fallback to another person's profile
  if (!rawMember || !isTeamMemberPubliclyEligible(rawMember).eligible) {
    notFound();
  }

  // 4. Resolve safe public DTO (strips personal contact, ensures Arabic parity)
  const member = resolvePublicTeamMember(rawMember, isAr ? 'ar' : 'en');

  // Format experience timeline safely
  const experienceEntries: TimelineEntry[] = Array.isArray(member.experience)
    ? member.experience.map((exp: any, idx: number) => ({
        id: exp.id || `exp-${idx}`,
        company: typeof exp.company === 'object' ? exp.company : { en: exp.company || 'E3', ar: exp.company || 'إي ثري' },
        role: typeof exp.role === 'object' ? exp.role : { en: exp.title || exp.role || member.designation, ar: exp.titleAr || exp.roleAr || member.designation },
        duration: typeof exp.duration === 'object' ? exp.duration : { en: exp.year || exp.duration || '', ar: exp.year || exp.duration || '' },
        description: typeof exp.description === 'object' ? exp.description : { en: exp.description || '', ar: exp.descriptionAr || '' },
      }))
    : [];

  return (
    <CinematicTeamProfileClient
      member={member}
      experienceEntries={experienceEntries}
      locale={locale}
    />
  );
}
