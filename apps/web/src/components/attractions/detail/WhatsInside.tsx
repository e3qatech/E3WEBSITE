'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface Feature {
  icon: string;
  title: string;
  description: string;
  imageUrl?: string;
}

interface WhatsInsideProps {
  description: string;
  features?: Feature[] | null;
  imageUrl?: string | null;
}

export function WhatsInside({ description, features, imageUrl }: WhatsInsideProps) {
  // Container variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  return (
    <section className="py-32 md:py-48 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background Subtle Glow */}
      <div className="absolute top-0 start-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-emerald-900/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Intro Description & Image */}
        <div className={`grid grid-cols-1 ${imageUrl ? 'lg:grid-cols-2' : ''} gap-16 lg:gap-24 items-center mb-32`}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className={`max-w-3xl ${imageUrl ? '' : 'mx-auto text-center'}`}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter leading-[0.9]">The Experience</h2>
            <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed">
              {description}
            </p>
          </motion.div>

          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 group"
            >
              <img src={imageUrl} alt="What's inside" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
          )}
        </div>

        {/* Features Bento Grid */}
        {features && features.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, idx) => {
              const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.Circle;
              const isLarge = idx === 0 && features.length % 2 !== 0;

              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`relative overflow-hidden group bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2rem] flex flex-col justify-end min-h-[320px] transition-all duration-700 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] ${isLarge ? 'md:col-span-2 lg:col-span-2' : ''}`}
                >
                  {feature.imageUrl ? (
                    <div className="absolute inset-0">
                      <img src={feature.imageUrl} alt={feature.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-105 transition-all duration-1000 ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                    </div>
                  ) : null}

                  <div className="relative p-10 z-10 flex-1 flex flex-col justify-end">
                    <div className="absolute top-10 start-10 p-4 rounded-2xl bg-white/5 border border-white/10 text-white backdrop-blur-md group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 group-hover:text-emerald-400 transition-all duration-500 ease-out">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    
                    <div className="mt-20 transform group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                      <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                      <p className="text-zinc-400 text-base leading-relaxed group-hover:text-zinc-300 transition-colors duration-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Hover effect gradient */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
