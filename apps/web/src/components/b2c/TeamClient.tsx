"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function TeamClient({ locale, initialMembers }: { locale: string; initialMembers: any[] }) {
  const [activeMember, setActiveMember] = useState<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth mouse following
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-[#8A2BE2]/30 relative" ref={containerRef}>
      
      {/* Noise Texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

      {/* Floating Image Card */}
      <motion.div
        className="fixed top-0 left-0 w-[280px] md:w-[320px] aspect-[3/4] pointer-events-none z-50 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-900"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: activeMember ? 1 : 0,
          scale: activeMember ? 1 : 0.8,
        }}
        transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
      >
        <AnimatePresence mode="wait">
          {activeMember && (
            <motion.div
              key={activeMember.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {activeMember.profileImage ? (
                <img src={activeMember.profileImage} alt={activeMember.firstName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-5xl font-black text-zinc-700">
                  {activeMember.firstName[0]}{activeMember.lastName[0]}
                </div>
              )}
              {/* Bottom Gradient & Info overlay like the design */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4">
                  <h3 className="text-white font-bold text-lg leading-tight mb-1">{activeMember.firstName} {activeMember.lastName}</h3>
                  <p className="text-[#00E5FF] text-xs font-black uppercase tracking-widest">{activeMember.department}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <main className="pt-32 pb-32 max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* HERO */}
        <header className="mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 text-white"
          >
            The Visionaries.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl font-medium leading-relaxed"
          >
            A collective of industrial designers, master fabricators, and event strategists redefining what's possible in the MENA region.
          </motion.p>
        </header>

        {/* LIST */}
        <div className="border-t border-zinc-900">
          {initialMembers.map((member, i) => (
            <Link 
              key={member.slug}
              href={`/${locale}/b2c/team/${member.slug}`}
              className="group flex flex-col md:flex-row items-start md:items-center justify-between py-10 md:py-12 border-b border-zinc-900 hover:border-zinc-700 transition-colors relative z-20"
              onMouseEnter={() => setActiveMember(member)}
              onMouseLeave={() => setActiveMember(null)}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-12 w-full md:w-auto">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white group-hover:text-zinc-300 transition-colors">
                  {member.firstName} {member.lastName}
                </h2>
                <span className="text-[#8A2BE2] font-bold text-sm md:text-base uppercase tracking-widest mt-2 md:mt-0">
                  {member.designation}
                </span>
              </div>

              <div className="hidden md:flex items-center gap-4 text-zinc-500 group-hover:text-white transition-colors">
                <span className="text-sm font-bold tracking-widest uppercase">{member.department}</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </Link>
          ))}
          
          {initialMembers.length === 0 && (
            <div className="text-center py-32">
              <p className="text-zinc-500 text-xl font-medium">No visionaries found.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
