"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

interface FAQItem {
  id: string
  question: Record<string, string>
  answer: Record<string, string>
}

interface FAQAccordionProps {
  items: FAQItem[]
  locale: string
}

export function FAQAccordion({ items, locale }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null)

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div className="w-full space-y-4">
      {items.map((item) => {
        const isOpen = openId === item.id

        return (
          <div 
            key={item.id} 
            className={`border border-[var(--border-default)] rounded-2xl overflow-hidden transition-colors ${
              isOpen ? 'bg-[var(--surface-hover)]' : 'bg-[var(--surface-default)] hover:border-[var(--color-primary)]/50'
            }`}
          >
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between p-6 text-start"
              aria-expanded={isOpen}
            >
              <span className={`text-lg md:text-xl font-bold ${isOpen ? 'text-[var(--color-primary)]' : 'text-[var(--text-primary)]'}`}>
                {item.question[locale] || item.question.en}
              </span>
              <div className={`shrink-0 ms-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isOpen ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--surface-default)] text-[var(--text-secondary)] border border-[var(--border-default)]'
              }`}>
                {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-6 text-[var(--text-secondary)] leading-relaxed">
                    {item.answer[locale] || item.answer.en}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
