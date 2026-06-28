"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, Download, Mail, CheckCircle2, FileBadge, Code, Terminal, Activity, ArrowUpRight } from "lucide-react";
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
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.1) 0%, transparent 70%)' }} 
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
  const competencies = member.coreCompetencies as string[] || [];
  const experience = member.experience as any[] || [];
  const projects = member.projects as any[] || [];
  const certifications = member.certifications as any[] || [];
  
  // Interactive Background tracking
  const bgX = useMotionValue(0);
  const bgY = useMotionValue(0);
  const bgXSpring = useSpring(bgX, { stiffness: 50, damping: 30 });
  const bgYSpring = useSpring(bgY, { stiffness: 50, damping: 30 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const xPct = (e.clientX / window.innerWidth) - 0.5;
      const yPct = (e.clientY / window.innerHeight) - 0.5;
      bgX.set(xPct * -50); // Move opposite to mouse
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
    <div className="min-h-screen bg-[#0C0C0C] text-zinc-100 font-sans selection:bg-[#F59E0B]/30 relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. SVG Noise/Grain Texture */}
      <div className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.03]">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* 2. Parallax Blurred Image Background */}
      <motion.div 
        style={{ x: bgXSpring, y: bgYSpring }}
        className="fixed -inset-[100px] pointer-events-none z-0 opacity-10"
      >
        <div 
          className="w-full h-full bg-cover bg-center blur-[120px] saturate-200"
          style={{ backgroundImage: `url(${member.profileImage || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'})` }}
        />
      </motion.div>

      {/* 3. Interactive Tech Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at center, black, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)' }} />

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-24 pb-32 relative z-10">
        
        {/* Top Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12 flex justify-between items-center">
          <Link href={`/${locale}/b2c/team`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141414] border border-zinc-800 text-sm font-mono text-zinc-400 hover:text-white hover:border-[#F59E0B] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            cd ../team
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-600">
            <Activity className="w-3 h-3 text-[#22C55E]" /> STATUS: ACTIVE
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-24 mb-32">
          
          {/* Left Info */}
          <div className="flex flex-col justify-center">
            <motion.div variants={itemVariants} className="mb-6 flex items-center gap-3">
              <span className="px-3 py-1 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-mono tracking-widest uppercase">
                {member.department}
              </span>
              <span className="text-zinc-600 font-mono text-xs">ID: {member.id?.substring(0, 8) || '0x992A'}</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-[80px] leading-[0.9] font-black tracking-tight text-white mb-4">
              {member.firstName} <br/> {member.lastName}
            </motion.h1>
            
            <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-mono text-zinc-400 mb-8 flex items-center gap-3">
              <Terminal className="w-5 h-5 text-[#F59E0B]" />
              {member.designation}
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-lg text-zinc-300 font-light leading-relaxed max-w-xl mb-12 border-l-2 border-zinc-800 pl-6">
              {member.tagline || member.aboutSummary}
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <MagneticButton 
                href={`mailto:${member.contactEmail}?subject=Contact Request`}
                className="px-8 py-4 bg-[#F59E0B] text-black hover:bg-[#FBBF24] rounded-lg font-bold tracking-wide transition-colors flex items-center justify-center gap-3"
              >
                <Calendar className="w-5 h-5" /> INITIATE_MEETING()
              </MagneticButton>
              
              <MagneticButton 
                onClick={() => alert("Press kit download will be available soon.")}
                className="px-8 py-4 bg-[#141414] border border-zinc-700 hover:border-[#F59E0B]/50 text-white rounded-lg font-mono text-sm transition-colors flex items-center justify-center gap-3"
              >
                <Download className="w-4 h-4" /> GET_PRESS_KIT
              </MagneticButton>
            </motion.div>
          </div>

          {/* Right Image Container */}
          <motion.div variants={itemVariants} className="relative">
            <TiltCard className="w-full aspect-[3/4] group perspective-1000">
              <div className="w-full h-full rounded-2xl bg-[#141414] border border-zinc-800 p-2 shadow-2xl relative overflow-hidden">
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                </div>
                <div className="w-full h-full rounded-xl overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700">
                  {member.profileImage ? (
                    <img src={member.profileImage} alt={member.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-800 font-mono text-9xl">
                      {member.firstName.charAt(0)}
                    </div>
                  )}
                  {/* Glitch Overlay */}
                  <div className="absolute inset-0 bg-[#F59E0B]/5 mix-blend-overlay pointer-events-none" />
                </div>
              </div>
            </TiltCard>
          </motion.div>

        </motion.div>

        {/* Data Dense Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-2 bg-[#141414] border border-zinc-800 p-8 rounded-2xl">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50 text-[#F59E0B]">
               <Code className="w-5 h-5" />
               <h3 className="font-mono text-sm tracking-widest uppercase">System.Bio</h3>
             </div>
             <p className="text-zinc-300 leading-relaxed font-light">{member.aboutSummary}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[#141414] border border-zinc-800 p-8 rounded-2xl">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/50 text-[#F59E0B]">
               <Activity className="w-5 h-5" />
               <h3 className="font-mono text-sm tracking-widest uppercase">Config.Dependencies</h3>
             </div>
             <div className="flex flex-wrap gap-2">
               {expertise.map((tag: string) => (
                 <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-400">
                   {tag}
                 </span>
               ))}
             </div>
          </motion.div>
        </div>

        {/* Bento Box Projects */}
        {projects.length > 0 && (
          <div className="mb-24">
            <h3 className="font-mono text-sm tracking-widest uppercase text-zinc-500 mb-8 border-b border-zinc-900 pb-4">~/projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any, idx: number) => (
                <TiltCard key={idx} className="group h-full perspective-1000">
                  <div className="h-full bg-[#141414] border border-zinc-800 group-hover:border-[#F59E0B]/50 transition-colors rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                    <div className="text-zinc-500 font-mono text-xs mb-4">{project.year} // {project.client}</div>
                    <h4 className="text-xl font-bold text-white mb-4 group-hover:text-[#F59E0B] transition-colors">{project.name}</h4>
                    <p className="text-zinc-400 text-sm font-light flex-1 mb-6">{project.description}</p>
                    <div className="mt-auto">
                      <span className="text-xs font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded">
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
            <h3 className="font-mono text-sm tracking-widest uppercase text-zinc-500 mb-12 border-b border-zinc-900 pb-4">~/history.log</h3>
            <div className="space-y-12 pl-4 border-l border-zinc-800/50">
              {experience.map((exp: any, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }}
                  key={idx} 
                  className="relative pl-8"
                >
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
                    <h4 className="text-xl font-bold text-white">{exp.role}</h4>
                    <span className="text-[#F59E0B] font-mono text-sm">@ {exp.company}</span>
                  </div>
                  <div className="text-zinc-500 font-mono text-xs mb-4">[{exp.duration}]</div>
                  <p className="text-zinc-400 font-light max-w-3xl whitespace-pre-wrap">{exp.responsibilities}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
