"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, MapPin, Mail, Phone } from 'lucide-react'
import { localizeHref, normalizeExternalUrl } from '@/lib/url-helper'

function Instagram({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function Facebook({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function Linkedin({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

export function B2BFooter({ settings = {}, locale: propLocale }: { settings?: Record<string, string>; locale?: string }) {
  const pathname = usePathname() || ""
  const isAr = propLocale ? propLocale === 'ar' : pathname.startsWith('/ar')
  const currentLocale = propLocale || (isAr ? 'ar' : 'en')

  const siteName = isAr ? (settings.siteNameAr || "إي ثري للشركات") : (settings.siteNameEn || "E3 Corporate");
  const address = isAr ? (settings.addressAr || settings.addressEn || "الدوحة، دولة قطر") : (settings.addressEn || "Doha, State of Qatar");
  const phone = settings.contactPhone || "";
  const emailAddr = settings.contactEmail || "";
  const desc = isAr 
    ? (settings.gatewayB2BDescAr || "تحول E3 الأفكار إلى تجارب بارزة — من خلال التصميم الإبداعي والتصنيع وإصدار التذاكر والتوظيف والعمليات والتسليم الملموس عبر قطر والمنطقة.") 
    : (settings.gatewayB2BDesc || "E3 turns ideas into landmark experiences — through creative design, fabrication, ticketing, staffing, operations, and measurable delivery across Qatar and the region.");
  
  const lightLogoUrl = settings.lightLogoUrl;
  const darkLogoUrl = settings.darkLogoUrl;

  return (
    <footer 
      data-portal="b2b"
      className="bg-[var(--bg-level-2)] text-[var(--text-secondary)] border-t border-[var(--border-level-1)] pt-20 pb-10 transition-colors duration-300" 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Connect / Inquiry Strip */}
        <div className="mb-20 p-6 sm:p-10 md:p-16 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
              {isAr ? "هل لديك مشروع في ذهنك؟" : "Have a project in mind?"}
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              {isAr ? "شاركنا موجز مشروعك وسيتواصل معك فريقنا لصياغة المفهوم المكتمل وخطة التنفيذ." : "Share your brief and our team will connect with you to shape the right concept and delivery plan."}
            </p>
          </div>
          
          <div className="relative z-10 shrink-0">
            <Link 
              href={`/${currentLocale}/b2b/contact`} 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white font-bold text-base rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors shadow-md"
            >
              {isAr ? "ابدأ الاستفسار" : "Start Inquiry"} <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href={`/${currentLocale}/b2b`} className="flex items-center gap-3">
              {(lightLogoUrl || darkLogoUrl) ? (
                <img 
                  src={(darkLogoUrl || lightLogoUrl)} 
                  alt={`${siteName} Logo`}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center font-black text-white tracking-tighter shadow-sm">
                  E3
                </div>
              )}
              <span className="font-bold text-xl tracking-tight text-[var(--text-primary)]">
                {!(lightLogoUrl || darkLogoUrl) ? (isAr ? "للشركات" : "Corporate") : ""}
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-[var(--text-secondary)]">
              {desc}
            </p>
          </div>

          <div>
            <h4 className="text-[var(--text-primary)] font-bold mb-6 tracking-wider uppercase text-xs">{isAr ? "الخدمات" : "Services"}</h4>
            <ul className="space-y-3.5 text-sm">
              <li><Link href={`/${currentLocale}/b2b/services/mega-events`} className="hover:text-[var(--color-primary)] transition-colors">{isAr ? "الفعاليات الكبرى" : "Mega Events"}</Link></li>
              <li><Link href={`/${currentLocale}/b2b/services/family-entertainment-centers`} className="hover:text-[var(--color-primary)] transition-colors">{isAr ? "مراكز الترفيه العائلي" : "Family Entertainment Centers"}</Link></li>
              <li><Link href={`/${currentLocale}/b2b/services/experiential-activations`} className="hover:text-[var(--color-primary)] transition-colors">{isAr ? "التجارب والتفعيلات" : "Experiential Activations"}</Link></li>
              <li><Link href={`/${currentLocale}/b2b/services/shows-performances`} className="hover:text-[var(--color-primary)] transition-colors">{isAr ? "العروض والأداء المباشر" : "Shows & Performances"}</Link></li>
              <li><Link href={`/${currentLocale}/b2b/services`} className="text-[var(--color-primary)] hover:underline transition-all font-semibold">{isAr ? "عرض جميع الخدمات ←" : "View All Services →"}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--text-primary)] font-bold mb-6 tracking-wider uppercase text-xs">{isAr ? "الشركة" : "Company"}</h4>
            <ul className="space-y-3.5 text-sm">
              <li><Link href={`/${currentLocale}/b2b/discover`} className="hover:text-[var(--color-primary)] transition-colors">{isAr ? "استكشف إي ثري" : "Discover E3"}</Link></li>
              <li><Link href={`/${currentLocale}/b2b/case-studies`} className="hover:text-[var(--color-primary)] transition-colors">{isAr ? "دراسات الحالة وأعمالنا" : "Case Studies"}</Link></li>
              <li><Link href={`/${currentLocale}/b2b/clients`} className="hover:text-[var(--color-primary)] transition-colors">{isAr ? "العملاء والشركاء" : "Clients & Partners"}</Link></li>
              <li><Link href={`/${currentLocale}/b2b/about`} className="hover:text-[var(--color-primary)] transition-colors">{isAr ? "من نحن" : "About Us"}</Link></li>
              <li><Link href={`/${currentLocale}/b2b/contact`} className="hover:text-[var(--color-primary)] transition-colors">{isAr ? "تواصل معنا" : "Contact / RFP"}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--text-primary)] font-bold mb-6 tracking-wider uppercase text-xs">{isAr ? "التواصل" : "Connect"}</h4>
            <ul className="space-y-3.5 text-sm">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[var(--color-primary)] mt-0.5 shrink-0" />
                  <span>{address}</span>
                </li>
              )}
              {emailAddr && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  <a href={`mailto:${emailAddr}`} className="hover:text-[var(--color-primary)] transition-colors">{emailAddr}</a>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-[var(--color-primary)] transition-colors">{phone}</a>
                </li>
              )}
            </ul>
            
            <div className="flex items-center gap-3 mt-6">
              {settings.socialInstagram && (
                <a href={normalizeExternalUrl(settings.socialInstagram)} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[var(--surface-default)] rounded-xl border border-[var(--border-level-2)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.socialFacebook && (
                <a href={normalizeExternalUrl(settings.socialFacebook)} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[var(--surface-default)] rounded-xl border border-[var(--border-level-2)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinkedin && (
                <a href={normalizeExternalUrl(settings.socialLinkedin)} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[var(--surface-default)] rounded-xl border border-[var(--border-level-2)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-level-1)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p>© {new Date().getFullYear()} {siteName}. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
          <div className="flex items-center gap-6">
            <Link href={localizeHref('/privacy', currentLocale)} className="hover:text-[var(--color-primary)] transition-colors">{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</Link>
            <Link href={localizeHref('/terms', currentLocale)} className="hover:text-[var(--color-primary)] transition-colors">{isAr ? "شروط الخدمة" : "Terms of Service"}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
