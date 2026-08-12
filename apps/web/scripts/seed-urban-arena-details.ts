import fs from "fs"
import path from "path"
import { PrismaClient } from "@prisma/client"

// Manually load .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8")
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const val = match[2].trim().replace(/^['"]|['"]$/g, "")
      process.env[key] = val
    }
  })
}

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Seeding Urban Arena Attraction Data...")

  const urbanArenaSlug = "urban-arena-doha"

  // 21 Activations
  const features = [
    {
      id: "ua-act-1",
      titleEn: "Urban Putt – Mini Golf",
      titleAr: "أوربان بوت – الميني غولف",
      descriptionEn: "Navigate a creative indoor mini-golf course filled with obstacles and playful challenges. Ideal for families, friends and groups, from age 4.",
      descriptionAr: "استمتع بجولة ميني غولف داخلية مليئة بالعوائق والتحديات الممتعة، ومناسبة للعائلات والأصدقاء والمجموعات من عمر 4 سنوات.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/mini-golf.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-2",
      titleEn: "Mixed-Reality Go-Karting",
      titleAr: "سباقات الكارتينغ بالواقع المختلط",
      descriptionEn: "Experience supervised indoor karting that combines real driving excitement with an engaging digital racing environment. Suitable from age 5.",
      descriptionAr: "استمتع بسباقات كارتينغ داخلية تحت الإشراف، تجمع بين متعة القيادة الحقيقية وبيئة سباق رقمية تفاعلية. مناسبة من عمر 5 سنوات.",
      storyTypeIds: ["DRIVE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/go-karting.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-3",
      titleEn: "Paintless Paintball",
      titleAr: "بينتبول بدون طلاء",
      descriptionEn: "A clean, supervised team challenge combining strategy, movement and accurate targeting without traditional paint. Suitable from age 12.",
      descriptionAr: "تحدٍ جماعي نظيف وتحت الإشراف، يجمع بين التخطيط والحركة ودقة التصويب دون استخدام الطلاء التقليدي. مناسب من عمر 12 سنة.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/paintless-paintball.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-4",
      titleEn: "Bazooka Ball",
      titleAr: "بازوكا بول",
      descriptionEn: "Team up for an energetic arena challenge using safe foam-ball launchers. Suitable for groups of 2–8 players from age 12.",
      descriptionAr: "كوّن فريقك واستمتع بتحدٍ حماسي داخل الساحة باستخدام قاذفات كرات إسفنجية آمنة. مناسب لمجموعات من لاعبين إلى 8 لاعبين من عمر 12 سنة.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/bazooka-ball.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-5",
      titleEn: "Laser Tag",
      titleAr: "ليزر تاغ",
      descriptionEn: "Enter a futuristic, sensor-powered arena where teams navigate the space, tag opponents and compete in a contact-free challenge.",
      descriptionAr: "ادخل ساحة مستقبلية مزودة بالمستشعرات، وتعاون مع فريقك لتحديد الخصوم والمنافسة في تحدٍ تفاعلي دون احتكاك مباشر.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/laser-tag.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-6",
      titleEn: "Kids Tribe",
      titleAr: "كيدز ترايب",
      descriptionEn: "A colourful soft-play environment where children can climb, slide, explore and play across cushioned structures. Suitable from age 3.",
      descriptionAr: "منطقة ألعاب لينة وملونة تتيح للأطفال التسلق والانزلاق والاستكشاف واللعب بين منشآت آمنة ومبطنة. مناسبة من عمر 3 سنوات.",
      storyTypeIds: ["EXPLORE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/kids-tribe.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-7",
      titleEn: "Projected Billiards",
      titleAr: "البلياردو بالإسقاطات التفاعلية",
      descriptionEn: "Play billiards on a table transformed by responsive projections, animations and digital effects. Suitable from age 14.",
      descriptionAr: "استمتع بالبلياردو على طاولة مطورة بإسقاطات تفاعلية ورسوم متحركة ومؤثرات رقمية تستجيب لكل ضربة. مناسبة من عمر 14 سنة.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/projected-billiards.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-8",
      titleEn: "Contemporary Billiards",
      titleAr: "البلياردو العصري",
      descriptionEn: "Enjoy a relaxed yet competitive billiards session on premium tables for 2–4 players. Suitable from age 14.",
      descriptionAr: "استمتع بجلسة بلياردو تجمع بين الاسترخاء والمنافسة على طاولات مميزة تتسع من لاعبين إلى 4 لاعبين. مناسبة من عمر 14 سنة.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/billiards.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-9",
      titleEn: "Floor Is Lava – Speed Grid",
      titleAr: "الأرضية حمم – شبكة السرعة",
      descriptionEn: "React quickly, move between safe zones and test your agility in a fast-paced, interactive floor challenge.",
      descriptionAr: "تحرك بسرعة بين المناطق الآمنة واختبر ردود فعلك ورشاقتك في تحدٍ أرضي تفاعلي مليء بالحركة.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/floor-is-lava.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-10",
      titleEn: "Spin City",
      titleAr: "سبين سيتي",
      descriptionEn: "A supervised indoor spinning ride delivering lively, family-friendly fun for guests from age 4.",
      descriptionAr: "لعبة دوران داخلية ممتعة وتحت الإشراف، تقدم تجربة عائلية مليئة بالحركة للزوار من عمر 4 سنوات.",
      storyTypeIds: ["EXPLORE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/spin-city.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-11",
      titleEn: "Interactive Ping Pong",
      titleAr: "تنس الطاولة التفاعلي",
      descriptionEn: "Serve, rally and compete in a fast, social table-tennis experience for players from age 6.",
      descriptionAr: "أرسل الكرة وتبادل الضربات وتنافس في تجربة تنس طاولة سريعة واجتماعية، مناسبة للاعبين من عمر 6 سنوات.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/ping-pong.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-12",
      titleEn: "Dartsee Digital Darts",
      titleAr: "دارتسي – السهام الرقمية",
      descriptionEn: "Test your accuracy through a supervised digital darts experience created for friendly competition. Suitable from age 12.",
      descriptionAr: "اختبر دقة تصويبك في تجربة سهام رقمية وتحت الإشراف، مصممة للمنافسات الودية. مناسبة من عمر 12 سنة.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/dartsee.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-13",
      titleEn: "Air Hockey",
      titleAr: "الهوكي الهوائي",
      descriptionEn: "Challenge friends to a quick, fast-moving air-hockey match suitable for players from age 4.",
      descriptionAr: "تحدَّ أصدقاءك في مباراة هوكي هوائي سريعة ومليئة بالحماس، مناسبة للاعبين من عمر 4 سنوات.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/air-hockey.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-14",
      titleEn: "Archery",
      titleAr: "الرماية بالقوس",
      descriptionEn: "Develop your focus, control and accuracy through a supervised archery experience. Suitable from age 7.",
      descriptionAr: "طوّر تركيزك وتحكمك ودقة تصويبك من خلال تجربة رماية بالقوس تُقام تحت الإشراف. مناسبة من عمر 7 سنوات.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/archery.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-15",
      titleEn: "Axe Hero",
      titleAr: "آكس هيرو – تحدي رمي الفأس",
      descriptionEn: "A supervised precision challenge where participants test their focus and targeting ability within a controlled activity zone.",
      descriptionAr: "تحدٍ يعتمد على الدقة ويُقام تحت إشراف متخصص، حيث يختبر المشاركون التركيز والقدرة على إصابة الهدف داخل منطقة منظمة.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/axe-hero.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-16",
      titleEn: "Toon Quest",
      titleAr: "تون كويست",
      descriptionEn: "A colourful, cartoon-inspired two-player arcade challenge combining responsive gameplay with friendly competition.",
      descriptionAr: "لعبة أركيد ملونة مستوحاة من عالم الرسوم المتحركة، مصممة للاعبين وتجمع بين التفاعل والمنافسة الودية.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/toon-quest.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-17",
      titleEn: "Interactive Air Hockey",
      titleAr: "الهوكي الهوائي التفاعلي",
      descriptionEn: "A digitally enhanced air-hockey experience featuring responsive overlays and visual effects. Suitable from age 7.",
      descriptionAr: "تجربة هوكي هوائي مطورة رقمياً، تضم مؤثرات بصرية وعناصر تفاعلية تستجيب لحركة اللعب. مناسبة من عمر 7 سنوات.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/interactive-air-hockey.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-18",
      titleEn: "PS5 Gaming Station",
      titleAr: "محطة ألعاب بلايستيشن 5",
      descriptionEn: "Enjoy timed PlayStation 5 sessions featuring next-generation visuals, responsive gameplay and social gaming experiences.",
      descriptionAr: "استمتع بجلسات بلايستيشن 5 محددة المدة، مع رسومات من الجيل الجديد وألعاب سريعة الاستجابة وتجارب اجتماعية ممتعة.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/ps5.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-19",
      titleEn: "Hoop Shots",
      titleAr: "تحدي رميات السلة",
      descriptionEn: "Step up to the lane and test your shooting accuracy across fast, replayable basketball challenges. Suitable from age 6.",
      descriptionAr: "تقدم إلى خط الرمي واختبر دقة تصويبك في تحديات كرة سلة سريعة ومتجددة. مناسبة من عمر 6 سنوات.",
      storyTypeIds: ["COMPETE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/hoop-shots.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-20",
      titleEn: "Arcade Gaming Zone",
      titleAr: "منطقة ألعاب الأركيد",
      descriptionEn: "Explore a lively collection of classic and modern arcade machines, skill games and high-score challenges.",
      descriptionAr: "اكتشف مجموعة حيوية من أجهزة الأركيد الكلاسيكية والحديثة وألعاب المهارة وتحديات تحقيق أعلى النتائج.",
      storyTypeIds: ["EXPLORE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/arcade.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    },
    {
      id: "ua-act-21",
      titleEn: "AR Racing",
      titleAr: "سباقات الواقع المعزز",
      descriptionEn: "Race through a digitally enhanced environment featuring interactive obstacles, visual effects and competitive challenges. Suitable from age 7.",
      descriptionAr: "تسابق داخل بيئة مطورة رقمياً تضم عوائق تفاعلية ومؤثرات بصرية وتحديات تنافسية. مناسبة من عمر 7 سنوات.",
      storyTypeIds: ["DRIVE"],
      highlightType: "Activity",
      iconUrl: "/icons/attractions/urban-arena/ar-racing.svg",
      linkedBrandId: "brand-urban-arena",
      showBrandLogo: true
    }
  ]

  // 8 Pricing Tiers
  const pricingData = [
    {
      titleEn: "Rookie Pass",
      titleAr: "باقة روكي",
      price: 45,
      discount: 0,
      currency: "QAR",
      type: "GENERAL",
      descriptionEn: "45 minutes of access to included Urban Arena activities. Paintless Paintball, Bazooka Ball, Laser Tag, Contemporary Billiards and Projected Billiards are excluded and priced separately.",
      descriptionAr: "دخول لمدة 45 دقيقة إلى أنشطة أوربان أرينا المشمولة. لا تشمل الباقة البينتبول بدون طلاء أو بازوكا بول أو الليزر تاغ أو البلياردو العصري أو البلياردو بالإسقاطات التفاعلية، وتُحتسب أسعارها بشكل منفصل."
    },
    {
      titleEn: "Pro Pass",
      titleAr: "باقة برو",
      price: 75,
      discount: 0,
      currency: "QAR",
      type: "GENERAL",
      descriptionEn: "90 minutes of access to included Urban Arena activities. Paintless Paintball, Bazooka Ball, Laser Tag, Contemporary Billiards and Projected Billiards are excluded and priced separately.",
      descriptionAr: "دخول لمدة 90 دقيقة إلى أنشطة أوربان أرينا المشمولة. لا تشمل الباقة البينتبول بدون طلاء أو بازوكا بول أو الليزر تاغ أو البلياردو العصري أو البلياردو بالإسقاطات التفاعلية، وتُحتسب أسعارها بشكل منفصل."
    },
    {
      titleEn: "Ultimate Pass",
      titleAr: "الباقة المطلقة",
      price: 199,
      discount: 0,
      currency: "QAR",
      type: "GENERAL",
      descriptionEn: "All-day access to included Urban Arena activities. Paintless Paintball, Bazooka Ball, Laser Tag, Contemporary Billiards and Projected Billiards are excluded and priced separately.",
      descriptionAr: "دخول طوال اليوم إلى أنشطة أوربان أرينا المشمولة. لا تشمل الباقة البينتبول بدون طلاء أو بازوكا بول أو الليزر تاغ أو البلياردو العصري أو البلياردو بالإسقاطات التفاعلية، وتُحتسب أسعارها بشكل منفصل."
    },
    {
      titleEn: "Paintless Paintball",
      titleAr: "بينتبول بدون طلاء",
      price: 75,
      discount: 0,
      currency: "QAR",
      type: "ADD_ON",
      descriptionEn: "QAR 75 standard price or QAR 50 when purchased as an eligible package add-on. Charged per game for 2–8 players.",
      descriptionAr: "السعر الأساسي 75 ر.ق، أو 50 ر.ق عند إضافتها إلى باقة مؤهلة. السعر لكل جولة، من لاعبين إلى 8 لاعبين."
    },
    {
      titleEn: "Bazooka Ball",
      titleAr: "بازوكا بول",
      price: 55,
      discount: 0,
      currency: "QAR",
      type: "ADD_ON",
      descriptionEn: "QAR 55 standard price or QAR 40 when purchased as an eligible package add-on. Charged per game for 2–8 players.",
      descriptionAr: "السعر الأساسي 55 ر.ق، أو 40 ر.ق عند إضافتها إلى باقة مؤهلة. السعر لكل جولة، من لاعبين إلى 8 لاعبين."
    },
    {
      titleEn: "Laser Tag",
      titleAr: "ليزر تاغ",
      price: 55,
      discount: 0,
      currency: "QAR",
      type: "ADD_ON",
      descriptionEn: "QAR 55 standard price or QAR 40 when purchased as an eligible package add-on. Charged per game for 2–8 players.",
      descriptionAr: "السعر الأساسي 55 ر.ق، أو 40 ر.ق عند إضافتها إلى باقة مؤهلة. السعر لكل جولة، من لاعبين إلى 8 لاعبين."
    },
    {
      titleEn: "Contemporary Billiards",
      titleAr: "البلياردو العصري",
      price: 50,
      discount: 0,
      currency: "QAR",
      type: "ADD_ON",
      descriptionEn: "QAR 50 standard price or QAR 35 when purchased as an eligible package add-on. One-hour table booking for up to four players with two cue sticks.",
      descriptionAr: "السعر الأساسي 50 ر.ق، أو 35 ر.ق عند إضافتها إلى باقة مؤهلة. حجز طاولة لمدة ساعة لما يصل إلى 4 لاعبين، مع عصوين للبلياردو."
    },
    {
      titleEn: "Projected Billiards",
      titleAr: "البلياردو بالإسقاطات التفاعلية",
      price: 65,
      discount: 0,
      currency: "QAR",
      type: "ADD_ON",
      descriptionEn: "QAR 65 standard price or QAR 40 when purchased as an eligible package add-on. One-hour interactive table booking for up to four players with two cue sticks.",
      descriptionAr: "السعر الأساسي 65 ر.ق، أو 40 ر.ق عند إضافتها إلى باقة مؤهلة. حجز طاولة تفاعلية لمدة ساعة لما يصل إلى 4 لاعبين، مع عصوين للبلياردو."
    }
  ]

  const operationsNote = {
    pricingNoteEn: "Package access is subject to attraction availability, operating requirements, age restrictions and venue safety rules. Premium activities excluded from the entry passes must be purchased separately.",
    pricingNoteAr: "يخضع استخدام الباقات لتوفر الأنشطة ومتطلبات التشغيل وشروط العمر وتعليمات السلامة في الموقع. يجب شراء الأنشطة المميزة غير المشمولة في باقات الدخول بشكل منفصل."
  }

  // Find or Create Urban Arena Attraction
  let attraction = await prisma.attraction.findFirst({
    where: { OR: [{ slug: urbanArenaSlug }, { slug: "urban-arena" }] }
  })

  if (!attraction) {
    attraction = await prisma.attraction.create({
      data: {
        slug: urbanArenaSlug,
        nameEn: "Urban Arena",
        nameAr: "أوربان أرينا",
        taglineEn: "Interactive Multi-Activity Gaming & Sports Arena",
        taglineAr: "ساحة الألعاب والمنافسات الرياضية التفاعلية",
        descriptionEn: "Urban Arena is Qatar's premier indoor multi-activity gaming hub featuring 21 interactive activations, mini-golf, AR go-karting, laser tag, and projected billiards.",
        descriptionAr: "أوربان أرينا هي الوجهة الأولى للألعاب والأنشطة التفاعلية في قطر، حيث تضم 21 تجربة حماسية تشمل الميني غولف وسباقات الكارتينغ بالواقع المعزز والليزر تاغ والبلياردو التفاعلي.",
        isPublished: true,
        isFeatured: true,
        features,
        operations: operationsNote
      }
    })
  } else {
    // Update existing record
    attraction = await prisma.attraction.update({
      where: { id: attraction.id },
      data: {
        nameEn: "Urban Arena",
        nameAr: "أوربان أرينا",
        isPublished: true,
        features,
        operations: {
          ...((attraction.operations as any) || {}),
          ...operationsNote
        }
      }
    })
  }

  // Delete old pricing and create updated 8 pricing tiers
  await prisma.attractionPricing.deleteMany({
    where: { attractionId: attraction.id }
  })

  for (const p of pricingData) {
    await prisma.attractionPricing.create({
      data: {
        attractionId: attraction.id,
        ...p
      }
    })
  }

  console.log(`✅ Urban Arena updated with ${features.length} activations and ${pricingData.length} pricing tiers! ID: ${attraction.id}`)
}

main()
  .catch(e => {
    console.error("❌ Seed script error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
