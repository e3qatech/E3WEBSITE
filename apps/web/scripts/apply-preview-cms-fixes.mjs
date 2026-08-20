import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load env
const envCandidates = [
  path.resolve(__dirname, '..', '.env.local'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '../..', '.env'),
  path.resolve(__dirname, '../../..', '.env'),
];

let dbUrl = '';
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      if (line.trim().startsWith('DATABASE_URL=')) {
        dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
        console.log(`Found DATABASE_URL in ${envPath}`);
        break;
      }
    }
  }
  if (dbUrl) break;
}

if (!dbUrl) {
  console.error('ERROR: No DATABASE_URL found!');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: dbUrl }
  }
});

const DEFAULT_SPATIAL_SECTIONS = [
  {
    id: "spatial-sec-01",
    slug: "cinematic-threshold",
    sectionNumber: "01",
    sortOrder: 0,
    visibility: true,
    eyebrowEn: "ACT 1 • THE THRESHOLD",
    eyebrowAr: "الفصل ١ • البوابة السينمائية",
    headingEn: "Step Into Pure Imagination",
    headingAr: "ادخل إلى عالم من الخيال اللامحدود",
    descriptionEn: "A multi-dimensional gateway bridging physical reality and high-octane experiential worlds across the Arabian Peninsula.",
    descriptionAr: "بوابة متعددة الأبعاد تربط بين الواقع وعوالم ترفيهية استثنائية في شبه الجزيرة العربية.",
    primaryCtaLabelEn: "Explore Attractions",
    primaryCtaLabelAr: "استكشف الوجهات",
    primaryCtaUrl: "/b2c#attractions",
    secondaryCtaLabelEn: "Watch Reel",
    secondaryCtaLabelAr: "شاهد العرض",
    secondaryCtaUrl: "/b2c#reel",
    mediaUrl: "/hero-bg.png",
    mediaType: "IMAGE",
    backgroundColor: "#050811",
    accentColor: "#f59e0b",
    haloColor: "#d97706",
    textAlignment: "CENTER",
    themeMode: "DARK"
  },
  {
    id: "spatial-sec-02",
    slug: "inflatapark-adventure",
    sectionNumber: "02",
    sortOrder: 1,
    visibility: true,
    eyebrowEn: "ACT 2 • BOUNCE & TRANSCEND",
    eyebrowAr: "الفصل ٢ • اقفز وحلّق",
    headingEn: "World Record Inflatable Arenas",
    headingAr: "ساحات القفز الهوائية القياسية",
    descriptionEn: "Conquer 5,000+ sqm of continuous gravity-defying obstacle courses, giant slides, and high-altitude inflatable drops.",
    descriptionAr: "تحدَّ أكثر من ٥٠٠٠ متر مربع من مسارات العقبات الهوائية العملاقة والزلاقات الشاهقة.",
    primaryCtaLabelEn: "Discover InflataPark",
    primaryCtaLabelAr: "اكتشف إنفلاتابارك",
    primaryCtaUrl: "/b2c/inflatapark-city-center-doha",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_36_Image_0001.jpg",
    mediaType: "IMAGE",
    backgroundColor: "#080c18",
    accentColor: "#38bdf8",
    haloColor: "#0284c7",
    textAlignment: "LEFT",
    themeMode: "DARK"
  },
  {
    id: "spatial-sec-03",
    slug: "crayons-and-bricks",
    sectionNumber: "03",
    sortOrder: 2,
    visibility: true,
    eyebrowEn: "ACT 3 • CREATE & CONSTRUCT",
    eyebrowAr: "الفصل ٣ • ابنِ وابتكر",
    headingEn: "Tactile Creative Playgrounds",
    headingAr: "مساحات الإبداع والتركيب التفاعلي",
    descriptionEn: "Hands-on architectural brick studios, sensory kinetic sand stations, and expressive crayon workshops.",
    descriptionAr: "ورش معمارية وتجارب حسية ملموسة تطلق العنان لخيال المبدعين الصغار.",
    primaryCtaLabelEn: "Explore Crayons & Bricks",
    primaryCtaLabelAr: "استكشف كرايونز آند بريكس",
    primaryCtaUrl: "/b2c/crayons-bricks-place-vendome",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/79a8b014-64b7-4d8f-97f3-0fedca268e8a.jpeg",
    mediaType: "IMAGE",
    backgroundColor: "#0d0b14",
    accentColor: "#ec4899",
    haloColor: "#db2777",
    textAlignment: "RIGHT",
    themeMode: "DARK"
  },
  {
    id: "spatial-sec-04",
    slug: "urban-arena-adrenaline",
    sectionNumber: "04",
    sortOrder: 3,
    visibility: true,
    eyebrowEn: "ACT 4 • COMPETE & CONQUER",
    eyebrowAr: "الفصل ٤ • تنافس وتحدَّ",
    headingEn: "Cybernetic Tactical Battles",
    headingAr: "معارك تكتيكية وإثارة إلكترونية",
    descriptionEn: "Neon-lit laser skirmishes, high-speed AR simulators, and precision team combat arenas built for masters of strategy.",
    descriptionAr: "حلبات ليزر مضيئة ومحاكيات واقع معزز وتحديات قتالية تكتيكية للفرق.",
    primaryCtaLabelEn: "Enter Urban Arena",
    primaryCtaLabelAr: "ادخل إربان أرينا",
    primaryCtaUrl: "/b2c/urban-arena",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/762b7271-c81f-42a7-a190-3be8b3000f71.jpg",
    mediaType: "IMAGE",
    backgroundColor: "#0a1012",
    accentColor: "#10b981",
    haloColor: "#059669",
    textAlignment: "LEFT",
    themeMode: "DARK"
  },
  {
    id: "spatial-sec-05",
    slug: "kids-driving-academy",
    sectionNumber: "05",
    sortOrder: 4,
    visibility: true,
    eyebrowEn: "ACT 5 • DRIVE & NAVIGATE",
    eyebrowAr: "الفصل ٥ • قُد وتعلم",
    headingEn: "Junior Grand Prix Circuit",
    headingAr: "حلبات سباق وتدريب للناشئين",
    descriptionEn: "Real traffic signals, battery-electric racecars, and official driving licenses in a safe simulated city.",
    descriptionAr: "إشارات مرور حقيقية وسيارات كهربائية مجهزة ورخص قيادة خاصة في مدينة آمنة ومصممة بدقة.",
    primaryCtaLabelEn: "Visit Driving School",
    primaryCtaLabelAr: "زر مدرسة القيادة",
    primaryCtaUrl: "/b2c/kids-city-driving-school",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/72ab2c19-e5de-4554-9ae2-b1beecc7ffab.jpg",
    mediaType: "IMAGE",
    backgroundColor: "#0f0e08",
    accentColor: "#eab308",
    haloColor: "#ca8a04",
    textAlignment: "RIGHT",
    themeMode: "DARK"
  },
  {
    id: "spatial-sec-06",
    slug: "family-celebrations",
    sectionNumber: "06",
    sortOrder: 5,
    visibility: true,
    eyebrowEn: "ACT 6 • CELEBRATE & GATHER",
    eyebrowAr: "الفصل ٦ • احتفل واجتمع",
    headingEn: "Bespoke Milestone Celebrations",
    headingAr: "احتفالات ومناسبات عائلية خاصة",
    descriptionEn: "VIP party pods, private arena buyouts, and tailored entertainment programming crafted for unforgettable memories.",
    descriptionAr: "أجنحة خاصة للحفلات وتجارب ترفيهية مخصصة تصنع ذكريات لا تُنسى لجميع أفراد العائلة.",
    primaryCtaLabelEn: "Book a Package",
    primaryCtaLabelAr: "احجز باقة",
    primaryCtaUrl: "/b2c/packages",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC06321.jpg",
    mediaType: "IMAGE",
    backgroundColor: "#120814",
    accentColor: "#a855f7",
    haloColor: "#9333ea",
    textAlignment: "CENTER",
    themeMode: "DARK"
  },
  {
    id: "spatial-sec-07",
    slug: "pulse-orbit-ecosystem",
    sectionNumber: "07",
    sortOrder: 6,
    visibility: true,
    eyebrowEn: "ACT 7 • CONNECT & ORBIT",
    eyebrowAr: "الفصل ٧ • تواصل وتفاعل",
    headingEn: "Integrated Live Destination",
    headingAr: "منظومة وجهات تفاعلية متكاملة",
    descriptionEn: "Explore live schedules, seasonal holiday festivals, and multi-attraction passes seamlessly synced across Qatar.",
    descriptionAr: "جدول الفعاليات المباشرة والمهرجانات الموسمية وتذاكر الوجهات المتعددة في قطر.",
    primaryCtaLabelEn: "View Calendar",
    primaryCtaLabelAr: "عرض التقويم",
    primaryCtaUrl: "/calendar",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Post%20Event%20Report%20InflataCity%202025%20_Page_013_Image_0007.jpg",
    mediaType: "IMAGE",
    backgroundColor: "#070c14",
    accentColor: "#06b6d4",
    haloColor: "#0891b2",
    textAlignment: "LEFT",
    themeMode: "DARK"
  },
  {
    id: "spatial-sec-08",
    slug: "the-e3-gateway",
    sectionNumber: "08",
    sortOrder: 7,
    visibility: true,
    eyebrowEn: "ACT 8 • JOIN THE EXPEDITION",
    eyebrowAr: "الفصل ٨ • انضم للرحلة",
    headingEn: "Your Next Dimension Awaits",
    headingAr: "بُعدك القادم يبدأ الآن",
    descriptionEn: "Join millions of explorers experiencing the cutting edge of physical-digital family entertainment across Doha and beyond.",
    descriptionAr: "انضم إلى ملايين الزوار واستمتع بأحدث مفاهيم الترفيه العائلي التفاعلي في الدوحة.",
    primaryCtaLabelEn: "Get Tickets Now",
    primaryCtaLabelAr: "احجز تذكرتك الآن",
    primaryCtaUrl: "/b2c/packages",
    mediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
    mediaType: "IMAGE",
    backgroundColor: "#050811",
    accentColor: "#f59e0b",
    haloColor: "#d97706",
    textAlignment: "CENTER",
    themeMode: "DARK"
  }
];

async function main() {
  console.log('--- 1. Updating b2c-landing page in Preview DB ---');
  const b2cPage = await prisma.pages.findUnique({
    where: { slug: 'b2c-landing' }
  });

  if (b2cPage) {
    const rawContent = (typeof b2cPage.content === 'object' && b2cPage.content !== null)
      ? b2cPage.content
      : JSON.parse(b2cPage.content || '{}');

    // Enable spatial barrel experience
    rawContent.spatialExperience = {
      enabled: true,
      faces: DEFAULT_SPATIAL_SECTIONS
    };

    // Clean any remaining unsplash URLs in b2c-landing content
    if (rawContent.act3Worlds && Array.isArray(rawContent.act3Worlds)) {
      rawContent.act3Worlds.forEach(w => {
        if (w.mediaUrl && w.mediaUrl.includes('unsplash.com')) {
          w.mediaUrl = 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/762b7271-c81f-42a7-a190-3be8b3000f71.jpg';
        }
      });
    }

    if (rawContent.ourBrands && Array.isArray(rawContent.ourBrands.brands)) {
      rawContent.ourBrands.brands.forEach(b => {
        if (b.logoDark && b.logoDark.includes('unsplash.com')) {
          b.logoDark = 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/2809137c-b6cd-48f0-94d4-80e19c038e4e.JPG';
        }
      });
    }

    await prisma.pages.update({
      where: { slug: 'b2c-landing' },
      data: { content: rawContent }
    });
    console.log('[SUCCESS] b2c-landing updated: spatialExperience.enabled = true');
  } else {
    console.log('[WARN] b2c-landing page record not found in Pages table');
  }

  console.log('--- 2. Updating StoryType in Preview DB ---');
  const achieveStoryType = await prisma.storyType.findFirst({
    where: { slug: 'achieve' }
  });
  if (achieveStoryType) {
    await prisma.storyType.update({
      where: { id: achieveStoryType.id },
      data: {
        coverMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_36_Image_0001.jpg',
        isActive: true
      }
    });
    console.log('[SUCCESS] StoryType "achieve" updated with E3 Blob coverMediaUrl');
  }

  const learnStoryType = await prisma.storyType.findFirst({
    where: { slug: 'learn' }
  });
  if (learnStoryType && !learnStoryType.coverMediaUrl) {
    await prisma.storyType.update({
      where: { id: learnStoryType.id },
      data: {
        coverMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/72ab2c19-e5de-4554-9ae2-b1beecc7ffab.jpg'
      }
    });
    console.log('[SUCCESS] StoryType "learn" updated with E3 Blob coverMediaUrl');
  }

  const enjoyStoryType = await prisma.storyType.findFirst({
    where: { slug: 'enjoy' }
  });
  if (enjoyStoryType && !enjoyStoryType.coverMediaUrl) {
    await prisma.storyType.update({
      where: { id: enjoyStoryType.id },
      data: {
        coverMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC01674.jpg'
      }
    });
    console.log('[SUCCESS] StoryType "enjoy" updated with E3 Blob coverMediaUrl');
  }

  console.log('--- Verification Complete ---');
}

main()
  .catch(err => {
    console.error('Failed to apply preview CMS fixes:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
