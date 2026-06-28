"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Award, Briefcase, FileBadge, CheckCircle2, ChevronRight, Mail, Linkedin } from "lucide-react";

export function TeamMemberClient({ locale, member }: { locale: string; member: any }) {
  const isRtl = locale === 'ar';
  
  const expertise = member.expertiseTags as string[] || [];
  const competencies = member.coreCompetencies as string[] || [];
  const experience = member.experience as any[] || [];
  const projects = member.projects as any[] || [];
  const certifications = member.certifications as any[] || [];
  const testimonials = member.testimonials as any[] || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/30" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Ambience */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-32 relative z-10">
        
        {/* Back Navigation */}
        <Link href={`/${locale}/b2c/team`} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-16 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Team
        </Link>

        {/* 1. HERO SECTION */}
        <section className="flex flex-col lg:flex-row gap-16 mb-32 items-center lg:items-start">
          {/* Profile Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/3 shrink-0"
          >
            <div className="aspect-[3/4] rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden relative group">
              {member.profileImage ? (
                <img src={member.profileImage} alt={member.firstName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-800 text-9xl font-black">
                  {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
            </div>
          </motion.div>

          {/* Hero Content */}
          <div className="w-full lg:w-2/3 pt-8 lg:pt-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-xs font-bold uppercase tracking-widest">
                  {member.department}
                </span>
                <span className="text-zinc-500 font-mono text-sm">{member.yearsOfExperience} Years Experience</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white">
                {member.firstName} <span className="text-zinc-500">{member.lastName}</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-300 mb-8">{member.designation}</h2>
              <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed mb-12 max-w-2xl">
                {member.tagline}
              </p>
              
              <div className="flex gap-4">
                {member.contactEmail && (
                  <a href={`mailto:${member.contactEmail}`} className="px-6 py-3 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl font-bold transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Connect
                  </a>
                )}
                {member.linkedinUrl && (
                  <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white hover:border-zinc-600 rounded-xl font-bold transition-colors flex items-center gap-2">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </section>

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
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
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
                  <div className="absolute -left-[41px] md:-left-[53px] top-1.5 w-5 h-5 rounded-full bg-zinc-950 border-4 border-amber-500" />
                  
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-4">
                    <h4 className="text-2xl font-bold text-white">{exp.role}</h4>
                    <span className="text-amber-500 font-mono text-sm uppercase tracking-widest">{exp.company}</span>
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
                  <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">{project.name}</h4>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32">
          {certifications.length > 0 && (
            <section>
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-500 mb-8 border-b border-zinc-900 pb-4">Certifications</h3>
              <div className="space-y-4">
                {certifications.map((cert: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <FileBadge className="w-5 h-5 text-amber-500" />
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
