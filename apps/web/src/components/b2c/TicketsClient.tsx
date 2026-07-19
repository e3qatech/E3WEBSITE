"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, ShieldCheck, Zap, Smartphone, ChevronDown, ChevronUp } from "lucide-react";
import { 
  useB2CTheme, 
  B2CCard, 
  B2CButton, 
  B2CBadge 
} from "@/components/ui/B2CThemeComponents";

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
  const { isAr } = useB2CTheme();

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .font-righteous { font-family: var(--font-display), 'Righteous', sans-serif; }
        .font-poppins { font-family: var(--font-sans), 'Poppins', sans-serif; }
      `}} />
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 text-[var(--text-primary)] font-poppins text-start" dir={isAr ? 'rtl' : 'ltr'}>
        
        {/* 1. HERO SECTION */}
        <div className="text-center py-16 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] mb-6 border border-[var(--e3-royal-blue)]/20 shadow-[0_4px_15px_rgba(26,31,214,0.06)]"
          >
            <Ticket className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 font-display uppercase tracking-wide">
            {initialSettings?.heroTitle || "Experiences Tickets"}
          </h1>
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto font-medium leading-relaxed">
            {initialSettings?.heroDescription || "Reserve your slot for Doha's most anticipated futuristic entertainment concepts."}
          </p>
        </div>

        {/* 2. ATTRACTIONS GRID */}
        {ticketsData.length === 0 ? (
          <div className="text-center py-20 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)]">
            <p className="text-[var(--text-secondary)] font-medium">{initialSettings?.emptyStateText || "No ticketing offers currently available."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {ticketsData.map((attraction) => {
              const isExpanded = expandedId === attraction.attractionId;
              const minPrice = attraction.pricingTiers?.length > 0 
                ? Math.min(...attraction.pricingTiers.map(t => t.price)) 
                : 0;
              const currency = attraction.pricingTiers?.[0]?.currency || "QAR";

              return (
                <B2CCard 
                  key={attraction.attractionId}
                  className="overflow-hidden border-[rgba(75,0,143,0.3)] shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex flex-col h-full"
                >
                  {/* Card Header (Image + Title) */}
                  <div 
                    className="cursor-pointer group relative"
                    onClick={() => toggleExpand(attraction.attractionId)}
                  >
                    <div className="h-56 md:h-64 relative overflow-hidden bg-zinc-950">
                      {attraction.heroMediaUrl ? (
                        <img 
                          src={attraction.heroMediaUrl} 
                          alt={isAr ? attraction.attractionNameAr : attraction.attractionNameEn}
                          className="w-full h-full object-cover transition-transform duration-75 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--e3-deep-blue)] to-[var(--e3-purple)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,10,42,0.95)] via-[rgba(8,10,42,0.3)] to-transparent" />
                      
                      <div className="absolute bottom-4 start-4 end-4 text-white text-start">
                        <h2 className="text-2xl font-black mb-2 font-display uppercase tracking-wide">
                          {isAr ? attraction.attractionNameAr : attraction.attractionNameEn}
                        </h2>
                        <div className="flex items-center justify-between">
                          <p className="text-zinc-300 text-xs font-medium line-clamp-1 max-w-[70%] leading-relaxed">
                            {isAr ? attraction.descriptionAr || "عش التجربة الخيالية." : attraction.descriptionEn || "Experience the thrill."}
                          </p>
                          {minPrice > 0 && (
                            <span className="font-mono text-xs font-bold text-white bg-[var(--e3-magenta)] px-3 py-1.5 rounded-lg backdrop-blur-sm border border-[var(--e3-magenta)]/30 uppercase tracking-wider">
                              From {currency} {minPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Expand Toggle */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-level-2)] bg-[var(--surface-default)]">
                      <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                        {isAr ? "خيارات التذاكر المتاحة" : "View Ticket Options"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[var(--e3-royal-blue)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
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
                        className="overflow-hidden bg-[var(--bg-level-1)]"
                      >
                        <div className="p-6 space-y-4">
                          {attraction.pricingTiers?.length === 0 ? (
                            <p className="text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-wider text-center py-4">No ticket options currently available.</p>
                          ) : (
                            attraction.pricingTiers.map(tier => (
                              <div key={tier.id} className="flex items-center justify-between p-4 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl gap-4">
                                <div className="text-start">
                                  <h3 className="font-bold text-[var(--text-primary)] text-sm md:text-base uppercase font-display">{isAr ? tier.titleAr : tier.titleEn}</h3>
                                  <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1">{tier.ticketType}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-end">
                                    <span className="block font-mono text-sm font-black text-[var(--text-primary)]">
                                      {tier.currency} {tier.price}
                                    </span>
                                  </div>
                                  <B2CButton 
                                    onClick={() => window.open(`${attraction.bookingUrl}?ticketType=${tier.ticketType}`, '_blank')}
                                    disabled={!tier.isAvailable}
                                    variant="primary"
                                    size="sm"
                                    className="uppercase font-black py-2.5 px-4"
                                  >
                                    {tier.isAvailable ? "Buy" : "Sold Out"}
                                  </B2CButton>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </B2CCard>
              );
            })}
          </div>
        )}

        {/* 3. TRUST BADGES */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 pt-12 border-t border-[var(--border-level-2)] grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[rgba(26,31,214,0.08)] border border-[var(--e3-royal-blue)]/20 rounded-2xl flex items-center justify-center text-[var(--e3-royal-blue)] mb-4">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-bold text-[var(--text-primary)] mb-2 font-display uppercase text-sm tracking-wide">{initialSettings?.badge1Title || "Secure Checkout"}</h4>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed max-w-xs">{initialSettings?.badge1Desc || "SSL protected bank processing."}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[rgba(176,19,184,0.08)] border border-[var(--e3-magenta)]/20 rounded-2xl flex items-center justify-center text-[var(--e3-magenta)] mb-4">
              <Zap size={24} />
            </div>
            <h4 className="font-bold text-[var(--text-primary)] mb-2 font-display uppercase text-sm tracking-wide">{initialSettings?.badge2Title || "Instant Ingress"}</h4>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed max-w-xs">{initialSettings?.badge2Desc || "Receive barcoded tickets instantly."}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[rgba(75,0,143,0.08)] border border-[var(--e3-purple)]/20 rounded-2xl flex items-center justify-center text-[var(--e3-purple)] mb-4">
              <Smartphone size={24} />
            </div>
            <h4 className="font-bold text-[var(--text-primary)] mb-2 font-display uppercase text-sm tracking-wide">{initialSettings?.badge3Title || "Mobile Passes"}</h4>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed max-w-xs">{initialSettings?.badge3Desc || "Tap-and-enter directly from phone."}</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
