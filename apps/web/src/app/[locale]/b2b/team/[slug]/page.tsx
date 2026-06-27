import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Mail, ArrowUpRight, Award } from "lucide-react"

import { ExperienceTimeline, TimelineEntry } from "@/components/b2b/team/ExperienceTimeline"
import { CaseStudyCard } from "@/components/b2b/case-studies/CaseStudyCard"
import { MeetingBookingForm } from "@/components/shared/MeetingBookingForm"

export async function generateMetadata(props: { params: Promise<{ locale: string, slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `Team Member | E3 Qatar`,
  }
}

export default async function TeamMemberPage(props: { params: Promise<{ locale: string, slug: string }> }) {
  const params = await props.params;
  const { locale, slug } = params;

  // Mock Data Fetch for team member
  const member = {
    id: "3",
    slug: "tariq-mansour",
    name: { en: "Tariq Mansour", ar: "طارق منصور" },
    designation: { en: "Lead Structural Engineer", ar: "كبير المهندسين الإنشائيين" },
    department: { en: "Technical", ar: "القسم التقني" },
    coverPhoto: "https://images.unsplash.com/photo-1541888086425-d81bb19240f5",
    profilePhoto: "https://i.pravatar.cc/500?img=60",
    bio: {
      en: "<p>Tariq brings over 15 years of specialized experience in temporary structural engineering for mega-events. He holds a Masters in Structural Mechanics and has overseen the safe deployment of over 5,000 tons of staging equipment across the MENA region.</p><p>His philosophy is simple: 'If it can be imagined, it can be engineered safely.'</p>",
      ar: "<p>يتمتع طارق بأكثر من 15 عاماً من الخبرة المتخصصة في الهندسة الإنشائية المؤقتة للفعاليات الضخمة.</p>"
    },
    socialLinks: {
      linkedin: "#",
      twitter: "#",
      email: "tariq@e3qatar.com"
    },
    certifications: [
      { id: "c1", name: "Certified Rigging Specialist", issuer: "PLASA", year: "2019" },
      { id: "c2", name: "Structural Safety for Temporary Structures", issuer: "IStructE", year: "2021" }
    ],
    experience: [
      {
        id: "e1",
        company: { en: "E3 Qatar", ar: "إي ثري قطر" },
        role: { en: "Lead Structural Engineer", ar: "كبير المهندسين الإنشائيين" },
        duration: { en: "2021 - Present", ar: "2021 - الحاضر" },
        description: { en: "Directing all load calculations, rigging operations, and safety sign-offs for major government and corporate deployments.", ar: "توجيه جميع حسابات الأحمال وعمليات التجهيز واعتمادات السلامة." }
      },
      {
        id: "e2",
        company: { en: "Global Events Tech", ar: "جلوبال إيفنتس تك" },
        role: { en: "Senior Rigger", ar: "كبير مسؤولي التجهيز" },
        duration: { en: "2015 - 2021", ar: "2015 - 2021" }
      }
    ] as TimelineEntry[]
  }

  // Mock contributed projects
  const contributedProjects = [
    {
      id: "1", slug: "qatar-auto-show", title: { en: "Geneva International Motor Show Qatar", ar: "معرض جنيف الدولي للسيارات قطر" },
      clientName: { en: "Qatar Tourism", ar: "قطر للسياحة" }, category: "Government", year: "2023",
      thumbnailUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
    },
    {
      id: "4", slug: "winter-wonderland-rigging", title: { en: "Winter Wonderland Stage Rigging", ar: "تجهيزات مسرح ونتر وندر لاند" },
      clientName: { en: "Estithmar Holding", ar: "استثمار القابضة" }, category: "FEC", year: "2023",
      thumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819"
    }
  ]

  if (!member) notFound()

  return (
    <main className="bg-[var(--surface-default)] min-h-screen">
      
      {/* 1. HERO */}
      <section className="relative w-full pt-32 pb-24 md:pb-32 overflow-hidden">
        {/* Cover Photo */}
        <div className="absolute inset-0 h-[400px]">
          <img src={member.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-[var(--surface-default)]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-start">
            {/* Profile Photo */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-[var(--surface-default)] shadow-2xl overflow-hidden shrink-0">
              <img src={member.profilePhoto} alt={member.name.en} className="w-full h-full object-cover" />
            </div>

            {/* Title & Socials */}
            <div className="flex-1 pb-4">
              <span className="inline-block px-4 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-sm font-bold uppercase tracking-wider mb-4 border border-[var(--color-primary)]/20">
                {(member.department as any)[locale] || member.department.en}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] mb-2">
                {(member.name as any)[locale] || member.name.en}
              </h1>
              <p className="text-xl md:text-2xl text-[var(--text-secondary)] font-medium mb-6">
                {(member.designation as any)[locale] || member.designation.en}
              </p>

              <div className="flex items-center justify-center md:justify-start gap-4">
                {member.socialLinks?.linkedin && (
                  <a href={member.socialLinks.linkedin} className="w-12 h-12 rounded-full bg-[var(--surface-hover)] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white hover:border-transparent transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  </a>
                )}
                {member.socialLinks?.twitter && (
                  <a href={member.socialLinks.twitter} className="w-12 h-12 rounded-full bg-[var(--surface-hover)] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white hover:border-transparent transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  </a>
                )}
                {member.socialLinks?.email && (
                  <a href={`mailto:${member.socialLinks.email}`} className="w-12 h-12 rounded-full bg-[var(--surface-hover)] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white hover:border-transparent transition-all">
                    <Mail className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TWO COLUMN LAYOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Main Content (Left) */}
          <div className="lg:w-2/3 space-y-20">
            
            {/* Bio */}
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6">
                {locale === 'ar' ? 'نبذة' : 'Biography'}
              </h2>
              <div 
                className="text-lg text-[var(--text-secondary)] leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: (member.bio as any)[locale] || member.bio.en }}
              />
            </div>

            {/* Experience */}
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)] mb-12">
                {locale === 'ar' ? 'الخبرة' : 'Experience'}
              </h2>
              <ExperienceTimeline entries={member.experience} locale={locale} />
            </div>

            {/* Projects */}
            {contributedProjects.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8">
                  {locale === 'ar' ? 'المشاريع' : 'Contributed Projects'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {contributedProjects.map((project, i) => (
                    <CaseStudyCard key={project.id} caseStudy={project as any} locale={locale} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:w-1/3 space-y-12">
            
            {/* Certifications */}
            {member.certifications && member.certifications.length > 0 && (
              <div className="bg-[var(--surface-hover)] rounded-3xl p-8 border border-[var(--border-default)]">
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-6">
                  {locale === 'ar' ? 'الشهادات' : 'Certifications'}
                </h3>
                <ul className="space-y-4">
                  {member.certifications.map(cert => (
                    <li key={cert.id} className="flex gap-4 p-4 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] group hover:border-[var(--color-primary)] transition-colors">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-primary)] text-sm mb-1 line-clamp-2 leading-tight">
                          {cert.name}
                        </p>
                        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                          {cert.issuer} • {cert.year}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Book a Meeting */}
            <div className="bg-[var(--surface-default)] rounded-3xl p-8 border border-[var(--border-default)] shadow-2xl sticky top-32">
              <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">
                {locale === 'ar' ? 'تحدث مع' : 'Talk to'} {(member.name as any)[locale] || member.name.en.split(' ')[0]}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {locale === 'ar' ? 'احجز استشارة مباشرة عبر الإنترنت.' : 'Book a direct online consultation.'}
              </p>
              
              <MeetingBookingForm locale={locale} hostId={member.id} />
            </div>

          </div>

        </div>
      </section>

    </main>
  )
}
