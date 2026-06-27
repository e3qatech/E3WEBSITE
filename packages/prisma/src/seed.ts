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
