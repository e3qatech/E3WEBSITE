import { Metadata } from 'next'
import { getCanonicalAttractions } from '@/lib/cms-attractions'
import { AttractionsClient } from '@/app/[locale]/b2c/AttractionsClient'
import { DEFAULT_OUR_BRANDS } from '@/lib/cms-brands'
import db from '@/lib/db'
import { getMergedCMSPageContent } from '@/lib/cms-default-pages'
import { getBaseUrl } from '@/lib/seo-helper'

const SEED_FALLBACK_ATTRACTIONS = DEFAULT_OUR_BRANDS.map(b => ({
  id: b.id,
  slug: b.slug,
  nameEn: b.nameEn,
  nameAr: b.nameAr,
  descriptionEn: b.descriptionEn,
  descriptionAr: b.descriptionAr,
  tagline: b.taglineEn,
  status: 'ACTIVE',
  heroMediaUrl: b.logoPrimary,
  category: 'FAMILY',
  bookingMode: 'EXTERNAL_URL',
  bookingUrl: b.bookingUrl || b.internalRoute,
  venue: { nameEn: 'Qatar', nameAr: 'قطر' },
  operations: {
    openingTime: "14:00",
    closingTime: "23:00",
    locationNameEn: "Qatar",
    locationNameAr: "قطر",
    lat: 25.418,
    lng: 51.530
  }
}))


export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params
  const { locale } = params
  const isAr = locale === 'ar'
  const baseUrl = getBaseUrl()

  const title = isAr
    ? 'أفضل الوجهات الترفيهية والألعاب العائلية في قطر | تذاكر ومواعيد الفعاليات | إي ثري'
    : 'Top Attractions & Family Entertainment in Qatar | Tickets & Venues | E3'

  const description = isAr
    ? 'استكشف واحجز أفضل الوجهات الترفيهية والمدن التفاعلية ومهرجانات الألعاب العائلية مثل إنفلاتارن في قطر والدوحة.'
    : 'Explore and book world-class entertainment destinations, theme parks, InflataRUN events, and live family experiences in Doha, Qatar.'

  return {
    title,
    description,
    keywords: isAr
      ? ['أماكن ترفيهية في قطر', 'وجهات سياحية بالدوحة', 'ألعاب عائلية قطر', 'حجز فعاليات قطر']
      : ['top attractions qatar', 'family entertainment doha', 'theme parks qatar', 'inflatarun tickets'],
    alternates: {
      canonical: `${baseUrl}/${locale}/b2c/attractions`,
      languages: {
        'en': `${baseUrl}/en/b2c/attractions`,
        'ar': `${baseUrl}/ar/b2c/attractions`,
        'x-default': `${baseUrl}/en/b2c/attractions`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/b2c/attractions`,
      images: [{ url: `${baseUrl}/og-image-default.jpg` }],
    },
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AttractionsPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params
  const { locale } = params

  let dbAttractions: any[] = []
  try {
    dbAttractions = await getCanonicalAttractions()
  } catch (_e) {
    dbAttractions = []
  }

  let rawContent: any = null
  try {
    const page = await db.pages.findUnique({ where: { slug: "b2c-attractions" } })
    if (page?.content) rawContent = page.content
  } catch (_e) {}

  const cmsData = getMergedCMSPageContent("b2c-attractions", rawContent)
  const initialAttractions = dbAttractions.length > 0 ? dbAttractions : SEED_FALLBACK_ATTRACTIONS

  return (
    <AttractionsClient locale={locale} cmsData={cmsData} initialAttractions={initialAttractions} />
  )
}
