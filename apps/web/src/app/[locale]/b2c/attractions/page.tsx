import { Metadata } from 'next'
import { getCanonicalAttractions } from '@/lib/cms-attractions'
import { AttractionsClient } from '@/app/[locale]/b2c/AttractionsClient'
import { DEFAULT_OUR_BRANDS } from '@/lib/cms-brands'
import db from '@/lib/db'
import { getMergedCMSPageContent } from '@/lib/cms-default-pages'

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

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params
  const baseUrl = getBaseUrl()

  return {
    title: params.locale === 'ar' ? 'دليل التجارب والوجهات الترفيهية | E3 Qatar' : 'Attractions & Experiences Directory | E3 Qatar',
    description: params.locale === 'ar' ? 'استكشف واحجز أفضل تجارب الترفيه في قطر حسب الفعالية والموقع والتوفر.' : 'Search, filter, and book world-class entertainment attractions across Qatar.',
    alternates: {
      canonical: `${baseUrl}/b2c/attractions`,
      languages: {
        'en': `${baseUrl}/en/b2c/attractions`,
        'ar': `${baseUrl}/ar/b2c/attractions`,
      },
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
