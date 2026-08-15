import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { Award, ArrowLeft, ArrowRight } from 'lucide-react';
import db from '@/lib/db';
import {
  resolvePublicTeamMember,
  isTeamMemberPubliclyEligible,
} from '@/lib/team/team-resolver';
import { ExperienceTimeline, TimelineEntry } from '@/components/b2b/team/ExperienceTimeline';
import { MeetingBookingForm } from '@/components/shared/MeetingBookingForm';
import { Button } from '@/components/ui/Button';

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

  // Format certifications safely
  const certificationsList = Array.isArray(member.certifications)
    ? member.certifications.map((c: any, idx: number) => ({
        id: c.id || `cert-${idx}`,
        name: typeof c === 'string' ? c : c.name || '',
        issuer: typeof c === 'object' ? c.issuer || (isAr ? 'هيئة مهنية معتمدة' : 'Professional Organization') : (isAr ? 'هيئة مهنية معتمدة' : 'Professional Organization'),
        year: typeof c === 'object' ? c.year || '' : '',
      }))
    : [];

  return (
    <main className="bg-[var(--surface-default)] min-h-screen">
      {/* 1. HERO */}
      <section className="relative w-full pt-32 pb-20 md:pb-28 overflow-hidden bg-gradient-to-b from-[var(--surface-hover)] to-[var(--surface-default)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Link */}
          <div className="mb-8">
            <Link
              href={`/${locale}/b2b/team`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {isAr ? 'العودة إلى دليل فريق العمل' : 'Back to Team Directory'}
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-start">
            {/* Profile Photo / Avatar Monogram */}
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-full border-4 border-[var(--surface-default)] shadow-2xl overflow-hidden shrink-0 bg-[var(--surface-default)] flex items-center justify-center">
              {member.profileImage ? (
                <img
                  src={member.profileImage}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[var(--color-primary)] text-white flex items-center justify-center text-4xl md:text-5xl font-black">
                  {member.initials}
                </div>
              )}
            </div>

            {/* Title & Safe Socials */}
            <div className="flex-1">
              <span className="inline-block px-4 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[var(--color-primary)]/20">
                {member.department}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-2">
                {member.name}
              </h1>
              <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium mb-6">
                {member.designation}
              </p>

              {member.yearsOfExperience > 0 && (
                <p className="text-sm font-semibold text-[var(--text-tertiary)] mb-6">
                  {isAr
                    ? `${member.yearsOfExperience} سنوات من الخبرة المتخصصة`
                    : `${member.yearsOfExperience}+ Years of Specialized Experience`}
                </p>
              )}

              <div className="flex items-center justify-center md:justify-start gap-3">
                {member.linkedinUrl && (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-[var(--surface-hover)] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white hover:border-transparent transition-all"
                    aria-label="LinkedIn Profile"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  </a>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${locale}/b2b/contact`}>
                    {isAr ? 'تواصل مع فريقنا' : 'Contact E3 Team'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TWO COLUMN CONTENT SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content (Left) */}
          <div className="lg:w-2/3 space-y-14">
            {/* Biography */}
            {member.aboutSummary ? (
              <div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-4">
                  {isAr ? 'نبذة مهنية' : 'Professional Biography'}
                </h2>
                <div className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed space-y-4">
                  <p>{member.aboutSummary}</p>
                </div>
              </div>
            ) : null}

            {/* Career Journey */}
            {member.careerJourney ? (
              <div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-4">
                  {isAr ? 'المسيرة المهنية' : 'Career Journey'}
                </h2>
                <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                  {member.careerJourney}
                </p>
              </div>
            ) : null}

            {/* Key Strengths & Competencies */}
            {member.coreCompetencies.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-4">
                  {isAr ? 'الكفاءات والخبرات الأساسية' : 'Core Competencies'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {member.coreCompetencies.map((comp: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl text-xs font-bold text-[var(--text-primary)]"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Timeline */}
            {experienceEntries.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8">
                  {isAr ? 'الخبرة العملية' : 'Professional Experience'}
                </h2>
                <ExperienceTimeline entries={experienceEntries} locale={locale} />
              </div>
            )}
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:w-1/3 space-y-10">
            {/* Certifications */}
            {certificationsList.length > 0 && (
              <div className="bg-[var(--surface-hover)] rounded-3xl p-6 border border-[var(--border-default)]">
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-6">
                  {isAr ? 'الشهادات والاعتمادات' : 'Certifications'}
                </h3>
                <ul className="space-y-3">
                  {certificationsList.map((cert) => (
                    <li
                      key={cert.id}
                      className="flex gap-3 p-3.5 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)]"
                    >
                      <div className="shrink-0 w-9 h-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-primary)] text-sm mb-0.5 leading-tight">
                          {cert.name}
                        </p>
                        {cert.issuer && (
                          <p className="text-xs font-medium text-[var(--text-tertiary)]">
                            {cert.issuer} {cert.year ? `• ${cert.year}` : ''}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Consultation / Booking CTA */}
            <div className="bg-[var(--surface-default)] rounded-3xl p-6 border border-[var(--border-default)] shadow-xl sticky top-28">
              <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">
                {isAr ? `تنسيق استشارة مع ${member.name}` : `Consult with ${member.name}`}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
                {isAr
                  ? 'احجز موعداً لمناقشة متطلبات مشروعك أو فعاليتك القادمة.'
                  : 'Schedule a direct project consultation for your upcoming corporate event.'}
              </p>

              <MeetingBookingForm locale={locale} hostId={member.id} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
