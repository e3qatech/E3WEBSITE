import { Metadata } from 'next'
import { getCanonicalAttractions } from '@/lib/cms-attractions'
import { AttractionsDirectoryClient } from '@/components/b2c/AttractionsDirectoryClient'
import { DEFAULT_OUR_BRANDS } from '@/lib/cms-brands'

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
  venue: { nameEn: 'Qatar', nameAr: 'قطر' }
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
    title: params.locale === 'ar' ? 'دليل التجارب والوجهات | E3 Qatar' : 'Attractions & Experiences Directory | E3 Qatar',
    description: params.locale === 'ar' ? 'استكشف واحجز أفضل تجارب الترفيه في قطر حسب الفعالية والموقع.' : 'Search, filter, and book world-class entertainment attractions across Qatar.',
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

  const initialAttractions = dbAttractions.length > 0 ? dbAttractions : SEED_FALLBACK_ATTRACTIONS

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-amber-500/30 selection:text-amber-300">
      <AttractionsDirectoryClient locale={locale} initialAttractions={initialAttractions} />
    </main>
  )
}
