import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/db";
import { MapPin, Clock, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ApplicationForm } from "@/components/b2c/careers/ApplicationForm";
import {
  isJobPubliclyEligible,
  formatJobPresentation,
} from "@/lib/careers/job-eligibility";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const job = await prisma.job.findUnique({
    where: { id: params.id },
  });
  
  if (!job) return { title: 'Job Not Found' };

  return {
    title: `${job.title} | E3 Careers`,
    description: job.description.slice(0, 150) + "...",
  };
}

export const dynamic = 'force-dynamic';

export default async function JobDetailsPage(props: { params: Promise<{ locale: string, id: string }> }) {
  const params = await props.params;
  const { locale, id } = params;
  const isRTL = locale === 'ar';

  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    notFound();
  }

  const eligibility = isJobPubliclyEligible(job);
  const formatted = formatJobPresentation(job, locale as 'en' | 'ar');

  return (
    <main className="bg-[var(--surface-default)] min-h-screen pt-32 pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <Link 
            href={`/${locale}/b2b/careers`}
            className="inline-flex items-center text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-8"
          >
            <ArrowLeft className={`w-4 h-4 me-2 ${isRTL ? 'rotate-180 ms-2 me-0' : ''}`} />
            {locale === 'ar' ? 'العودة إلى الوظائف' : 'Back to Careers'}
          </Link>

          <div className="text-xs font-bold px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full uppercase tracking-wider inline-block mb-4">
            {formatted.department}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6">
            {formatted.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
              {formatted.location}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--color-primary)]" />
              {formatted.type}
            </div>
          </div>
        </div>

        {/* Closed or Expired State Banner */}
        {!eligibility.eligible && (
          <div className="mb-12 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white text-lg">
                  {locale === 'ar' ? 'هذه الوظيفة لم تعد تستقبل طلبات جديدة' : 'Position Closed'}
                </h3>
                <p className="text-sm text-zinc-300 mt-1">
                  {locale === 'ar'
                    ? (eligibility.reasonAr || 'انتهى موعد التقديم على هذه الوظيفة أو تم إغلاقها.')
                    : (eligibility.reason || 'This position is closed or no longer accepting submissions.')}
                </p>
              </div>
            </div>
            <Link
              href={`/${locale}/b2b/careers`}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-amber-500 text-zinc-950 font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors shrink-0"
            >
              {locale === 'ar' ? 'استعراض الشواغر المتاحة' : 'View Open Roles'}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                {locale === 'ar' ? 'عن الوظيفة' : 'About the Role'}
              </h2>
              <div className="prose prose-invert max-w-none text-[var(--text-secondary)]">
                {formatted.description.split('\n').map((paragraph: string, idx: number) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </section>

            {formatted.requirements && (
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  {locale === 'ar' ? 'المتطلبات' : 'Requirements'}
                </h2>
                <div className="prose prose-invert max-w-none text-[var(--text-secondary)]">
                  {formatted.requirements.split('\n').map((req: string, idx: number) => (
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

          {/* Application Form Sidebar (Only active if job is eligible) */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                {locale === 'ar' ? 'قدم الآن' : 'Apply Now'}
              </h2>
              {eligibility.eligible ? (
                <ApplicationForm jobId={job.id} jobTitle={formatted.title} locale={locale} />
              ) : (
                <div className="text-center py-8 space-y-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {locale === 'ar'
                      ? 'باب التقديم لهذه الوظيفة مغلق حالياً. يمكنك تقديم طلب عام ليتم النظر في ملفك عند توفر شواغر مستقبلية.'
                      : 'Applications for this role are currently closed. You may submit a general application for future openings.'}
                  </p>
                  <Link
                    href={`/${locale}/apply`}
                    className="inline-block w-full py-3 px-4 bg-[var(--color-primary)] text-zinc-950 font-bold rounded-xl text-center text-sm hover:opacity-90 transition-opacity"
                  >
                    {locale === 'ar' ? 'تقديم طلب عام' : 'Submit General Application'}
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
