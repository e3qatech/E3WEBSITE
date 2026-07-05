"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Play, X, Calendar, Clock, User, Building, Mail, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Dynamically import Three.js components to prevent bundle bloat on non-3D pages
const Scene3D = dynamic(() => import("@/components/b2b/Scene3D"), { ssr: false });

export function ServiceDetailClient({ service }: { service: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Sections Refs for Scroll Spy
  const heroRef = useRef<HTMLElement>(null);
  const descRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(heroProgress, [0, 1], [1, 0]);

  const [activeSection, setActiveSection] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Parse JSON arrays safely
  const processSteps = service.process ? (typeof service.process === 'string' ? JSON.parse(service.process) : service.process) : [];
  
  // Custom JSON Renderer for Rich Text (Minimalist)
  const renderContent = (contentStr: string) => {
    if (!contentStr) return null;
    try {
      const data = JSON.parse(contentStr);
      // Assuming TipTap JSON format: { type: 'doc', content: [...] }
      if (data.type === 'doc' && data.content) {
        return data.content.map((block: any, idx: number) => {
          if (block.type === 'paragraph') {
            return <p key={String(idx)} className="mb-6 text-lg text-[var(--text-secondary)] leading-relaxed">{block.content?.map((textNode: any, i: number) => <span key={String(i)} className={textNode.marks?.some((m:any) => m.type === 'bold') ? 'font-bold text-[var(--text-primary)]' : ''}>{textNode.text}</span>)}</p>;
          }
          if (block.type === 'heading') {
            const Tag: any = `h${block.attrs?.level || 2}`;
            return <Tag key={String(idx)} className="text-3xl font-black text-[var(--text-primary)] mb-6 mt-12">{block.content?.[0]?.text}</Tag>;
          }
          return null;
        });
      }
    } catch(e) {
      // Fallback if it's plain text or HTML
      return <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: contentStr }} />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden bg-[var(--surface-default)]">
      
      {/* RIGHT SIDE DOT NAVIGATION */}
      <div className="fixed end-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4">
        {[0, 1, 2, 3].map((i) => (
          <button 
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${activeSection === i ? 'bg-[var(--color-primary)] scale-150' : 'bg-[var(--text-muted)] hover:bg-[var(--text-secondary)]'}`}
            onClick={() => {
              const refs = [heroRef, descRef, processRef, galleryRef];
              refs[i].current?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label={`Scroll to section ${i + 1}`}
          />
        ))}
      </div>

      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="relative h-[100vh] w-full flex flex-col justify-end overflow-hidden bg-zinc-950 text-white">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
          {service.heroMediaType === 'VIDEO' ? (
            <video src={service.heroMediaUrl} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-70" />
          ) : service.heroMediaType === 'MODEL_3D' ? (
            <div className="w-full h-full cursor-grab active:cursor-grabbing"><Scene3D modelUrl={service.heroMediaUrl} /></div>
          ) : service.heroMediaType === 'IFRAME' ? (
            <iframe src={service.heroMediaUrl} className="w-full h-full opacity-70 pointer-events-none" allow="autoplay; fullscreen" />
          ) : (
            // IMAGE (Default with Ken Burns)
            <motion.img 
              src={service.heroMediaUrl || service.thumbnail || '/placeholder.jpg'} 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="w-full h-full object-cover opacity-60" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </motion.div>

        <div className="relative z-10 px-8 pb-32 max-w-[1400px] mx-auto w-full">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-4"
          >
            {service.titleEn}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-3xl text-gray-300 max-w-3xl font-light"
          >
            {service.taglineEn}
          </motion.p>
        </div>
      </section>

      {/* 2. DESCRIPTION */}
      <section ref={descRef} className="py-32 px-4 md:px-8 max-w-[1400px] mx-auto min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-7"
          >
            {renderContent(service.contentEn)}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-5 relative"
          >
            <div className="sticky top-32 rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-8">
              <h3 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Key Benefits</h3>
              <ul className="space-y-4">
                {[1,2,3].map((_, i) => (
                  <li key={i} className="flex items-start gap-4 text-[var(--text-secondary)]">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-1">✓</div>
                    <span>Enterprise-grade reliability and seamless integration into existing infrastructure.</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. "HOW WE DO IT" - PROCESS */}
      {processSteps && processSteps.length > 0 && (
        <section ref={processRef} className="py-32 px-4 md:px-8 bg-[var(--surface-sunken)]">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-20 text-center text-[var(--text-primary)]">How We Do It</h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute start-8 md:start-0 md:top-12 md:w-full w-1 h-full md:h-1 bg-[var(--border-subtle)]" />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                {processSteps.map((step: any, idx: number) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.2 }}
                    className="flex flex-row md:flex-col items-start gap-6 md:gap-8 relative"
                  >
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[var(--surface-default)] border-4 border-[var(--surface-sunken)] shadow-xl flex items-center justify-center shrink-0 text-[var(--color-primary)] z-10">
                      <span className="text-2xl md:text-4xl font-black">{idx + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-[var(--text-primary)]">{step.title}</h3>
                      <p className="text-[var(--text-secondary)]">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. GALLERY */}
      {service.gallery && service.gallery.length > 0 && (
        <section ref={galleryRef} className="py-32 px-4 md:px-8 max-w-[1400px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-[var(--text-primary)]">Gallery</h2>
          
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {service.gallery.map((item: any, idx: number) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative rounded-2xl overflow-hidden cursor-pointer group break-inside-avoid"
                onClick={() => setLightboxIndex(idx)}
              >
                <img src={item.url} alt={item.captionEn || ''} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/40 transition-colors duration-300 flex items-center justify-center">
                  <Play className="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 w-12 h-12" />
                </div>
                {item.captionEn && (
                  <div className="absolute bottom-0 start-0 end-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.captionEn}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 5. SIMILAR PROJECTS */}
      {service.projects && service.projects.length > 0 && (
        <section className="py-32 px-4 md:px-8 bg-[var(--surface-raised)] border-y border-[var(--border-subtle)]">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-16 text-[var(--text-primary)]">Related Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {service.projects.map((project: any) => (
                <div key={project.id} className="group cursor-pointer">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 relative">
                    <img src={project.imageUrl || '/placeholder.jpg'} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">{project.titleEn}</h3>
                  <p className="text-[var(--text-secondary)] line-clamp-2">{project.descriptionEn}</p>
                </div>
              ))}
            </div>
            <div className="mt-16 text-center">
              <Button variant="outline" asChild size="lg" className="rounded-full">
                <Link href="/b2b/case-studies">View All Case Studies</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 6. CTA SECTION */}
      <section className="py-32 px-4 text-center bg-gradient-to-br from-[var(--surface-active)] to-[var(--surface-default)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-primary)_0%,transparent_50%)]" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black mb-8 text-[var(--text-primary)]">Ready to Build the Impossible?</h2>
          <p className="text-xl text-[var(--text-secondary)] mb-12">
            Let's discuss how our technical expertise can elevate your next project.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {service.ctaPrimary === 'BOOK_APPOINTMENT' ? (
              <Button size="lg" variant="primary" onClick={() => setIsBookingModalOpen(true)} className="rounded-full h-14 px-8 text-lg">
                Book an Appointment
              </Button>
            ) : (
              <Button size="lg" variant="primary" asChild className="rounded-full h-14 px-8 text-lg">
                <Link href={`/b2b/contact?service=${service.slug}`}>Contact Sales</Link>
              </Button>
            )}
            
            {service.ctaSecondary && (
              <Button size="lg" variant="outline" asChild className="rounded-full h-14 px-8 text-lg bg-transparent">
                <Link href={service.ctaSecondary}>{service.ctaSecondary.replace(/-/g, ' ')}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && service.gallery && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/95 flex items-center justify-center backdrop-blur-sm p-4">
          <button onClick={() => setLightboxIndex(null)} className="absolute top-8 end-8 text-white/50 hover:text-white">
            <X size={40} />
          </button>
          <img 
            src={service.gallery[lightboxIndex].url} 
            alt="Lightbox" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
          />
        </div>
      )}

      {/* BOOKING MODAL (Placeholder for actual form implementation) */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--surface-default)] border border-[var(--border-subtle)] w-full max-w-2xl rounded-3xl p-8 relative shadow-2xl">
            <button onClick={() => setIsBookingModalOpen(false)} className="absolute top-6 end-6 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X size={24} />
            </button>
            <h3 className="text-3xl font-black mb-2">Book an Appointment</h3>
            <p className="text-[var(--text-secondary)] mb-8">Schedule a technical consultation with our engineering team.</p>
            
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Full Name</label>
                   <input type="text" className="w-full bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-xl px-4 py-3" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Company</label>
                   <input type="text" className="w-full bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-xl px-4 py-3" />
                 </div>
               </div>
               <div>
                   <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Select Time Slot</label>
                   <select className="w-full bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 appearance-none text-[var(--text-primary)]">
                     <option>Mon, Oct 12 - 10:00 AM AST</option>
                     <option>Tue, Oct 13 - 2:00 PM AST</option>
                   </select>
               </div>
               <Button className="w-full h-14 text-lg rounded-xl" variant="primary">Confirm Booking</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
