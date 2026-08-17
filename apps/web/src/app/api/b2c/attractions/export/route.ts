import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import * as XLSX from "xlsx"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isTemplateOnly = searchParams.get("template") === "true"

    const attractions = isTemplateOnly ? [] : await db.attraction.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        pricing: true,
        faqs: true,
        gallery: true,
        featuresList: {
          include: {
            storyTypes: true
          }
        },
        attractionLocations: {
          include: {
            location: true
          }
        }
      }
    })

    const workbook = XLSX.utils.book_new()

    // 1. Attractions Sheet
    const attractionsData = attractions.map((a: any) => ({
      slug: a.slug,
      nameEn: a.nameEn,
      nameAr: a.nameAr,
      entityType: a.entityType || "ATTRACTION",
      experienceFormat: a.experienceFormat || "PERMANENT_FEC",
      accessModel: a.accessModel || "PAID",
      durationModel: a.durationModel || "PERMANENT",
      environment: a.environment || "INDOOR",
      taglineEn: a.taglineEn || "",
      taglineAr: a.taglineAr || "",
      descriptionEn: a.descriptionEn || "",
      descriptionAr: a.descriptionAr || "",
      heroMediaUrl: a.heroMediaUrl || "",
      logoUrl: a.logoUrl || "",
      isPublished: a.isPublished,
      isFeatured: a.isFeatured,
      isB2bVisible: a.isB2bVisible
    }))
    if (attractionsData.length === 0) {
      attractionsData.push({
        slug: "sample-attraction",
        nameEn: "Sample Entertainment Center",
        nameAr: "مركز ترفيهي تجريبي",
        entityType: "ATTRACTION",
        experienceFormat: "PERMANENT_FEC",
        accessModel: "PAID",
        durationModel: "PERMANENT",
        environment: "INDOOR",
        taglineEn: "Next-Gen Mixed Reality Arena",
        taglineAr: "ساحة التحديات التفاعلية",
        descriptionEn: "Experience high-energy games and simulators.",
        descriptionAr: "استمتع بأحدث الألعاب والسباقات التفاعلية.",
        heroMediaUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
        logoUrl: "https://example.com/logo.png",
        isPublished: true,
        isFeatured: false,
        isB2bVisible: true
      })
    }
    const wsAttractions = XLSX.utils.json_to_sheet(attractionsData)
    XLSX.utils.book_append_sheet(workbook, wsAttractions, "Attractions")

    // 2. Locations Sheet
    const locationsData = attractions.flatMap((a: any) => (a.attractionLocations || []).map((al: any) => ({
      attractionSlug: a.slug,
      locationNameEn: al.location?.nameEn || "",
      locationNameAr: al.location?.nameAr || "",
      venueEn: al.location?.venueEn || "",
      venueAr: al.location?.venueAr || "",
      latitude: al.location?.latitude || "",
      longitude: al.location?.longitude || "",
      isPrimary: al.isPrimary,
      bookingUrlOverride: al.bookingUrlOverride || ""
    })))
    if (locationsData.length === 0) {
      locationsData.push({
        attractionSlug: "sample-attraction",
        locationNameEn: "Doha Mall Venue",
        locationNameAr: "فرع دوحة مول",
        venueEn: "Doha Mall, P Floor",
        venueAr: "دوحة مول، الطابق P",
        latitude: 25.233187,
        longitude: 51.506754,
        isPrimary: true,
        bookingUrlOverride: "https://booking.e3.qa"
      })
    }
    const wsLocations = XLSX.utils.json_to_sheet(locationsData)
    XLSX.utils.book_append_sheet(workbook, wsLocations, "Locations")

    // 3. Activities Sheet
    const activitiesData = attractions.flatMap((a: any) => (a.featuresList || []).map((f: any) => {
      const primaryTrack = f.storyTypes?.[0]?.slug || "explore"
      const secondaryTracks = (f.storyTypes?.slice(1) || []).map((st: any) => st.slug).join("; ")
      return {
        attractionSlug: a.slug,
        titleEn: f.titleEn,
        titleAr: f.titleAr,
        contentType: f.highlightType || "ACTIVITY",
        primaryStoryTrackSlug: primaryTrack,
        secondaryStoryTrackSlugs: secondaryTracks,
        intensityLevel: f.intensityLevel || "MEDIUM",
        durationMinutes: f.durationMinutes || "",
        minAge: f.minAge || "",
        minHeightCm: f.minHeightCm || "",
        descriptionEn: f.descriptionEn || "",
        descriptionAr: f.descriptionAr || "",
        imageUrl: f.imageUrl || ""
      }
    }))
    if (activitiesData.length === 0) {
      activitiesData.push({
        attractionSlug: "sample-attraction",
        titleEn: "AR Racing Simulator",
        titleAr: "محاكي السباق بالواقع المعزز",
        contentType: "ACTIVITY",
        primaryStoryTrackSlug: "drive",
        secondaryStoryTrackSlugs: "compete; adrenaline",
        intensityLevel: "HIGH",
        durationMinutes: 15,
        minAge: 10,
        minHeightCm: 130,
        descriptionEn: "High speed electric karting with augmented reality boosts.",
        descriptionAr: "سباقات كارتينغ كهربائية سريعة ومعززة بالتحديات الرقمية.",
        imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7"
      })
    }
    const wsActivities = XLSX.utils.json_to_sheet(activitiesData)
    XLSX.utils.book_append_sheet(workbook, wsActivities, "Activities")

    // 4. Pricing Sheet
    const pricingData = attractions.flatMap((a: any) => (a.pricing || []).map((p: any) => ({
      attractionSlug: a.slug,
      titleEn: p.titleEn,
      titleAr: p.titleAr,
      price: p.price,
      currency: p.currency,
      type: p.type,
      descriptionEn: p.descriptionEn || "",
      descriptionAr: p.descriptionAr || ""
    })))
    if (pricingData.length === 0) {
      pricingData.push({
        attractionSlug: "sample-attraction",
        titleEn: "General Pass",
        titleAr: "تذكرة عامة",
        price: 50,
        currency: "QAR",
        type: "ACCESS_PASS",
        descriptionEn: "Access to standard activities for 60 minutes.",
        descriptionAr: "دخول للأنشطة الأساسية لمدة 60 دقيقة."
      })
    }
    const wsPricing = XLSX.utils.json_to_sheet(pricingData)
    XLSX.utils.book_append_sheet(workbook, wsPricing, "Pricing")

    // 5. Gallery Sheet
    const galleryData = attractions.flatMap((a: any) => (a.gallery || []).map((g: any) => ({
      attractionSlug: a.slug,
      url: g.url,
      captionEn: g.captionEn || "",
      captionAr: g.captionAr || ""
    })))
    if (galleryData.length === 0) {
      galleryData.push({
        attractionSlug: "sample-attraction",
        url: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
        captionEn: "Arena main hall view",
        captionAr: "منظر الصالة الرئيسية"
      })
    }
    const wsGallery = XLSX.utils.json_to_sheet(galleryData)
    XLSX.utils.book_append_sheet(workbook, wsGallery, "Gallery")

    // 6. FAQs Sheet
    const faqsData = attractions.flatMap((a: any) => (a.faqs || []).map((f: any) => ({
      attractionSlug: a.slug,
      questionEn: f.questionEn,
      questionAr: f.questionAr,
      answerEn: f.answerEn,
      answerAr: f.answerAr
    })))
    if (faqsData.length === 0) {
      faqsData.push({
        attractionSlug: "sample-attraction",
        questionEn: "What are the operating hours?",
        questionAr: "ما هي أوقات العمل؟",
        answerEn: "Daily from 10:00 AM to 10:00 PM.",
        answerAr: "يومياً من الساعة ١٠:٠٠ صباحاً حتى ١٠:٠٠ مساءً."
      })
    }
    const wsFaqs = XLSX.utils.json_to_sheet(faqsData)
    XLSX.utils.book_append_sheet(workbook, wsFaqs, "FAQs")

    // 7. Partners Sheet
    const wsPartners = XLSX.utils.json_to_sheet([
      {
        attractionSlug: "sample-attraction",
        name: "Visit Qatar",
        tagline: "Official Tourism Partner",
        logoUrl: "https://example.com/visit-qatar.png"
      }
    ])
    XLSX.utils.book_append_sheet(workbook, wsPartners, "Partners")

    // 8. Social & News Sheet
    const wsSocial = XLSX.utils.json_to_sheet([
      {
        attractionSlug: "sample-attraction",
        platform: "Instagram",
        url: "https://instagram.com/e3qatar"
      }
    ])
    XLSX.utils.book_append_sheet(workbook, wsSocial, "Social & News")

    const outBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new Response(outBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${isTemplateOnly ? "e3_attractions_template.xlsx" : "e3_attractions_export.xlsx"}"`
      }
    })
  } catch (error: any) {
    console.error("[EXPORT_ATTRACTIONS_ERROR]", error)
    return NextResponse.json({ error: error.message || "Export failed" }, { status: 500 })
  }
}
