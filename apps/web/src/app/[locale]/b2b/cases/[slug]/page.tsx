import React from 'react'
import Link from 'next/link'
import { ArrowRight, Quote, Calendar, Building2, Layers, Trophy } from 'lucide-react'
import { notFound, permanentRedirect } from 'next/navigation'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { Metadata } from 'next'
import { getPublicCaseStudyBySlug, getNextPublicCaseStudy } from '@/lib/case-studies'

export async function generateMetadata({ params }: { params: Promise<{ slug: string, locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const isAr = locale === 'ar';
  
  if (slug === 'doha-balloon-parade') {
    permanentRedirect(`/${locale}/b2b/cases/doha-balloon-parade-2022`);
  }

  const project = await getPublicCaseStudyBySlug(slug);

  if (!project) {
    return { title: 'Case Study Not Found' };
  }

  const seo = project.seo as any || {};
  
  const title = isAr 
    ? (seo.metaTitleAr || project.titleAr || project.titleEn) 
    : (seo.metaTitleEn || project.titleEn);
    
  const description = isAr 
    ? (seo.metaDescriptionAr || project.challengeAr || project.solutionAr || '') 
    : (seo.metaDescriptionEn || project.challengeEn || project.solutionEn || '');

  const canonicalUrl = `https://e3.qa/${locale}/b2b/cases/${slug}`;

  return {
    title: `${title} — E3 Case Study`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: (project.heroImageUrl || project.thumbnailUrl) ? [{ url: project.heroImageUrl || project.thumbnailUrl || '' }] : [],
    }
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const { slug, locale } = await params
  const isAr = locale === 'ar'

  if (slug === 'doha-balloon-parade') {
    permanentRedirect(`/${locale}/b2b/cases/doha-balloon-parade-2022`);
  }

  const project = await getPublicCaseStudyBySlug(slug, {
    includeTeam: true,
    includeAttraction: true
  })

  if (!project) {
    notFound()
  }

  // Fetch next published case study for footer transition (QF-05)
  const nextProject = await getNextPublicCaseStudy(project.id, project.year)

  const metrics = Array.isArray(project.metrics) ? project.metrics as any[] : []
  const gallery = Array.isArray(project.gallery) ? project.gallery as any[] : []
  const testimonials = Array.isArray(project.testimonials) ? (project.testimonials as any[]).filter(t => t.isVisible !== false) : []

  const title = isAr ? (project.titleAr || project.titleEn) : project.titleEn
  const challengeText = isAr ? (project.challengeAr || project.challengeEn) : project.challengeEn
  const solutionText = isAr ? (project.solutionAr || project.solutionEn) : project.solutionEn

  return (
    <div className="flex flex-col w-full bg-zinc-950 min-h-screen text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. IMMERSIVE HERO */}
      <section className="relative min-h-[85vh] flex flex-col justify-end pb-16 pt-32 overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 z-0">
          {(project.heroImageUrl || project.thumbnailUrl) ? (
            <UniversalMediaRenderer 
              type={project.heroMediaType as any || "IMAGE"} 
              src={project.heroImageUrl || project.thumbnailUrl || ""}
              className="w-full h-full object-cover filter brightness-[0.6] contrast-[1.1]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent rtl:bg-gradient-to-l" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <div className="mb-8">
            <Link 
              href={`/${locale}/b2b/cases`} 
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-800 backdrop-blur-md transition-all duration-300 group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 rtl:rotate-0 transition-transform" /> 
              <span>{isAr ? "جميع المشاريع ودراسات الحالة" : "All Case Studies"}</span>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-5xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-syne text-zinc-100 tracking-tight mb-6 leading-[1.05] drop-shadow-xl">
                {title}
              </h1>

              {project.attraction && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold rounded-full text-xs uppercase tracking-widest backdrop-blur-md">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{isAr ? `مشروع ضمن ${project.attraction.nameAr || project.attraction.nameEn}` : `Powered by ${project.attraction.nameEn}`}</span>
                </div>
              )}
            </div>
            
            {project.clientLogoUrl && (
              <div className="shrink-0 bg-zinc-900/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 hidden md:block">
                <img src={project.clientLogoUrl} alt={project.clientName || "Client Logo"} className="h-14 w-auto object-contain" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. KEY DETAILS STRIP */}
      <section className="border-b border-zinc-900 bg-zinc-900/40 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 py-8 gap-8">
            {project.clientName && (
              <div>
                <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? "العميل" : "CLIENT"}</span>
                </div>
                <div className="text-zinc-100 font-bold text-lg font-syne">{project.clientName}</div>
              </div>
            )}

            {project.category && (
              <div>
                <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? "الفئة" : "CATEGORY"}</span>
                </div>
                <div className="text-zinc-100 font-bold text-lg font-syne">{isAr ? (project as any).categoryAr || project.category : project.category}</div>
              </div>
            )}

            {project.year && (
              <div>
                <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? "السنة" : "YEAR"}</span>
                </div>
                <div className="text-zinc-100 font-bold text-lg font-syne">{project.year}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. THE CHALLENGE & THE SOLUTION */}
      <section className="py-24 md:py-32 border-b border-zinc-900 relative">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-5xl mx-auto space-y-24">
            
            {/* Challenge */}
            {challengeText && (
              <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-start">
                <div className="md:col-span-5">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-2">{isAr ? "التحدي التشغيلي" : "THE CHALLENGE"}</span>
                  <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight leading-tight">
                    {isAr ? "التحدي والمهمة" : "Operational Challenge"}
                  </h2>
                </div>
                <div className="md:col-span-7 p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
                  <div className="text-lg md:text-xl text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                    {challengeText}
                  </div>
                </div>
              </div>
            )}
            
            {/* Solution */}
            {solutionText && (
              <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-start">
                <div className="md:col-span-5">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">{isAr ? "الحل والتنفيذ" : "THE E3 SOLUTION"}</span>
                  <h2 className="text-4xl md:text-5xl font-black font-syne text-emerald-400 tracking-tight leading-tight">
                    {isAr ? "الحل والتسليم" : "Turnkey Execution"}
                  </h2>
                </div>
                <div className="md:col-span-7 p-8 rounded-3xl bg-zinc-900/60 border border-emerald-500/30 backdrop-blur-md">
                  <div className="text-lg md:text-xl text-zinc-200 leading-relaxed font-medium whitespace-pre-wrap">
                    {solutionText}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </section>

      {/* 4. IMPACT METRICS BENTO GRID */}
      {metrics.length > 0 && (
        <section className="py-24 bg-zinc-900/40 border-b border-zinc-900">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">{isAr ? "الأثر والأرقام" : "QUANTIFIED IMPACT"}</span>
              <h2 className="text-4xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight">
                {isAr ? "أثر المشروع ومؤشرات الأداء" : "Key Project Metrics"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {metrics.map((m: any, i: number) => {
                const val = isAr ? (m.valueAr || m.valueEn || m.value) : (m.valueEn || m.value)
                const label = isAr ? (m.labelAr || m.labelEn || m.label) : (m.labelEn || m.label)
                const isLarge = i === 0 && metrics.length % 2 !== 0

                return (
                  <div 
                    key={i} 
                    className={`bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 md:p-12 flex flex-col justify-center items-center text-center group hover:border-emerald-500/50 transition-all duration-500 ${isLarge ? 'md:col-span-2 lg:col-span-3' : ''}`}
                  >
                    <div className={`font-black font-syne text-emerald-400 tracking-tight mb-4 group-hover:scale-105 transition-transform duration-500 ${isLarge ? 'text-6xl md:text-8xl' : 'text-5xl md:text-6xl'}`}>
                      {val}
                    </div>
                    <div className="text-xs md:text-sm text-zinc-400 font-mono font-bold uppercase tracking-widest">{label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. TEAM & TESTIMONIALS BENTO */}
      {(project.teamMembers.length > 0 || testimonials.length > 0) && (
        <section className="py-24 md:py-32 border-b border-zinc-900">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Testimonials */}
              {testimonials.length > 0 && (
                <div className={`flex flex-col gap-6 ${project.teamMembers.length === 0 ? 'lg:col-span-2' : ''}`}>
                  <h3 className="text-2xl font-black font-syne text-zinc-100 tracking-tight mb-4">{isAr ? "شهادة العميل" : "Client Feedback"}</h3>
                  {testimonials.map((t, i) => {
                    const quote = isAr ? (t.quoteAr || t.quoteEn) : t.quoteEn
                    return (
                      <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden flex-1 flex flex-col backdrop-blur-md">
                        <Quote className="w-12 h-12 text-zinc-800 absolute top-6 end-6 -rotate-6" />
                        <div className="text-lg md:text-xl text-zinc-200 italic mb-8 relative z-10 flex-1 leading-relaxed">
                          &quot;{quote}&quot;
                        </div>
                        <div className="text-emerald-400 font-mono font-bold uppercase tracking-widest text-xs relative z-10">
                          {t.authorName} {t.authorRole ? `— ${t.authorRole}` : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Team Members */}
              {project.teamMembers.length > 0 && (
                <div className={`flex flex-col gap-6 ${testimonials.length === 0 ? 'lg:col-span-2' : ''}`}>
                  <h3 className="text-2xl font-black font-syne text-zinc-100 tracking-tight mb-4">{isAr ? "فريق العمل القيادي" : "Key Execution Team"}</h3>
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 flex-1 backdrop-blur-md">
                    <div className="flex flex-col gap-2">
                      {project.teamMembers.map((tm: any, i: number) => {
                        const role = isAr ? (tm.roleAr || tm.roleEn || tm.employeeProfile?.designation) : (tm.roleEn || tm.employeeProfile?.designation)
                        return (
                          <div key={i} className="group relative py-4 border-b border-zinc-800/80 last:border-0 flex justify-between items-center cursor-default">
                            <div className="text-xl font-bold font-syne text-zinc-300 group-hover:text-emerald-400 transition-colors z-10">
                              {tm.employeeProfile?.firstName} {tm.employeeProfile?.lastName}
                            </div>
                            <div className="text-zinc-500 font-mono uppercase tracking-widest text-xs font-bold z-10">
                              {role}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </section>
      )}

      {/* 6. PROJECT GALLERY BENTO */}
      {gallery.length > 0 && (
        <section className="py-24 bg-zinc-900/30 border-b border-zinc-900">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl md:text-4xl font-black font-syne text-zinc-100 tracking-tight mb-12 text-center">
              {isAr ? "معرض صور المشروع" : "Project Visual Gallery"}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto auto-rows-[250px] md:auto-rows-[300px]">
              {gallery.map((img: any, i: number) => {
                const isLarge = i % 5 === 0
                const isTall = i % 5 === 2
                const isWide = i % 5 === 3
                
                let spanClasses = "col-span-2 md:col-span-1 row-span-1"
                if (isLarge) spanClasses = "col-span-2 md:col-span-2 row-span-1 md:row-span-2"
                else if (isTall) spanClasses = "col-span-2 md:col-span-1 row-span-1 md:row-span-2"
                else if (isWide) spanClasses = "col-span-2 md:col-span-2 row-span-1"

                const caption = isAr ? (img.captionAr || img.captionEn) : img.captionEn

                return (
                  <div key={i} className={`bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden relative group ${spanClasses}`}>
                    <UniversalMediaRenderer 
                      type={"IMAGE"} 
                      src={img.url}
                      alt={caption || "Gallery Image"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {caption && (
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 md:p-8">
                        <div className="text-zinc-100 font-bold text-sm">{caption}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. NEXT PROJECT FOOTER */}
      {nextProject && (
        <section className="py-32 bg-emerald-500 text-zinc-950 text-center relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-xs font-mono font-bold uppercase tracking-widest mb-6 opacity-80">
              {isAr ? "المشروع التالي" : "NEXT FEATURED CASE STUDY"}
            </div>
            <Link 
              href={`/${locale}/b2b/cases/${nextProject.slug}`} 
              className="group inline-flex flex-col md:flex-row items-center gap-4 text-4xl md:text-7xl font-black font-syne tracking-tight hover:scale-[1.02] transition-transform duration-300"
            >
              <span>{isAr ? (nextProject.titleAr || nextProject.titleEn) : nextProject.titleEn}</span>
              <ArrowRight className="w-10 h-10 md:w-16 md:h-16 group-hover:translate-x-4 rtl:group-hover:-translate-x-4 rtl:-scale-x-100 transition-transform duration-300" />
            </Link>
          </div>
        </section>
      )}

    </div>
  )
}
