"use client"

import { motion } from "framer-motion"

interface ProcessTimelineProps {
  locale: string
}

export function ProcessTimeline({ locale }: ProcessTimelineProps) {
  const isRTL = locale === 'ar'

  const steps = [
    {
      id: "01",
      titleEn: "Discovery",
      titleAr: "الاستكشاف",
      descEn: "We align on vision, technical constraints, and desired impact.",
      descAr: "ننسق الرؤية، القيود الفنية، والتأثير المنشود."
    },
    {
      id: "02",
      titleEn: "Design",
      titleAr: "التصميم",
      descEn: "Translating concepts into engineered blueprints and 3D pre-visualizations.",
      descAr: "ترجمة المفاهيم إلى مخططات هندسية وتصورات ثلاثية الأبعاد."
    },
    {
      id: "03",
      titleEn: "Engineering",
      titleAr: "الهندسة",
      descEn: "Fabrication, software development, and technical integration.",
      descAr: "التصنيع، تطوير البرمجيات، والتكامل الفني."
    },
    {
      id: "04",
      titleEn: "Deployment",
      titleAr: "النشر والتركيب",
      descEn: "On-site installation, rigorous testing, and safety sign-offs.",
      descAr: "التركيب في الموقع، الاختبار الصارم، واعتمادات السلامة."
    },
    {
      id: "05",
      titleEn: "Support",
      titleAr: "الدعم",
      descEn: "Live operations monitoring and post-event teardown.",
      descAr: "مراقبة العمليات الحية والتفكيك بعد الفعالية."
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  }

  return (
    <div className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-4">
            {locale === 'ar' ? 'آلية العمل' : 'How We Work'}
          </h2>
          <p className="text-xl text-[var(--text-secondary)]">
            {locale === 'ar' ? 'من الفكرة إلى الواقع، بهندسة دقيقة.' : 'From concept to reality, engineered with precision.'}
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
          <div className="hidden md:block absolute top-[40px] start-[10%] end-[10%] h-1 bg-[var(--surface-hover)] z-0 rounded-full overflow-hidden">
            <motion.div 
              variants={lineVariants as any}
              className={`h-full bg-gradient-to-r ${isRTL ? 'from-[var(--color-accent)] to-[var(--color-primary)]' : 'from-[var(--color-primary)] to-[var(--color-accent)]'}`}
              style={{ originX: isRTL ? 1 : 0 }}
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between relative z-10 gap-12 md:gap-4">
            {steps.map((step, index) => (
              <motion.div 
                key={step.id} 
                variants={itemVariants as any}
                className="flex-1 flex flex-col md:items-center text-start md:text-center relative group"
              >
                {/* Mobile vertical line connector */}
                {index !== steps.length - 1 && (
                  <div className={`md:hidden absolute top-[80px] bottom-[-48px] w-[2px] bg-[var(--surface-hover)] ${isRTL ? 'end-[39px]' : 'start-[39px]'}`} />
                )}

                <div className="flex items-center gap-6 md:gap-0 md:flex-col">
                  {/* Number Bubble */}
                  <div className="w-20 h-20 rounded-full bg-[var(--surface-default)] border-4 border-[var(--surface-hover)] flex items-center justify-center font-black text-2xl text-[var(--text-tertiary)] group-hover:border-[var(--color-primary)]/30 group-hover:text-[var(--color-primary)] transition-colors shadow-sm mb-0 md:mb-6 z-10 relative">
                    {step.id}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                      {locale === 'ar' ? step.titleAr : step.titleEn}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {locale === 'ar' ? step.descAr : step.descEn}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
      </div>
    </div>
  )
}
