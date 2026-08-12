import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

export const DEFAULT_PACKAGES = [
  {
    slug: "inflatarun-vip-birthday",
    code: "PKG-INFLATA-BDAY",
    titleEn: "InflataRUN VIP Birthday Adventure",
    titleAr: "مغامرة عيد الميلاد VIP في إنفلاتا ران",
    taglineEn: "Bounce, race, and celebrate across Qatar's record 1,055m inflatable dunes",
    taglineAr: "اقفز وسابق واحتفل في أكبر مدينة ألعاب مطاطية بقطر",
    shortDescriptionEn: "All-inclusive VIP inflatable birthday party with private party room, dedicated host, food & cake ceremony.",
    shortDescriptionAr: "حفل عيد ميلاد VIP متكامل يشمل غرفة خاصة، مضيف حفل، وجبات، ومراسم الكعكة.",
    fullDescriptionEn: "Engineered for maximum fun and safety, the InflataRUN VIP Birthday package gives your child and their friends exclusive access to inflatable dunes, private party room celebration, and custom mascot moments.",
    fullDescriptionAr: "صُممت باقة إنفلاتا ران لتوفير أعلى درجات المتعة والسلامة، مع دخول حصري للألعاب وغرفة احتفالات خاصة.",
    category: "BIRTHDAY",
    audienceType: "KIDS",
    coverMediaUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
    heroMediaUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80",
    startingPrice: 1500,
    priceDisplayMode: "STARTING_FROM",
    currency: "QAR",
    minGuests: 10,
    maxGuests: 40,
    durationMinutes: 150,
    ageSuitabilityEn: "Ages 4 - 14",
    ageSuitabilityAr: "الأعمار ٤ - ١٤ سنة",
    indoorOutdoor: "INDOOR",
    badgeTextEn: "Most Popular",
    badgeTextAr: "الأكثر طلباً",
    availabilityStatus: "AVAILABLE",
    bookingType: "ENQUIRY_REQUIRED",
    isFeatured: true,
    isPublished: true,
    sortOrder: 1,
    tiers: [
      {
        id: "tier-essential",
        nameEn: "Essential Adventure",
        nameAr: "المغامرة الأساسية",
        price: 1500,
        guestCount: 10,
        extraGuestPrice: 100,
        durationMinutes: 120,
        includedItems: ["90 Mins Inflatable Park Access", "30 Mins Party Room", "Dedicated Party Host", "Digital Invitations", "Birthday Child Certificate"],
        excludedItems: ["Mascot Appearance", "Return Goodie Bags"]
      },
      {
        id: "tier-premium",
        nameEn: "VIP Party Ultimate",
        nameAr: "حفل VIP الفاخر",
        price: 2600,
        guestCount: 15,
        extraGuestPrice: 120,
        durationMinutes: 150,
        recommended: true,
        includedItems: ["120 Mins Inflatable Park Access", "40 Mins Private Party Room", "Personal Party Facilitator", "Hot Kids Meals & Juice", "Themed Decor Setup", "Mascot Meet & Greet", "E3 Gift Bags for Guests"]
      }
    ],
    inclusions: [
      { id: "inc1", titleEn: "Inflatable Dunes Access", titleAr: "دخول حديقة المطاطيات", icon: "Sparkles", status: "INCLUDED" },
      { id: "inc2", titleEn: "Private Party Room", titleAr: "غرفة الحفلات الخاصة", icon: "Building", status: "INCLUDED" },
      { id: "inc3", titleEn: "Dedicated Party Host", titleAr: "مضيف حفل مخصص", icon: "Users", status: "INCLUDED" },
      { id: "inc4", titleEn: "Kids Meals & Juice", titleAr: "وجبات أطفال ومشروبات", icon: "Utensils", status: "INCLUDED" },
      { id: "inc5", titleEn: "Safety Grip Socks", titleAr: "جوارب السلامة الرياضية", icon: "ShieldCheck", status: "INCLUDED" }
    ],
    addOns: [
      { id: "add1", titleEn: "Mascot Character Visit", titleAr: "زيارة الشخصية الكرتونية", price: 350, priceType: "FIXED", minQty: 1, maxQty: 2 },
      { id: "add2", titleEn: "Custom Balloon Arch Setup", titleAr: "قوس البالونات الثيم الخاص", price: 450, priceType: "FIXED", minQty: 1, maxQty: 1 },
      { id: "add3", titleEn: "Professional Event Photographer", titleAr: "مصور حفل محترف", price: 600, priceType: "FIXED", minQty: 1, maxQty: 1 },
      { id: "add4", titleEn: "Extra 30 Mins Play Time", titleAr: "٣٠ دقيقة لعب إضافية", price: 30, priceType: "PER_GUEST", minQty: 10, maxQty: 50 }
    ],
    journeySteps: [
      { id: "j1", stepNumber: 1, titleEn: "Select Package & Date", titleAr: "اختيار الباقة والتاريخ", descriptionEn: "Choose your preferred party tier and guest count." },
      { id: "j2", stepNumber: 2, titleEn: "Customize Add-Ons", titleAr: "تخصيص الإضافات", descriptionEn: "Add mascot visits, custom themes, and photography." },
      { id: "j3", stepNumber: 3, titleEn: "E3 Confirmation", titleAr: "تأكيد فريق إي ثري", descriptionEn: "Our event coordinator verifies venue slot and details." },
      { id: "j4", stepNumber: 4, titleEn: "Celebrate!", titleAr: "الاحتفال والبهجة", descriptionEn: "Arrive at InflataRUN for an unforgettable birthday." }
    ],
    faqs: [
      { id: "f1", questionEn: "Can we bring our own birthday cake?", questionAr: "هل يمكننا إحضار كعكة عيد الميلاد الخاصة بنا؟", answerEn: "Yes! You are welcome to bring a birthday cake. Our team will store and present it during the cake ceremony." },
      { id: "f2", questionEn: "What is the minimum age for InflataRUN?", questionAr: "ما هو الحد الأدنى للعمر في إنفلاتا ران؟", answerEn: "InflataRUN welcomes children aged 3 and above. Toddler zones are available for younger guests." }
    ]
  },
  {
    slug: "urban-arena-tactical-combat",
    code: "PKG-URBAN-CORP",
    titleEn: "Urban Arena Tactical Team Outing",
    titleAr: "تحدي الشركات وتكتيك الفرق في أوربان أرينا",
    taglineEn: "High-octane laser tag, spatial sound combat, and corporate leaderboard challenges",
    taglineAr: "تحديات المعارك التكتيكية بالليزر والرياضات الإلكترونية للشركات",
    shortDescriptionEn: "Competitive corporate team-building experience with private arena buyout, leaderboard tracking & catering.",
    shortDescriptionAr: "تجربة بناء الفرق وتطوير المهارات التكتيكية للشركات مع حجز الساحة والتحليلات.",
    category: "CORPORATE",
    audienceType: "CORPORATE",
    coverMediaUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80",
    heroMediaUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80",
    startingPrice: 3500,
    priceDisplayMode: "STARTING_FROM",
    currency: "QAR",
    minGuests: 15,
    maxGuests: 100,
    durationMinutes: 180,
    ageSuitabilityEn: "Adults & Corporate Groups",
    ageSuitabilityAr: "الشركات والكبار",
    indoorOutdoor: "INDOOR",
    badgeTextEn: "Corporate Choice",
    badgeTextAr: "خيار الشركات الأول",
    availabilityStatus: "AVAILABLE",
    bookingType: "ENQUIRY_REQUIRED",
    isFeatured: true,
    isPublished: true,
    sortOrder: 2,
    tiers: [
      {
        id: "tier-tactical",
        nameEn: "Tactical Challenge",
        nameAr: "تحدي التكتيك",
        price: 3500,
        guestCount: 20,
        extraGuestPrice: 150,
        durationMinutes: 120,
        includedItems: ["Private Laser Tag Arena Buyout", "Tactical Briefing & Facilitator", "Live Leaderboard Scoring", "Welcome Mocktails"]
      },
      {
        id: "tier-command",
        nameEn: "Command & Control VIP",
        nameAr: "القيادة والسيطرة VIP",
        price: 5800,
        guestCount: 35,
        extraGuestPrice: 160,
        durationMinutes: 180,
        recommended: true,
        includedItems: ["Full Arena Exclusive Access", "AV & Screen Branding", "Corporate Trophy Ceremony", "Gourmet Buffet Catering", "High-res Event Photo Package"]
      }
    ],
    inclusions: [
      { id: "inc1", titleEn: "Laser Tag Arena Access", titleAr: "دخول ساحة المعارك التكتيكية", icon: "Crosshair", status: "INCLUDED" },
      { id: "inc2", titleEn: "Live Leaderboards", titleAr: "شاشات النتائج المباشرة", icon: "Trophy", status: "INCLUDED" },
      { id: "inc3", titleEn: "Event Facilitator", titleAr: "مدرب وميسر فعاليات", icon: "Users", status: "INCLUDED" }
    ],
    addOns: [
      { id: "add1", titleEn: "Custom Corporate AV Branding", titleAr: "عرض شعار الشركة على شاشات العرض", price: 800, priceType: "FIXED" },
      { id: "add2", titleEn: "VIP Catering Upgrade", titleAr: "باقة البوفيه الفاخر", price: 90, priceType: "PER_GUEST" }
    ]
  },
  {
    slug: "kids-city-school-outing",
    code: "PKG-KIDS-SCHOOL",
    titleEn: "Kids City School & Nursery Outing",
    titleAr: "رحلات المدارس والحضانات في مدينة قيادة الأطفال",
    taglineEn: "Educational traffic rules, driving licences, and interactive mini-city exploration",
    taglineAr: "رحلات تعليمية تفاعلية للتعرف على قواعد المرور واستخراج رخص القيادة المصغرة",
    shortDescriptionEn: "Structured educational field trips for schools and nurseries with traffic lessons and driving licences.",
    shortDescriptionAr: "رحلات مدرسية تعليمية منظمّة تشمل دروس السلامة المرورية ورخص القيادة التذكارية.",
    category: "SCHOOL",
    audienceType: "KIDS",
    coverMediaUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    heroMediaUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    startingPrice: 1200,
    priceDisplayMode: "PER_GUEST",
    currency: "QAR",
    minGuests: 20,
    maxGuests: 150,
    durationMinutes: 150,
    ageSuitabilityEn: "Nursery to Grade 5",
    ageSuitabilityAr: "الحضانات ورياض الأطفال والابتدائي",
    indoorOutdoor: "INDOOR",
    badgeTextEn: "Educational Approved",
    badgeTextAr: "معتمد للمدارس",
    availabilityStatus: "AVAILABLE",
    bookingType: "ENQUIRY_REQUIRED",
    isFeatured: false,
    isPublished: true,
    sortOrder: 3,
    tiers: [
      {
        id: "tier-school-std",
        nameEn: "Mini Driver Explorer",
        nameAr: "السائق الصغير الاستكشافي",
        price: 1200,
        guestCount: 20,
        extraGuestPrice: 55,
        durationMinutes: 120,
        includedItems: ["Traffic Safety Workshop", "Electric Car Driving Session", "Personalized Printed Driving Licences", "Supervisors Complimentary Access"]
      }
    ]
  }
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const venue = searchParams.get("venue")
    const featured = searchParams.get("featured") === "true"
    const search = searchParams.get("search")

    // Check count and auto-seed default packages if empty
    const count = await db.package.count()
    if (count === 0) {
      for (const p of DEFAULT_PACKAGES) {
        await db.package.create({ data: p }).catch(console.error)
      }
    }

    const where: any = { isPublished: true }

    if (category && category !== "ALL") {
      where.category = category.toUpperCase()
    }
    if (featured) {
      where.isFeatured = true
    }
    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: "insensitive" } },
        { titleAr: { contains: search, mode: "insensitive" } },
        { shortDescriptionEn: { contains: search, mode: "insensitive" } }
      ]
    }

    const packages = await db.package.findMany({
      where,
      include: {
        attraction: { select: { id: true, nameEn: true, nameAr: true, slug: true } },
        brand: { select: { id: true, nameEn: true, nameAr: true } },
        location: { select: { id: true, nameEn: true, nameAr: true } }
      },
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ]
    })

    return NextResponse.json({ data: packages })
  } catch (error: any) {
    console.error("[GET /api/b2c/packages] Error:", error)
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { titleEn, titleAr, slug, category, startingPrice, ...rest } = body

    if (!titleEn) {
      return NextResponse.json({ error: "Title EN is required" }, { status: 400 })
    }

    const generatedSlug = slug || titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

    const newPackage = await db.package.create({
      data: {
        titleEn,
        titleAr: titleAr || titleEn,
        slug: generatedSlug,
        category: category || "BIRTHDAY",
        startingPrice: startingPrice ? parseFloat(startingPrice) : 0,
        ...rest
      }
    })

    return NextResponse.json({ data: newPackage })
  } catch (error: any) {
    console.error("[POST /api/b2c/packages] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create package" }, { status: 500 })
  }
}
