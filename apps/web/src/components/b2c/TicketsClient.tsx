"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, ShieldCheck, Zap, Smartphone, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PricingTier {
  id: string;
  ticketType: string;
  titleEn: string;
  titleAr: string;
  price: number;
  currency: string;
  isAvailable: boolean;
}

interface AttractionTicketData {
  attractionId: string;
  attractionNameEn: string;
  attractionNameAr: string;
  attractionSlug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  heroMediaUrl?: string;
  bookingUrl: string;
  pricingTiers: PricingTier[];
}

export function TicketsClient({ ticketsData, initialSettings }: { ticketsData: AttractionTicketData[]; initialSettings?: any }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8">
      {/* 1. HERO SECTION */}
      <div className="text-center py-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-6"
        >
          <Ticket className="w-10 h-10" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-4">
          {initialSettings?.heroTitle || ""}
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          {initialSettings?.heroDescription || ""}
        </p>
      </div>

      {/* 2. ATTRACTIONS GRID */}
      {ticketsData.length === 0 ? (
        <div className="text-center py-20 bg-[var(--surface-sunken)] rounded-3xl border border-[var(--border-subtle)]">
          <p className="text-[var(--text-secondary)]">{initialSettings?.emptyStateText || ""}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ticketsData.map((attraction) => {
            const isExpanded = expandedId === attraction.attractionId;
            const minPrice = attraction.pricingTiers?.length > 0 
              ? Math.min(...attraction.pricingTiers.map(t => t.price)) 
              : 0;
            const currency = attraction.pricingTiers?.[0]?.currency || "QAR";

            return (
              <motion.div 
                key={attraction.attractionId}
                layout
                className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
              >
                {/* Card Header (Image + Title) */}
                <div 
                  className="cursor-pointer group"
                  onClick={() => toggleExpand(attraction.attractionId)}
                >
                  <div className="h-48 md:h-64 relative overflow-hidden bg-[var(--surface-sunken)]">
                    {attraction.heroMediaUrl ? (
                      <img 
                        src={attraction.heroMediaUrl} 
                        alt={attraction.attractionNameEn}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                        <Ticket className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    <div className="absolute bottom-4 start-4 end-4 text-white">
                      <h2 className="text-2xl font-black mb-1 drop-shadow-md">
                        {attraction.attractionNameEn}
                      </h2>
                      <div className="flex items-center justify-between">
                        <p className="text-white/80 text-sm line-clamp-1 max-w-[70%]">
                          {attraction.descriptionEn || "Experience the thrill."}
                        </p>
                        {minPrice > 0 && (
                          <span className="font-bold bg-[var(--color-primary)] text-white px-3 py-1 rounded-full text-sm">
                            From {currency} {minPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expand Toggle */}
                  <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-default)]">
                    <span className="font-medium text-[var(--text-primary)]">
                      View Ticket Options
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[var(--text-secondary)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />
                    )}
                  </div>
                </div>

                {/* Inline Ticket Tiers */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-[var(--surface-sunken)]"
                    >
                      <div className="p-6 space-y-4">
                        {attraction.pricingTiers?.length === 0 ? (
                          <p className="text-[var(--text-secondary)] text-sm text-center">No ticket options currently available.</p>
                        ) : (
                          attraction.pricingTiers.map(tier => (
                            <div key={tier.id} className="flex items-center justify-between p-4 bg-[var(--surface-default)] border border-[var(--border-subtle)] rounded-2xl">
                              <div>
                                <h3 className="font-bold text-[var(--text-primary)]">{tier.titleEn}</h3>
                                <p className="text-sm text-[var(--text-secondary)]">{tier.ticketType}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <span className="block font-black text-lg text-[var(--text-primary)]">
                                    {tier.currency} {tier.price}
                                  </span>
                                </div>
                                <Button 
                                  onClick={() => window.open(`${attraction.bookingUrl}?ticketType=${tier.ticketType}`, '_blank')}
                                  disabled={!tier.isAvailable}
                                >
                                  {tier.isAvailable ? "Buy" : "Sold Out"}
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 3. TRUST BADGES */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="mt-20 pt-10 border-t border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
      >
        <div className="flex flex-col items-center">
          <ShieldCheck className="w-8 h-8 text-[var(--color-primary)] mb-3" />
          <h4 className="font-bold text-[var(--text-primary)] mb-1">{initialSettings?.badge1Title || ""}</h4>
          <p className="text-sm text-[var(--text-secondary)]">{initialSettings?.badge1Desc || ""}</p>
        </div>
        <div className="flex flex-col items-center">
          <Zap className="w-8 h-8 text-[var(--color-primary)] mb-3" />
          <h4 className="font-bold text-[var(--text-primary)] mb-1">{initialSettings?.badge2Title || ""}</h4>
          <p className="text-sm text-[var(--text-secondary)]">{initialSettings?.badge2Desc || ""}</p>
        </div>
        <div className="flex flex-col items-center">
          <Smartphone className="w-8 h-8 text-[var(--color-primary)] mb-3" />
          <h4 className="font-bold text-[var(--text-primary)] mb-1">{initialSettings?.badge3Title || ""}</h4>
          <p className="text-sm text-[var(--text-secondary)]">{initialSettings?.badge3Desc || ""}</p>
        </div>
      </motion.div>
    </div>
  );
}
