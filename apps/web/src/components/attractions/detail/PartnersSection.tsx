'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatLocalizedText } from '@/lib/utils';
import { sanitizeUrl, resolvePartnerLogoUrl } from '@/lib/partners/partner-resolver';

interface Partner {
  name?: string;
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

  if (!partners || !Array.isArray(partners) || partners.length === 0) {
    return null;
  }

  // Strictly filter authentic partners: require valid non-placeholder logoUrl and name
  const validPartners = partners.filter(p => {
    if (!p) return false;
    const nameVal = typeof p === 'object' && ('partnerName' in p ? (p as any).partnerName : p.name);
    const resolvedName = formatLocalizedText(nameVal, locale).trim();
    const rawLogo = p.logoUrl || (p as any).logo || (p as any).image || (p as any).partnerImageLogoUrl;
    const logo = resolvePartnerLogoUrl(rawLogo);

    if (!resolvedName || !logo) return false;
    if (logo.includes('placeholder') || logo.includes('via.placeholder') || logo.includes('example.com')) return false;
    if (resolvedName.toLowerCase().includes('demo partner') || resolvedName.toLowerCase() === 'partner') return false;

    // Suppress if runtime image loading failed
    if (failedLogos.has(logo)) return false;

    return true;
  });

  if (validPartners.length === 0) {
    return null;
  }

  const sanitized = validPartners.map(p => {
    const nameVal = typeof p === 'object' && ('partnerName' in p ? (p as any).partnerName : p.name);
    const rawLogo = p.logoUrl || (p as any).logo || (p as any).image || (p as any).partnerImageLogoUrl;
    const resolvedLogo = resolvePartnerLogoUrl(rawLogo);
    return {
      ...p,
      name: formatLocalizedText(nameVal, locale),
      websiteUrl: sanitizeUrl(p.websiteUrl),
      logoUrl: resolvedLogo,
    };
  });

  // To create a continuous marquee, duplicate items if there are few
  const displayPartners = sanitized.length < 8 ? [...sanitized, ...sanitized, ...sanitized] : sanitized;

  const handleImageError = (logoUrl?: string | null) => {
    if (logoUrl) {
      setFailedLogos(prev => {
        const next = new Set(prev);
        next.add(logoUrl);
        return next;
      });
    }
  };

  return (
    <section className="py-24 bg-[var(--surface-default)] border-t border-[var(--border-level-2)] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[var(--text-primary)]"
        >
          {locale === 'ar' ? 'شركاؤنا' : 'Our Partners'}
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          className="h-1 w-24 bg-emerald-500 mx-auto mt-6"
        />
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        <div className="absolute top-0 start-0 w-32 h-full bg-gradient-to-r from-[var(--surface-default)] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 end-0 w-32 h-full bg-gradient-to-l from-[var(--surface-default)] to-transparent z-10 pointer-events-none" />
        
        <motion.div 
          className="flex whitespace-nowrap gap-16 items-center py-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          style={{ width: 'max-content' }}
        >
          {displayPartners.map((partner, idx) => (
            <div 
              key={`${partner.name}-${idx}`} 
              className="relative w-44 h-24 flex-shrink-0 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 opacity-70 hover:opacity-100 flex items-center justify-center p-2"
            >
              {partner.websiteUrl ? (
                <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative flex items-center justify-center">
                  {partner.logoUrl ? (
                    <img 
                      src={partner.logoUrl} 
                      alt={partner.name || 'Partner logo'} 
                      className="object-contain w-full h-full max-h-16"
                      onError={() => handleImageError(partner.logoUrl)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-zinc-500">
                      {partner.name}
                    </div>
                  )}
                </a>
              ) : (
                <div className="block w-full h-full relative flex items-center justify-center">
                  {partner.logoUrl ? (
                    <img 
                      src={partner.logoUrl} 
                      alt={partner.name || 'Partner logo'} 
                      className="object-contain w-full h-full max-h-16"
                      onError={() => handleImageError(partner.logoUrl)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-zinc-500">
                      {partner.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {displayPartners.map((partner, idx) => (
            <div 
              key={`dup-${partner.name}-${idx}`} 
              className="relative w-44 h-24 flex-shrink-0 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 opacity-70 hover:opacity-100 flex items-center justify-center p-2"
            >
              {partner.websiteUrl ? (
                <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative flex items-center justify-center">
                  {partner.logoUrl ? (
                    <img 
                      src={partner.logoUrl} 
                      alt={partner.name || 'Partner logo'} 
                      className="object-contain w-full h-full max-h-16"
                      onError={() => handleImageError(partner.logoUrl)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-zinc-500">
                      {partner.name}
                    </div>
                  )}
                </a>
              ) : (
                <div className="block w-full h-full relative flex items-center justify-center">
                  {partner.logoUrl ? (
                    <img 
                      src={partner.logoUrl} 
                      alt={partner.name || 'Partner logo'} 
                      className="object-contain w-full h-full max-h-16"
                      onError={() => handleImageError(partner.logoUrl)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-zinc-500">
                      {partner.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
