"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const TiltCard = ({ children, className }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative ${className}`}
    >
      {/* Glare effect */}
      <div className="absolute inset-0 z-50 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.15) 0%, transparent 70%)' }} 
      />
      <div style={{ transform: "translateZ(30px)" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};

export function TeamClient({ locale, initialMembers }: { locale: string; initialMembers: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

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

        <main className="pt-32 pb-32 max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          {/* HERO */}
          <header className="mb-24 text-center">
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
              className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto font-medium leading-relaxed"
            >
              A collective of industrial designers, master fabricators, and event strategists redefining what's possible in the MENA region.
            </motion.p>
          </header>

          {/* GAMIFIED GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initialMembers.map((member, i) => (
              <TiltCard key={member.slug} className="group perspective-1000">
                <Link href={`/${locale}/b2c/team/${member.slug}`} className="block h-full">
                  <div className="bg-[#1A1A2E]/60 backdrop-blur-md border border-[#7C3AED]/30 hover:border-[#F43F5E]/60 shadow-[0_0_20px_rgba(124,58,237,0.1)] hover:shadow-[0_0_40px_rgba(244,63,94,0.3)] transition-all duration-300 rounded-2xl p-4 flex flex-col relative overflow-hidden h-full">
                    
                    {/* Glassmorphism Frame Detail */}
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-6 h-6 text-[#F43F5E]" />
                    </div>
                    
                    {/* Image Area */}
                    <div className="w-full aspect-square rounded-xl overflow-hidden relative mb-6 border border-[#7C3AED]/20">
                      {member.profileImage ? (
                        <img src={member.profileImage} alt={member.firstName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-[#0F0F23] flex items-center justify-center text-6xl font-black text-zinc-800">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[#7C3AED]/10 mix-blend-overlay pointer-events-none" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 flex flex-col">
                      <div className="text-[#F43F5E] font-black text-xs uppercase tracking-widest mb-2 font-righteous">
                        {member.department}
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-white mb-1 font-righteous group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#F43F5E]">
                        {member.firstName} {member.lastName}
                      </h2>
                      <p className="text-[#7C3AED] font-semibold text-sm">
                        {member.designation}
                      </p>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            ))}
            
            {initialMembers.length === 0 && (
              <div className="col-span-full text-center py-32">
                <p className="text-zinc-500 text-xl font-medium">No visionaries found.</p>
              </div>
            )}
          </div>

        </main>
      </div>
    </>
  );
}
