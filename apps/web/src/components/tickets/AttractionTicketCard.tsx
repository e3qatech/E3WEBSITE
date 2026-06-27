"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Ticket, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface PricingTier {
  id: string
  ticketType: {
    name: Record<string, string>
  }
  price: number
  isActive: boolean
}

interface AttractionData {
  id: string
  name: Record<string, string>
  tagline: Record<string, string>
  heroMedia?: {
    url: string
  }
  pricing: PricingTier[]
}

interface AttractionTicketCardProps {
  attraction: AttractionData
  locale: string
}

export function AttractionTicketCard({ attraction, locale }: AttractionTicketCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isRTL = locale === 'ar'
  
  const bookingBaseUrl = process.env.NEXT_PUBLIC_BOOKING_QUBE_URL || 'https://booking.e3.qa'
  const displayName = attraction.name[locale] || attraction.name.en
  const displayTagline = attraction.tagline?.[locale] || attraction.tagline?.en
  
  const activePricing = attraction.pricing.filter(p => p.isActive)
  const minPrice = activePricing.length > 0 
    ? Math.min(...activePricing.map(p => p.price))
    : 0

  return (
    <div className="bg-[var(--surface-default)] rounded-3xl overflow-hidden border border-[var(--border-default)] hover:border-[var(--color-primary)]/30 transition-all shadow-sm hover:shadow-xl">
      {/* Top Banner (Collapsible Trigger) */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex flex-col md:flex-row cursor-pointer"
      >
        {/* Image */}
        <div className="w-full md:w-48 h-48 md:h-auto shrink-0 relative bg-[var(--surface-hover)]">
          {attraction.heroMedia?.url ? (
            <img 
              src={attraction.heroMedia.url} 
              alt={displayName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-primary)]/10">
              <Ticket className="w-10 h-10 text-[var(--color-primary)]/40" />
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{displayName}</h3>
              <p className="text-[var(--text-secondary)] line-clamp-2">{displayTagline}</p>
            </div>
            <div className="text-end shrink-0">
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                {locale === 'ar' ? 'تبدأ من' : 'From'}
              </p>
              <p className="text-2xl font-black text-[var(--color-primary)]">
                QAR {minPrice}
              </p>
            </div>
          </div>
        </div>

        {/* Expand Icon */}
        <div className="flex items-center justify-center p-6 bg-[var(--surface-hover)] border-t md:border-t-0 md:border-s border-[var(--border-default)]">
          <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold">
            <span className="md:hidden">{locale === 'ar' ? 'عرض التذاكر' : 'View Tickets'}</span>
            <ChevronDown 
              className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Expanded Pricing Tiers */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[var(--border-default)] bg-[var(--surface-hover)]"
          >
            <div className="p-6 md:p-8">
              <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-6">
                {locale === 'ar' ? 'خيارات التذاكر المتاحة' : 'Available Ticket Options'}
              </h4>
              
              {activePricing.length === 0 ? (
                <p className="text-[var(--text-secondary)]">
                  {locale === 'ar' ? 'لا توجد تذاكر متاحة حالياً.' : 'No tickets currently available.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activePricing.map(tier => {
                    const ticketName = tier.ticketType.name[locale] || tier.ticketType.name.en
                    return (
                      <div key={tier.id} className="bg-[var(--surface-default)] p-6 rounded-2xl border border-[var(--border-default)] flex flex-col">
                        <div className="flex-1 mb-6">
                          <h5 className="text-xl font-bold text-[var(--text-primary)] mb-2">{ticketName}</h5>
                          <p className="text-2xl font-black text-[var(--text-primary)]">QAR {tier.price}</p>
                        </div>
                        
                        <Button asChild fullWidth variant="primary">
                          <a 
                            href={`${bookingBaseUrl}/book?attraction=${attraction.id}&ticket=${encodeURIComponent(tier.ticketType.name.en)}&qty=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>{locale === 'ar' ? 'شراء' : 'Buy'}</span>
                            <ExternalLink className="w-4 h-4 ms-2" />
                          </a>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
