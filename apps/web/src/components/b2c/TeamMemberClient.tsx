"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, Download, Mail } from "lucide-react";

export function TeamMemberClient({ locale, member }: { locale: string; member: any }) {
  const isRtl = locale === 'ar';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-[#D4FF00]/30" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Ambience */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
      <div className="fixed top-1/4 left-1/4 w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 pt-24 pb-32 relative z-10 flex flex-col min-h-screen">
        
        {/* Top Bar */}
        <div className="mb-8 md:mb-16">
          <Link href={`/${locale}/b2c/team`} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-bold uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Team
          </Link>
        </div>

        {/* Content Split */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 flex-1">
          
          {/* Left Pane (Image) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-[40%] shrink-0 flex flex-col gap-4"
          >
            <div className="w-full aspect-[4/5] rounded-[32px] bg-zinc-900 overflow-hidden relative shadow-2xl border border-zinc-800">
              {member.profileImage ? (
                <img src={member.profileImage} alt={member.firstName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-800 text-9xl font-black">
                  {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                </div>
              )}
            </div>
            
            {member.contactEmail ? (
              <a href={`mailto:${member.contactEmail}`} className="w-full py-4 bg-[#111111] hover:bg-[#1A1A1A] border border-zinc-800 rounded-2xl flex justify-center items-center gap-3 text-white font-bold tracking-wide transition-colors">
                <Mail className="w-5 h-5" /> CONTACT
              </a>
            ) : (
              <div className="w-full py-4 bg-[#111111] border border-zinc-800 rounded-2xl flex justify-center items-center gap-3 text-white font-bold tracking-wide cursor-not-allowed opacity-50">
                <Mail className="w-5 h-5" /> CONTACT
              </div>
            )}
          </motion.div>

          {/* Right Pane (Info) */}
          <div className="w-full lg:w-[60%] flex flex-col justify-center pb-12 lg:pb-0">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {/* Badge */}
              <div className="mb-8">
                <span className="px-4 py-1.5 rounded-full border border-zinc-800 text-[#D4FF00] text-xs font-black tracking-widest uppercase inline-block">
                  {member.department}
                </span>
              </div>

              {/* Name */}
              <h1 className="text-6xl md:text-8xl lg:text-[100px] leading-[0.9] font-black tracking-tighter text-white mb-6 uppercase">
                {member.firstName} <br/> {member.lastName}
              </h1>

              {/* Title */}
              <h2 className="text-2xl md:text-4xl font-medium text-zinc-400 mb-12">
                {member.designation}
              </h2>

              {/* Bio / Tagline */}
              <p className="text-lg md:text-xl text-zinc-200 font-light leading-relaxed max-w-2xl mb-16">
                {member.tagline || member.aboutSummary}
              </p>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={`mailto:${member.contactEmail || 'info@eeeqa.com'}?subject=Meeting Request: ${member.firstName} ${member.lastName}`}
                  className="px-8 py-4 bg-[#D4FF00] text-black hover:bg-[#bce000] rounded-full font-black tracking-wide transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(212,255,0,0.2)] hover:shadow-[0_0_60px_rgba(212,255,0,0.3)]"
                >
                  <Calendar className="w-5 h-5" /> SCHEDULE MEETING
                </a>
                
                <button 
                  onClick={() => alert("Press kit download will be available soon.")}
                  className="px-8 py-4 bg-transparent border border-zinc-700 hover:border-zinc-500 text-white rounded-full font-bold tracking-wide transition-colors flex items-center justify-center gap-3"
                >
                  <Download className="w-5 h-5" /> DOWNLOAD PRESS KIT
                </button>
              </div>

            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
