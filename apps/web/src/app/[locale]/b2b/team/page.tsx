import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TeamGrid, TeamMember } from "@/components/b2b/team/TeamGrid"
import { Button } from "@/components/ui/Button"
import prisma from "@/lib/db"

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: params.locale === 'ar' ? 'فريقنا | E3 Qatar' : 'Our Team | E3 Qatar',
  }
}

export default async function B2BTeamPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const isRTL = locale === 'ar'

  // Fetch real data from DB
  const employeeProfiles = await prisma.employeeProfile.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" }
  })

  // Map to the format expected by TeamGrid
  const mappedTeam: TeamMember[] = employeeProfiles.map((emp) => ({
    id: emp.id,
    slug: emp.slug,
    name: { 
      en: `${emp.firstName} ${emp.lastName}`,
      ar: `${emp.firstName} ${emp.lastName}` // Fallback, extend DB later for full AR support
    },
    designation: { 
      en: emp.designation,
      ar: emp.designation
    },
    department: emp.department,
    profilePhoto: emp.profileImage || "https://i.pravatar.cc/500",
    bioExcerpt: { 
      en: emp.aboutSummary,
      ar: emp.aboutSummary
    },
    socialLinks: { 
      linkedin: emp.linkedinUrl || undefined,
      email: emp.contactEmail || undefined
    }
  }))

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
        <TeamGrid members={mappedTeam} locale={locale} />
        
      </div>
    </main>
  )
}
