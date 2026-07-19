"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, Download, Code, Terminal, Activity, ArrowUpRight } from "lucide-react";
import React, { useRef, useEffect } from "react";
import { 
  useB2CTheme, 
  B2CCard, 
  B2CBadge 
} from "@/components/ui/B2CThemeComponents";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { B2CGrid } from "@/components/ui/B2CGrid";

// Custom magnetic/tilt cards removed in favor of unified UI components

export function TeamMemberClient({ locale, member, initialSettings }: { locale: string; member: any; initialSettings?: any }) {
  const { isAr } = useB2CTheme();
  
  const expertise = member.expertiseTags as string[] || [];
  const experience = member.experience as any[] || [];
  const projects = member.projects as any[] || [];
  
  // Interactive Background tracking
  const bgX = useMotionValue(0);
  const bgY = useMotionValue(0);
  const bgXSpring = useSpring(bgX, { stiffness: 50, damping: 30 });
  const bgYSpring = useSpring(bgY, { stiffness: 50, damping: 30 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const xPct = (e.clientX / window.innerWidth) - 0.5;
      const yPct = (e.clientY / window.innerHeight) - 0.5;
      bgX.set(xPct * -50); 
      bgY.set(yPct * -50);
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [bgX, bgY]);

  // Stagger variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .font-righteous { font-family: var(--font-display), 'Righteous', sans-serif; }
        .font-poppins { font-family: var(--font-sans), 'Poppins', sans-serif; }
      `}} />
      <div className="w-full relative text-[var(--text-primary)] font-poppins selection:bg-[rgba(26,31,214,0.3)] overflow-x-hidden" dir={isAr ? 'rtl' : 'ltr'}>
        
        {/* Noise Texture */}
        <div className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.03]">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

        <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-12 pb-32 relative z-10">
          
          {/* Top Bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12 flex justify-between items-center">
            <Link href={`/${locale}/b2c/team`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--e3-royal-blue)] transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:translate-x-1" /> 
              {initialSettings?.backButtonText || "Back to Team"}
            </Link>
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-[var(--e3-royal-blue)] uppercase">
              <Activity className="w-4 h-4 text-[var(--e3-magenta)] animate-pulse" /> {initialSettings?.systemStatus || "Online"}
            </div>
          </motion.div>

          {/* Hero Section */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-24 mb-24">
            
            {/* Left Info */}
            <div className="flex flex-col justify-center text-start">
              <motion.div variants={itemVariants} className="mb-6 flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-[rgba(176,19,184,0.1)] border border-[var(--e3-magenta)]/30 text-[var(--e3-magenta)] text-[10px] font-black tracking-widest uppercase">
                  {member.department}
                </span>
                <span className="text-[var(--text-tertiary)] font-mono text-xs">ID: {member.id?.substring(0, 8) || '0x992A'}</span>
              </motion.div>
              
              <AnimatedText 
                as="h1" 
                text={`${member.firstName} ${member.lastName}`}
                className="text-5xl md:text-7xl lg:text-8xl leading-[0.95] font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] via-[var(--e3-royal-blue)] to-[var(--e3-magenta)] mb-4 font-display uppercase"
              />
              
              <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-bold text-[var(--text-secondary)] mb-8 flex items-center gap-3 uppercase font-display">
                <Terminal className="w-5 h-5 text-[var(--e3-royal-blue)]" />
                {member.designation}
              </motion.h2>
              
              <motion.p variants={itemVariants} className="text-lg text-[var(--text-secondary)] font-medium leading-relaxed max-w-xl mb-12 border-s-2 border-[var(--e3-royal-blue)] ps-6">
                {member.tagline || member.aboutSummary}
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <MagneticButton 
                  href={`mailto:${member.contactEmail}?subject=Contact Request`}
                  variant="primary"
                  size="md"
                  className="flex items-center justify-center gap-2 font-black uppercase"
                >
                  <Calendar className="w-5 h-5" /> {initialSettings?.initiateMeetingText || "Contact Member"}
                </MagneticButton>
                
                <MagneticButton 
                  onClick={() => alert(initialSettings?.pressKitAlertText || "Downloading member kit...")}
                  variant="outline"
                  size="md"
                  className="flex items-center justify-center gap-2 font-black uppercase"
                >
                  <Download className="w-4 h-4" /> {initialSettings?.pressKitText || "Press Kit"}
                </MagneticButton>
              </motion.div>
            </div>

            {/* Right Image Container */}
            <motion.div variants={itemVariants} className="relative z-10">
              <InteractiveCard className="w-full aspect-[3/4] group border-[rgba(75,0,143,0.3)]" glowColor="rgba(26, 31, 214, 0.4)">
                <div className="w-full h-full p-2 relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
                  <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-10 flex gap-2`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--e3-magenta)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--e3-royal-blue)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--text-primary)]" />
                  </div>
                  <div className="w-full h-full rounded-2xl overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700 bg-zinc-950">
                    {member.profileImage ? (
                      <img src={member.profileImage} alt={member.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800 font-display text-9xl uppercase">
                        {member.firstName.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[rgba(26,31,214,0.06)] mix-blend-overlay pointer-events-none" />
                  </div>
                </div>
              </InteractiveCard>
            </motion.div>

          </motion.div>

          {/* Data Dense Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24 text-start">
            <B2CCard className="lg:col-span-2 p-8 border-[rgba(75,0,143,0.3)]">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-level-2)] text-[var(--e3-magenta)]">
                 <Code className="w-5 h-5" />
                 <h3 className="font-bold text-sm tracking-widest uppercase font-display">System Bio</h3>
               </div>
               <p className="text-[var(--text-secondary)] leading-relaxed font-medium">{member.aboutSummary}</p>
            </B2CCard>

            <B2CCard className="p-8 border-[rgba(75,0,143,0.3)]">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-level-2)] text-[var(--e3-royal-blue)]">
                 <Activity className="w-5 h-5" />
                 <h3 className="font-bold text-sm tracking-widest uppercase font-display">Core Skills</h3>
               </div>
               <div className="flex flex-wrap gap-2">
                 {expertise.map((tag: string) => (
                   <span key={tag} className="px-3 py-1.5 bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-lg text-xs font-bold text-[var(--text-primary)]">
                     {tag}
                   </span>
                 ))}
               </div>
            </B2CCard>
          </div>

          {/* Bento Box Projects */}
          {projects.length > 0 && (
            <div className="mb-24 text-start">
              <h3 className="font-bold text-sm tracking-widest uppercase text-[var(--text-tertiary)] mb-8 border-b border-[var(--border-level-2)] pb-4 font-display">Key Projects</h3>
              <B2CGrid columns={3} gap="md">
                {projects.map((project: any, idx: number) => (
                  <InteractiveCard key={idx} className="group h-full border-[rgba(75,0,143,0.3)]">
                    <div className="h-full p-6 flex flex-col relative overflow-hidden">
                      <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} p-2 opacity-20 group-hover:opacity-100 transition-opacity`}>
                        <ArrowUpRight className="w-5 h-5 text-[var(--e3-magenta)]" />
                      </div>
                      <div className="text-[var(--text-tertiary)] font-bold text-xs mb-4 uppercase tracking-wider">{project.year} // {project.client}</div>
                      <h4 className="text-xl font-black text-[var(--text-primary)] mb-4 group-hover:text-[var(--e3-royal-blue)] transition-colors font-display uppercase">{project.name}</h4>
                      <p className="text-[var(--text-secondary)] text-sm font-medium flex-1 mb-6">{project.description}</p>
                      <div className="mt-auto">
                        <span className="text-xs font-black text-[var(--e3-magenta)] bg-[rgba(176,19,184,0.1)] px-3 py-1.5 rounded-lg border border-[var(--e3-magenta)]/20 uppercase tracking-wider">
                          ROLE: {project.role}
                        </span>
                      </div>
                    </div>
                  </InteractiveCard>
                ))}
              </B2CGrid>
            </div>
          )}

          {/* Timeline */}
          {experience.length > 0 && (
            <div className="mb-24 text-start">
              <h3 className="font-bold text-sm tracking-widest uppercase text-[var(--text-tertiary)] mb-12 border-b border-[var(--border-level-2)] pb-4 font-display">History Log</h3>
              <div className="space-y-12 ps-4 border-s border-[var(--border-level-2)]">
                {experience.map((exp: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    whileInView={{ opacity: 1, x: 0 }} 
                    viewport={{ once: true }}
                    key={idx} 
                    className="relative ps-8"
                  >
                    <div className="absolute -start-[5.5px] top-2 w-2.5 h-2.5 rounded-full bg-[var(--e3-magenta)] shadow-[0_0_10px_rgba(176,19,184,0.6)] animate-pulse" />
                    <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
                      <h4 className="text-xl font-black text-[var(--text-primary)] font-display uppercase">{exp.role}</h4>
                      <span className="text-[var(--e3-royal-blue)] font-bold text-sm">@ {exp.company}</span>
                    </div>
                    <div className="text-[var(--text-tertiary)] font-bold text-xs mb-4">[{exp.duration}]</div>
                    <p className="text-[var(--text-secondary)] font-medium max-w-3xl whitespace-pre-wrap leading-relaxed text-sm md:text-base">{exp.responsibilities}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
