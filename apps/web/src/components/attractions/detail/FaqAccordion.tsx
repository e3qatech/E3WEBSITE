'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { formatLocalizedText, cn } from '@/lib/utils';

interface FAQ {
  id: string;
  questionEn: string;
  questionAr?: string | null;
  answerEn: string;
  answerAr?: string | null;
}

export function FaqAccordion({ faqs, locale = 'en' }: { faqs: FAQ[]; locale?: string }) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);
  const isAr = locale === 'ar';

  if (!faqs || faqs.length === 0) return null;

  const initialCount = 4;
  const visibleFaqs = showAll ? faqs : faqs.slice(0, initialCount);
  const hasMore = faqs.length > initialCount;

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const areAllExpanded = faqs.length > 0 && openIndexes.length === visibleFaqs.length;

  const toggleExpandAll = () => {
    if (areAllExpanded) {
      setOpenIndexes([]);
    } else {
      setOpenIndexes(visibleFaqs.map((_, i) => i));
    }
  };

  return (
    <section id="faq" className="py-24 md:py-36 bg-[var(--surface-default)] text-[var(--text-primary)] relative border-t border-[var(--border-level-2)] overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Subtle Glow */}
      <div className="absolute top-1/3 start-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-12">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[var(--border-level-2)] pb-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isAr ? "مركز المساعدة والمعلومات" : "HELP & FAQ"}</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[var(--text-primary)]">
              {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
            </h2>
            <p className="text-sm md:text-base text-[var(--text-secondary)] font-normal">
              {isAr ? "كل ما تحتاج لمعرفته قبل تخطيط زيارتك إلى الوجهة" : "Everything you need to know before planning your visit."}
            </p>
          </div>

          {/* Master Expand/Collapse All Button */}
          <button
            type="button"
            onClick={toggleExpandAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--border-level-2)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer shadow-sm shrink-0 self-start sm:self-end"
          >
            <span>
              {areAllExpanded
                ? (isAr ? "طي كافة الإجابات" : "Collapse All")
                : (isAr ? "توسيع كافة الإجابات" : "Expand All")}
            </span>
            {areAllExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible FAQ Accordion Items */}
        <div className="space-y-4">
          {visibleFaqs.map((faq, idx) => {
            const isOpen = openIndexes.includes(idx);
            const qVal = isAr ? (faq.questionAr || faq.questionEn) : (faq.questionEn || faq.questionAr);
            const aVal = isAr ? (faq.answerAr || faq.answerEn) : (faq.answerEn || faq.answerAr);
            
            return (
              <motion.div 
                key={faq.id || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className={cn(
                  "border rounded-2xl transition-all duration-300 overflow-hidden shadow-sm",
                  isOpen 
                    ? "bg-[var(--surface-hover)] border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20" 
                    : "bg-[var(--surface-default)] border-[var(--border-level-2)] hover:border-emerald-500/30 hover:bg-[var(--surface-hover)]"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full flex items-center justify-between p-6 text-start focus:outline-none cursor-pointer gap-4"
                >
                  <span className={cn(
                    "text-base sm:text-lg font-bold transition-colors duration-200",
                    isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text-primary)]"
                  )}>
                    {formatLocalizedText(qVal, locale)}
                  </span>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300",
                    isOpen 
                      ? "bg-emerald-500 text-slate-950 rotate-180" 
                      : "bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-[var(--text-secondary)]"
                  )}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-6 pb-6 pt-0 text-sm md:text-base text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-level-2)] pt-4 mt-2">
                        <div dangerouslySetInnerHTML={{ __html: formatLocalizedText(aVal, locale) }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Show More / Show Less Button */}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[var(--surface-hover)] hover:bg-emerald-500/15 border border-[var(--border-level-2)] hover:border-emerald-500/40 text-xs font-bold text-[var(--text-primary)] hover:text-emerald-600 dark:hover:text-emerald-400 uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <span>
                {showAll
                  ? (isAr ? "عرض أسئلة أقل" : "Show Less FAQs")
                  : (isAr ? `عرض باقي الأسئلة (+${faqs.length - initialCount})` : `Show All FAQs (+${faqs.length - initialCount})`)}
              </span>
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
