'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatLocalizedText } from '@/lib/utils';
import { sanitizeUrl, resolvePartnerLogoUrl } from '@/lib/partners/partner-resolver';

interface Partner {
  name?: string;
  nameEn?: string;
  nameAr?: string;
  partnerName?: any;
  logoUrl?: string;
  logo?: string;
  image?: string;
  partnerImageLogoUrl?: string;
  websiteUrl?: string;
  partnerDetailTagline?: any;
}

interface PartnersSectionProps {
  partners?: Partner[] | null;
  locale?: string;
}

export function PartnersSection({ partners, locale = 'en' }: PartnersSectionProps) {
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());
  const isAr = locale === 'ar';

  if (!partners || !Array.isArray(partners) || partners.length === 0) {
    return null;
  }

  // Strictly filter authentic partners: REQUIRE an active, valid, non-placeholder, non-failed logoUrl
  const validPartners = partners.filter((p) => {
    if (!p) return false;
    const nameVal = typeof p === 'object' && ('partnerName' in p ? (p as any).partnerName : (p.nameEn || p.nameAr || p.name));
    const resolvedName = formatLocalizedText(nameVal, locale).trim();
    const rawLogo = p.logoUrl || (p as any).logo || (p as any).image || (p as any).partnerImageLogoUrl;
    const logo = resolvePartnerLogoUrl(rawLogo);

    // If no logo or name, exclude
    if (!resolvedName || !logo) return false;
    if (logo.includes('placeholder') || logo.includes('via.placeholder') || logo.includes('example.com')) return false;
    if (resolvedName.toLowerCase().includes('demo partner') || resolvedName.toLowerCase() === 'partner') return false;

    // If image runtime loading failed, exclude
    if (failedLogos.has(logo)) return false;

    return true;
  });

  // If no partners with valid logos remain, hide the entire section
  if (validPartners.length === 0) {
    return null;
  }

  const sanitized = validPartners.map((p) => {
    const nameVal = typeof p === 'object' && ('partnerName' in p ? (p as any).partnerName : (p.nameEn || p.nameAr || p.name));
    const rawLogo = p.logoUrl || (p as any).logo || (p as any).image || (p as any).partnerImageLogoUrl;
    const resolvedLogo = resolvePartnerLogoUrl(rawLogo);
    return {
      ...p,
      name: formatLocalizedText(nameVal, locale),
      websiteUrl: sanitizeUrl(p.websiteUrl),
      logoUrl: resolvedLogo,
    };
  });

  const handleImageError = (logoUrl?: string | null) => {
    if (logoUrl) {
      setFailedLogos((prev) => {
        const next = new Set(prev);
        next.add(logoUrl);
        return next;
      });
    }
  };

  // If after error suppression all logos failed, return null
  if (sanitized.filter((s) => !failedLogos.has(s.logoUrl || '')).length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[var(--surface-default)] border-t border-[var(--border-level-2)] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[var(--text-primary)]"
        >
          {isAr ? 'شركاء الوجهة والرعاة' : 'Our Partners & Sponsors'}
        </motion.h2>
        <div className="h-1 w-16 bg-emerald-500 mx-auto mt-4 rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {sanitized.map((partner, idx) => {
            if (!partner.logoUrl || failedLogos.has(partner.logoUrl)) return null;

            const content = (
              <div className="relative h-16 w-36 md:w-44 flex items-center justify-center p-2 rounded-2xl bg-[var(--surface-hover)]/40 hover:bg-[var(--surface-hover)] border border-[var(--border-level-1)] hover:border-emerald-500/30 transition-all duration-300 group shadow-xs">
                <img
                  src={partner.logoUrl}
                  alt={partner.name || 'Partner logo'}
                  className="object-contain w-full h-full max-h-12 grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                  onError={() => handleImageError(partner.logoUrl)}
                  loading="lazy"
                />
              </div>
            );

            if (partner.websiteUrl) {
              return (
                <a
                  key={`${partner.name}-${idx}`}
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transition-transform hover:scale-105"
                  title={partner.name}
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={`${partner.name}-${idx}`} title={partner.name}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
