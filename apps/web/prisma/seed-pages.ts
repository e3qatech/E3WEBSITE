import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const pagesData = [
    {
      slug: 'b2b-home',
      title: { en: 'B2B Homepage', ar: 'الصفحة الرئيسية للشركات' },
      content: {
        hero: {
          mediaUrl: '/assets/images/placeholder-hero.jpg',
          headlineEn: 'Engineering Landmark Experiences',
          headlineAr: 'هندسة تجارب تاريخية',
          subtitleEn: 'We turn ambitious creative visions into flawless operational reality.',
          subtitleAr: 'نحول الرؤى الإبداعية الطموحة إلى واقع تشغيلي لا تشوبه شائبة.',
          descriptionEn: 'E3 is the MENA region\'s premier event engineering and technical production partner.',
          descriptionAr: 'اي ثري هي الشريك الأول لهندسة الفعاليات والإنتاج الفني في منطقة الشرق الأوسط وشمال أفريقيا.',
          primaryCtaEn: 'View Capabilities',
          primaryCtaAr: 'عرض القدرات',
          secondaryCtaEn: 'Contact Us',
          secondaryCtaAr: 'اتصل بنا'
        },
        stats: [
          { value: '50+', labelEn: 'Years Combined Experience', labelAr: 'سنوات من الخبرة المشتركة' },
          { value: '2M+', labelEn: 'Attendees Managed', labelAr: 'حضور تمت إدارتهم' },
          { value: '120+', labelEn: 'Technical Specialists', labelAr: 'متخصصين فنيين' },
          { value: '0', labelEn: 'Compromises on Safety', labelAr: 'مساومات على السلامة' }
        ],
        wowAndHow: {
          titleEn: 'The Wow and The How',
          titleAr: 'الابهار وكيفية التنفيذ',
          descriptionEn: 'Our philosophy balances creative ambition (The Wow) with structural and operational reality (The How).',
          descriptionAr: 'توازن فلسفتنا بين الطموح الإبداعي والواقع الهيكلي والتشغيلي.',
          pointsEn: [
            'End-to-End Technical Production',
            'Immersive & XR Technologies',
            'Crowd Dynamics & Safety'
          ],
          pointsAr: [
            'إنتاج فني شامل',
            'التقنيات الغامرة',
            'ديناميكيات الحشود والسلامة'
          ]
        }
      }
    },
    {
      slug: 'b2b-about',
      title: { en: 'B2B About Us', ar: 'عنا للشركات' },
      content: {
        header: {
          titleEn: 'We are E3.',
          titleAr: 'نحن اي ثري.',
          subtitleEn: 'Event Engineering Experts. We turn ambitious creative visions into flawless operational reality.',
          subtitleAr: 'خبراء هندسة الفعاليات. نحول الرؤى الإبداعية الطموحة إلى واقع تشغيلي لا تشوبه شائبة.'
        },
        story: {
          titleEn: 'Our Story',
          titleAr: 'قصتنا',
          contentEn: 'E3 was founded in Doha with a simple premise: the region\'s rapidly growing events sector needed a partner that understood both the creative ambition of mega-events and the hard engineering required to deliver them.',
          contentAr: 'تأسست اي ثري في الدوحة بفرضية بسيطة: قطاع الفعاليات سريع النمو في المنطقة يحتاج إلى شريك يفهم الطموح الإبداعي للفعاليات الضخمة والهندسة الصعبة اللازمة لتقديمها.',
          imageMediaId: null
        },
        values: [
          { titleEn: 'Engineering Precision', titleAr: 'الدقة الهندسية', descEn: 'No detail is too small, no safety margin too tight.', descAr: 'لا توجد تفصيلة صغيرة جدًا، ولا هامش أمان ضيق جدًا.' },
          { titleEn: 'Operational Excellence', titleAr: 'التميز التشغيلي', descEn: 'We take extreme ownership of the live operation.', descAr: 'نأخذ ملكية كاملة للعملية المباشرة.' }
        ]
      }
    },
    {
      slug: 'b2b-contact',
      title: { en: 'B2B Contact', ar: 'اتصل بنا' },
      content: {
        header: {
          titleEn: 'Start a Project.',
          titleAr: 'ابدأ مشروعاً.',
          subtitleEn: 'Whether you have a fully drafted RFP or just a preliminary concept, our team is ready to engineer a solution.',
          subtitleAr: 'سواء كان لديك طلب تقديم عروض صياغة كاملة أو مجرد مفهوم أولي، فإن فريقنا مستعد لهندسة حل.'
        },
        inquiries: {
          business: 'business@e3.qa',
          careers: 'careers@e3.qa',
          phone: '+974 4444 4444'
        },
        headquarters: {
          addressEn: 'Palm Tower B, Floor 22\nWest Bay, Doha\nState of Qatar',
          addressAr: 'برج النخلة ب، الطابق 22\nالخليج الغربي، الدوحة\nدولة قطر'
        }
      }
    },
    {
      slug: 'b2c-landing',
      title: { en: 'B2C Landing Page', ar: 'الصفحة الرئيسية للمستهلكين' },
      content: {
        hero: {
          mediaType: 'IMAGE',
          mediaUrl: null,
          headerEn: 'Discover Experiences',
          headerAr: 'اكتشف التجارب',
          subHeaderEn: 'Explore Qatar\'s most exciting attractions, powered by real-time telemetry and industrial precision.',
          subHeaderAr: 'استكشف أروع مناطق الجذب في قطر.',
          showSearch: true
        },
        featuredTitleEn: 'Featured Attractions',
        featuredTitleAr: 'مناطق الجذب المميزة',
        gridTitleEn: 'All Experiences',
        gridTitleAr: 'جميع التجارب',
        subscribe: {
          titleEn: 'Never Miss the Fun!',
          titleAr: 'لا تفوت المرح!',
          subtitleEn: 'Subscribe to get exclusive access to early-bird tickets and announcements.',
          subtitleAr: 'اشترك للحصول على وصول حصري.'
        },
        cta: {
          titleEn: 'Have a question?',
          titleAr: 'هل لديك سؤال؟',
          buttonTextEn: 'Contact Us',
          buttonTextAr: 'اتصل بنا',
          buttonUrl: '/contact'
        },
        careersCta: {
          titleEn: 'Join Our Team',
          titleAr: 'انضم لفريقنا',
          subtitleEn: 'We\'re always looking for talented individuals to join our crew.',
          subtitleAr: 'نحن نبحث دائماً عن الموهوبين.',
          buttonTextEn: 'View Careers',
          buttonTextAr: 'عرض الوظائف',
          buttonUrl: '/careers'
        },
        faqs: []
      }
    },
    {
      slug: 'b2c-discover',
      title: { en: 'B2C Discover Page', ar: 'صفحة اكتشف للمستهلكين' },
      content: {
        hero: {
          titleEn: 'Discover the Magic',
          titleAr: 'اكتشف السحر',
          subtitleEn: 'We build worlds for you to explore.',
          subtitleAr: 'نحن نبني عوالم لتستكشفها.',
          mediaType: 'IMAGE',
          mediaUrl: null
        },
        heritage: {
          titleEn: 'Our Heritage',
          titleAr: 'تراثنا',
          descriptionEn: 'Rooted in Qatar, built for the world.',
          descriptionAr: 'متجذر في قطر، مبني للعالم.',
          visionEn: 'To be the global leader in immersive entertainment.',
          visionAr: 'أن نكون الرائد العالمي في الترفيه الغامر.',
          missionEn: 'We deliver unforgettable experiences.',
          missionAr: 'نحن نقدم تجارب لا تُنسى.',
          valuesEn: 'Safety, Innovation, Excellence.',
          valuesAr: 'السلامة، الابتكار، التميز.'
        }
      }
    }
  ]

  for (const page of pagesData) {
    const existing = await prisma.pages.findUnique({ where: { slug: page.slug } });
    if (!existing) {
      await prisma.pages.create({
        data: {
          slug: page.slug,
          title: page.title,
          content: page.content,
          seo: { title: page.title }
        }
      })
    }
  }
  console.log(`Created CMS Pages`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
