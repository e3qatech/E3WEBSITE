"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Phone, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MeetingBookingModal } from "./MeetingBookingModal"

type CTAType = 'CONTACT' | 'LEARN_MORE' | 'BOOK_APPOINTMENT'

interface DynamicCTAProps {
  type: CTAType
  serviceSlug: string
  locale: string
}

export function DynamicCTA({ type, serviceSlug, locale }: DynamicCTAProps) {
  const isRTL = locale === 'ar'
  const [isModalOpen, setIsModalOpen] = useState(false)

  const renderPrimaryAction = () => {
    switch (type) {
      case 'BOOK_APPOINTMENT':
        return (
          <Button size="xl" onClick={() => setIsModalOpen(true)}>
            {locale === 'ar' ? 'حجز موعد استشارة' : 'Book a Consultation'}
          </Button>
        )
      case 'LEARN_MORE':
        return (
          <Button size="xl" asChild>
            <a href="#description">
              {locale === 'ar' ? 'اكتشف المزيد' : 'Learn More'}
            </a>
          </Button>
        )
      case 'CONTACT':
      default:
        return (
          <Button size="xl" asChild>
            <Link href={`/${locale}/b2b/contact?service=${serviceSlug}`}>
              {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </Link>
          </Button>
        )
    }
  }

  return (
    <section className="relative overflow-hidden bg-[var(--surface-hover)] pt-32 pb-24 border-t border-[var(--border-default)]">
      
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -end-40 w-96 h-96 bg-[var(--color-primary)]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 start-0 w-[500px] h-[500px] bg-[var(--color-accent)]/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-[var(--surface-default)]/60 backdrop-blur-md p-8 md:p-16 rounded-[3rem] border border-[var(--border-default)]">
          
          <div className="max-w-2xl text-center md:text-start">
            <h2 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] mb-6">
              {locale === 'ar' ? 'لنجعل المستحيل ممكناً.' : 'Let\'s make the impossible happen.'}
            </h2>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
              {locale === 'ar' 
                ? 'تواصل مع فريقنا الهندسي لمناقشة متطلبات مشروعك القادم.' 
                : 'Connect with our engineering team to discuss the requirements for your next major deployment.'}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              {renderPrimaryAction()}
              
              {/* Optional Secondary Direct Contact */}
              {type !== 'CONTACT' && (
                <Button size="xl" variant="outline" asChild className="bg-transparent">
                  <Link href={`/${locale}/b2b/contact?service=${serviceSlug}`}>
                    {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 w-full md:w-auto min-w-[250px]">
            <a href="tel:+97444000000" className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-default)] hover:border-[var(--color-primary)] transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">
                  {locale === 'ar' ? 'اتصل بنا' : 'Call Us'}
                </p>
                <p className="font-bold text-[var(--text-primary)]" dir="ltr">+974 4400 0000</p>
              </div>
            </a>

            <a href="mailto:sales@e3qatar.com" className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-default)] hover:border-[var(--color-primary)] transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">
                  {locale === 'ar' ? 'راسلنا' : 'Email Us'}
                </p>
                <p className="font-bold text-[var(--text-primary)]">sales@e3qatar.com</p>
              </div>
            </a>
          </div>

        </div>
      </div>

      <MeetingBookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        locale={locale} 
        serviceSlug={serviceSlug}
      />
    </section>
  )
}
