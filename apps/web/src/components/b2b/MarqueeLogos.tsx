"use client"

import { motion } from "framer-motion"

interface MarqueeLogosProps {
  locale: string
}

export function MarqueeLogos({ locale }: MarqueeLogosProps) {
  const isRTL = locale === 'ar'

  // Mock partners (e.g., Qatar Tourism, Lusail City, FIFA, etc.)
  const partners = [
    "Qatar Tourism", "Lusail City", "Msheireb", "Qatar Foundation", 
    "Supreme Committee", "Ooredoo", "Qatar Airways", "Katara"
  ]

  // Double the array for seamless infinite scroll
  const items = [...partners, ...partners]

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
            className="w-1/2 flex items-center justify-center shrink-0 basis-[auto] px-12"
          >
            <span className="text-xl md:text-2xl font-black text-[var(--text-tertiary)] uppercase tracking-widest whitespace-nowrap opacity-50 hover:opacity-100 transition-opacity cursor-default">
              {partner}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
