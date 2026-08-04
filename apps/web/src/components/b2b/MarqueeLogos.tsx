"use client"

import { motion } from "framer-motion"

interface PartnerItem {
  id?: string
  name: string
  logoUrl?: string | null
}

interface MarqueeLogosProps {
  locale: string
  partners?: PartnerItem[]
}

export function MarqueeLogos({ locale, partners }: MarqueeLogosProps) {
  const isRTL = locale === 'ar'

  const defaultPartners: PartnerItem[] = [
    { name: "Qatar Tourism" },
    { name: "Lusail City" },
    { name: "Msheireb" },
    { name: "Qatar Foundation" },
    { name: "Supreme Committee" },
    { name: "Ooredoo" },
    { name: "Qatar Airways" },
    { name: "Katara" }
  ]

  const list = partners && partners.length > 0 ? partners : defaultPartners
  const items = [...list, ...list]

  return (
    <div className="w-full overflow-hidden bg-[var(--surface-hover)] border-y border-[var(--border-default)] py-8 relative">
      
      {/* Gradient fade edges */}
      <div className="absolute top-0 start-0 bottom-0 w-32 bg-gradient-to-r from-[var(--surface-hover)] to-transparent z-10" />
      <div className="absolute top-0 end-0 bottom-0 w-32 bg-gradient-to-l from-[var(--surface-hover)] to-transparent z-10" />

      <motion.div
        animate={{
          x: isRTL ? ["0%", "50%"] : ["0%", "-50%"]
        }}
        transition={{
          duration: 30,
          ease: "linear",
          repeat: Infinity,
        }}
        className="flex w-[200%] items-center"
      >
        {items.map((partner, idx) => (
          <div 
            key={idx}
            className="w-1/2 flex items-center justify-center shrink-0 basis-[auto] px-8"
          >
            {partner.logoUrl ? (
              <img 
                src={partner.logoUrl} 
                alt={partner.name} 
                className="h-10 md:h-14 max-w-[160px] md:max-w-[200px] object-contain filter grayscale brightness-200 opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" 
              />
            ) : (
              <span className="text-xl md:text-2xl font-black text-[var(--text-tertiary)] uppercase tracking-widest whitespace-nowrap opacity-50 hover:opacity-100 transition-opacity cursor-default">
                {partner.name}
              </span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
