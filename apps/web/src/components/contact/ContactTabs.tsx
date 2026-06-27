"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, LifeBuoy, HelpCircle } from "lucide-react"

import { FeedbackForm } from "./FeedbackForm"
import { SupportForm } from "./SupportForm"
import { FaqTab } from "./FaqTab"

type TabType = 'FEEDBACK' | 'SUPPORT' | 'FAQ'

interface ContactTabsProps {
  locale: string
  attractions: any[]
  faqs: any[]
}

export function ContactTabs({ locale, attractions, faqs }: ContactTabsProps) {
  const isRTL = locale === 'ar'
  const [activeTab, setActiveTab] = useState<TabType>('FAQ')

  const tabs: { id: TabType, icon: any, labelEn: string, labelAr: string }[] = [
    { id: 'FAQ', icon: HelpCircle, labelEn: 'FAQ', labelAr: 'الأسئلة الشائعة' },
    { id: 'SUPPORT', icon: LifeBuoy, labelEn: 'Support', labelAr: 'الدعم الفني' },
    { id: 'FEEDBACK', icon: MessageSquare, labelEn: 'Feedback', labelAr: 'الآراء والمقترحات' },
  ]

  return (
    <div className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-default)] shadow-lg overflow-hidden">
      
      {/* Tab Header */}
      <div className="flex border-b border-[var(--border-default)] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 flex items-center justify-center gap-2 py-6 px-4 min-w-[120px] transition-colors hover:bg-[var(--surface-hover)] focus:outline-none"
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--text-tertiary)]'}`} />
              <span className={`font-bold transition-colors ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {locale === 'ar' ? tab.labelAr : tab.labelEn}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 start-0 end-0 h-1 bg-[var(--color-primary)]"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6 md:p-10 min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {activeTab === 'FAQ' && (
            <motion.div
              key="FAQ"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <FaqTab 
                locale={locale} 
                faqs={faqs} 
                attractions={attractions} 
                onGoToSupport={() => setActiveTab('SUPPORT')} 
              />
            </motion.div>
          )}

          {activeTab === 'SUPPORT' && (
            <motion.div
              key="SUPPORT"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SupportForm locale={locale} attractions={attractions} />
            </motion.div>
          )}

          {activeTab === 'FEEDBACK' && (
            <motion.div
              key="FEEDBACK"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <FeedbackForm locale={locale} attractions={attractions} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  )
}
