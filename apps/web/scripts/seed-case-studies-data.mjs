import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding / updating canonical case studies in database...");

  // 1. Fetch employee profiles to link
  const employees = await prisma.employeeProfile.findMany();
  const empMap = new Map(employees.map((e) => [e.slug, e.id]));

  const rajanId = empMap.get("rajan-pathak") || employees[0]?.id;
  const ebrahimId = empMap.get("ebrahim-karolia") || employees[1]?.id;
  const lucianId = empMap.get("lucian-moldovan") || employees[2]?.id;
  const _amaanId = empMap.get("amaan-malik") || employees[3]?.id;

  // 2. Fetch Urban Arena attraction
  const urbanArenaAttr = await prisma.attraction.findFirst({
    where: { slug: "urban-arena-doha-mall" },
  });

  // 3. Update Urban Arena case study
  const urbanArenaData = {
    titleEn: "Urban Arena Tactical Entertainment Hub",
    titleAr: "أوربان أرينا — مجمع الترفيه التكتيكي التفاعلي",
    clientName: "E3 Owned & Operated / Doha Mall",
    clientNameAr: "مملوكة ومُشغلة من E3 / دوحة مول",
    category: "Attractions",
    sectorEn: "Commercial Tactical Entertainment",
    sectorAr: "الترفيه التكتيكي التجاري",
    locationEn: "Doha Mall, Qatar",
    locationAr: "دوحة مول، قطر",
    year: 2024,
    status: "PUBLISHED",
    isFeatured: true,
    heroImageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/d1a1b309-29fc-415b-a5f8-48bc2f14752d.mp4",
    thumbnailMediaType: "IMAGE",
    thumbnailUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1600&auto=format&fit=crop",
    clientLogoUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/93ab62a1-8628-4355-a687-308a8f83b42c.png",
    challengeEn: "Converting a 4,500 sqm high-ceiling commercial shell into Qatar's first multi-tiered tactical combat and gamified obstacle arena with real-time laser telemetry and biometric leaderboards under an aggressive 90-day build timeline.",
    challengeAr: "تحويل مساحة تجارية خام بارتفاعات شاهقة تبلغ 4500 متر مربع إلى أول مجمع ترفيهي تكتيكي متعدد المستويات في قطر مجهز بنظام تتبع الليزر اللحظي ولوحات الصدارة البيومترية خلال جدول زمني قياسي مدته 90 يوماً.",
    solutionEn: "Engineered proprietary acoustic zoning, high-speed infra-red tracking arrays, integrated laser tag courses, bazooka ball, paintless paintball zones, and automated guest throughput queuing with dynamic lighting cues.",
    solutionAr: "هندسة مناطق عزل صوتي متقدمة، وشبكات تتبع بالأشعة تحت الحمراء عالية الدقة، مع مسارات متكاملة لليزر تاج والكرات التكتيكية وإدارة رقمية فورية لحشود الزوار مع إضاءة ديناميكية متزامنة.",
    resultEn: "Achieved record 99.4% telemetry uptime, welcomed over 350,000 players in the opening quarter, and reduced average match turnover interval to under 90 seconds.",
    resultAr: "تحقيق نسبة جاهزية تشغيلية 99.4%، واستقبال أكثر من 350,000 لاعب خلال الربع الأول، مع تقليص وقت تبديل جولات اللعب إلى أقل من 90 ثانية.",
    attractionId: urbanArenaAttr?.id || null,
    metrics: [
      { valueEn: "350K+", valueAr: "350K+", labelEn: "Total Arena Players", labelAr: "إجمالي لاعبي الأرينا" },
      { valueEn: "4,500 m²", valueAr: "4,500 م²", labelEn: "Tactical Play Space", labelAr: "مساحة اللعب التكتيكية" },
      { valueEn: "99.4%", valueAr: "99.4%", labelEn: "Telemetry System Uptime", labelAr: "جاهزية أنظمة التتبع" },
      { valueEn: "<90s", valueAr: "<90ث", labelEn: "Match Turnover Interval", labelAr: "معدل دوران الجولات" },
    ],
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1600&auto=format&fit=crop",
        type: "IMAGE",
        captionEn: "High-intensity tactical obstacle grid and neon illumination",
        captionAr: "شبكة العقبات التكتيكية والإضاءة النيونية التفاعلية",
      },
      {
        url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop",
        type: "IMAGE",
        captionEn: "Infrared laser tag combat field and dynamic scoring hubs",
        captionAr: "ميدان الليزر تاج وشاشات تسجيل النقاط المباشرة",
      },
      {
        url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
        type: "IMAGE",
        captionEn: "Central telemetry monitoring and match control bridge",
        captionAr: "منصة المراقبة المركزية والتحكم اللحظي بالمباريات",
      },
      {
        url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
        type: "IMAGE",
        captionEn: "VIP briefing lounge and team staging quarter",
        captionAr: "قاعة التوجيه التكتيكي لكبار الشخصيات ومنطقة تجهيز الفرق",
      },
    ],
    testimonials: [
      {
        quoteEn: "Urban Arena completely redefined indoor gamified entertainment in Qatar with unmatched engineering, safety protocols, and operational throughput.",
        quoteAr: "أعادت أوربان أرينا صياغة مفهوم الترفيه التفاعلي الداخلي في قطر بمعايير هندسية وأمان وتدفق جماهيري استثنائي.",
        authorName: "Nasser Al-Hajri",
        authorRole: "Executive Director, Retail & Mall Operations",
        isVisible: true,
      },
      {
        quoteEn: "The multi-tiered tactical combat zones and automated telemetry made it the most engaging FEC concept in Doha.",
        quoteAr: "المسارات التكتيكية متعددة المستويات وأنظمة التتبع الآلي جعلت المشروع التجربة الترفيهية الأكثر جذباً في الدوحة.",
        authorName: "Eng. Jassim Al-Kuwari",
        authorRole: "Senior Facility Development Manager",
        isVisible: true,
      },
    ],
    seo: {
      metaTitleEn: "Urban Arena Tactical Entertainment Hub Case Study | E3 Qatar",
      metaTitleAr: "دراسة حالة مجمع أوربان أرينا الترفيهي التكتيكي | إي ثري قطر",
      metaDescriptionEn: "Explore how E3 engineered Qatar's premier gamified tactical combat destination at Urban Arena.",
      metaDescriptionAr: "استكشف كيف هندست إي ثري الوجهة الترفيهية التكتيكية الرائدة في قطر بأوربان أرينا.",
    },
  };

  const existingUrban = await prisma.caseStudy.findUnique({
    where: { slug: "case-urban-arena" },
  });

  if (existingUrban) {
    await prisma.caseStudy.update({
      where: { slug: "case-urban-arena" },
      data: urbanArenaData,
    });

    // Delete existing team members and re-link
    await prisma.caseStudyTeamMember.deleteMany({
      where: { caseStudyId: existingUrban.id },
    });

    if (rajanId) {
      await prisma.caseStudyTeamMember.create({
        data: {
          caseStudyId: existingUrban.id,
          employeeProfileId: rajanId,
          roleEn: "Head of FEC Systems & Telemetry",
          roleAr: "رئيس أنظمة المراكز الترفيهية والتتبع",
          orderIndex: 0,
        },
      });
    }

    if (ebrahimId) {
      await prisma.caseStudyTeamMember.create({
        data: {
          caseStudyId: existingUrban.id,
          employeeProfileId: ebrahimId,
          roleEn: "Site Build & Project Manager",
          roleAr: "مدير المشروع والإنشاءات الميدانية",
          orderIndex: 1,
        },
      });
    }

    if (lucianId) {
      await prisma.caseStudyTeamMember.create({
        data: {
          caseStudyId: existingUrban.id,
          employeeProfileId: lucianId,
          roleEn: "Arena Operations Director",
          roleAr: "مدير العمليات والتشغيل الميداني",
          orderIndex: 2,
        },
      });
    }

    console.log("Updated case-urban-arena with complete canonical data and team members.");
  }

  // 4. Update Doha Balloon Parade 2022
  const balloonAttr = await prisma.attraction.findFirst({
    where: { slug: "doha-balloon-parade-2022" },
  });

  const existingBalloon = await prisma.caseStudy.findUnique({
    where: { slug: "doha-balloon-parade-2022" },
  });

  if (existingBalloon) {
    await prisma.caseStudy.update({
      where: { slug: "doha-balloon-parade-2022" },
      data: {
        heroMediaType: "IMAGE",
        heroImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
        thumbnailMediaType: "IMAGE",
        thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
        resultEn: "Successfully managed 760,000+ attendees over 3 days across a 3km Corniche route with zero safety incidents and international media acclaim.",
        resultAr: "نجاح استثنائي في إدارة حشود تجاوزت 760,000 زائر على مدار 3 أيام على امتداد 3 كم على كورنيش الدوحة بدون أي حوادث أمنية وبإشادة إعلامية دولية واسعة.",
        gallery: [
          {
            url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
            type: "IMAGE",
            captionEn: "Giant helium inflatables soaring above the Doha Corniche skyline",
            captionAr: "البالونات العملاقة تحلق فوق كورنيش الدوحة بأفق العاصمة",
          },
          {
            url: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=1200&auto=format&fit=crop",
            type: "IMAGE",
            captionEn: "Marching brass bands and street performance troupes",
            captionAr: "الفرق الموسيقية النحاسية واستعراضات الشارع الحية",
          },
          {
            url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
            type: "IMAGE",
            captionEn: "Night illumination and kinetic fireworks finale",
            captionAr: "العروض الضوئية الليلية وعروض الألعاب النارية الختامية",
          },
        ],
        testimonials: [
          {
            quoteEn: "E3 delivered Qatar's first world-class balloon parade with remarkable operational crowd control and spectacular family entertainment.",
            quoteAr: "قدمت إي ثري أول موكب بالونات عالمي في قطر بإدارة حشود متميزة وبرنامج ترفيهي عائلي استثنائي.",
            authorName: "Hamad Al-Kuwari",
            authorRole: "Festivals & Major Events Director, Visit Qatar",
            isVisible: true,
          },
        ],
        seo: {
          metaTitleEn: "Doha Balloon Parade 2022 Case Study | E3 Qatar",
          metaTitleAr: "دراسة حالة استعراض بالونات الدوحة 2022 | إي ثري قطر",
          metaDescriptionEn: "Discover how E3 produced Qatar's landmark 3km Corniche balloon parade for 760,000+ visitors.",
          metaDescriptionAr: "استكشف كيف أنتجت إي ثري موكب بالونات كورنيش الدوحة الأيقوني لـ 760 ألف زائر.",
        },
      },
    });

    if (ebrahimId) {
      await prisma.caseStudyTeamMember.deleteMany({
        where: { caseStudyId: existingBalloon.id },
      });
      await prisma.caseStudyTeamMember.create({
        data: {
          caseStudyId: existingBalloon.id,
          employeeProfileId: ebrahimId,
          roleEn: "Parade Operations Director",
          roleAr: "مدير العمليات واستعراض الشارع",
          orderIndex: 0,
        },
      });
    }

    console.log("Updated doha-balloon-parade-2022 with complete canonical data.");
  }
}

main().finally(() => prisma.$disconnect());
