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
    <section className="py-24 bg-zinc-950 text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">Tickets & Passes</h2>
          <p className="mt-4 text-zinc-400">Choose the perfect access for your experience</p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricing.map((tier, idx) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col hover:border-zinc-700 transition-colors"
            >
              <div className="mb-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-xs font-bold tracking-wider uppercase mb-4">
                  <Ticket className="w-3 h-3 mr-2" />
                  {tier.type}
                </span>
                <h3 className="text-2xl font-bold mb-2">{tier.titleEn}</h3>
                {tier.descriptionEn && (
                  <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                    {tier.descriptionEn}
                  </p>
                )}
              </div>

              <div className="mb-8 relative">
                {offers && offers.length > 0 ? (() => {
                  const maxDiscount = Math.max(...offers.map(o => o.discount));
                  const discountedPrice = tier.price * (1 - maxDiscount / 100);
                  return (
                    <div className="flex flex-col gap-1">
                      <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
                        <span className="bg-emerald-500 text-black text-xs font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-lg transform rotate-3">
                          {maxDiscount}% OFF
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-emerald-400">{discountedPrice.toFixed(0)}</span>
                        <span className="text-zinc-500 font-bold">{tier.currency}</span>
                      </div>
                      <div className="flex items-baseline gap-2 opacity-50 line-through">
                        <span className="text-xl font-bold">{tier.price}</span>
                        <span className="text-sm font-bold">{tier.currency}</span>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black">{tier.price}</span>
                    <span className="text-zinc-500 font-bold">{tier.currency}</span>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-8 border-t border-zinc-800">
                <Link
                  href={bookingUrl || '#'}
                  className="w-full flex justify-center items-center py-4 rounded-xl bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partner Offers */}
        {offers && offers.length > 0 && (
          <div className="mt-24 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-center mb-8 flex items-center justify-center gap-2">
              <Tag className="w-5 h-5 text-zinc-400" />
              Special Offers & Discounts
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-black text-emerald-400">{offer.discount}% OFF</div>
                    <div className="text-sm text-zinc-500 mt-1">
                      {offer.validUntil ? `Valid until ${new Date(offer.validUntil).toLocaleDateString()}` : 'Limited time offer'}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleCopy(offer.code)}
                    className="flex items-center gap-2 bg-black border border-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <span className="font-mono font-bold tracking-widest">{offer.code}</span>
                    {copiedCode === offer.code ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
