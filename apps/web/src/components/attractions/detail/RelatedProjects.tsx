import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatLocalizedText } from '@/lib/utils'
import { localizeHref } from '@/lib/url-helper'

export function RelatedProjects({ projects, locale = 'en' }: { projects: any[], locale?: string }) {
  if (!projects || projects.length === 0) return null

  return (
    <section className="py-24 bg-[var(--bg-level-1)] border-t border-[var(--border-level-2)]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{locale === 'ar' ? 'المشاريع' : 'Projects'}</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((proj: any, i) => {
            const linkHref = localizeHref(`/b2b/cases/${proj.slug}`, locale);
            const rawName = locale === 'ar' && proj.titleAr ? proj.titleAr : (proj.titleEn || proj.titleAr);
            const rawDesc = locale === 'ar' && proj.challengeAr ? proj.challengeAr : (proj.challengeEn || proj.challengeAr);
            const targetName = formatLocalizedText(rawName, locale);
            const targetDesc = formatLocalizedText(rawDesc, locale);
            const targetImage = proj.thumbnailUrl || proj.heroImageUrl;
            
            return (
              <Link key={proj.id || i} href={linkHref} className="group block relative aspect-video rounded-3xl overflow-hidden bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-emerald-500/50 transition-all shadow-lg">
                <div className="absolute inset-0 z-0">
                  {targetImage ? (
                    <img src={targetImage} alt={targetName} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-tertiary)] font-medium">[Project Image]</div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-[var(--surface-default)]/60 to-transparent opacity-95 z-10" />
                <div className="absolute bottom-0 start-0 end-0 p-8 z-20">
                  <div className="flex justify-between items-end">
                    <div className="max-w-[85%]">
                      <h3 className="text-2xl font-bold text-[var(--text-primary)] transition-colors">
                        {targetName}
                      </h3>
                      {targetDesc && (
                        <p className="text-[var(--text-secondary)] mt-2 line-clamp-2 text-sm">{targetDesc}</p>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[var(--surface-hover)] backdrop-blur border border-[var(--border-level-2)] flex items-center justify-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 shadow-md">
                      <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
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
