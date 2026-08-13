import db from '@/lib/db';

export async function getLiveB2CBrandsFromDB(): Promise<any[]> {
  try {
    let dbBrands = await (db as any).brandIP?.findMany({
      where: { isActive: true, showOnB2C: true },
      orderBy: [
        { b2cDisplayOrder: 'asc' },
        { updatedAt: 'desc' }
      ]
    });

    if (!dbBrands || dbBrands.length === 0) {
      // Auto seed initial canonical brand records into db.brandIP
      const defaultBrands = [
        {
          slug: "crayons-bricks",
          nameEn: "Crayons & Bricks",
          nameAr: "كرايونز آند بريكس",
          taglineEn: "Owned Creative Workshops & STEM Play Labs",
          taglineAr: "فكرة مملوكة — ورش الإبداع والبناء والابتكار للأطفال",
          shortDescriptionEn: "An owned E3 child-development realm for children to build, sculpt, draw, and experiment with spatial building blocks and STEM labs.",
          shortDescriptionAr: "مساحة إبداعية مملوكة لـ E3 مخصصة للأطفال للاكتشاف والبناء والتلوين وورش العمل التفاعلية.",
          primaryLogoUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/79a8b014-64b7-4d8f-97f3-0fedca268e8a.jpeg",
          primaryMediaUrl: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=800&auto=format&fit=crop",
          isActive: true,
          showOnB2C: true,
          showOnB2B: true,
          showInWorldsCreated: true,
          showInB2BPortfolio: true,
          featureOnB2C: true,
          featureOnB2B: true,
          lifecycleStatus: "ACTIVE",
          b2cDisplayOrder: 1,
          b2bDisplayOrder: 1,
          b2cCtaUrl: "/b2c/attractions/crayons-and-bricks-place-vendome",
          b2bInquiryUrl: "/b2b/contact?subject=CrayonsBricks"
        },
        {
          slug: "kids-city-driving-school",
          nameEn: "Kidz Driving School",
          nameAr: "مدرسة القيادة للأطفال",
          taglineEn: "Owned Interactive Traffic City Concept",
          taglineAr: "فكرة مملوكة — مدينة المرور التفاعلية الأولى للأطفال",
          shortDescriptionEn: "An owned immersive traffic city concept empowering children with miniature electric vehicles, traffic signals, driving licenses, and safety education.",
          shortDescriptionAr: "تجربة واقعية مملوكة لـ E3 للأطفال لقيادة السيارات الكهربائية الصغيرة وتعلم قواعد المرور ورخص القيادة.",
          primaryLogoUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/e6016d8f-1b8e-4099-95b7-fb9acd1169eb.png",
          primaryMediaUrl: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=800&auto=format&fit=crop",
          isActive: true,
          showOnB2C: true,
          showOnB2B: true,
          showInWorldsCreated: true,
          showInB2BPortfolio: true,
          featureOnB2C: true,
          featureOnB2B: true,
          lifecycleStatus: "ACTIVE",
          b2cDisplayOrder: 2,
          b2bDisplayOrder: 2,
          b2cCtaUrl: "/b2c/attractions/kidz-driving-school-city-center-doha",
          b2bInquiryUrl: "/b2b/contact?subject=KidzDrivingSchool"
        },
        {
          slug: "inflatapark",
          nameEn: "InflataPark",
          nameAr: "إنفلاتا بارك",
          taglineEn: "Operated Indoor Inflatable Playground",
          taglineAr: "مفهوم مُشغّل — أكبر مدينة ألعاب هوائية مطاطية مغلقة",
          shortDescriptionEn: "An E3 operated indoor inflatable park covering continuous obstacle courses, giant slides, and bounce zones.",
          shortDescriptionAr: "مجمع الألعاب الهوائية المطاطية المُدار بواسطة E3 ويمتد على مساحات واسعة من المسارات التنافسية.",
          primaryLogoUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop",
          primaryMediaUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
          isActive: true,
          showOnB2C: true,
          showOnB2B: true,
          showInWorldsCreated: true,
          showInB2BPortfolio: true,
          featureOnB2C: true,
          featureOnB2B: true,
          lifecycleStatus: "ACTIVE",
          b2cDisplayOrder: 3,
          b2bDisplayOrder: 3,
          b2cCtaUrl: "/b2c/attractions/inflata-park-city-center-doha",
          b2bInquiryUrl: "/b2b/contact?subject=InflataPark"
        },
        {
          slug: "urban-arena",
          nameEn: "Urban Arena",
          nameAr: "أوربان أرينا",
          taglineEn: "Operated High-Octane Kinetic & Laser Arena",
          taglineAr: "مفهوم مُشغّل — حلبة المنافسات التفاعلية والليزر",
          shortDescriptionEn: "Qatar's premier kinetic entertainment arena operated by E3, featuring laser tag, high-impact esports tournaments, mixed-reality karting, and interactive obstacle courses.",
          shortDescriptionAr: "الساحة الأولى في قطر للترفيه التفاعلي والمُدارة بواسطة E3، وتضم حلبات منافسات الليزر والرياضات الإلكترونية والكارتينغ.",
          primaryLogoUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/93ab62a1-8628-4355-a687-308a8f83b42c.png",
          primaryMediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
          isActive: true,
          showOnB2C: true,
          showOnB2B: true,
          showInWorldsCreated: true,
          showInB2BPortfolio: true,
          featureOnB2C: true,
          featureOnB2B: true,
          lifecycleStatus: "ACTIVE",
          b2cDisplayOrder: 4,
          b2bDisplayOrder: 4,
          b2cCtaUrl: "/b2c/attractions/urban-arena-doha-mall",
          b2bInquiryUrl: "/b2b/contact?subject=UrbanArena"
        },
        {
          slug: "spongebob-paw-patrol",
          nameEn: "SpongeBob & PAW Patrol",
          nameAr: "سبونج بوب وباو باترول",
          taglineEn: "Official Character Water Activation",
          taglineAr: "فعالية الشخصيات العالمية المائية الرسمية",
          shortDescriptionEn: "A splash-filled character experience bringing Bikini Bottom and Adventure Bay to Qatar at Meryal Waterpark.",
          shortDescriptionAr: "تجربة مائية مليئة بالمرح تجمع بين شخصيات سبونج بوب وباو باترول في قطر بحديقة مريال المائية.",
          primaryLogoUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/2809137c-b6cd-48f0-94d4-80e19c038e4e.JPG",
          primaryMediaUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
          isActive: true,
          showOnB2C: true,
          showOnB2B: true,
          showInWorldsCreated: true,
          showInB2BPortfolio: true,
          featureOnB2C: true,
          featureOnB2B: true,
          lifecycleStatus: "ACTIVE",
          b2cDisplayOrder: 5,
          b2bDisplayOrder: 5,
          b2cCtaUrl: "/b2c/attractions/spongebob-squarepants-paw-patrol-activation-meryal",
          b2bInquiryUrl: "/b2b/contact?subject=SpongeBob"
        },
        {
          slug: "bookingqube",
          nameEn: "BookingQube",
          nameAr: "بوكينج كيوب",
          taglineEn: "Wholly Owned Ticketing & Spatial Engine",
          taglineAr: "منظومة حجز التذاكر والتسجيل الرقمي المملوكة لـ E3",
          shortDescriptionEn: "E3's proprietary digital ticketing platform powering venue access, RFID wristbands, and automated guest flow across all destinations.",
          shortDescriptionAr: "منظومة حجز التذاكر الرقمية المبتكرة المملوكة لـ E3 والتي تدير دخول الزوار والتسجيل الرقمي في كافة الوجهات.",
          primaryLogoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop",
          primaryMediaUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
          isActive: true,
          showOnB2C: true,
          showOnB2B: true,
          showInWorldsCreated: true,
          showInB2BPortfolio: true,
          featureOnB2C: true,
          featureOnB2B: true,
          lifecycleStatus: "ACTIVE",
          b2cDisplayOrder: 6,
          b2bDisplayOrder: 6,
          b2cCtaUrl: "https://bookingqube.e3qatar.com",
          b2bInquiryUrl: "/b2b/contact?subject=BookingQube"
        }
      ];

      for (const b of defaultBrands) {
        await (db as any).brandIP.upsert({
          where: { slug: b.slug },
          update: {},
          create: b
        });
      }

      dbBrands = await (db as any).brandIP.findMany({
        where: { isActive: true, showOnB2C: true },
        orderBy: [
          { b2cDisplayOrder: 'asc' },
          { updatedAt: 'desc' }
        ]
      });
    }

    const palette = ["#f59e0b", "#10b981", "#ec4899", "#3b82f6", "#06b6d4", "#8b5cf6"];

    return (dbBrands || []).map((b: any, idx: number) => ({
      id: b.id,
      slug: b.slug,
      nameEn: b.b2cTitleOverrideEn || b.nameEn,
      nameAr: b.b2cTitleOverrideAr || b.nameAr,
      taglineEn: b.b2cShortDescOverrideEn || b.taglineEn || b.shortDescriptionEn || "",
      taglineAr: b.b2cShortDescOverrideAr || b.taglineAr || b.shortDescriptionAr || "",
      descriptionEn: b.b2cDetailCopyEn || b.fullStoryEn || b.shortDescriptionEn || b.b2cShortDescOverrideEn || "",
      descriptionAr: b.b2cDetailCopyAr || b.fullStoryAr || b.shortDescriptionAr || b.b2cShortDescOverrideAr || "",
      logoPrimary: b.primaryLogoUrl || b.lightLogoUrl || b.darkLogoUrl || b.compactLogoUrl || "",
      logoLight: b.lightLogoUrl || b.primaryLogoUrl || "",
      logoDark: b.darkLogoUrl || b.primaryLogoUrl || "",
      logoCompact: b.compactLogoUrl || b.primaryLogoUrl || "",
      brandColor: palette[idx % palette.length],
      relationship: b.primaryRelationshipId || b.lifecycleStatus || "OWNED",
      shortDescEn: b.b2cShortDescOverrideEn || b.shortDescriptionEn || "",
      shortDescAr: b.b2cShortDescOverrideAr || b.shortDescriptionAr || "",
      detailCopyEn: b.b2cDetailCopyEn || b.fullStoryEn || "",
      detailCopyAr: b.b2cDetailCopyAr || b.fullStoryAr || "",
      heroImage: b.primaryMediaUrl || b.coverMediaUrl || b.primaryLogoUrl || "",
      primaryMediaUrl: b.primaryMediaUrl || "",
      ctaUrl: b.b2cCtaUrl || `/b2c/brands/${b.slug}`,
      bookingUrl: b.b2cCtaUrl || `/b2c/brands/${b.slug}`,
      internalRoute: b.b2cCtaUrl || `/b2c/brands/${b.slug}`,
      showOnB2C: b.showOnB2C,
      showInWorldsCreated: b.showInWorldsCreated,
      featureOnB2C: b.featureOnB2C,
      isVisible: b.isActive,
      status: b.isActive ? 'PUBLISHED' : 'DRAFT'
    }));
  } catch (err) {
    console.error("[getLiveB2CBrandsFromDB_ERROR]", err);
    return [];
  }
}
