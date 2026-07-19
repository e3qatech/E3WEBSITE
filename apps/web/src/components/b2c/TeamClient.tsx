"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { 
  useB2CTheme, 
  B2CBadge 
} from "@/components/ui/B2CThemeComponents";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { B2CGrid } from "@/components/ui/B2CGrid";

// Removed TiltCard in favor of unified InteractiveCard

export function TeamClient({ locale, initialMembers, initialSettings }: { locale: string; initialMembers: any[]; initialSettings?: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAr } = useB2CTheme();

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .font-righteous { font-family: var(--font-display), 'Righteous', sans-serif; }
        .font-poppins { font-family: var(--font-sans), 'Poppins', sans-serif; }
      `}} />
      <div className="w-full relative text-[var(--text-primary)] font-poppins selection:bg-[rgba(26,31,214,0.3)]" ref={containerRef} dir={isAr ? 'rtl' : 'ltr'}>
        
        {/* Noise Texture */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

        <main className="pt-24 pb-32 max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          {/* HERO */}
          <header className="mb-24 text-center">
            <AnimatedText 
              as="h1" 
              text={initialSettings?.heroTitle || "The Minds Behind E3"}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] via-[var(--e3-royal-blue)] to-[var(--e3-magenta)] font-display uppercase justify-center"
            />
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto font-medium leading-relaxed"
            >
              {initialSettings?.heroDescription || ""}
            </motion.p>
          </header>

          <B2CGrid columns={3} gap="md">
            {initialMembers.map((member, i) => (
              <InteractiveCard key={member.slug} glowColor="rgba(26, 31, 214, 0.4)" tiltStrength={8}>
                <Link href={`/${locale}/b2c/team/${member.slug}`} className="block h-full relative z-10">
                  <div className="p-4 flex flex-col relative overflow-hidden h-full">
                    
                    {/* Glassmorphism Frame Detail */}
                    <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} p-2 opacity-50 group-hover:opacity-100 transition-opacity`}>
                      <ArrowUpRight className="w-5 h-5 text-[var(--e3-magenta)]" />
                    </div>
                    
                    {/* Image Area */}
                    <div className="w-full aspect-square rounded-2xl overflow-hidden relative mb-6 border border-[var(--border-level-2)] bg-zinc-950">
                      {member.profileImage ? (
                        <img 
                          src={member.profileImage} 
                          alt={member.firstName} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl font-black text-zinc-800 uppercase">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[rgba(26,31,214,0.06)] mix-blend-overlay pointer-events-none" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 flex flex-col text-start px-2">
                      <div className="text-[var(--e3-magenta)] font-black text-[10px] uppercase tracking-widest mb-2 font-display">
                        {member.department}
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)] mb-1 font-display uppercase group-hover:text-[var(--e3-royal-blue)] transition-colors">
                        {member.firstName} {member.lastName}
                      </h2>
                      <p className="text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider">
                        {member.designation}
                      </p>
                    </div>
                  </div>
                </Link>
              </InteractiveCard>
            ))}
            
            {initialMembers.length === 0 && (
              <div className="col-span-full text-center py-32">
                <p className="text-[var(--text-tertiary)] text-xl font-black uppercase tracking-wide">
                  {initialSettings?.emptyStateText || "No members found"}
                </p>
              </div>
            )}
          </B2CGrid>

        </main>
      </div>
    </>
  );
}
