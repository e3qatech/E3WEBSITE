import { Metadata } from "next"
import { Download, MapPin, Phone, Mail, MessageCircle } from "lucide-react"

import { MultiStepLeadForm } from "@/components/b2b/contact/MultiStepLeadForm"
import { PartnerMarquee } from "@/components/b2b/contact/PartnerMarquee"
import { FAQAccordion } from "@/components/b2b/contact/FAQAccordion"
import { MeetingBookingForm } from "@/components/shared/MeetingBookingForm"
import { Button } from "@/components/ui/Button"

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: params.locale === 'ar' ? 'تواصل معنا | E3 Qatar' : 'Contact Us | E3 Qatar',
  }
}

export default async function B2BContactPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const isRTL = locale === 'ar'

  // MOCK DATA
  const companyProfile = {
    pdfUrl: "/e3-company-profile.pdf",
    stats: [
      { label: { en: "Years Excellence", ar: "سنوات من التميز" }, value: "15+" },
      { label: { en: "Global Projects", ar: "مشاريع عالمية" }, value: "200+" },
      { label: { en: "Engineering Experts", ar: "خبراء هندسة" }, value: "50+" },
    ]
  }

  const partnerLogos = [
    "https://upload.wikimedia.org/wikipedia/commons/2/25/Qatar_Tourism_Logo.svg",
    "https://upload.wikimedia.org/wikipedia/en/thumb/e/ee/Qatar_Airways_Logo.svg/1200px-Qatar_Airways_Logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/2/25/Qatar_Tourism_Logo.svg",
    "https://upload.wikimedia.org/wikipedia/en/thumb/e/ee/Qatar_Airways_Logo.svg/1200px-Qatar_Airways_Logo.svg.png",
  ]

  const activeServices = [
    { id: "event-engineering", name: { en: "Event Engineering", ar: "هندسة الفعاليات" } },
    { id: "av-production", name: { en: "A/V Production", ar: "الإنتاج السمعي والبصري" } },
    { id: "crowd-management", name: { en: "Crowd Management", ar: "إدارة الحشود" } },
    { id: "stage-design", name: { en: "Stage Design", ar: "تصميم المسارح" } },
  ]

  const faqs = [
    {
      id: "1",
      question: { en: "What is the typical timeline for an event build?", ar: "ما هو الإطار الزمني المعتاد لتجهيز الفعالية؟" },
      answer: { en: "Timelines vary drastically by scale. Small activations can be engineered and deployed in 2-3 weeks, while major festival infrastructure typically requires 3-6 months of lead time for engineering approvals and logistics.", ar: "تختلف الجداول الزمنية باختلاف حجم المشروع." }
    },
    {
      id: "2",
      question: { en: "Do you provide safety certifications?", ar: "هل تقدمون شهادات السلامة؟" },
      answer: { en: "Yes. Every structural deployment comes with full engineering sign-offs and local municipality compliance certificates.", ar: "نعم، جميع الهياكل تأتي مع اعتمادات هندسية." }
    },
    {
      id: "3",
      question: { en: "Can we hire specific equipment without full service?", ar: "هل يمكننا استئجار معدات معينة بدون خدمة كاملة؟" },
      answer: { en: "E3 primarily operates as an end-to-end partner to guarantee the 'Wow' factor. However, we do offer dry hire of specialized AV equipment to vetted partners.", ar: "نحن نفضل العمل كشريك متكامل، لكن نقدم خدمات تأجير لبعض الشركاء المعتمدين." }
    }
  ]

  return (
    <main className="bg-[var(--surface-default)] min-h-screen pt-32">
      
      {/* 1. HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] mb-6 max-w-4xl leading-tight">
          {locale === 'ar' ? 'لنبنِ شيئاً استثنائياً.' : 'Let\'s Build Something Extraordinary.'}
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl">
          {locale === 'ar' 
            ? 'سواء كنت تخطط لحدث عالمي أو تركيبات تفاعلية، فريقنا الهندسي جاهز للتحدي.' 
            : 'Whether you\'re planning a global summit or a complex immersive installation, our engineering and creative teams are ready.'}
        </p>
      </section>

      {/* 2. COMPANY PROFILE STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full lg:w-2/3">
            {companyProfile.stats.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-2">
                  {stat.value}
                </span>
                <span className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {(stat.label as any)[locale] || stat.label.en}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-1/3 shrink-0">
            <Button size="xl" asChild className="w-full gap-3">
              <a href={companyProfile.pdfUrl} download>
                <Download className="w-5 h-5" />
                {locale === 'ar' ? 'تحميل ملف الشركة' : 'Download Company Profile'}
              </a>
            </Button>
          </div>

        </div>
      </section>

      {/* 3. PARTNERS */}
      <PartnerMarquee logos={partnerLogos} />

      {/* 4. MAIN CONTENT GRID (Form & Details) */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--surface-hover)] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left: Lead Form */}
            <div className="lg:col-span-7">
              <h2 className="text-3xl font-black text-[var(--text-primary)] mb-8">
                {locale === 'ar' ? 'ابدأ مشروعك' : 'Start a Project'}
              </h2>
              <MultiStepLeadForm locale={locale} services={activeServices} />
            </div>

            {/* Right: Contact Details & Scheduler */}
            <div className="lg:col-span-5 space-y-12">
              
              {/* Direct Contact Details */}
              <div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                  {locale === 'ar' ? 'تواصل مباشرة' : 'Direct Contact'}
                </h3>
                <div className="space-y-6">
                  <a href="tel:+97444000000" className="flex items-center gap-4 p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-default)] hover:border-[var(--color-primary)] transition-colors group">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">
                        {locale === 'ar' ? 'الهاتف' : 'Phone'}
                      </p>
                      <p className="font-bold text-[var(--text-primary)]" dir="ltr">+974 4400 0000</p>
                    </div>
                  </a>

                  <a href="mailto:hello@e3qatar.com" className="flex items-center gap-4 p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-default)] hover:border-[var(--color-primary)] transition-colors group">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">
                        {locale === 'ar' ? 'البريد' : 'Email'}
                      </p>
                      <p className="font-bold text-[var(--text-primary)]">hello@e3qatar.com</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-default)]">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-secondary)]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-bold mb-1">
                        {locale === 'ar' ? 'المكتب الرئيسي' : 'Headquarters'}
                      </p>
                      <p className="text-[var(--text-secondary)] font-medium leading-relaxed">
                        Lusail Boulevard, Building 45<br/>
                        Doha, Qatar<br/>
                        PO Box 12345
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inline Scheduler */}
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                  {locale === 'ar' ? 'حجز اجتماع سريع' : 'Book a Quick Meeting'}
                </h3>
                <MeetingBookingForm locale={locale} />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="py-24 border-t border-[var(--border-default)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-12 text-center">
            {locale === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h2>
          <FAQAccordion items={faqs} locale={locale} />
        </div>
      </section>

    </main>
  )
}
