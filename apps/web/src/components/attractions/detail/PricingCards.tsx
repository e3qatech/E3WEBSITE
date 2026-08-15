'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Tag, Copy, Check, Info, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { localizeHref, isExternalUrl, normalizeExternalUrl } from '@/lib/url-helper';

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

export function PricingCards({ pricing, offers, bookingUrl, pricingNoteEn, pricingNoteAr, locale = 'en' }: PricingCardsProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const isAr = locale === 'ar';

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!pricing || pricing.length === 0) return null;

  const generalPasses = pricing.filter(p => (p.type || '').toUpperCase() === 'GENERAL' || !p.type);
  const addOnPasses = pricing.filter(p => (p.type || '').toUpperCase() === 'ADD_ON');
  const passesToRender = generalPasses.length > 0 ? generalPasses : pricing;

  const safeBookingUrl = bookingUrl
    ? (isExternalUrl(bookingUrl) ? normalizeExternalUrl(bookingUrl) : localizeHref(bookingUrl, locale))
    : '#';

  const noteText = isAr
    ? (pricingNoteAr || "يخضع استخدام الباقات لتوفر الأنشطة ومتطلبات التشغيل وشروط العمر وتعليمات السلامة في الموقع. يجب شراء الأنشطة المميزة غير المشمولة في باقات الدخول بشكل منفصل.")
    : (pricingNoteEn || "Package access is subject to attraction availability, operating requirements, age restrictions and venue safety rules. Premium activities excluded from the entry passes must be purchased separately.");

  return (
    <section className="py-32 bg-zinc-950 text-white relative overflow-hidden border-t border-white/5" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-20">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest">
            <Ticket className="w-3.5 h-3.5" />
            <span>{isAr ? "الباقات والأسعار" : "PRICING & TICKETS"}</span>
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white">
            {isAr ? "باقات الدخول والأنشطة" : "Access Passes & Tickets"}
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 font-light">
            {isAr ? "اختر الباقة المناسبة لتجربتك في أوربان أرينا" : "Select your pass or add-on activity"}
          </p>
        </motion.div>

        {/* 1. General Access Passes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {passesToRender.map((tier, idx) => {
            const isFeatured = idx === 1 || tier.type.toLowerCase().includes('vip');
            const titleVal = isAr ? (tier.titleAr || tier.titleEn) : (tier.titleEn || tier.titleAr);
            const descVal = isAr ? (tier.descriptionAr || tier.descriptionEn) : (tier.descriptionEn || tier.descriptionAr);
            
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`relative group bg-white/[0.02] border backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-700 hover:bg-white/[0.05] hover:-translate-y-2 ${
                  isFeatured 
                    ? 'border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:border-emerald-500 hover:shadow-[0_0_60px_rgba(16,185,129,0.25)] md:-translate-y-4' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Glow Effect for Featured */}
                {isFeatured && (
                  <div className="absolute top-0 start-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-emerald-500/10 blur-[50px] pointer-events-none rounded-full" />
                )}

                <div className="mb-8 relative z-10">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-6 ${isFeatured ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/70 border border-white/10'}`}>
                    <Ticket className="w-3.5 h-3.5 me-2" />
                    {isAr ? "باقة دخول" : "ACCESS PASS"}
                  </span>
                  <h3 className="text-3xl font-black mb-4 tracking-tight text-white">{titleVal}</h3>
                  {descVal && (
                    <p className="text-zinc-400 text-sm leading-relaxed font-light min-h-[4rem]">
                      {descVal}
                    </p>
                  )}
                </div>

                <div className="mb-10 relative z-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter text-white">{tier.price}</span>
                    <span className="text-emerald-400 font-extrabold uppercase tracking-widest text-sm">{tier.currency || 'QAR'}</span>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10 relative z-10">
                  <Link
                    href={safeBookingUrl}
                    className={`relative group/btn w-full flex justify-center items-center py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 shadow-lg ${
                      isFeatured ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400' : 'bg-white text-zinc-950 hover:bg-zinc-200'
                    }`}
                  >
                    <span className="relative z-10">{isAr ? "احجز الباقة" : "Secure Pass"}</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 2. Premium Activity Add-Ons */}
        {addOnPasses.length > 0 && (
          <div className="space-y-8 max-w-6xl mx-auto pt-10 border-t border-white/10">
            <div className="text-start">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? "الأنشطة المميزة والإضافية" : "PREMIUM ACTIVITIES"}</span>
              </span>
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white">
                {isAr ? "أنشطة إضافية وتجارب حصرية" : "Premium Activity Add-Ons"}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addOnPasses.map((addon) => {
                const addTitle = isAr ? (addon.titleAr || addon.titleEn) : (addon.titleEn || addon.titleAr);
                const addDesc = isAr ? (addon.descriptionAr || addon.descriptionEn) : (addon.descriptionEn || addon.descriptionAr);

                return (
                  <div
                    key={addon.id}
                    className="bg-white/[0.02] border border-white/10 hover:border-purple-500/40 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between transition-all duration-500 hover:bg-white/[0.04]"
                  >
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {isAr ? "نشاط إضافي" : "ADD-ON ACTIVITY"}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-white">{addon.price}</span>
                          <span className="text-xs font-bold text-purple-400">{addon.currency || 'QAR'}</span>
                        </div>
                      </div>

                      <h4 className="text-xl font-bold text-white">{addTitle}</h4>
                      {addDesc && (
                        <p className="text-xs text-zinc-400 font-light leading-relaxed">
                          {addDesc}
                        </p>
                      )}
                    </div>

                    <Link
                      href={safeBookingUrl}
                      className="w-full text-center py-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      {isAr ? "إضافة التجربة" : "Book Activity"}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 3. Pricing & Venue Safety Note */}
        <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex items-start gap-4 backdrop-blur-md">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-zinc-400 font-light leading-relaxed">
            <span className="font-bold text-white block">{isAr ? "ملاحظة التشغيل والسلامة:" : "Operations & Safety Notice:"}</span>
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
            <h3 className="text-xl font-bold text-center mb-8 flex items-center justify-center gap-3 text-zinc-300 uppercase tracking-widest">
              <Tag className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? "عروض الشركاء والخصومات" : "Special Perks & Promo Codes"}</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="relative group bg-white/[0.01] border border-white/10 border-dashed rounded-2xl p-6 flex items-center justify-between hover:bg-white/[0.03] transition-colors duration-500 overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-3xl font-black text-emerald-400 mb-1 tracking-tighter">{offer.discount}% OFF</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">
                      {offer.validUntil ? `Until ${new Date(offer.validUntil).toLocaleDateString()}` : 'Limited Time'}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleCopy(offer.code)}
                    className="relative z-10 flex items-center gap-3 bg-zinc-950/50 border border-white/10 px-5 py-3 rounded-xl hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm"
                  >
                    <span className="font-mono font-bold tracking-[0.2em] text-sm">{offer.code}</span>
                    {copiedCode === offer.code ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
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
