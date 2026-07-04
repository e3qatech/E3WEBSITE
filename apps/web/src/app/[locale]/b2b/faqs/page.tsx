import React from 'react'
import { db } from "@/lib/db"
import { UniversalMediaRenderer } from '@/components/shared/UniversalMediaRenderer'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/Accordion'

export const dynamic = 'force-dynamic'

export default async function B2BFAQsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar'

  const pageData = await db.pages.findUnique({
    where: { slug: 'b2b-faqs' }
  })

  const content = pageData?.content as any || {}

  const headerTitle = isAr ? (content?.header?.titleAr || "الأسئلة الشائعة") : (content?.header?.titleEn || "Frequently Asked Questions");
  const headerSubtitle = isAr ? (content?.header?.subtitleAr || "اعثر على إجابات للأسئلة المتداولة.") : (content?.header?.subtitleEn || "Find answers to commonly asked questions.");
  const mediaType = content?.header?.mediaType || "IMAGE";
  const mediaUrl = content?.header?.mediaUrl || "";

  const faqs = Array.isArray(content.items) && content.items.length > 0 ? content.items : [
    {
      questionEn: "How do I start a project with E3?",
      questionAr: "كيف أبدأ مشروعاً مع إي ثري؟",
      answerEn: "You can start by reaching out through our contact page or booking a consultation with our B2B team.",
      answerAr: "يمكنك البدء بالتواصل معنا عبر صفحة الاتصال أو حجز استشارة مع فريقنا للشركات."
    },
    {
      questionEn: "What industries do you serve?",
      questionAr: "ما هي القطاعات التي تخدمونها؟",
      answerEn: "We serve a wide range of industries including entertainment, corporate events, government sectors, and hospitality.",
      answerAr: "نحن نخدم مجموعة واسعة من القطاعات بما في ذلك الترفيه، فعاليات الشركات، القطاعات الحكومية، والضيافة."
    }
  ]

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Header Section */}
      <section className="relative w-full h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {mediaUrl && (
          <div className="absolute inset-0 z-0">
            <UniversalMediaRenderer src={mediaUrl} type={mediaType} className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          </div>
        )}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase mb-6">
            {headerTitle}
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
            {headerSubtitle}
          </p>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq: any, index: number) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-xl px-6"
              >
                <AccordionTrigger className="text-lg font-medium text-zinc-100 hover:text-white py-6">
                  {isAr ? faq.questionAr : faq.questionEn}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 pb-6 leading-relaxed">
                  {isAr ? faq.answerAr : faq.answerEn}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      
    </div>
  )
}
