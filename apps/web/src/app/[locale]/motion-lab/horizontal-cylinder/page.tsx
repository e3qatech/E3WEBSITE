import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowDown, Sparkles, Layers } from 'lucide-react';
import { HorizontalOctagonalExperience } from '@/components/spatial';
import { localizeHref } from '@/lib/url-helper';
import { getCMSPageContentServer } from '@/lib/cms-server';

export const dynamic = 'force-dynamic';

export function isMotionLabAllowedInEnvironment(): boolean {
  const vercelEnvironment = process.env.VERCEL_ENV;

  if (vercelEnvironment === "production") {
    return false;
  }

  if (vercelEnvironment === "preview") {
    return true;
  }

  return process.env.NODE_ENV === "development";
}

export function getMotionLabRedirectUrl(locale: string): string {
  return `/${locale}/b2c`;
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === 'ar';

  return {
    title: isAr
      ? 'معمل الحركة: الأسطوانة التفاعلية الأفقية | إي ثري قطر'
      : 'Motion Lab: Horizontal Octagonal Barrel | E3 Qatar',
    description: isAr
      ? 'تجربة تفاعلية أفقية ثمانية الأوجه لتدوير أقسام الموقع واستكشاف عوالم إي ثري.'
      : 'Full-screen scroll-driven horizontal octagonal cylinder experience rotating through E3 ecosystems.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function MotionLabHorizontalCylinderPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const isAr = locale === 'ar';

  // In production without explicit feature flag, redirect to B2C
  if (!isMotionLabAllowedInEnvironment()) {
    redirect(`/${locale}/b2c`);
  }

  const cmsData = await getCMSPageContentServer("b2c-landing");
  const cmsFaces = cmsData?.spatialExperience?.faces;

  return (
    <main className="min-h-screen bg-[#050811] text-white flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1. Opening Hero Section */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 text-center overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>{isAr ? "معمل الحركة التجريبي" : "E3 Motion Lab Prototype"}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-sky-400">8-Sided Horizontal Barrel</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
            {isAr ? (
              <>
                الأسطوانة التفاعلية <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-400">
                  ثمانية الأوجه
                </span>
              </>
            ) : (
              <>
                Horizontal Octagonal <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-400">
                  Scroll Experience
                </span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? "مرر لأسفل لدخول التجربة الفضائية وتدوير الأسطوانة عبر المحور الأفقي لاستعراض فصول المنظومة الترفيهية."
              : "Scroll down to enter the pinned spatial experience and rotate the eight-sided horizontal barrel around its X-axis."}
          </p>

          <div className="pt-6">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-400 animate-bounce">
              <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? "مرر لأسفل لبدء التدوير" : "Scroll down to begin"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Pinned 8-Sided Horizontal Barrel Experience */}
      <HorizontalOctagonalExperience locale={locale} customSections={cmsFaces} />

      {/* 3. Post-Experience Lower Page Section (Smooth Unpinning Continuity) */}
      <section className="relative py-28 px-6 md:px-12 lg:px-20 bg-zinc-950 border-t border-zinc-800 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-400">
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? "اكتمل التدوير بسلاسة" : "Seamless Unpinning Complete"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {isAr ? "تابع استكشاف قطر مع إي ثري" : "Continue Exploring Qatar with E3"}
          </h2>

          <p className="text-zinc-400 text-base leading-relaxed max-w-xl mx-auto">
            {isAr
              ? "انتقلت بنجاح عبر الفصول الثمانية. يمكنك الآن متابعة التصفح أو العودة إلى البوابة الرئيسية."
              : "You have traversed all eight chapters. Continue downwards into our live catalog or explore the primary portal."}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={localizeHref('/b2c/attractions', locale)}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-zinc-950 text-sm transition-all"
            >
              {isAr ? "تصفح كل الوجهات" : "Explore All Attractions"}
            </Link>
            <Link
              href={localizeHref('/b2c', locale)}
              className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm transition-all"
            >
              {isAr ? "العودة إلى الرئيسية" : "Return to Home"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
