'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FAQ {
  id: string;
  questionEn: string;
  answerEn: string;
}

export function FaqAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-32 bg-black text-white relative border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">FAQ</h2>
          <p className="text-xl text-zinc-400 font-light">Everything you need to know</p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            
            return (
              <motion.div 
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="border-b border-white/10 last:border-0 group"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between py-8 text-left focus:outline-none"
                >
                  <span className={`text-xl md:text-2xl font-bold pr-8 transition-colors duration-300 ${isOpen ? 'text-emerald-400' : 'text-white group-hover:text-zinc-300'}`}>
                    {faq.questionEn}
                  </span>
                  <div className={`shrink-0 ml-4 transition-transform duration-500 ease-[0.22,1,0.36,1] ${isOpen ? 'rotate-180 text-emerald-400' : 'text-zinc-500 group-hover:text-white'}`}>
                    {isOpen ? <Minus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="pb-8 text-lg text-zinc-400 font-light leading-relaxed prose prose-invert max-w-none pr-12">
                        <div dangerouslySetInnerHTML={{ __html: faq.answerEn }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
