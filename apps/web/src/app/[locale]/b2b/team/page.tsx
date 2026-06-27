import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TeamGrid, TeamMember } from "@/components/b2b/team/TeamGrid"
import { Button } from "@/components/ui/Button"

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

  // MOCK DATA
  const mockTeam: TeamMember[] = [
    {
      id: "1",
      slug: "ahmed-hassan",
      name: { en: "Ahmed Hassan", ar: "أحمد حسن" },
      designation: { en: "Chief Executive Officer", ar: "الرئيس التنفيذي" },
      department: "Management",
      profilePhoto: "https://i.pravatar.cc/500?img=11",
      bioExcerpt: {
        en: "With over 20 years in global event production, Ahmed leads E3 with a vision for technological excellence and uncompromising safety.",
        ar: "مع أكثر من 20 عاماً في إنتاج الفعاليات العالمية، يقود أحمد E3 برؤية للتميز التكنولوجي والسلامة."
      },
      socialLinks: { linkedin: "#" }
    },
    {
      id: "2",
      slug: "sarah-jones",
      name: { en: "Sarah Jones", ar: "سارة جونز" },
      designation: { en: "Creative Director", ar: "المدير الإبداعي" },
      department: "Creative",
      profilePhoto: "https://i.pravatar.cc/500?img=5",
      bioExcerpt: {
        en: "Sarah bridges the gap between wild imagination and structural reality. She ensures every 'Wow' moment is perfectly engineered.",
        ar: "تسد سارة الفجوة بين الخيال الجامح والواقع الهيكلي. إنها تضمن هندسة كل لحظة إبهار بشكل مثالي."
      },
      socialLinks: { linkedin: "#", twitter: "#" }
    },
    {
      id: "3",
      slug: "tariq-mansour",
      name: { en: "Tariq Mansour", ar: "طارق منصور" },
      designation: { en: "Lead Structural Engineer", ar: "كبير المهندسين الإنشائيين" },
      department: "Technical",
      profilePhoto: "https://i.pravatar.cc/500?img=60",
      bioExcerpt: {
        en: "Tariq oversees all load-bearing structures and rigging operations, ensuring zero safety incidents across our history.",
        ar: "يشرف طارق على جميع الهياكل الحاملة وعمليات التجهيز، مما يضمن عدم وجود حوادث سلامة في تاريخنا."
      }
    },
    {
      id: "4",
      slug: "emma-wilson",
      name: { en: "Emma Wilson", ar: "إيما ويلسون" },
      designation: { en: "Head of Operations", ar: "رئيس العمليات" },
      department: "Operations",
      profilePhoto: "https://i.pravatar.cc/500?img=47",
      bioExcerpt: {
        en: "Emma manages the logistical ballet of moving hundreds of tons of equipment across international borders.",
        ar: "تدير إيما الخدمات اللوجستية لنقل مئات الأطنان من المعدات عبر الحدود الدولية."
      }
    }
  ]

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
        <TeamGrid members={mockTeam} locale={locale} />
        
      </div>
    </main>
  )
}
