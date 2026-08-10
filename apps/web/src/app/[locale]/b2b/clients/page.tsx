import React from 'react'
import 'next/link'
import { db } from "@/lib/db"
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { DEFAULT_OUR_BRANDS } from '@/lib/cms-brands'
import { Sparkles, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Our Brands, Clients & Partners - E3 Corporate',
  description: 'Flagship E3 brands, client portfolios, and global partners delivering world-class experiences across Qatar.',
}

export const dynamic = 'force-dynamic'

export default async function ClientsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar'

  let dbPartners: any[] = []
  let pageData: any = null

  try {
    const results = await Promise.all([
      db.partner.findMany({
        where: { isVisible: true },
        orderBy: [
          { orderIndex: 'asc' },
          { name: 'asc' }
        ]
      }),
      db.pages.findUnique({
        where: { slug: 'b2b-partners' }
      })
    ])
    dbPartners = results[0]
    pageData = results[1]
  } catch (error) {
    console.error("Error fetching b2b partners data:", error)
  }

  const content = pageData?.content as any || {}
  const hero = content?.hero || {
    titleEn: "Our Brands, Clients & Partners.",
    titleAr: "عوالمنا، عملاؤنا وشركاؤنا.",
    subtitleEn: "Flagship E3-created entertainment destinations, corporate clients, and international strategic partners.",
    subtitleAr: "الوجهات الترفيهية الفاخرة من ابتكار E3، وشبكة العملاء والشركاء الاستراتيجيين في قطر.",
    mediaType: "IMAGE",
    mediaUrl: ""
  }

  const heroTitle = isAr ? hero.titleAr : hero.titleEn;
  const heroSubtitle = isAr ? hero.subtitleAr : hero.subtitleEn;

  // Filter Our Brands (E3 Owned) vs Clients vs Partners
  const ourBrandsList = DEFAULT_OUR_BRANDS.filter(b => b.isVisible)

  const clientsList = dbPartners.filter(p => p.category === 'CLIENT' || p.category === 'CORPORATE' || p.category === 'GOVERNMENT')
  const partnersList = dbPartners.filter(p => p.category === 'PARTNER' || p.category === 'TECHNOLOGY' || p.category === 'AGENCY' || !p.category)

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <section className="relative min-h-[50vh] flex items-center py-20 md:py-28 border-b border-zinc-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {hero.mediaUrl ? (
            <UniversalMediaRenderer
              type={hero.mediaType || "IMAGE"}
              src={hero.mediaUrl}
              alt="Clients Hero Background"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-purple-500/10 via-emerald-500/5 to-transparent pointer-events-none" />
          )}
          {hero.mediaUrl && <div className="absolute inset-0 bg-zinc-950/80" />}
          {hero.mediaUrl && <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />}
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? "منظومة إي ثري — E3 ECOSYSTEM" : "E3 ECOSYSTEM & PARTNERSHIPS"}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-zinc-100 tracking-tight max-w-4xl">
            {heroTitle}
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl font-medium">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Main Tabbed Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 space-y-20">

          {/* 1. OUR BRANDS (E3 CREATED & OPERATED) */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-purple-950/60 pb-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {isAr ? "عوالم من ابتكار E3 (Our Brands)" : "Worlds Created by E3 (Our Brands)"}
                </h2>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {isAr ? "ملك وحصرياً لـ E3" : "100% E3 OWNED"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ourBrandsList.map((brand) => (
                <a
                  key={brand.id}
                  href={brand.internalRoute || "#"}
                  className="group relative p-6 rounded-2xl bg-gradient-to-b from-purple-950/30 to-slate-950 border border-purple-500/30 hover:border-purple-500 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <img src={brand.logoPrimary} alt={brand.nameEn} className="w-12 h-12 rounded-xl object-cover border border-purple-500/40" />
                    <div>
                      <h3 className="text-lg font-extrabold text-white group-hover:text-purple-300 transition-colors">
                        {isAr ? brand.nameAr : brand.nameEn}
                      </h3>
                      <span className="text-xs font-mono text-purple-400 font-bold">
                        {isAr ? brand.taglineAr : brand.taglineEn}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-light line-clamp-2">
                    {isAr ? brand.descriptionAr : brand.descriptionEn}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* 2. CLIENTS (B2B & GOVERNMENT) */}
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-zinc-100 tracking-tight flex items-center gap-4">
              {isAr ? "عملاؤنا (Clients)" : "Clients & Corporate Partners"}
              <div className="h-px flex-1 bg-zinc-900" />
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {clientsList.length === 0 ? (
                <div className="col-span-full py-8 text-center border border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  {isAr ? "قائمة العملاء قيد التحديث" : "Clients list being updated"}
                </div>
              ) : (
                clientsList.map((client, j) => (
                  <div
                    key={client.id || j}
                    className="aspect-[3/2] rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-6 hover:bg-zinc-800 transition-all group"
                  >
                    {client.logoUrl ? (
                      <img src={client.logoUrl} alt={client.name} className="max-w-[80%] max-h-[80%] object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                    ) : (
                      <div className="text-zinc-400 font-bold text-xs text-center">{client.name}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. STRATEGIC PARTNERS */}
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-zinc-100 tracking-tight flex items-center gap-4">
              {isAr ? "شركاء النجاح (Partners)" : "Strategic & Technology Partners"}
              <div className="h-px flex-1 bg-zinc-900" />
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {partnersList.length === 0 ? (
                <div className="col-span-full py-8 text-center border border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  {isAr ? "قائمة الشركاء قيد التحديث" : "Partners list being updated"}
                </div>
              ) : (
                partnersList.map((partner, j) => (
                  <div
                    key={partner.id || j}
                    className="aspect-[3/2] rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-6 hover:bg-zinc-800 transition-all group"
                  >
                    {partner.logoUrl ? (
                      <img src={partner.logoUrl} alt={partner.name} className="max-w-[80%] max-h-[80%] object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                    ) : (
                      <div className="text-zinc-400 font-bold text-xs text-center">{partner.name}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
