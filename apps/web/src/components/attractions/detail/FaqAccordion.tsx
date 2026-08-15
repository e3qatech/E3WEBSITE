'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { formatLocalizedText } from '@/lib/utils';

interface FAQ {
  id: string;
  questionEn: string;
  answerEn: string;
}

export function FaqAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-32 bg-[var(--surface-default)] text-[var(--text-primary)] relative border-t border-[var(--border-level-2)]">
      <div className="max-w-4xl mx-auto px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6 text-[var(--text-primary)]">FAQ</h2>
          <p className="text-xl text-[var(--text-secondary)] font-light">Everything you need to know</p>
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
                className="border-b border-[var(--border-level-2)] last:border-0 group"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between py-8 text-left focus:outline-none cursor-pointer"
                >
                  <span className={`text-xl md:text-2xl font-bold pe-8 transition-colors duration-300 ${isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-primary)] group-hover:text-emerald-500'}`}>
                    {formatLocalizedText(faq.questionEn)}
                  </span>
                  <div className={`shrink-0 ms-4 transition-transform duration-500 ease-[0.22,1,0.36,1] ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]'}`}>
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
                      <div className="pb-8 text-lg text-[var(--text-secondary)] font-normal leading-relaxed max-w-none pe-12">
                        <div dangerouslySetInnerHTML={{ __html: formatLocalizedText(faq.answerEn) }} />
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
