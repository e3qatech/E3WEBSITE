import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { TeamMemberClient } from "@/components/b2c/TeamMemberClient";
import db from "@/lib/db";
import {
  resolvePublicTeamMember,
  isTeamMemberPubliclyEligible,
} from "@/lib/team/team-resolver";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const isAr = locale === 'ar';

  try {
    let member = await db.employeeProfile.findUnique({
      where: { slug },
    });
    if (!member) {
      member = await db.employeeProfile.findUnique({
        where: { id: slug },
      });
    }

    if (!member || !isTeamMemberPubliclyEligible(member).eligible) {
      return {
        title: isAr ? 'الملف الشخصي غير موجود | E3 Qatar' : 'Team Member Not Found | E3 Qatar',
      };
    }

    const safeMember = resolvePublicTeamMember(member, isAr ? 'ar' : 'en');
    return {
      title: `${safeMember.name} - ${safeMember.designation} | E3 Qatar`,
      description: safeMember.aboutSummary || safeMember.tagline || undefined,
    };
  } catch {
    return {
      title: isAr ? 'فريق العمل | E3 Qatar' : 'Our Team | E3 Qatar',
    };
  }
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const isAr = locale === 'ar';

  // 1. Query database for team member by slug
  const member = await db.employeeProfile.findUnique({
    where: { slug },
  });

  // 2. Legacy CUID resolution & permanent redirect helper
  if (!member) {
    const legacyMember = await db.employeeProfile.findUnique({
      where: { id: slug },
    });
    if (legacyMember && isTeamMemberPubliclyEligible(legacyMember).eligible && legacyMember.slug) {
      permanentRedirect(`/${locale}/b2c/team/${legacyMember.slug}`);
    }
  }

  // 3. Strict 404 for missing, inactive, or malformed records
  if (!member || !isTeamMemberPubliclyEligible(member).eligible) {
    notFound();
  }

  const setting = await db.setting.findUnique({
    where: { key: "B2C_TEAM_PAGE_SETTINGS" },
  });
  const settings = setting ? (typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value) : null;

  const safeMember = resolvePublicTeamMember(member, isAr ? 'ar' : 'en');

  return <TeamMemberClient locale={locale} member={safeMember as any} initialSettings={settings} />;
}
