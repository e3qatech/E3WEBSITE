import { PrismaClient, RoleType, LeadStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { seedServices } from './seed-services'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Credentials & Access Controls
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('supersecret', saltRounds)
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@e3.qa' },
    update: {},
    create: {
      email: 'admin@e3.qa',
      name: 'Super Admin',
      password: adminPassword,
      role: RoleType.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  })
  console.log('Created Super Admin:', superAdmin.email)

  // 2. Organizational Hierarchy (Team Members)
  const chairman = await prisma.employeeProfile.create({
    data: {
      slug: 'abdullah-al-kubaisi',
      firstName: 'Abdullah',
      lastName: 'Al Kubaisi',
      firstNameAr: 'عبدالله',
      lastNameAr: 'الكبيسي',
      designation: 'Chairman',
      designationAr: 'رئيس مجلس الإدارة',
      department: 'Executive',
      yearsOfExperience: 20,
      tagline: 'Leading the future of events',
      aboutSummary: 'Visionary leader behind E3.',
      aboutSummaryAr: 'القائد المتبصر وراء E3.',
      careerJourney: '20+ years in the industry.',
      keyStrengths: 'Leadership, Vision, Strategy',
      expertiseTags: [],
      coreCompetencies: [],
      experience: [],
      projects: [],
      certifications: [],
      education: [],
      awards: [],
      skillsMatrix: [],
      mediaGallery: [],
      testimonials: [],
      order: 1,
    }
  })

  const gm = await prisma.employeeProfile.create({
    data: {
      slug: 'mohammad-ali-awada',
      firstName: 'Mohammad Ali',
      lastName: 'Awada',
      firstNameAr: 'محمد علي',
      lastNameAr: 'عواضة',
      designation: 'General Manager',
      designationAr: 'المدير العام',
      department: 'Executive',
      yearsOfExperience: 15,
      tagline: 'Driving operational excellence',
      aboutSummary: 'Expert in large-scale event operations.',
      aboutSummaryAr: 'خبير في عمليات الفعاليات واسعة النطاق.',
      careerJourney: '15+ years in large scale events.',
      keyStrengths: 'Operations, Management, Logistics',
      expertiseTags: [],
      coreCompetencies: [],
      experience: [],
      projects: [],
      certifications: [],
      education: [],
      awards: [],
      skillsMatrix: [],
      mediaGallery: [],
      testimonials: [],
      order: 2,
    }
  })
  console.log('Created Organizational Hierarchy.')

  // 3. Attraction Profiles (B2C)
  const inflataPark = await prisma.attraction.upsert({
    where: { slug: 'inflatapark-doha-mall' },
    update: {},
    create: {
      slug: 'inflatapark-doha-mall',
      nameEn: 'InflataPark FEC',
      nameAr: 'حديقة الألعاب المطاطية',
      descriptionEn: 'InflataPark FEC (Doha Mall, 3rd Floor) containing signature sub-zones: Bazooka Ball, InflataKidz, and the Grab n Win wall.',
      descriptionAr: 'حديقة الألعاب المطاطية في دوحة مول، الطابق الثالث.',
      coordinates: { lat: 25.2415, lng: 51.5385, location: 'Doha Mall, 3rd Floor' },
      heroMediaType: 'IMAGE',
      heroMediaUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      features: [
        {
          icon: 'UsersThree',
          title: 'Family Friendly',
          description: 'Fun for all ages with dedicated zones for toddlers to adults.'
        },
        {
          icon: 'PersonSimpleRun',
          title: 'Bazooka Ball',
          description: 'A signature high-energy combat zone.'
        },
        {
          icon: 'Baby',
          title: 'InflataKidz',
          description: 'Safe, soft, and bouncy environment for the little ones.'
        },
        {
          icon: 'HandGrab',
          title: 'Grab n Win',
          description: 'Interactive wall with exciting prizes.'
        }
      ],
      temporalRules: {
        create: [
          {
            ruleType: 'RECURRING',
            openTime: '10:00',
            closeTime: '22:00',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
            notes: 'Standard opening hours',
          }
        ]
      },
      isPublished: true,
      isFeatured: true,
    }
  })
  console.log('Created Attraction:', inflataPark.nameEn)

  // 4. B2B Services & Proofs
  await seedServices(prisma)
  console.log('Created Services.')

  // Doha Balloon Parade Case Study
  const balloonParade = await prisma.caseStudy.upsert({
    where: { slug: 'doha-balloon-parade' },
    update: {},
    create: {
      slug: 'doha-balloon-parade',
      titleEn: 'Doha Balloon Parade',
      titleAr: 'موكب بالونات الدوحة',
      challengeEn: 'Managing Qatar\'s first large-scale giant balloon parade in an urban environment.',
      challengeAr: 'إدارة أول موكب بالونات عملاقة في بيئة حضرية في قطر.',
      solutionEn: 'Implemented advanced logistical routing, crowd control barriers, and strict wind-monitoring telemetry.',
      solutionAr: 'تطبيق التوجيه اللوجستي المتقدم، وحواجز التحكم في الحشود، ومراقبة دقيقة للرياح.',
      metrics: {
        visitors: 760000,
        staff: 2500,
        balloons: 50,
      },
      isPublished: true,
    }
  })
  console.log('Created Case Study:', balloonParade.titleEn)

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
