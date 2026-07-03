import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // 1. Create Media (Placeholder for testing)
  const logo = await prisma.media.create({
    data: {
      url: '/assets/images/placeholder-logo.png',
      type: 'IMAGE',
      mimeType: 'image/png',
      size: 1024,
      alt: { en: 'Logo', ar: 'شعار' },
    }
  })

  const heroImage = await prisma.media.create({
    data: {
      url: '/assets/images/placeholder-hero.jpg',
      type: 'IMAGE',
      mimeType: 'image/jpeg',
      size: 2048,
      alt: { en: 'Hero Image', ar: 'صورة البطل' },
    }
  })

  const profilePic = await prisma.media.create({
    data: {
      url: '/assets/images/placeholder-profile.jpg',
      type: 'IMAGE',
      mimeType: 'image/jpeg',
      size: 512,
      alt: { en: 'Profile Picture', ar: 'صورة الملف الشخصي' },
    }
  })

  // 2. Super Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.users.upsert({
    where: { email: 'admin@e3qatar.com' },
    update: {},
    create: {
      email: 'admin@e3qatar.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: new Date(),
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Admin',
          preferredLanguage: 'EN',
          preferredTheme: 'DARK',
          timezone: 'Asia/Qatar',
        }
      }
    },
  })
  console.log(`Created admin user: ${adminUser.email}`)

  // 3. Site Settings
  await prisma.siteSettings.upsert({
    where: { key: 'site_name' },
    update: {},
    create: {
      key: 'site_name',
      value: { en: 'E3 Qatar', ar: 'اي ثري قطر' },
      group: 'GENERAL',
    }
  })
  
  await prisma.siteSettings.upsert({
    where: { key: 'brand_colors' },
    update: {},
    create: {
      key: 'brand_colors',
      value: { primary: '#0066FF', secondary: '#FF6B35', accent: '#00D4AA' },
      group: 'UI',
    }
  })

  await prisma.siteSettings.upsert({
    where: { key: 'social_links' },
    update: {},
    create: {
      key: 'social_links',
      value: { instagram: 'https://instagram.com/e3qatar', linkedin: 'https://linkedin.com/company/e3qatar' },
      group: 'SOCIAL',
    }
  })

  // 3.5 CMS Pages
  const pagesData = [
    {
      slug: 'b2b-home',
      title: 'B2B Homepage',
      content: {
        hero: {
          mediaUrl: heroImage.id,
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
      title: 'B2B About Us',
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
          imageMediaId: heroImage.id
        },
        values: [
          { titleEn: 'Engineering Precision', titleAr: 'الدقة الهندسية', descEn: 'No detail is too small, no safety margin too tight.', descAr: 'لا توجد تفصيلة صغيرة جدًا، ولا هامش أمان ضيق جدًا.' },
          { titleEn: 'Operational Excellence', titleAr: 'التميز التشغيلي', descEn: 'We take extreme ownership of the live operation.', descAr: 'نأخذ ملكية كاملة للعملية المباشرة.' }
        ]
      }
    },
    {
      slug: 'b2b-contact',
      title: 'B2B Contact',
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
      title: 'B2C Landing Page',
      content: {
        hero: {
          mediaType: 'IMAGE',
          mediaUrl: heroImage.id,
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
      title: 'B2C Discover Page',
      content: {
        hero: {
          titleEn: 'Discover the Magic',
          titleAr: 'اكتشف السحر',
          subtitleEn: 'We build worlds for you to explore.',
          subtitleAr: 'نحن نبني عوالم لتستكشفها.',
          mediaType: 'IMAGE',
          mediaUrl: heroImage.id
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
    await prisma.pages.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        slug: page.slug,
        title: page.title,
        content: page.content,
        seo: { title: page.title }
      }
    })
  }
  console.log(`Created CMS Pages`)

  // 4. Sample Services (2 items)
  const service1 = await prisma.services.upsert({
    where: { slug: 'corporate-events' },
    update: {},
    create: {
      slug: 'corporate-events',
      name: { en: 'Corporate Events', ar: 'فعاليات الشركات' },
      description: { en: 'Full-service corporate event planning and execution.', ar: 'تخطيط وتنفيذ فعاليات الشركات بخدمة كاملة.' },
      process: [{ title: 'Strategy', desc: 'Planning phase' }, { title: 'Execution', desc: 'Live event' }],
      heroMediaType: 'IMAGE',
      heroMediaId: heroImage.id,
      isVisible: true,
      isFeatured: true,
    }
  })

  const service2 = await prisma.services.upsert({
    where: { slug: 'brand-activations' },
    update: {},
    create: {
      slug: 'brand-activations',
      name: { en: 'Brand Activations', ar: 'تنشيط العلامة التجارية' },
      description: { en: 'Immersive brand experiences that captivate audiences.', ar: 'تجارب غامرة للعلامة التجارية تجذب الجماهير.' },
      heroMediaType: 'IMAGE',
      heroMediaId: heroImage.id,
      isVisible: true,
      isFeatured: false,
    }
  })
  console.log(`Created 2 services`)

  // 5. Sample Attraction
  const attraction = await prisma.attractions.upsert({
    where: { slug: 'e3-wonderland' },
    update: {},
    create: {
      slug: 'e3-wonderland',
      name: { en: 'E3 Wonderland', ar: 'إي ثري وندرلاند' },
      tagline: { en: 'A magical journey for all ages.', ar: 'رحلة سحرية لجميع الأعمار.' },
      description: { en: 'Experience the magic of E3 Wonderland. A fully immersive theme park.', ar: 'جرب سحر إي ثري وندرلاند. مدينة ترفيهية غامرة بالكامل.' },
      heroMediaType: 'IMAGE',
      heroMediaId: heroImage.id,
      locationAddress: { en: 'Lusail Boulevard, Doha', ar: 'درب لوسيل، الدوحة' },
      latitude: 25.4093,
      longitude: 51.4984,
      isVisible: true,
      isFeatured: true,
      status: 'ACTIVE',
      // Operations (Live Status)
      operations: {
        create: {
          defaultOpenTime: '10:00',
          defaultCloseTime: '22:00',
          maxCapacity: 5000,
          currentOccupancy: 1200,
          averageVisitDuration: 180,
        }
      },
      // Pricing
      pricing: {
        createMany: {
          data: [
            { ticketType: { en: 'Adult Standard', ar: 'بالغ - قياسي' }, price: 150.00, ageGroup: 'ADULT' },
            { ticketType: { en: 'Child Standard', ar: 'طفل - قياسي' }, price: 75.00, ageGroup: 'CHILD' },
            { ticketType: { en: 'VIP Pass', ar: 'تذكرة كبار الشخصيات' }, price: 400.00, ageGroup: 'VIP' },
          ]
        }
      },
      // Temporal Rules
      temporalRules: {
        createMany: {
          data: [
            // Standard operating hours (recurring on Friday & Saturday: longer hours)
            { ruleType: 'OPERATING_HOURS', dayOfWeek: 5, openTime: '09:00', closeTime: '23:59', isRecurring: true },
            { ruleType: 'OPERATING_HOURS', dayOfWeek: 6, openTime: '09:00', closeTime: '23:59', isRecurring: true },
          ]
        }
      },
      // Social Links
      socialLinks: {
        create: {
          platform: 'INSTAGRAM',
          url: 'https://instagram.com/e3wonderland'
        }
      }
    }
  })
  console.log(`Created sample attraction`)

  // 6. Sample Team Member
  await prisma.teamMembers.upsert({
    where: { slug: 'ahmed-ceo' },
    update: {},
    create: {
      slug: 'ahmed-ceo',
      name: { en: 'Ahmed Al-Thani', ar: 'أحمد آل ثاني' },
      designation: { en: 'Chief Executive Officer', ar: 'الرئيس التنفيذي' },
      department: 'MANAGEMENT',
      bio: { en: 'Ahmed brings 20 years of entertainment experience.', ar: 'يجلب أحمد 20 عامًا من الخبرة في مجال الترفيه.' },
      photoId: profilePic.id,
      isPublished: true,
    }
  })
  console.log(`Created team member`)

  // 7. Sample Partners (3 items)
  const partnersData = [
    { name: 'Qatar Airways', category: 'SPONSOR', showOnWebsite: true },
    { name: 'Ooredoo', category: 'TECHNOLOGY', showOnWebsite: true },
    { name: 'Qatar Tourism', category: 'GOVERNMENT', showOnWebsite: true }
  ]

  for (const p of partnersData) {
    // Assuming Partners doesn't have a unique constraint on name in schema, we will just create them if none exist
    const existing = await prisma.partners.findFirst({ where: { name: p.name } })
    if (!existing) {
      await prisma.partners.create({
        data: {
          name: p.name,
          category: p.category as any, // casting to allow Prisma enum typing
          logoId: logo.id,
          showOnWebsite: p.showOnWebsite
        }
      })
    }
  }
  console.log(`Created 3 partners`)

  // 8. Sample Permissions (Basic setup for Super Admin and Sales)
  const adminPermissions = [
    { role: 'SUPER_ADMIN', resource: 'ALL', action: 'CREATE' },
    { role: 'SUPER_ADMIN', resource: 'ALL', action: 'READ' },
    { role: 'SUPER_ADMIN', resource: 'ALL', action: 'UPDATE' },
    { role: 'SUPER_ADMIN', resource: 'ALL', action: 'DELETE' },
    { role: 'SUPER_ADMIN', resource: 'ALL', action: 'PUBLISH' },
  ]

  for (const perm of adminPermissions) {
    await prisma.permissions.upsert({
      where: {
        role_resource_action: {
          role: perm.role as any,
          resource: perm.resource,
          action: perm.action as any,
        }
      },
      update: {},
      create: {
        role: perm.role as any,
        resource: perm.resource,
        action: perm.action as any,
      }
    })
  }
  console.log(`Created base permissions`)

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
