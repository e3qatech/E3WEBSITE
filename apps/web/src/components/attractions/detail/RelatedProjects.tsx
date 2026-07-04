import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function RelatedProjects({ projects, locale }: { projects: any[], locale: string }) {
  if (!projects || projects.length === 0) return null

  return (
    <section className="py-24 bg-zinc-950 border-t border-zinc-900">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black text-zinc-100 tracking-tight">{locale === 'ar' ? 'المشاريع' : 'Projects'}</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((proj: any, i) => {
            const linkHref = `/b2b/case-studies/${proj.slug}`;
            const targetName = locale === 'ar' && proj.titleAr ? proj.titleAr : proj.titleEn;
            const targetDesc = locale === 'ar' && proj.challengeAr ? proj.challengeAr : proj.challengeEn;
            const targetImage = proj.thumbnailUrl || proj.heroImageUrl;
            
            return (
              <Link key={proj.id || i} href={linkHref} className="group block relative aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="absolute inset-0 z-0">
                  {targetImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={targetImage} alt={targetName} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600 font-medium">[Project Image]</div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent opacity-90 z-10" />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <div className="flex justify-between items-end">
                    <div className="max-w-[85%]">
                      <h3 className="text-2xl font-bold text-zinc-100 transition-colors">
                        {targetName}
                      </h3>
                      {targetDesc && (
                        <p className="text-zinc-300 mt-2 line-clamp-2 text-sm">{targetDesc}</p>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur border border-zinc-700 flex items-center justify-center text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
