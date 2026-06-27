"use client"

import { motion } from "framer-motion"

export interface ProcessStep {
  id: string
  title: Record<string, string>
  description: Record<string, string>
}

interface ServiceProcessProps {
  steps: ProcessStep[]
  locale: string
}

export function ServiceProcess({ steps, locale }: ServiceProcessProps) {
  const isRTL = locale === 'ar'

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  }

  const lineVariants = {
    hidden: { width: "0%" },
    show: { 
      width: "100%", 
      transition: { duration: 1.5, ease: "easeInOut" } 
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  }

  if (!steps || steps.length === 0) return null

  return (
    <section className="py-24 bg-[var(--surface-hover)] border-y border-[var(--border-default)] overflow-hidden" id="process">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-4">
            {locale === 'ar' ? 'كيف نقوم بذلك' : 'How We Do It'}
          </h2>
          <p className="text-xl text-[var(--text-secondary)]">
            {locale === 'ar' ? 'الشفافية الفنية والهندسية في كل خطوة.' : 'Technical transparency at every step.'}
          </p>
        </div>

        <motion.div 
          variants={containerVariants as any}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="relative"
        >
          {/* Background Line (Desktop) */}
          <div className="hidden md:block absolute top-[28px] start-[10%] end-[10%] h-1 bg-[var(--surface-default)] z-0 rounded-full overflow-hidden">
            <motion.div 
              variants={lineVariants as any}
              className={`h-full bg-gradient-to-r ${isRTL ? 'from-[var(--color-accent)] to-[var(--color-primary)]' : 'from-[var(--color-primary)] to-[var(--color-accent)]'}`}
              style={{ originX: isRTL ? 1 : 0 }}
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between relative z-10 gap-12 md:gap-8">
            {steps.map((step, index) => {
              const num = (index + 1).toString().padStart(2, '0')
              return (
                <motion.div 
                  key={step.id} 
                  variants={itemVariants as any}
                  className="flex-1 flex flex-col md:items-center text-start md:text-center relative group"
                >
                  {/* Mobile vertical line connector */}
                  {index !== steps.length - 1 && (
                    <div className={`md:hidden absolute top-[60px] bottom-[-48px] w-[2px] bg-[var(--surface-default)] ${isRTL ? 'end-[27px]' : 'start-[27px]'}`} />
                  )}

                  <div className="flex items-center gap-6 md:gap-0 md:flex-col">
                    {/* Number Bubble */}
                    <div className="w-14 h-14 rounded-full bg-[var(--surface-default)] border-2 border-[var(--border-default)] flex items-center justify-center font-black text-xl text-[var(--text-tertiary)] group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all shadow-sm mb-0 md:mb-6 z-10 relative">
                      {num}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        {step.title[locale] || step.title.en}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {step.description[locale] || step.description.en}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
        
      </div>
    </section>
  )
}
