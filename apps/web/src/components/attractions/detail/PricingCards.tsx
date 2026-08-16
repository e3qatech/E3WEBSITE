'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Tag, Copy, Check, Info, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { localizeHref, isExternalUrl, normalizeExternalUrl } from '@/lib/url-helper';
import { formatLocalizedText } from '@/lib/utils';

interface PricingTier {
  id: string;
  titleEn: string;
  titleAr?: string;
  price: number;
  currency: string;
  type: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  discount?: number | null;
}

interface PartnerOffer {
  id: string;
  code: string;
  discount: number;
  validUntil?: Date | string | null;
}

interface PricingCardsProps {
  pricing: PricingTier[];
  offers?: PartnerOffer[];
  bookingUrl?: string | null;
  pricingNoteEn?: string | null;
  pricingNoteAr?: string | null;
  locale?: string;
}

export type ControlledPricingCategory = 'ACCESS_PASS' | 'PREMIUM_ACTIVITY' | 'HOURLY_ACTIVITY' | 'ADD_ON';
type PricingTab = 'ALL' | ControlledPricingCategory;

export function normalizePricingCategory(type?: string): ControlledPricingCategory {
  if (!type) return 'ACCESS_PASS';
  const t = type.toUpperCase().trim();
  if (t === 'ACCESS_PASS' || t === 'ACCESS' || t === 'GENERAL' || t === 'GENERAL PASS' || t === 'ENTRY') {
    return 'ACCESS_PASS';
  }
  if (t === 'PREMIUM_ACTIVITY' || t === 'PREMIUM' || t === 'VIP' || t === 'PRO' || t.includes('PREMIUM')) {
    return 'PREMIUM_ACTIVITY';
  }
  if (t === 'HOURLY_ACTIVITY' || t === 'HOURLY' || t === 'TIMED' || t.includes('HOURLY')) {
    return 'HOURLY_ACTIVITY';
  }
  if (t === 'ADD_ON' || t === 'ADDON' || t === 'ADD-ON' || t === 'GEAR' || t === 'MERCH') {
    return 'ADD_ON';
  }
  return 'ACCESS_PASS';
}

export function PricingCards({ pricing, offers, bookingUrl, pricingNoteEn, pricingNoteAr, locale = 'en' }: PricingCardsProps) {
  const [activeCategory, setActiveCategory] = useState<PricingTab>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const isAr = locale === 'ar';

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!pricing || pricing.length === 0) return null;

  const getCategoryLabel = (cat: PricingTab) => {
    switch (cat) {
      case 'ACCESS_PASS': return isAr ? 'باقات الدخول' : 'Access Passes';
      case 'PREMIUM_ACTIVITY': return isAr ? 'الأنشطة المميزة' : 'Premium Activities';
      case 'HOURLY_ACTIVITY': return isAr ? 'الجلسات بالساعة' : 'Hourly Activities';
      case 'ADD_ON': return isAr ? 'الخدمات والإضافات' : 'Add-ons';
      default: return isAr ? 'كافة الباقات والأنشطة' : 'All Tiers';
    }
  };

  const getCategoryColor = (cat: ControlledPricingCategory) => {
    switch (cat) {
      case 'ACCESS_PASS': return 'emerald';
      case 'PREMIUM_ACTIVITY': return 'purple';
      case 'HOURLY_ACTIVITY': return 'blue';
      case 'ADD_ON': return 'amber';
      default: return 'emerald';
    }
  };

  const categorizedList = pricing.map(p => ({
    ...p,
    category: normalizePricingCategory(p.type)
  }));

  const filteredPricing = activeCategory === 'ALL'
    ? categorizedList
    : categorizedList.filter(p => p.category === activeCategory);

  const safeBookingUrl = bookingUrl
    ? (isExternalUrl(bookingUrl) ? normalizeExternalUrl(bookingUrl) : localizeHref(bookingUrl, locale))
    : '#';

  const noteText = isAr
    ? (pricingNoteAr || "يخضع استخدام الباقات لتوفر الأنشطة ومتطلبات التشغيل وشروط العمر وتعليمات السلامة في الموقع. يجب شراء الأنشطة المميزة غير المشمولة في باقات الدخول بشكل منفصل.")
    : (pricingNoteEn || "Package access is subject to attraction availability, operating requirements, age restrictions and venue safety rules. Premium activities excluded from the entry passes must be purchased separately.");

  return (
    <section id="pricing" className="py-32 bg-[var(--bg-level-1)] text-[var(--text-primary)] relative overflow-hidden border-t border-[var(--border-level-2)]" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
            <Ticket className="w-3.5 h-3.5" />
            <span>{isAr ? "الباقات والأسعار" : "PRICING & TICKETS"}</span>
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[var(--text-primary)]">
            {isAr ? "باقات الدخول والأنشطة" : "Access Passes & Tickets"}
          </h2>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] font-normal">
            {isAr ? `تصفح كافة الباقات والأنشطة المتاحة (${pricing.length} خيارات)` : `Explore all ${pricing.length} ticket tiers and activity passes`}
          </p>
        </motion.div>

        {/* Category Pill Switcher */}
        <div className="flex flex-wrap justify-center items-center gap-2 p-1.5 max-w-2xl mx-auto rounded-full bg-[var(--surface-default)]/90 backdrop-blur-md border border-[var(--border-level-2)] shadow-md">
          {(['ALL', 'ACCESS_PASS', 'PREMIUM_ACTIVITY', 'HOURLY_ACTIVITY', 'ADD_ON'] as PricingTab[]).map(cat => {
            const count = cat === 'ALL' ? pricing.length : categorizedList.filter(p => p.category === cat).length;
            if (cat !== 'ALL' && count === 0) return null;
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <span>{getCategoryLabel(cat)}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-[var(--surface-hover)] text-[var(--text-tertiary)]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* All Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredPricing.map((tier, idx) => {
            const titleVal = formatLocalizedText(isAr ? (tier.titleAr || tier.titleEn) : (tier.titleEn || tier.titleAr), locale);
            const descVal = formatLocalizedText(isAr ? (tier.descriptionAr || tier.descriptionEn) : (tier.descriptionEn || tier.descriptionAr), locale);
            const cat = tier.category;
            const isFeatured = cat === 'PREMIUM_ACTIVITY' || tier.type.toLowerCase().includes('vip') || idx === 1;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 6) * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`relative group bg-[var(--surface-default)] border backdrop-blur-3xl rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-500 hover:bg-[var(--surface-hover)] hover:-translate-y-1 shadow-lg ${
                  isFeatured 
                    ? 'border-emerald-500/50 shadow-2xl' 
                    : 'border-[var(--border-level-2)] hover:border-emerald-500/30'
                }`}
              >
                {/* Glow Effect for Featured */}
                {isFeatured && (
                  <div className="absolute top-0 start-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-emerald-500/10 blur-[40px] pointer-events-none rounded-full" />
                )}

                <div className="space-y-4 mb-6 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase shadow-sm ${
                      cat === 'PREMIUM_ACTIVITY' 
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30' 
                        : cat === 'HOURLY_ACTIVITY' 
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                        : cat === 'ADD_ON'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                    }`}>
                      <Ticket className="w-3 h-3 me-1.5" />
                      {getCategoryLabel(cat)}
                    </span>

                    {tier.discount ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                        {tier.discount}% OFF
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">{titleVal}</h3>
                  {descVal && (
                    <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-normal min-h-[3rem]">
                      {descVal}
                    </p>
                  )}
                </div>

                <div className="space-y-6 relative z-10 pt-4 border-t border-[var(--border-level-2)]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tighter text-[var(--text-primary)]">{tier.price}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-widest text-xs">{tier.currency || 'QAR'}</span>
                  </div>

                  <Link
                    href={safeBookingUrl}
                    className={`w-full flex justify-center items-center py-3.5 rounded-xl font-black uppercase tracking-[0.15em] text-xs transition-all duration-300 shadow-md ${
                      isFeatured 
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' 
                        : 'bg-[var(--surface-hover)] hover:bg-[var(--border-level-2)] text-[var(--text-primary)] border border-[var(--border-level-2)]'
                    }`}
                  >
                    <span>{isAr ? "حجز التذكرة" : "Book Pass"}</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3. Pricing & Venue Safety Note */}
        <div className="max-w-4xl mx-auto bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-2xl p-6 flex items-start gap-4 backdrop-blur-md shadow-md">
          <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-[var(--text-secondary)] font-normal leading-relaxed">
            <span className="font-bold text-[var(--text-primary)] block">{isAr ? "ملاحظة التشغيل والسلامة:" : "Operations & Safety Notice:"}</span>
            <p>{noteText}</p>
          </div>
        </div>

        {/* Partner Offers */}
        {offers && offers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="pt-10 max-w-3xl mx-auto"
          >
            <h3 className="text-xl font-bold text-center mb-8 flex items-center justify-center gap-3 text-[var(--text-secondary)] uppercase tracking-widest">
              <Tag className="w-5 h-5 text-emerald-500" />
              <span>{isAr ? "عروض الشركاء والخصومات" : "Special Perks & Promo Codes"}</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="relative group bg-[var(--surface-default)] border border-[var(--border-level-2)] border-dashed rounded-2xl p-6 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors duration-500 overflow-hidden shadow-md">
                  <div className="relative z-10">
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1 tracking-tighter">{offer.discount}% OFF</div>
                    <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
                      {offer.validUntil ? `Until ${new Date(offer.validUntil).toLocaleDateString()}` : 'Limited Time'}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleCopy(offer.code)}
                    className="relative z-10 flex items-center gap-3 bg-[var(--surface-hover)] border border-[var(--border-level-2)] px-5 py-3 rounded-xl hover:bg-[var(--border-level-2)] transition-colors duration-300 backdrop-blur-sm shadow-sm"
                  >
                    <span className="font-mono font-bold tracking-[0.2em] text-sm text-[var(--text-primary)]">{offer.code}</span>
                    {copiedCode === offer.code ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}
