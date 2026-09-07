import React from 'react';
import { db } from '@/lib/db';
import { CalendarView } from '@/components/calendar/CalendarView';
import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo-helper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  let pageData: any = null;
  try {
    pageData = await db.pages.findUnique({ where: { slug: 'b2c-calendar' } });
  } catch (e) {
    console.warn("[CALENDAR METADATA NOTICE] Failed to query pages table:", e);
  }

  const cms = (pageData?.content as any) || {};

  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/${locale}/b2c/calendar`;

  const title = isAr
    ? (cms.seo?.metaTitleAr || cms.hero?.titleAr || "جدول فعاليات وتذاكر عروض قطر الترفيهية | إي ثري")
    : (cms.seo?.metaTitleEn || cms.hero?.titleEn || "Qatar Events Calendar & Live Show Tickets | E3");

  const description = isAr
    ? (cms.seo?.metaDescriptionAr || cms.hero?.subtitleAr || "استكشف جدول الفعاليات القادمة، المهرجانات الترفيهية، مواعيد عروض المدن التفاعلية وتذاكر التجارب العائلية في الدوحة وقطر.")
    : (cms.seo?.metaDescriptionEn || cms.hero?.subtitleEn || "Browse upcoming live events, seasonal festivals, theme park schedules, and ticketed family experiences in Doha, Qatar.");

  return {
    title,
    description,
    keywords: isAr
      ? ["جدول فعاليات قطر", "فعاليات الدوحة هذا الأسبوع", "تذاكر عروض قطر", "مهرجانات قطر"]
      : ["qatar events calendar", "doha upcoming events", "qatar live shows tickets", "family activities doha"],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/b2c/calendar`,
        ar: `${baseUrl}/ar/b2c/calendar`,
        "x-default": `${baseUrl}/en/b2c/calendar`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{ url: `${baseUrl}/og-image-default.jpg` }],
    },
  };
}

import { getMergedCMSPageContent } from '@/lib/cms-default-pages';

export default async function CalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  let pageData: any = null;
  let settingsRecords: any[] = [];

  try {
    const [pageRes, settingsRes] = await Promise.all([
      db.pages.findUnique({ where: { slug: 'b2c-calendar' } }).catch(() => null),
      db.setting.findMany({
        where: { 
          key: { in: ["B2C_CALENDAR_PAGE_SETTINGS", "B2C_CALENDAR_DISCOUNTS"] } 
        }
      }).catch(() => [])
    ]);
    pageData = pageRes;
    settingsRecords = settingsRes;
  } catch (e) {
    console.warn("[CALENDAR PAGE DB NOTICE] Failed to query CMS records:", e);
  }

  const uiSettings = settingsRecords.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);

  const rawCmsContent = (pageData?.content as any) || uiSettings.B2C_CALENDAR_PAGE_SETTINGS || {};
  const cmsContent = getMergedCMSPageContent('b2c-calendar', rawCmsContent);

  // Fetch active attractions offers for partner discounts ticker
  let discounts: any[] = [];
  try {
    const attractionsWithOffers = await db.attraction.findMany({
      where: {
        isPublished: true,
        isHidden: false,
      },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        offers: true,
      },
      take: 8,
    });

    discounts = attractionsWithOffers.flatMap((a: any) => 
      (a.offers || []).map((o: any) => ({
        id: o.id,
        title: locale === 'ar' ? (a.nameAr || a.nameEn) : a.nameEn,
        description: `Special offer for ${a.nameEn}`,
        discount: `${o.discount}% OFF`,
        promoCode: o.code
      }))
    );
  } catch (e) {
    console.warn("[CALENDAR DISCOUNTS NOTICE] Failed to query offers:", e);
  }

  return (
    <div>
      <CalendarView 
        cmsContent={cmsContent}
        heroMediaType={cmsContent.hero?.mediaType || cmsContent.heroMedia?.mediaType || cmsContent.heroMediaType || "IMAGE"}
        heroMediaUrl={cmsContent.hero?.mediaUrl || cmsContent.heroMedia?.mediaUrl || cmsContent.heroMediaUrl || ""}
        eyebrowEn={cmsContent.hero?.eyebrowEn || cmsContent.eyebrowEn}
        eyebrowAr={cmsContent.hero?.eyebrowAr || cmsContent.eyebrowAr}
        titleEn={cmsContent.hero?.titleEn || cmsContent.titleEn}
        titleAr={cmsContent.hero?.titleAr || cmsContent.titleAr}
        descriptionEn={cmsContent.hero?.subtitleEn || cmsContent.descriptionEn || cmsContent.taglineEn}
        descriptionAr={cmsContent.hero?.subtitleAr || cmsContent.descriptionAr || cmsContent.taglineAr}
        title={cmsContent.title}
        tagline={cmsContent.tagline}
        discounts={discounts}
      />
    </div>
  );
}
