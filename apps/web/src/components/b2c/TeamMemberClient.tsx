"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, Download, Mail, CheckCircle2, FileBadge, ExternalLink } from "lucide-react";

export function TeamMemberClient({ locale, member }: { locale: string; member: any }) {
  const isRtl = locale === 'ar';
  
  const expertise = member.expertiseTags as string[] || [];
  const competencies = member.coreCompetencies as string[] || [];
  const experience = member.experience as any[] || [];
  const projects = member.projects as any[] || [];
  const certifications = member.certifications as any[] || [];
  const testimonials = member.testimonials as any[] || [];

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

        {/* Hero Content Split */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-32">
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
          <div className="w-full lg:w-[60%] flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="mb-8">
                <span className="px-4 py-1.5 rounded-full border border-zinc-800 text-[#D4FF00] text-xs font-black tracking-widest uppercase inline-block">
                  {member.department}
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-[100px] leading-[0.9] font-black tracking-tighter text-white mb-6 uppercase">
                {member.firstName} <br/> {member.lastName}
              </h1>
              <h2 className="text-2xl md:text-4xl font-medium text-zinc-400 mb-12">
                {member.designation}
              </h2>
              <p className="text-lg md:text-xl text-zinc-200 font-light leading-relaxed max-w-2xl mb-16">
                {member.tagline || member.aboutSummary}
              </p>
              
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

        {/* 2. ABOUT & EXPERTISE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32">
          <section>
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-500 mb-8 border-b border-zinc-900 pb-4">Professional Overview</h3>
            <div className="space-y-6 text-zinc-300 leading-relaxed text-lg whitespace-pre-wrap">
              <p>{member.aboutSummary}</p>
              {member.careerJourney && (
                <>
                  <h4 className="text-xl font-bold text-white mt-8 mb-4">The Journey</h4>
                  <p>{member.careerJourney}</p>
                </>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-500 mb-8 border-b border-zinc-900 pb-4">Core Competencies</h3>
            <div className="flex flex-wrap gap-3 mb-12">
              {expertise.map(tag => (
                <span key={tag} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
            
            {competencies.length > 0 && (
              <div className="space-y-4">
                {competencies.map((comp, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#D4FF00] shrink-0 mt-0.5" />
                    <span className="text-zinc-300 leading-relaxed">{comp}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 3. EXPERIENCE TIMELINE */}
        {experience.length > 0 && (
          <section className="mb-32">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-500 mb-12 border-b border-zinc-900 pb-4">Experience Timeline</h3>
            <div className="relative border-l border-zinc-800 ml-4 md:ml-0 md:pl-12 space-y-16 pl-8">
              {experience.map((exp: any, idx: number) => (
                <div key={idx} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[41px] md:-left-[53px] top-1.5 w-5 h-5 rounded-full bg-zinc-950 border-4 border-[#D4FF00]" />
                  
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-4">
                    <h4 className="text-2xl font-bold text-white">{exp.role}</h4>
                    <span className="text-[#8A2BE2] font-mono text-sm uppercase tracking-widest">{exp.company}</span>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-500 font-mono text-sm mb-6">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {exp.duration}</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed max-w-3xl whitespace-pre-wrap">{exp.responsibilities}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. PROJECTS PORTFOLIO BENTO */}
        {projects.length > 0 && (
          <section className="mb-32">
            <div className="flex items-center justify-between mb-12 border-b border-zinc-900 pb-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-500">Major Events & Projects</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any, idx: number) => (
                <div key={idx} className={`group bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 transition-colors rounded-3xl p-8 flex flex-col ${idx === 0 ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950' : ''}`}>
                  <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-[#D4FF00] transition-colors">{project.name}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 font-mono mb-6">
                    <span className="text-zinc-300">{project.client}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                    <span>{project.year}</span>
                  </div>
                  <p className="text-zinc-400 mb-8 flex-1">{project.description}</p>
                  <div className="mt-auto">
                    <span className="inline-block px-3 py-1 bg-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-400 rounded-lg">
                      Role: {project.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. CERTIFICATIONS & AWARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {certifications.length > 0 && (
            <section>
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-500 mb-8 border-b border-zinc-900 pb-4">Certifications</h3>
              <div className="space-y-4">
                {certifications.map((cert: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <FileBadge className="w-5 h-5 text-[#D4FF00]" />
                      </div>
                      <div>
                        <h5 className="font-bold text-zinc-100">{cert.name}</h5>
                        <p className="text-sm text-zinc-500">{cert.issuer} • {cert.year}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <section>
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-500 mb-8 border-b border-zinc-900 pb-4">Testimonials</h3>
              <div className="space-y-6">
                {testimonials.map((test: any, idx: number) => (
                  <div key={idx} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <p className="text-zinc-300 italic mb-6">"{test.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                        {test.author.charAt(0)}
                      </div>
                      <div>
                        <h6 className="font-bold text-sm text-zinc-200">{test.author}</h6>
                        <p className="text-xs text-zinc-500">{test.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

      </main>
    </div>
  );
}
