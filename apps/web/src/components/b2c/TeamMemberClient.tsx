"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, Download, Code, Terminal, Activity, ArrowUpRight } from "lucide-react";
import React, { useRef, useEffect } from "react";

// Magnetic Button Component
const MagneticButton = ({ children, className, onClick, href }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.2);
    y.set((clientY - centerY) * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      ref={ref as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      href={href}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      className={className}
    >
      {children}
    </Component>
  );
};

// 3D Tilt Card Component
const TiltCard = ({ children, className }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

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

export function TeamMemberClient({ locale, member }: { locale: string; member: any }) {
  const isRtl = locale === 'ar';
  
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
        @import url('https://fonts.googleapis.com/css2?family=Righteous&family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-righteous { font-family: 'Righteous', cursive; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}} />
      <div className="min-h-screen bg-[#0F0F23] text-zinc-100 font-poppins selection:bg-[#F43F5E]/30 relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
        
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
        <div className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.03]">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

        <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-24 pb-32 relative z-10">
          
          {/* Top Bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12 flex justify-between items-center">
            <Link href={`/${locale}/b2c/team`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A2E]/60 backdrop-blur-md border border-[#7C3AED]/30 text-sm font-bold text-zinc-300 hover:text-white hover:border-[#F43F5E] transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              Back to Team
            </Link>
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#7C3AED]">
              <Activity className="w-4 h-4 text-[#F43F5E]" /> SYSTEM ONLINE
            </div>
          </motion.div>

          {/* Hero Section */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-24 mb-32">
            
            {/* Left Info */}
            <div className="flex flex-col justify-center">
              <motion.div variants={itemVariants} className="mb-6 flex items-center gap-3">
                <span className="px-3 py-1 rounded bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-[#F43F5E] text-xs font-bold tracking-widest uppercase">
                  {member.department}
                </span>
                <span className="text-zinc-500 font-mono text-xs">ID: {member.id?.substring(0, 8) || '0x992A'}</span>
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-[80px] leading-[0.9] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#7C3AED] mb-4 font-righteous">
                {member.firstName} <br/> {member.lastName}
              </motion.h1>
              
              <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-bold text-zinc-300 mb-8 flex items-center gap-3">
                <Terminal className="w-5 h-5 text-[#F43F5E]" />
                {member.designation}
              </motion.h2>
              
              <motion.p variants={itemVariants} className="text-lg text-zinc-300 font-medium leading-relaxed max-w-xl mb-12 border-l-2 border-[#7C3AED] pl-6">
                {member.tagline || member.aboutSummary}
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <MagneticButton 
                  href={`mailto:${member.contactEmail}?subject=Contact Request`}
                  className="px-8 py-4 bg-[#F43F5E] text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:bg-[#E11D48] rounded-lg font-bold tracking-wide transition-colors flex items-center justify-center gap-3"
                >
                  <Calendar className="w-5 h-5" /> INITIATE MEETING
                </MagneticButton>
                
                <MagneticButton 
                  onClick={() => alert("Press kit download will be available soon.")}
                  className="px-8 py-4 bg-[#1A1A2E]/60 backdrop-blur-md border border-[#7C3AED]/30 hover:border-[#F43F5E]/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-3"
                >
                  <Download className="w-4 h-4" /> PRESS KIT
                </MagneticButton>
              </motion.div>
            </div>

            {/* Right Image Container */}
            <motion.div variants={itemVariants} className="relative">
              <TiltCard className="w-full aspect-[3/4] group perspective-1000">
                <div className="w-full h-full rounded-2xl bg-[#1A1A2E]/60 backdrop-blur-md border border-[#7C3AED]/40 shadow-[0_0_30px_rgba(124,58,237,0.2)] group-hover:shadow-[0_0_50px_rgba(244,63,94,0.4)] group-hover:border-[#F43F5E]/60 transition-all duration-500 p-2 relative overflow-hidden">
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F43F5E]" />
                    <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="w-full h-full rounded-xl overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700">
                    {member.profileImage ? (
                      <img src={member.profileImage} alt={member.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#0F0F23] text-zinc-700 font-righteous text-9xl">
                        {member.firstName.charAt(0)}
                      </div>
                    )}
                    {/* Glitch Overlay */}
                    <div className="absolute inset-0 bg-[#7C3AED]/10 mix-blend-overlay pointer-events-none" />
                  </div>
                </div>
              </TiltCard>
            </motion.div>

          </motion.div>

          {/* Data Dense Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-2 bg-[#1A1A2E]/60 backdrop-blur-md border border-[#7C3AED]/30 shadow-[0_0_20px_rgba(124,58,237,0.1)] p-8 rounded-2xl">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#7C3AED]/20 text-[#F43F5E]">
                 <Code className="w-5 h-5" />
                 <h3 className="font-bold text-sm tracking-widest uppercase">System Bio</h3>
               </div>
               <p className="text-zinc-300 leading-relaxed font-medium">{member.aboutSummary}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[#1A1A2E]/60 backdrop-blur-md border border-[#7C3AED]/30 shadow-[0_0_20px_rgba(124,58,237,0.1)] p-8 rounded-2xl">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#7C3AED]/20 text-[#F43F5E]">
                 <Activity className="w-5 h-5" />
                 <h3 className="font-bold text-sm tracking-widest uppercase">Core Skills</h3>
               </div>
               <div className="flex flex-wrap gap-2">
                 {expertise.map((tag: string) => (
                   <span key={tag} className="px-3 py-1 bg-[#0F0F23] border border-[#7C3AED]/40 rounded text-xs font-bold text-zinc-300">
                     {tag}
                   </span>
                 ))}
               </div>
            </motion.div>
          </div>

          {/* Bento Box Projects */}
          {projects.length > 0 && (
            <div className="mb-24">
              <h3 className="font-bold text-sm tracking-widest uppercase text-zinc-400 mb-8 border-b border-[#7C3AED]/20 pb-4">Key Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: any, idx: number) => (
                  <TiltCard key={idx} className="group h-full perspective-1000">
                    <div className="h-full bg-[#1A1A2E]/60 backdrop-blur-md border border-[#7C3AED]/30 shadow-[0_0_15px_rgba(124,58,237,0.1)] group-hover:border-[#F43F5E]/60 group-hover:shadow-[0_0_30px_rgba(244,63,94,0.2)] transition-all duration-300 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-6 h-6 text-[#F43F5E]" />
                      </div>
                      <div className="text-zinc-500 font-bold text-xs mb-4">{project.year} // {project.client}</div>
                      <h4 className="text-xl font-black text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#7C3AED] group-hover:to-[#F43F5E] transition-colors font-righteous">{project.name}</h4>
                      <p className="text-zinc-400 text-sm font-medium flex-1 mb-6">{project.description}</p>
                      <div className="mt-auto">
                        <span className="text-xs font-bold text-[#F43F5E] bg-[#F43F5E]/10 px-2 py-1 rounded border border-[#F43F5E]/20">
                          ROLE: {project.role}
                        </span>
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {experience.length > 0 && (
            <div className="mb-24">
              <h3 className="font-bold text-sm tracking-widest uppercase text-zinc-400 mb-12 border-b border-[#7C3AED]/20 pb-4">History Log</h3>
              <div className="space-y-12 pl-4 border-l border-[#7C3AED]/30">
                {experience.map((exp: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    whileInView={{ opacity: 1, x: 0 }} 
                    viewport={{ once: true }}
                    key={idx} 
                    className="relative pl-8"
                  >
                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-[#F43F5E] shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
                    <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
                      <h4 className="text-xl font-black text-white font-righteous">{exp.role}</h4>
                      <span className="text-[#7C3AED] font-bold text-sm">@ {exp.company}</span>
                    </div>
                    <div className="text-zinc-500 font-bold text-xs mb-4">[{exp.duration}]</div>
                    <p className="text-zinc-300 font-medium max-w-3xl whitespace-pre-wrap">{exp.responsibilities}</p>
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
