import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 10 attractions and events...');
  
  const attractionsData = [
    {
      slug: 'lego-shows-qatar-2024',
      nameEn: 'LEGO® Shows Qatar 2024',
      nameAr: 'معرض ليغو قطر ٢٠٢٤',
      taglineEn: "Where Millions of Bricks Built Qatar's Biggest Family Adventure",
      taglineAr: 'أكبر مغامرة عائلية في قطر',
      descriptionEn: "LEGO® Shows Qatar 2024 was the inaugural edition of the region's largest touring LEGO® experience, transforming the Qatar National Convention Centre into a vibrant universe of creativity...",
      descriptionAr: 'معرض ليغو قطر ٢٠٢٤ هو النسخة الافتتاحية لأكبر تجربة ليغو في المنطقة...',
      heroMediaType: 'IMAGE',
      heroMediaUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80',
      heroThumbnailUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=400',
      isPublished: true,
      isFeatured: true,
      startDate: new Date('2024-04-10T13:00:00Z'),
      endDate: new Date('2024-04-25T23:00:00Z'),
      status: 'PUBLISHED',
      operations: {
        venueName: "Qatar National Convention Centre (QNCC), Doha",
        ageGroup: "All Ages (Recommended for Families & Children)",
        hours: "Daily: 1:00 PM – 11:00 PM"
      },
      features: [
        { title: "LEGO® City Adventure Zone" },
        { title: "NINJAGO® Training Academy" },
        { title: "DUPLO® Discovery Village" }
      ],
      temporalStatus: { status: "PAST" },
      pricing: [
        { titleEn: "Day Pass", titleAr: "تذكرة يومية", price: 125.00 },
        { titleEn: "VIP Experience", titleAr: "تجربة كبار الشخصيات", price: 350.00 }
      ]
    },
    {
      slug: 'lusail-winter-wonderland',
      nameEn: 'Lusail Winter Wonderland',
      nameAr: 'لوسيل ونتر وندر لاند',
      taglineEn: 'The Ultimate Entertainment Destination',
      taglineAr: 'وجهة الترفيه القصوى',
      descriptionEn: 'Experience world-class rides, games, and entertainment at Lusail Winter Wonderland. A premier destination for families and thrill-seekers.',
      descriptionAr: 'استمتع بألعاب وتسلية عالمية في لوسيل ونتر وندر لاند.',
      heroMediaType: 'IMAGE',
      heroMediaUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&q=80',
      heroThumbnailUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&q=80&w=400',
      isPublished: true,
      startDate: new Date('2023-11-01T15:00:00Z'),
      endDate: new Date('2024-03-01T23:00:00Z'),
      status: 'PUBLISHED',
      temporalStatus: { status: "PAST" },
      pricing: [
        { titleEn: "Entry Ticket", titleAr: "تذكرة دخول", price: 50.00 },
        { titleEn: "Unlimited Ride Pass", titleAr: "تذكرة ألعاب غير محدودة", price: 250.00 }
      ]
    },
    {
      slug: 'qatar-toy-festival-2024',
      nameEn: 'Qatar Toy Festival 2024',
      nameAr: 'مهرجان قطر للألعاب ٢٠٢٤',
      taglineEn: 'Play, Learn, and Grow',
      taglineAr: 'العب وتعلم وانمو',
      descriptionEn: 'The biggest toy festival in the Middle East featuring over 50 international brands. Join us for a magical summer filled with joy.',
      descriptionAr: 'أكبر مهرجان للألعاب في الشرق الأوسط يضم أكثر من ٥٠ علامة تجارية عالمية.',
      heroMediaType: 'IMAGE',
      heroMediaUrl: 'https://images.unsplash.com/photo-1558066532-62817d2a71f0?auto=format&fit=crop&q=80',
      heroThumbnailUrl: 'https://images.unsplash.com/photo-1558066532-62817d2a71f0?auto=format&fit=crop&q=80&w=400',
      isPublished: true,
      startDate: new Date('2024-07-15T14:00:00Z'),
      endDate: new Date('2024-08-15T22:00:00Z'),
      status: 'PUBLISHED',
      temporalStatus: { status: "PAST" },
      pricing: [
        { titleEn: "General Admission", titleAr: "دخول عام", price: 50.00 }
      ]
    },
    {
      slug: 'doha-quest',
      nameEn: 'Doha Quest',
      nameAr: 'دوحة كويست',
      taglineEn: "Qatar's First Indoor Theme Park",
      taglineAr: 'أول مدينة ملاهي داخلية في قطر',
      descriptionEn: 'A 32,000 sqm indoor experiential theme park with over 30 rides & attractions, spanning across three time-dimensions.',
      descriptionAr: 'مدينة ملاهي داخلية على مساحة ٣٢٠٠٠ متر مربع.',
      heroMediaType: 'IMAGE',
      heroMediaUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80',
      heroThumbnailUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=400',
      isPublished: true,
      startDate: new Date('2024-01-01T10:00:00Z'),
      endDate: new Date('2025-12-31T22:00:00Z'),
      status: 'PUBLISHED',
      temporalStatus: { status: "ACTIVE" },
      pricing: [
        { titleEn: "Adult Ticket", titleAr: "تذكرة الكبار", price: 235.00 },
        { titleEn: "Child Ticket", titleAr: "تذكرة الأطفال", price: 160.00 }
      ]
    },
    {
      slug: 'meryal-waterpark',
      nameEn: 'Meryal Waterpark',
      nameAr: 'حديقة مريال المائية',
      taglineEn: 'Splash into the Future',
      taglineAr: 'الغوص في المستقبل',
      descriptionEn: 'Qatar\'s largest waterpark featuring the highest water slide in the world. Unmatched aquatic thrills and chill zones.',
      descriptionAr: 'أكبر حديقة مائية في قطر تضم أعلى منزلق مائي في العالم.',
      heroMediaType: 'IMAGE',
      heroMediaUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80',
      heroThumbnailUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=400',
      isPublished: true,
      startDate: new Date('2024-05-01T10:00:00Z'),
      endDate: new Date('2025-10-31T18:00:00Z'),
      status: 'PUBLISHED',
      temporalStatus: { status: "ACTIVE" },
      pricing: [
        { titleEn: "Adult Full Day", titleAr: "يوم كامل كبار", price: 260.00 },
        { titleEn: "Child Full Day", titleAr: "يوم كامل أطفال", price: 225.00 }
      ]
    },
    {
      slug: 'katara-cultural-festival',
      nameEn: 'Katara Cultural Festival',
      nameAr: 'مهرجان كتارا الثقافي',
      taglineEn: 'Where Traditions Meet',
      taglineAr: 'حيث تلتقي التقاليد',
      descriptionEn: 'Celebrate diversity with performances, art exhibitions, and cultural showcases from around the world.',
      descriptionAr: 'احتفل بالتنوع مع العروض والمعارض الفنية.',
      heroMediaType: 'IMAGE',
      heroMediaUrl: 'https://images.unsplash.com/photo-1582560383186-5380584446bd?auto=format&fit=crop&q=80',
      heroThumbnailUrl: 'https://images.unsplash.com/photo-1582560383186-5380584446bd?auto=format&fit=crop&q=80&w=400',
      isPublished: true,
      startDate: new Date('2024-11-01T16:00:00Z'),
      endDate: new Date('2024-11-15T23:00:00Z'),
      status: 'PUBLISHED',
      temporalStatus: { status: "COMING SOON" },
      pricing: [
        { titleEn: "Free Entry", titleAr: "دخول مجاني", price: 0.00 }
      ]
    },
    {
      slug: 'souq-waqif-spring-festival',
      nameEn: 'Souq Waqif Spring Festival',
      nameAr: 'مهرجان ربيع سوق واقف',
      taglineEn: 'Springtime Magic at the Souq',
      taglineAr: 'سحر الربيع في السوق',
      descriptionEn: 'Enjoy the vibrant atmosphere of Souq Waqif with street performers, live music, and family-friendly entertainment.',
      descriptionAr: 'استمتع بالأجواء النابضة بالحياة في سوق واقف.',
      heroMediaType: 'IMAGE',
      heroMediaUrl: 'https://images.unsplash.com/photo-1577908975317-5e921e2fbc04?auto=format&fit=crop&q=80',
      heroThumbnailUrl: 'https://images.unsplash.com/photo-1577908975317-5e921e2fbc04?auto=format&fit=crop&q=80&w=400',
      isPublished: true,
      startDate: new Date('2024-02-15T15:00:00Z'),
      endDate: new Date('2024-03-05T23:00:00Z'),
      status: 'PUBLISHED',
      temporalStatus: { status: "PAST" },
      pricing: [
        { titleEn: "Free Entry", titleAr: "دخول مجاني", price: 0.00 }
      ]
    },
    {
      slug: 'snow-dunes',
      nameEn: 'Snow Dunes',
      nameAr: 'كثبان الثلج',
      taglineEn: 'A Winter Wonderland in the Desert',
      taglineAr: 'عجائب الشتاء في الصحراء',
      descriptionEn: 'Qatar\'s first indoor snow park featuring thrilling rides, icy adventures, and real snow falls at -4 degrees.',
      descriptionAr: 'أول حديقة ثلجية داخلية في قطر.',
      heroMediaType: 'IMAGE',
      heroMediaUrl: 'https://images.unsplash.com/photo-1548883354-94cb0b435f08?auto=format&fit=crop&q=80',
      heroThumbnailUrl: 'https://images.unsplash.com/photo-1548883354-94cb0b435f08?auto=format&fit=crop&q=80&w=400',
      isPublished: true,
      startDate: new Date('2024-01-01T10:00:00Z'),
      endDate: new Date('2025-12-31T22:00:00Z'),
      status: 'PUBLISHED',
      temporalStatus: { status: "ACTIVE" },
      pricing: [
        { titleEn: "Silver Package", titleAr: "الباقة الفضية", price: 190.00 },
        { titleEn: "Platinum Package", titleAr: "الباقة البلاتينية", price: 450.00 }
      ]
    },
    {
      slug: 'angry-birds-world',
      nameEn: 'Angry Birds World',
      nameAr: 'عالم أنجري بيردز',
      taglineEn: 'Play with your favorite characters',
      taglineAr: 'العب مع شخصياتك المفضلة',
      descriptionEn: 'A theme park dedicated to the world-famous Angry Birds franchise. Packed with immersive rides, a trampoline park, and karting.',
      descriptionAr: 'مدينة ملاهي مخصصة لشخصيات أنجري بيردز الشهيرة.',
      heroMediaType: 'IMAGE',
      heroMediaUrl: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80',
      heroThumbnailUrl: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=400',
      isPublished: true,
      startDate: new Date('2024-01-01T10:00:00Z'),
      endDate: new Date('2025-12-31T22:00:00Z'),
      status: 'PUBLISHED',
      temporalStatus: { status: "ACTIVE" },
      pricing: [
        { titleEn: "Family Card", titleAr: "بطاقة العائلة", price: 250.00 }
      ]
    },
    {
      slug: 'expo-2023-doha',
      nameEn: 'Expo 2023 Doha',
      nameAr: 'إكسبو ٢٠٢٣ الدوحة',
      taglineEn: 'Green Desert, Better Environment',
      taglineAr: 'صحراء خضراء، بيئة أفضل',
      descriptionEn: 'The first A1 International Horticultural Exhibition in the MENA region, promoting sustainable innovations.',
      descriptionAr: 'أول معرض دولي للبستنة من الفئة A1 في منطقة الشرق الأوسط وشمال أفريقيا.',
      heroMediaType: 'IMAGE',
      heroMediaUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80',
      heroThumbnailUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=400',
      isPublished: true,
      startDate: new Date('2023-10-02T10:00:00Z'),
      endDate: new Date('2024-03-28T22:00:00Z'),
      status: 'PUBLISHED',
      temporalStatus: { status: "PAST" },
      pricing: [
        { titleEn: "Free Admission", titleAr: "دخول مجاني", price: 0.00 }
      ]
    }
  ];

  for (const item of attractionsData) {
    const { startDate, endDate, status, pricing, ...attractionData } = item;
    
    // Create Attraction
    const attraction = await prisma.attraction.upsert({
      where: { slug: item.slug },
      update: { ...attractionData },
      create: { ...attractionData }
    });
    
    // Upsert pricing
    if (pricing && pricing.length > 0) {
      // Clear existing to avoid duplicates easily
      await prisma.attractionPricing.deleteMany({
        where: { attractionId: attraction.id }
      });
      await prisma.attractionPricing.createMany({
        data: pricing.map(p => ({ ...p, attractionId: attraction.id }))
      });
    }

    // Upsert Calendar Event
    const eventId = `event-${item.slug}`;
    const existingEvent = await prisma.calendarEvent.findFirst({
        where: { attractionId: attraction.id }
    });
    
    if (existingEvent) {
        await prisma.calendarEvent.update({
            where: { id: existingEvent.id },
            data: {
                title: item.nameEn,
                description: item.descriptionEn,
                startDate: item.startDate,
                endDate: item.endDate,
                status: item.status,
            }
        });
    } else {
        await prisma.calendarEvent.create({
            data: {
              title: item.nameEn,
              description: item.descriptionEn,
              startDate: item.startDate,
              endDate: item.endDate,
              status: item.status,
              attractionId: attraction.id,
            }
        });
    }

    console.log(`Upserted Attraction and Event: ${item.nameEn}`);
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
