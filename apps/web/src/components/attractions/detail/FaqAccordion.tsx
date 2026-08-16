'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { formatLocalizedText } from '@/lib/utils';

interface FAQ {
  id: string;
  questionEn: string;
  questionAr?: string | null;
  answerEn: string;
  answerAr?: string | null;
}

export function FaqAccordion({ faqs, locale = 'en' }: { faqs: FAQ[]; locale?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isAr = locale === 'ar';

  if (!faqs || faqs.length === 0) return null;

  return (
    <section id="faq" className="py-32 bg-[var(--surface-default)] text-[var(--text-primary)] relative border-t border-[var(--border-level-2)]" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 space-y-4"
        >
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-[var(--text-primary)]">
            {isAr ? "الأسئلة الشائعة" : "FAQ"}
          </h2>
          <p className="text-xl text-[var(--text-secondary)] font-light">
            {isAr ? "كل ما تحتاج لمعرفته قبل زيارتك" : "Everything you need to know"}
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const qVal = isAr ? (faq.questionAr || faq.questionEn) : (faq.questionEn || faq.questionAr);
            const aVal = isAr ? (faq.answerAr || faq.answerEn) : (faq.answerEn || faq.answerAr);
            
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
                  className="w-full flex items-center justify-between py-8 text-start focus:outline-none cursor-pointer"
                >
                  <span className={`text-xl md:text-2xl font-bold pe-8 transition-colors duration-300 ${isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-primary)] group-hover:text-emerald-500'}`}>
                    {formatLocalizedText(qVal, locale)}
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
                        <div dangerouslySetInnerHTML={{ __html: formatLocalizedText(aVal, locale) }} />
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
