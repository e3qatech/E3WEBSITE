"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown, CheckCircle2, Zap, Settings, Shield, Award, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ServiceItem {
  id: string;
  slug: string;
  titleEn: string;
  taglineEn: string;
  isFeatured: boolean;
  thumbnail: string | null;
}

const PROCESS_STEPS = [
  { id: 1, title: "Discovery", desc: "Understanding goals and site constraints." },
  { id: 2, title: "Design", desc: "Creative vision and technical schematics." },
  { id: 3, title: "Engineering", desc: "Custom fabrication and safety approvals." },
  { id: 4, title: "Deployment", desc: "On-site installation and integration." },
  { id: 5, title: "Support", desc: "Ongoing maintenance and operations." },
];

const MARQUEE_LOGOS = [
  "Qatar Tourism", "Supreme Committee", "Qatar Airways", "Katara", "Qatar Museums", "Aspire Zone"
];

export function ServicesClient({ services }: { services: ServiceItem[] }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Icons for services (fallback)
  const getIcon = (index: number) => {
    const icons = [<Zap key="1" />, <Settings key="2" />, <Shield key="3" />, <Award key="4" />];
    return icons[index % icons.length];
  };

  return (
    <div className="relative w-full overflow-hidden">
      
      {/* 1. HERO SECTION (80vh) */}
      <section ref={heroRef} className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden bg-zinc-950 text-white">
        {/* Animated Background wireframe grid */}
        <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          <div className="absolute top-0 start-0 end-0 h-full bg-gradient-to-b from-transparent via-transparent to-black" />
        </motion.div>
        
        <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white drop-shadow-lg">
              We Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">Experiences</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light mb-12 max-w-3xl mx-auto drop-shadow-md">
              End-to-end event engineering, entertainment solutions, and immersive installations.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-wrap justify-center gap-6 md:gap-12 py-6 px-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
          >
            <div className="text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">9+</h3>
              <p className="text-sm text-gray-400 uppercase tracking-wider mt-1">Services</p>
            </div>
            <div className="w-px bg-white/20 hidden md:block" />
            <div className="text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">200+</h3>
              <p className="text-sm text-gray-400 uppercase tracking-wider mt-1">Projects</p>
            </div>
            <div className="w-px bg-white/20 hidden md:block" />
            <div className="text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">15+</h3>
              <p className="text-sm text-gray-400 uppercase tracking-wider mt-1">Years</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-10 start-1/2 -translate-x-1/2 z-10 text-white/50"
        >
          <ChevronDown size={32} />
        </motion.div>
      </section>

      {/* 2. SERVICES OVERVIEW */}
      <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-sm font-bold tracking-widest uppercase text-[var(--color-primary)] mb-4">Our Philosophy</h2>
          <p className="text-3xl md:text-4xl font-light leading-relaxed text-[var(--text-primary)]">
            We don't just provide equipment; we engineer holistic environments. From the initial spark of imagination to the final bolt tightened, our approach is defined by the intersection of creativity and robust technical execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="p-10 rounded-3xl bg-[var(--surface-raised)] border border-[var(--border-subtle)]"
          >
            <h3 className="text-3xl font-black mb-6 text-[var(--text-primary)] flex items-center gap-4">
              <span className="text-[var(--color-accent)]">The Wow</span>
              <div className="h-1 flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-30 rounded-full" />
            </h3>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              We design for visual impact and unforgettable first impressions. Through state-of-the-art lighting, immersive visuals, and cutting-edge audio, we create atmospheres that captivate audiences and leave lasting memories.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="p-10 rounded-3xl bg-[var(--surface-raised)] border border-[var(--border-subtle)]"
          >
            <h3 className="text-3xl font-black mb-6 text-[var(--text-primary)] flex items-center gap-4">
              <span className="text-[var(--color-primary)]">The How</span>
              <div className="h-1 flex-1 bg-gradient-to-r from-[var(--color-primary)] to-transparent opacity-30 rounded-full" />
            </h3>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              Behind every spectacle is rigorous engineering. We handle the complex logistics, structural integrity, power distribution, and strict safety protocols to ensure that the magic happens flawlessly, every single time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. SERVICES GRID (Bento Layout) */}
      <section className="py-24 px-4 md:px-8 bg-[var(--surface-sunken)]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6">Our Capabilities</h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl">
              A comprehensive suite of specialized services designed to handle every technical aspect of modern event production.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(280px,auto)]">
            {services.map((service, i) => {
              // Create bento sizes based on isFeatured or index
              const isLarge = service.isFeatured || i === 0;
              const isWide = !isLarge && (i === 3 || i === 6);
              
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`
                    group relative overflow-hidden rounded-3xl bg-[var(--surface-default)] border border-[var(--border-subtle)]
                    hover:shadow-xl dark:hover:border-transparent transition-all duration-500 flex flex-col justify-between p-8
                    ${isLarge ? "md:col-span-2 md:row-span-2" : isWide ? "md:col-span-2 lg:col-span-2" : "col-span-1"}
                  `}
                >
                  {/* Hover Gradient Border (Visible on hover in dark mode) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Optional Background Image for featured items */}
                  {isLarge && service.thumbnail && (
                    <div className="absolute inset-0 opacity-10 dark:opacity-20 transition-transform duration-700 group-hover:scale-105 pointer-events-none">
                      <img src={service.thumbnail} alt="" className="w-full h-full object-cover grayscale mix-blend-multiply dark:mix-blend-screen" />
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--color-primary)] mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        {getIcon(i)}
                      </div>
                      <h3 className={`font-bold text-[var(--text-primary)] mb-4 ${isLarge ? "text-3xl" : "text-2xl"}`}>
                        {service.titleEn}
                      </h3>
                      <p className={`text-[var(--text-secondary)] ${isLarge ? "text-lg max-w-md" : "text-base"} line-clamp-3`}>
                        {service.taglineEn || "Professional event services tailored for scale and impact."}
                      </p>
                    </div>

                    <div className="mt-8">
                      <Link 
                        href={`/b2b/services/${service.slug}`}
                        className="inline-flex items-center font-medium text-[var(--color-primary)] group/link"
                      >
                        Learn More 
                        <ArrowRight className="ms-2 w-5 h-5 group-hover/link:translate-x-2 transition-transform rtl:-scale-x-100" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. PROCESS SECTION */}
      <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto overflow-hidden">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6">How We Work</h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            A battle-tested methodology ensuring flawless execution from concept to tear-down.
          </p>
        </div>

        <div className="relative">
          {/* Horizontal Line connecting steps (Desktop) */}
          <div className="absolute top-12 start-0 end-0 h-1 bg-[var(--border-subtle)] hidden md:block z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left"
              >
                <div className="w-24 h-24 rounded-full bg-[var(--surface-default)] border-4 border-[var(--surface-sunken)] flex items-center justify-center mb-6 shadow-xl relative">
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)] opacity-20" />
                  <span className="text-3xl font-black text-[var(--color-primary)]">0{step.id}</span>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">{step.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-32 px-4 relative overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 end-0 w-1/2 h-full bg-gradient-to-l from-[var(--color-primary)] to-transparent" />
          <div className="absolute bottom-0 start-0 w-1/2 h-full bg-gradient-to-r from-[var(--color-accent)] to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8">Ready to Start?</h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Partner with E3 Qatar to bring your next monumental event or immersive installation to life with unparalleled precision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-full">
              <Link href="/b2b/contact">Start a Project</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-full border-white/20 hover:bg-white hover:text-zinc-950">
              <Link href="/b2b/case-studies">View Our Work</Link>
            </Button>
          </div>
        </div>

        {/* Marquee Logos */}
        <div className="mt-24 pt-12 border-t border-white/10 relative z-10 w-full overflow-hidden flex flex-col items-center">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-500 mb-8">Trusted By Industry Leaders</p>
          <div className="flex flex-nowrap w-full mask-image-edges">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="flex items-center gap-16 md:gap-32 whitespace-nowrap px-8"
            >
              {[...MARQUEE_LOGOS, ...MARQUEE_LOGOS].map((logo, i) => (
                <div key={i} className="text-2xl font-bold text-gray-400 opacity-50 uppercase tracking-wider">
                  {logo}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global Style for Mask */}
      <style dangerouslySetInnerHTML={{__html: `
        .mask-image-edges {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}} />
    </div>
  );
}
