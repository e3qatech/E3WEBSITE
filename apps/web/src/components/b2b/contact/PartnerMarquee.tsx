"use client"

import { motion } from "framer-motion"

interface PartnerMarqueeProps {
  logos: string[]
}

export function PartnerMarquee({ logos }: PartnerMarqueeProps) {
  // Duplicate array to ensure seamless infinite scrolling
  const duplicatedLogos = [...logos, ...logos, ...logos]

  return (
    <div className="relative w-full overflow-hidden bg-[var(--surface-hover)] border-y border-[var(--border-default)] py-12">
      {/* Fade Edges */}
      <div className="absolute inset-y-0 start-0 w-32 bg-gradient-to-r from-[var(--surface-hover)] to-transparent z-10" />
      <div className="absolute inset-y-0 end-0 w-32 bg-gradient-to-l from-[var(--surface-hover)] to-transparent z-10" />
      
      <div className="flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          className="flex items-center gap-16 md:gap-24 whitespace-nowrap min-w-full"
        >
          {duplicatedLogos.map((logo, index) => (
            <img 
              key={index} 
              src={logo} 
              alt={`Partner Logo ${index}`} 
              className="h-12 md:h-16 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
