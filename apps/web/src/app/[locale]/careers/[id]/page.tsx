import { notFound } from "next/navigation"
import { Metadata } from "next"
import prisma from "@/lib/db"
import { MapPin, Briefcase, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ApplicationForm } from "@/components/b2c/careers/ApplicationForm"

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const job = await prisma.job.findUnique({
    where: { id: params.id }
  })
  
  if (!job) return { title: 'Job Not Found' }

  return {
    title: `${job.title} | E3 Careers`,
    description: job.description.slice(0, 150) + "..."
  }
}

export const dynamic = 'force-dynamic'

export default async function JobDetailsPage(props: { params: Promise<{ locale: string, id: string }> }) {
  const params = await props.params;
  const { locale, id } = params;
  const isRTL = locale === 'ar'

  const job = await prisma.job.findUnique({
    where: { id }
  })

  if (!job || !job.isPublished) {
    notFound()
  }

  return (
    <main className="bg-[var(--surface-default)] min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <Link 
            href={`/${locale}/careers`}
            className="inline-flex items-center text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-8"
          >
            <ArrowLeft className={`w-4 h-4 me-2 ${isRTL ? 'rotate-180 ms-2 me-0' : ''}`} />
            {locale === 'ar' ? 'العودة إلى الوظائف' : 'Back to Careers'}
          </Link>

          <div className="text-xs font-bold px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full uppercase tracking-wider inline-block mb-4">
            {job.department || "General"}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6">
            {job.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
              {job.location || (locale === 'ar' ? 'الدوحة، قطر' : 'Doha, Qatar')}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--color-primary)]" />
              {job.type.replace("_", " ")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                {locale === 'ar' ? 'عن الوظيفة' : 'About the Role'}
              </h2>
              <div className="prose prose-invert max-w-none text-[var(--text-secondary)]">
                {job.description.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </section>

            {job.requirements && (
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  {locale === 'ar' ? 'المتطلبات' : 'Requirements'}
                </h2>
                <div className="prose prose-invert max-w-none text-[var(--text-secondary)]">
                  {job.requirements.split('\n').map((req, idx) => (
                    req.trim() && (
                      <div key={idx} className="flex items-start gap-3 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-2 shrink-0" />
                        <p>{req.replace(/^[-*]\s*/, '')}</p>
                      </div>
                    )
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Application Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                {locale === 'ar' ? 'قدم الآن' : 'Apply Now'}
              </h2>
              <ApplicationForm jobId={job.id} jobTitle={job.title} locale={locale} />
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}
