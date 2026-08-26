import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { DynamicARViewer } from '@/components/shared/DynamicWrappers'
import { db } from "@/lib/db"
import { Metadata } from 'next'
import { localizeHref } from '@/lib/url-helper'

export async function generateMetadata({ params }: { params: Promise<{ slug: string, locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const isAr = locale === 'ar';
  
  const service = await db.service.findUnique({
    where: { slug }
  });

  if (!service) {
    return { title: 'Service Not Found' };
  }

  const seo = service.seo as any || {};
  
  const title = isAr 
    ? (seo.metaTitleAr || service.titleAr || service.titleEn) 
    : (seo.metaTitleEn || service.titleEn);
    
  const description = isAr 
    ? (seo.metaDescriptionAr || service.taglineAr || '') 
    : (seo.metaDescriptionEn || service.taglineEn || '');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: service.thumbnail ? [{ url: service.thumbnail }] : [],
    }
  };
}

export default async function ServiceMicrosite({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  
  const { slug, locale } = await params
  const isAr = locale === 'ar'

  const service = await db.service.findUnique({
    where: { slug },
    include: {
      projects: {
        include: { attraction: true }
      },
      gallery: { orderBy: { orderIndex: 'asc' } }
    }
  })

  if (!service || !service.isVisible) {
    notFound()
  }

  const processList = Array.isArray(service.process) ? service.process : []
  const title = isAr ? (service.titleAr || service.titleEn) : service.titleEn
  const tagline = isAr ? (service.taglineAr || service.taglineEn) : service.taglineEn
  const content = isAr ? (service.contentAr || service.contentEn) : service.contentEn

  return (
    <div className="flex flex-col w-full bg-[var(--bg-level-1)] text-[var(--text-primary)] min-h-screen transition-colors" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. Immersive Header */}
      <section className="relative min-h-[60vh] flex items-center pt-24 pb-12 overflow-hidden border-b border-[var(--border-level-1)]">
        <div className="absolute inset-0 z-0">
          {service.heroMediaUrl ? (
            <UniversalMediaRenderer 
              type={service.heroMediaType as any || "IMAGE"} 
              src={service.heroMediaUrl}
              alt={title}
            />
          ) : (
            <div className="w-full h-full bg-[var(--surface-default)]" />
          )}
          <div className="absolute inset-0 bg-[var(--bg-level-1)]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-level-1)] via-[var(--bg-level-1)]/80 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <Link href={localizeHref('/b2b/services', locale)} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-emerald-500 uppercase tracking-wider mb-8 transition-colors">
            <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" /> {isAr ? "العودة إلى الخدمات" : "Back to Services"}
          </Link>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-[var(--text-primary)] tracking-tight mb-6 max-w-4xl">
            {title}
          </h1>
          {tagline && (
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl font-medium">
              {tagline}
            </p>
          )}
        </div>
      </section>

      {/* 2. Deep Dive Narrative & Specs */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <h2 className="text-3xl font-black text-[var(--text-primary)] mb-6 tracking-tight">
                {isAr ? "نطاق الخدمة" : "The Discipline"}
              </h2>
              <div className="text-lg text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {content}
              </div>
            </div>
            
            {processList.length > 0 && (
              <div className="p-8 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-sm">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                  {isAr ? "مراحل العمل والمخرجات" : "Core Deliverables & Process"}
                </h3>
                <ul className="space-y-6">
                  {processList.map((step: any, i: number) => {
                    const stepTitle = isAr ? (step.titleAr || step.titleEn) : step.titleEn;
                    const stepDesc = isAr ? (step.descAr || step.descEn) : step.descEn;
                    return (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                        <div>
                          <div className="text-[var(--text-primary)] font-bold mb-1">{stepTitle}</div>
                          <div className="text-[var(--text-secondary)] text-sm">{stepDesc}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2.5 WebXR AR Viewer - Only rendered if authentic 3D asset is configured */}
      {service.model3dUrl && (
        <section className="py-24 bg-[var(--bg-level-2)] border-t border-[var(--border-level-1)] relative transition-colors">
          <div className="container mx-auto px-4 md:px-8 text-center mb-8">
            <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-2">
              {isAr ? "معاينة المعدات التفاعلية" : "Immersive Equipment Viewer"}
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              {isAr 
                ? "استكشف تجهيزاتنا الفنية وهياكل المسارح مباشرة في مساحتك باستخدام الواقع المعزز." 
                : "Experience our stage fabrications and technical setups directly in your space using augmented reality."}
            </p>
          </div>
          <div className="container mx-auto px-4 md:px-8">
            <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-default)] relative shadow-md">
              <DynamicARViewer modelUrl={service.model3dUrl} modelName={title} />
            </div>
          </div>
        </section>
      )}

      {/* 3. Related Projects */}
      {service.projects && service.projects.length > 0 && (
        <section className="py-24 bg-[var(--bg-level-2)] border-t border-[var(--border-level-1)] transition-colors">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {isAr ? "المشاريع ذات الصلة" : "Projects"}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {service.projects.map((proj: any, i: number) => {
                const isAttraction = !!proj.attraction;
                const linkHref = isAttraction ? localizeHref(`/b2c/attractions/${proj.attraction.slug}`, locale) : null;
                const targetName = isAttraction 
                  ? (isAr ? (proj.attraction.nameAr || proj.attraction.nameEn) : proj.attraction.nameEn)
                  : (isAr ? (proj.titleAr || proj.titleEn) : proj.titleEn);
                const targetDesc = isAttraction 
                  ? (isAr ? (proj.attraction.descriptionAr || proj.attraction.descriptionEn) : proj.attraction.descriptionEn)
                  : (isAr ? (proj.descriptionAr || proj.descriptionEn) : proj.descriptionEn);
                const targetImage = isAttraction ? (proj.attraction.heroThumbnailUrl || proj.attraction.heroFallbackUrl || proj.imageUrl) : proj.imageUrl;
                
                const cardContent = (
                  <div className="group block relative aspect-video rounded-2xl overflow-hidden bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-emerald-500/50 transition-colors shadow-sm">
                    <div className="absolute inset-0 z-0">
                      {targetImage ? (
                        <img src={targetImage} alt={targetName} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-[var(--surface-raised)] flex items-center justify-center text-[var(--text-tertiary)] font-medium">[Project Image]</div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-[var(--surface-default)]/60 to-transparent opacity-95 z-10" />
                    <div className="absolute bottom-0 start-0 end-0 p-6 sm:p-8 z-20">
                      <div className="flex justify-between items-end">
                        <div className="max-w-[85%]">
                          {isAttraction && (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {isAr ? "وجهة مميزة" : "Featured Attraction"}
                            </div>
                          )}
                          <h3 className="text-2xl font-bold text-[var(--text-primary)] transition-colors">
                            {targetName}
                          </h3>
                          {targetDesc && (
                            <p className="text-[var(--text-secondary)] mt-2 line-clamp-2 text-sm">{targetDesc}</p>
                          )}
                        </div>
                        {isAttraction && (
                           <div className="w-10 h-10 rounded-full bg-[var(--surface-default)]/90 backdrop-blur border border-[var(--border-level-2)] flex items-center justify-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 shadow-sm">
                             <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                );

                if (linkHref) {
                  return (
                    <Link key={proj.id || i} href={linkHref}>
                      {cardContent}
                    </Link>
                  )
                }

                return <div key={proj.id || i}>{cardContent}</div>;
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. Gallery */}
      {service.gallery && service.gallery.length > 0 && (
        <section className="py-24 border-t border-[var(--border-level-1)] bg-[var(--bg-level-1)] transition-colors">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-12">
              {isAr ? "معرض الصور" : "Gallery"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {service.gallery.map((img: any, i: number) => (
                <div key={i} className="aspect-square bg-[var(--surface-default)] rounded-2xl border border-[var(--border-level-2)] overflow-hidden relative group shadow-sm">
                  <img src={img.url} alt={isAr ? (img.captionAr || img.captionEn || "معرض الصور") : (img.captionEn || "Gallery Image")} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}

