'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Partner {
  name?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

interface PartnersSectionProps {
  partners?: Partner[] | null;
  locale?: string;
}

export function PartnersSection({ partners, locale = 'en' }: PartnersSectionProps) {
  if (!partners || !Array.isArray(partners) || partners.length === 0) {
    return null;
  }

  // To create a continuous marquee, we duplicate the items if there are few
  const displayPartners = partners.length < 8 ? [...partners, ...partners, ...partners] : partners;

  return (
    <section className="py-24 bg-zinc-950 border-t border-zinc-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white"
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
        <div className="absolute top-0 start-0 w-32 h-full bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 end-0 w-32 h-full bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />
        
        <motion.div 
          className="flex whitespace-nowrap gap-16 items-center py-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          style={{ width: 'max-content' }}
        >
          {displayPartners.map((partner, idx) => (
            <div 
              key={`${partner.name}-${idx}`} 
              className="relative w-40 h-24 flex-shrink-0 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              {partner.websiteUrl ? (
                <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                  {(partner.logoUrl || (partner as any).logo || (partner as any).image) ? (
                    <img 
                      src={partner.logoUrl || (partner as any).logo || (partner as any).image} 
                      alt={partner.name || 'Partner logo'} 
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-zinc-500">
                      {partner.name}
                    </div>
                  )}
                </a>
              ) : (
                <div className="block w-full h-full relative">
                  {(partner.logoUrl || (partner as any).logo || (partner as any).image) ? (
                    <img 
                      src={partner.logoUrl || (partner as any).logo || (partner as any).image} 
                      alt={partner.name || 'Partner logo'} 
                      className="object-contain w-full h-full"
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
              className="relative w-40 h-24 flex-shrink-0 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              {partner.websiteUrl ? (
                <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                  {(partner.logoUrl || (partner as any).logo || (partner as any).image) ? (
                    <img 
                      src={partner.logoUrl || (partner as any).logo || (partner as any).image} 
                      alt={partner.name || 'Partner logo'} 
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-zinc-500">
                      {partner.name}
                    </div>
                  )}
                </a>
              ) : (
                <div className="block w-full h-full relative">
                  {(partner.logoUrl || (partner as any).logo || (partner as any).image) ? (
                    <img 
                      src={partner.logoUrl || (partner as any).logo || (partner as any).image} 
                      alt={partner.name || 'Partner logo'} 
                      className="object-contain w-full h-full"
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
