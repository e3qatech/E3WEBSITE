"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, HelpCircle, ArrowRight } from "lucide-react"

interface FAQ {
  id: string
  question: Record<string, string>
  answer: Record<string, string>
  attractionId?: string | null
}

interface Attraction {
  id: string
  name: Record<string, string>
}

interface FaqTabProps {
  locale: string
  faqs: FAQ[]
  attractions: Attraction[]
  onGoToSupport: () => void
}

export function FaqTab({ locale, faqs, attractions, onGoToSupport }: FaqTabProps) {
  const isRTL = locale === 'ar'
  const [search, setSearch] = useState("")
  const [activeAttraction, setActiveAttraction] = useState<string>("ALL")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      // 1. Filter by attraction
      if (activeAttraction !== "ALL" && faq.attractionId !== activeAttraction) {
        return false
      }
      
      // 2. Filter by search
      if (search.trim()) {
        const query = search.toLowerCase()
        const q = faq.question[locale] || faq.question.en
        const a = faq.answer[locale] || faq.answer.en
        if (!q.toLowerCase().includes(query) && !a.toLowerCase().includes(query)) {
          return false
        }
      }
      
      return true
    })
  }, [faqs, activeAttraction, search, locale])

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] ${isRTL ? 'end-4' : 'start-4'}`} />
          <input
            type="text"
            placeholder={locale === 'ar' ? 'ابحث في الأسئلة الشائعة...' : 'Search FAQs...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full h-12 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors ${isRTL ? 'pe-12 ps-4' : 'ps-12 pe-4'}`}
          />
        </div>
        <select 
          value={activeAttraction}
          onChange={(e) => setActiveAttraction(e.target.value)}
          className="h-12 px-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors md:w-64"
        >
          <option value="ALL">{locale === 'ar' ? 'جميع الوجهات' : 'All Attractions'}</option>
          {attractions.map(attr => (
            <option key={attr.id} value={attr.id}>
              {attr.name[locale] || attr.name.en}
            </option>
          ))}
        </select>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[var(--surface-hover)] rounded-2xl border border-[var(--border-default)]">
            <HelpCircle className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)] font-medium">
              {locale === 'ar' ? 'لا توجد نتائج مطابقة لبحثك.' : 'No FAQs match your search.'}
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id
            return (
              <div 
                key={faq.id}
                className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden transition-colors hover:border-[var(--color-primary)]/50"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full flex items-center justify-between p-6 text-start focus:outline-none"
                >
                  <span className="font-bold text-[var(--text-primary)] text-lg">
                    {faq.question[locale] || faq.question.en}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300 shrink-0 ${isRTL ? 'me-4' : 'ms-4'} ${isExpanded ? 'rotate-180 text-[var(--color-primary)]' : ''}`}
                  />
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-[var(--text-secondary)] leading-relaxed">
                        {faq.answer[locale] || faq.answer.en}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })
        )}
      </div>

      {/* Call to Action */}
      <div className="mt-12 p-8 bg-[var(--color-primary)]/10 rounded-2xl border border-[var(--color-primary)]/20 text-center">
        <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          {locale === 'ar' ? 'لم تجد ما تبحث عنه؟' : 'Still need help?'}
        </h4>
        <p className="text-[var(--text-secondary)] mb-6">
          {locale === 'ar' 
            ? 'فريق الدعم لدينا مستعد دائماً لمساعدتك في أي استفسار.' 
            : 'Our support team is always ready to assist you with any questions.'}
        </p>
        <button 
          onClick={onGoToSupport}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl hover:bg-[var(--color-primary)]/90 transition-colors"
        >
          {locale === 'ar' ? 'تواصل مع الدعم' : 'Contact Support'}
          <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  )
}
