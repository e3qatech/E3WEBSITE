import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, MapPin, Briefcase, Clock } from "lucide-react"
import prisma from "@/lib/db"

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: params.locale === 'ar' ? 'الوظائف | E3 Qatar' : 'Careers | E3 Qatar',
    description: params.locale === 'ar' ? 'انضم إلى فريق E3 وساهم في بناء مستقبل الفعاليات الترفيهية.' : 'Join the E3 team and help build the future of entertainment experiences.'
  }
}

export const dynamic = 'force-dynamic'

export default async function CareersPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const isRTL = locale === 'ar'

  const jobs = await prisma.job.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <main className="bg-[var(--surface-default)] min-h-screen pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16 md:mb-24 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] mb-6 tracking-tight">
            {locale === 'ar' ? 'اصنع المستحيل' : 'Engineer the Impossible'}
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            {locale === 'ar' 
              ? 'نحن نبحث عن عقول مبدعة ومهندسين بارعين لبناء تجارب لا تُنسى. انضم إلينا.' 
              : 'We are looking for creative minds and brilliant engineers to build unforgettable experiences. Join us.'}
          </p>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {jobs.length === 0 ? (
            <div className="text-center py-20 bg-[var(--surface-hover)] rounded-3xl border border-[var(--border-default)]">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {locale === 'ar' ? 'لا توجد وظائف شاغرة حالياً' : 'No Open Positions'}
              </h3>
              <p className="text-[var(--text-secondary)]">
                {locale === 'ar' ? 'يرجى التحقق مرة أخرى لاحقاً أو إرسال سيرتك الذاتية.' : 'Please check back later or submit a general application.'}
              </p>
            </div>
          ) : (
            jobs.map((job) => (
              <Link 
                href={`/${locale}/careers/${job.id}`} 
                key={job.id}
                className="block group bg-[var(--surface-default)] border border-[var(--border-default)] hover:border-[var(--color-primary)] rounded-3xl p-6 md:p-8 transition-all hover:shadow-xl hover:shadow-[var(--color-primary)]/10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="text-xs font-bold px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full uppercase tracking-wider inline-block mb-4">
                      {job.department || "General"}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] mb-4 group-hover:text-[var(--color-primary)] transition-colors">
                      {job.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {job.location || (locale === 'ar' ? 'الدوحة، قطر' : 'Doha, Qatar')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {job.type.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[var(--surface-hover)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors text-[var(--text-secondary)] ${isRTL ? 'rotate-180' : ''}`}>
                    <ArrowRight className="w-6 h-6 rtl:-scale-x-100" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

      </div>
    </main>
  )
}
