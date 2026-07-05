'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Tag, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface PricingTier {
  id: string;
  titleEn: string;
  price: number;
  currency: string;
  type: string;
  descriptionEn?: string | null;
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
}

export function PricingCards({ pricing, offers, bookingUrl }: PricingCardsProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!pricing || pricing.length === 0) return null;

  return (
    <section className="py-32 bg-zinc-950 text-white relative overflow-hidden border-t border-white/5">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">Access Passes</h2>
          <p className="text-xl text-zinc-400 font-light">Select your tier of experience</p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricing.map((tier, idx) => {
            const isFeatured = idx === 1 || tier.type.toLowerCase().includes('vip');
            
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`relative group bg-white/[0.02] border backdrop-blur-3xl rounded-[2.5rem] p-10 flex flex-col transition-all duration-700 hover:bg-white/[0.04] hover:-translate-y-2 ${
                  isFeatured 
                    ? 'border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:border-emerald-500/50 hover:shadow-[0_0_60px_rgba(16,185,129,0.2)] md:-translate-y-4' 
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                {/* Glow Effect for Featured */}
                {isFeatured && (
                  <div className="absolute top-0 start-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-emerald-500/10 blur-[50px] pointer-events-none rounded-full" />
                )}

                <div className="mb-10 relative z-10">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-6 ${isFeatured ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-white/70 border border-white/10'}`}>
                    <Ticket className="w-3.5 h-3.5 me-2" />
                    {tier.type}
                  </span>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">{tier.titleEn}</h3>
                  {tier.descriptionEn && (
                    <p className="text-zinc-400 text-sm leading-relaxed min-h-[3rem]">
                      {tier.descriptionEn}
                    </p>
                  )}
                </div>

                <div className="mb-12 relative z-10">
                  {(() => {
                    const maxOfferDiscount = offers && offers.length > 0 ? Math.max(...offers.map(o => o.discount)) : 0;
                    const activeDiscount = (tier.discount && tier.discount > 0) ? tier.discount : maxOfferDiscount;
                    
                    if (activeDiscount > 0) {
                      const discountedPrice = tier.price * (1 - activeDiscount / 100);
                      return (
                        <div className="flex flex-col gap-2">
                          <div className="absolute -top-4 -end-4">
                            <span className="bg-emerald-500 text-zinc-950 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)] transform rotate-[8deg]">
                              {activeDiscount}% OFF
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-emerald-400 tracking-tighter">{discountedPrice.toFixed(0)}</span>
                            <span className="text-zinc-500 font-bold uppercase tracking-widest">{tier.currency}</span>
                          </div>
                          <div className="flex items-baseline gap-2 opacity-40 line-through">
                            <span className="text-2xl font-bold">{tier.price}</span>
                            <span className="text-sm font-bold uppercase">{tier.currency}</span>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black tracking-tighter">{tier.price}</span>
                        <span className="text-zinc-500 font-bold uppercase tracking-widest">{tier.currency}</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-auto pt-8 border-t border-white/5 relative z-10">
                  <Link
                    href={bookingUrl || '#'}
                    className={`relative group/btn w-full flex justify-center items-center py-5 rounded-2xl font-black uppercase tracking-[0.2em] overflow-hidden transition-all duration-300 ${
                      isFeatured ? 'bg-emerald-500 text-zinc-950' : 'bg-white text-zinc-950'
                    }`}
                  >
                    <span className="relative z-10">Secure Pass</span>
                    <div className="absolute inset-0 bg-white/30 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Partner Offers */}
        {offers && offers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-32 max-w-3xl mx-auto"
          >
            <h3 className="text-xl font-bold text-center mb-10 flex items-center justify-center gap-3 text-zinc-300 uppercase tracking-widest">
              <Tag className="w-5 h-5 text-emerald-400" />
              Special Perks
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
                  
                  {/* Subtle hover sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}
