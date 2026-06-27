'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface WhatsInsideProps {
  description: string;
  features?: Feature[] | null;
}

export function WhatsInside({ description, features }: WhatsInsideProps) {
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
    <section className="py-24 md:py-32 bg-black text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Intro Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-24"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-8 uppercase tracking-tight">The Experience</h2>
          <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Features Bento Grid */}
        {features && features.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {features.map((feature, idx) => {
              // Dynamically resolve icon, fallback to Circle if not found
              const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.Circle;
              
              // Make the first item span 2 columns on tablet/desktop if it fits nicely
              const isLarge = idx === 0 && features.length % 2 !== 0;

              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`relative overflow-hidden group bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-end min-h-[250px] transition-colors duration-500 hover:bg-zinc-800/80 ${isLarge ? 'md:col-span-2 lg:col-span-2' : ''}`}
                >
                  <div className="absolute top-8 left-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-white">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="mt-16">
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover effect gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
