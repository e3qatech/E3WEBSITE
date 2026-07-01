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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Righteous&family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-righteous { font-family: 'Righteous', cursive; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}} />
      <div className="min-h-screen bg-[#0F0F23] text-zinc-100 font-poppins selection:bg-[#F43F5E]/30 relative overflow-hidden" ref={containerRef}>
        
        {/* Interactive Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-64 -left-64 w-[800px] h-[800px] bg-[#7C3AED] rounded-full mix-blend-screen filter blur-[128px] opacity-20"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 -right-64 w-[600px] h-[600px] bg-[#F43F5E] rounded-full mix-blend-screen filter blur-[128px] opacity-20"
          />
        </div>

        {/* Noise Texture */}
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

        {/* Floating Image Card */}
        <motion.div
          className="fixed top-0 left-0 w-[280px] md:w-[320px] aspect-[3/4] pointer-events-none z-50 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(244,63,94,0.3)] border border-[#F43F5E]/30 bg-zinc-900"
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
                  <div className="w-full h-full bg-[#1A1A2E] flex items-center justify-center text-5xl font-black text-zinc-600">
                    {activeMember.firstName[0]}{activeMember.lastName[0]}
                  </div>
                )}
                {/* Bottom Gradient & Info overlay like the design */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0F0F23]/90 via-[#0F0F23]/50 to-transparent flex flex-col justify-end p-6">
                  <div className="bg-[#0F0F23]/60 backdrop-blur-md border border-[#7C3AED]/30 rounded-xl p-4 shadow-[0_4px_20px_rgba(124,58,237,0.2)]">
                    <h3 className="text-white font-bold text-lg leading-tight mb-1 font-righteous tracking-wide">{activeMember.firstName} {activeMember.lastName}</h3>
                    <p className="text-[#F43F5E] text-xs font-black uppercase tracking-widest">{activeMember.department}</p>
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
              className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#7C3AED] font-righteous"
            >
              The Visionaries.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-zinc-300 max-w-2xl font-medium leading-relaxed"
            >
              A collective of industrial designers, master fabricators, and event strategists redefining what's possible in the MENA region.
            </motion.p>
          </header>

          {/* LIST */}
          <div className="border-t border-[#7C3AED]/20">
            {initialMembers.map((member, i) => (
              <Link 
                key={member.slug}
                href={`/${locale}/b2c/team/${member.slug}`}
                className="group flex flex-col md:flex-row items-start md:items-center justify-between py-10 md:py-12 border-b border-[#7C3AED]/20 hover:border-[#F43F5E]/50 transition-colors relative z-20"
                onMouseEnter={() => setActiveMember(member)}
                onMouseLeave={() => setActiveMember(null)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-12 w-full md:w-auto">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#F43F5E] transition-all font-righteous">
                    {member.firstName} {member.lastName}
                  </h2>
                  <span className="text-[#7C3AED] group-hover:text-[#F43F5E] transition-colors font-bold text-sm md:text-base uppercase tracking-widest mt-2 md:mt-0">
                    {member.designation}
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-4 text-zinc-500 group-hover:text-[#F43F5E] transition-colors">
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
    </>
  );
}
