import * as XLSX from "xlsx"
import { db } from "@/lib/db"

export interface MasterAttractionRow {
  attractionId?: string
  nameEn: string
  nameAr?: string
  slug: string
  experienceFormat?: string
  accessModel?: string
  taglineEn?: string
  taglineAr?: string
  descriptionEn?: string
  descriptionAr?: string
  venueLocation?: string
  storyDiscoveryIntro?: string
  heroMediaUrl?: string
  logoUrl?: string
  galleryImages?: string[] // 1 to 10
  status?: string // DRAFT, PUBLISHED, ARCHIVED
}

export interface MasterActivityRow {
  attractionIdentifier: string // ID or Slug
  activityId?: string
  titleEn: string
  titleAr?: string
  descriptionEn?: string
  descriptionAr?: string
  classification?: string // PRIMARY_ATTRACTION, FEATURED_RIDE, INTERACTIVE_ZONE, etc.
  primaryStoryTrack?: string // e.g. "drive", "bounce", "compete", "explore", "celebrate", "family-time"
  secondaryStoryTracks?: string // semicolon or comma-delimited
  duration?: string | number
  ageRange?: string
  accessibility?: string
  coverImageUrl?: string
  additionalImage2Url?: string
  additionalImage3Url?: string
  additionalImage4Url?: string
  videoUrl?: string
  mediaStatus?: string // MISSING, PARTIALLY_COMPLETE, READY, APPROVED
  contentStatus?: string // DRAFT, READY, APPROVED
}

export interface MasterPricingRow {
  attractionIdentifier: string // ID or Slug
  pricingId?: string
  titleEn: string
  titleAr?: string
  category?: string // ACCESS_PASS, PREMIUM_ACTIVITY, HOURLY_ACTIVITY, ADD_ON
  price: number
  duration?: string
  descriptionEn?: string
  descriptionAr?: string
  includedActivities?: string
  accessModel?: string // PAID, FREE
  activeStatus?: string // ACTIVE, INACTIVE
  displayOrder?: number
}

export interface MasterWorkbookData {
  attractions: MasterAttractionRow[]
  activities: MasterActivityRow[]
  pricing: MasterPricingRow[]
}

export interface ValidationRecordDiff {
  sheet: 'Attraction' | 'What\'s Inside' | 'Pricing'
  rowNumber: number
  identifier: string
  titleEn: string
  action: 'CREATE' | 'UPDATE' | 'UNCHANGED' | 'WARNING' | 'ERROR'
  messages: string[]
  mediaStatus?: 'MISSING' | 'PARTIALLY_COMPLETE' | 'READY' | 'APPROVED'
  contentStatus?: 'DRAFT' | 'READY' | 'APPROVED'
  data: any
}

export interface ValidationReport {
  isValid: boolean
  totalRows: number
  createdCount: number
  updatedCount: number
  unchangedCount: number
  warningCount: number
  errorCount: number
  diffs: ValidationRecordDiff[]
  mediaQueueSummary: {
    totalAttractions: number
    attractionsMeetingGalleryTarget: number // >= 10
    totalActivities: number
    activitiesMeetingMediaTarget: number // 1 cover + 3 supporting = 4 images
    missingMediaCount: number
    partialMediaCount: number
    readyMediaCount: number
    approvedMediaCount: number
  }
}

const DEFAULT_STORY_TRACKS: Record<string, { slug: string; titleEn: string; titleAr: string }> = {
  drive: { slug: "drive", titleEn: "Drive", titleAr: "القيادة" },
  bounce: { slug: "bounce", titleEn: "Bounce", titleAr: "القفز والمرح" },
  compete: { slug: "compete", titleEn: "Compete", titleAr: "التحدي والمنافسة" },
  explore: { slug: "explore", titleEn: "Explore", titleAr: "الاستكشاف" },
  celebrate: { slug: "celebrate", titleEn: "Celebrate", titleAr: "الاحتفال" },
  "family-time": { slug: "family-time", titleEn: "Family Time", titleAr: "وقت العائلة" },
  family: { slug: "family-time", titleEn: "Family Time", titleAr: "وقت العائلة" }
}

/**
 * Standardizes story track string into canonical slug.
 */
export function normalizeStoryTrack(trackRaw?: string): string {
  if (!trackRaw) return "explore"
  const clean = String(trackRaw).toLowerCase().trim().replace(/[\s_]+/g, "-")
  if (DEFAULT_STORY_TRACKS[clean]) return DEFAULT_STORY_TRACKS[clean].slug
  for (const [key, val] of Object.entries(DEFAULT_STORY_TRACKS)) {
    if (val.titleEn.toLowerCase() === clean || val.titleAr === clean) return key
  }
  return clean
}

/**
 * Generates the unified 3-Tab Master Workbook XLSX buffer.
 */
export async function generateMasterWorkbook(options: {
  attractionIdOrSlug?: string
  templateOnly?: boolean
}): Promise<Buffer> {
  const { attractionIdOrSlug, templateOnly } = options

  let attractionsDb: any[] = []

  if (!templateOnly) {
    const where: any = {}
    if (attractionIdOrSlug) {
      where.OR = [
        { id: attractionIdOrSlug },
        { slug: attractionIdOrSlug.toLowerCase().trim() }
      ]
    }

    attractionsDb = await db.attraction.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        gallery: { orderBy: { orderIndex: "asc" } },
        featuresList: {
          orderBy: { orderIndex: "asc" },
          include: { storyTypes: true }
        },
        pricing: { orderBy: { createdAt: "asc" } },
        attractionLocations: {
          include: { location: true }
        }
      }
    })
  }

  const workbook = XLSX.utils.book_new()

  // --------------------------------------------------------------------------
  // TAB 1: Attraction
  // --------------------------------------------------------------------------
  const attractionRows: any[] = attractionsDb.map((a: any) => {
    const venue = a.attractionLocations?.[0]?.location?.venueEn || a.attractionLocations?.[0]?.location?.nameEn || (a.operations as any)?.venueName || ""
    const storyIntro = (a.operations as any)?.storyIntro || (a.features as any)?.storyIntro || ""
    const gallery = (a.gallery || []).map((g: any) => g.url)

    const row: any = {
      "Attraction ID": a.id,
      "Name (EN)": a.nameEn,
      "Name (AR)": a.nameAr,
      "Slug": a.slug,
      "Attraction Format": a.experienceFormat || "PERMANENT_FEC",
      "Free/Paid": a.accessModel || "PAID",
      "Tagline (EN)": a.taglineEn || "",
      "Tagline (AR)": a.taglineAr || "",
      "Description (EN)": a.descriptionEn || "",
      "Description (AR)": a.descriptionAr || "",
      "Venue / Location": venue,
      "Story Discovery Introduction": storyIntro,
      "Hero Image URL": a.heroMediaUrl || "",
      "Logo URL": a.logoUrl || ""
    }

    // Gallery images 1 to 10
    for (let i = 1; i <= 10; i++) {
      row[`Gallery Image ${i}`] = gallery[i - 1] || ""
    }

    row["Status"] = a.isPublished ? "PUBLISHED" : "DRAFT"
    return row
  })

  if (attractionRows.length === 0) {
    // Sample template row
    const sampleRow: any = {
      "Attraction ID": "",
      "Name (EN)": "Urban Arena",
      "Name (AR)": "أوربان أرينا",
      "Slug": "urban-arena",
      "Attraction Format": "PERMANENT_FEC",
      "Free/Paid": "PAID",
      "Tagline (EN)": "Next-Gen Mixed Reality Action Arena",
      "Tagline (AR)": "ساحة الواقع المدمج وأحدث التحديات التفاعلية",
      "Description (EN)": "State-of-the-art interactive gaming, laser battles, and dynamic obstacle courses.",
      "Description (AR)": "وجهة ترفيهية متطورة تجمع بين ألعاب الواقع المدمج والمعارك التفاعلية ومسارات التحدي.",
      "Venue / Location": "Doha Mall, P Floor",
      "Story Discovery Introduction": "Enter a thrilling futuristic playground where physical agility meets digital innovation.",
      "Hero Image URL": "https://images.unsplash.com/photo-1511512578047-dfb367046420",
      "Logo URL": "/assets/partners/e3-logo.svg"
    }
    for (let i = 1; i <= 10; i++) {
      sampleRow[`Gallery Image ${i}`] = i === 1 ? "https://images.unsplash.com/photo-1511512578047-dfb367046420" : ""
    }
    sampleRow["Status"] = "DRAFT"
    attractionRows.push(sampleRow)
  }

  const wsAttraction = XLSX.utils.json_to_sheet(attractionRows)
  XLSX.utils.book_append_sheet(workbook, wsAttraction, "Attraction")

  // --------------------------------------------------------------------------
  // TAB 2: What's Inside
  // --------------------------------------------------------------------------
  const activityRows: any[] = attractionsDb.flatMap((a: any) => {
    return (a.featuresList || []).map((f: any) => {
      const primaryTrack = f.storyTypes?.[0]?.titleEn || f.storyTypes?.[0]?.slug || "Explore"
      const secondaryTracks = (f.storyTypes?.slice(1) || []).map((st: any) => st.titleEn || st.slug).join("; ")
      const audience = (f.targetAudience as any) || {}
      const addImgs = audience.additionalImages || []
      const duration = f.durationMinutes ? `${f.durationMinutes} mins` : ""
      const ageRange = f.minAge ? `${f.minAge}+` : "All Ages"
      const accessibility = audience.accessibility || "Fully accessible"

      // Media status calculation
      const hasCover = Boolean(f.imageUrl)
      const additionalCount = addImgs.filter(Boolean).length
      let mediaStatus = "MISSING"
      if (hasCover && additionalCount >= 3) mediaStatus = "READY"
      else if (hasCover || additionalCount > 0) mediaStatus = "PARTIALLY_COMPLETE"
      if (audience.mediaStatus) mediaStatus = audience.mediaStatus

      return {
        "Attraction Identifier": a.slug,
        "Activity ID": f.id,
        "Activity Name (EN)": f.titleEn,
        "Activity Name (AR)": f.titleAr || "",
        "Description (EN)": f.descriptionEn || "",
        "Description (AR)": f.descriptionAr || "",
        "Activity Classification": f.highlightType || "PRIMARY_ATTRACTION",
        "Primary Story Track": primaryTrack,
        "Secondary Story Tracks": secondaryTracks,
        "Duration": duration,
        "Age Range": ageRange,
        "Accessibility": accessibility,
        "Cover Image URL": f.imageUrl || "",
        "Additional Image 2 URL": addImgs[0] || "",
        "Additional Image 3 URL": addImgs[1] || "",
        "Additional Image 4 URL": addImgs[2] || "",
        "Video URL": audience.videoUrl || "",
        "Media Status": mediaStatus,
        "Content Status": audience.contentStatus || "READY"
      }
    })
  })

  if (activityRows.length === 0) {
    activityRows.push({
      "Attraction Identifier": "urban-arena",
      "Activity ID": "",
      "Activity Name (EN)": "Cyber Laser Battle",
      "Activity Name (AR)": "معركة الليزر السيبرانية",
      "Description (EN)": "Tactical multi-level laser tag with immersive light and sound effects.",
      "Description (AR)": "معركة ليزر تكتيكية متعددة المستويات مع مؤثرات ضوئية وصوتية غامرة.",
      "Activity Classification": "PRIMARY_ATTRACTION",
      "Primary Story Track": "Compete",
      "Secondary Story Tracks": "Drive; Adrenaline",
      "Duration": "15 mins",
      "Age Range": "8 - 18",
      "Accessibility": "Wheelchair accessible, Low sensory mode available",
      "Cover Image URL": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7",
      "Additional Image 2 URL": "https://images.unsplash.com/photo-1511512578047-dfb367046420",
      "Additional Image 3 URL": "",
      "Additional Image 4 URL": "",
      "Video URL": "https://www.youtube.com/watch?v=sample",
      "Media Status": "PARTIALLY_COMPLETE",
      "Content Status": "READY"
    })
  }

  const wsActivities = XLSX.utils.json_to_sheet(activityRows)
  XLSX.utils.book_append_sheet(workbook, wsActivities, "What’s Inside")

  // --------------------------------------------------------------------------
  // TAB 3: Pricing
  // --------------------------------------------------------------------------
  const pricingRows: any[] = attractionsDb.flatMap((a: any) => {
    return (a.pricing || []).map((p: any, idx: number) => ({
      "Attraction Identifier": a.slug,
      "Pricing ID": p.id,
      "Package Name (EN)": p.titleEn,
      "Package Name (AR)": p.titleAr,
      "Category": p.type || "ACCESS_PASS",
      "Price (QAR)": p.price,
      "Duration": (p.descriptionEn?.match(/(\d+\s*(?:mins|hours|minutes))/i)?.[1]) || "60 mins",
      "Description (EN)": p.descriptionEn || "",
      "Description (AR)": p.descriptionAr || "",
      "Included Activities": "All standard zone activities",
      "Free/Paid": p.price === 0 ? "FREE" : "PAID",
      "Active Status": "ACTIVE",
      "Display Order": idx + 1
    }))
  })

  if (pricingRows.length === 0) {
    pricingRows.push({
      "Attraction Identifier": "urban-arena",
      "Pricing ID": "",
      "Package Name (EN)": "General Arena Access",
      "Package Name (AR)": "تذكرة دخول الصالة العامة",
      "Category": "ACCESS_PASS",
      "Price (QAR)": 75,
      "Duration": "60 mins",
      "Description (EN)": "Full access to interactive arenas and arcade zones for 1 hour.",
      "Description (AR)": "دخول كامل للساحات التفاعلية وألعاب الآركيد لمدة ساعة واحدة.",
      "Included Activities": "Cyber Laser Battle, Simulator, Climbing Wall",
      "Free/Paid": "PAID",
      "Active Status": "ACTIVE",
      "Display Order": 1
    })
  }

  const wsPricing = XLSX.utils.json_to_sheet(pricingRows)
  XLSX.utils.book_append_sheet(workbook, wsPricing, "Pricing")

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
}

/**
 * Parses raw workbook buffer or CSV into strongly-typed MasterWorkbookData.
 */
export function parseMasterWorkbook(buffer: Buffer): MasterWorkbookData {
  const workbook = XLSX.read(buffer, { type: "buffer" })

  // Find sheet names flexibly
  const attractionSheetName = workbook.SheetNames.find(n => /attraction/i.test(n)) || workbook.SheetNames[0]
  const activitiesSheetName = workbook.SheetNames.find(n => /(what|inside|activit|feature)/i.test(n)) || workbook.SheetNames[1]
  const pricingSheetName = workbook.SheetNames.find(n => /(pricing|ticket|pass)/i.test(n)) || workbook.SheetNames[2]

  const rawAttractions: any[] = attractionSheetName ? XLSX.utils.sheet_to_json(workbook.Sheets[attractionSheetName]) : []
  const rawActivities: any[] = activitiesSheetName ? XLSX.utils.sheet_to_json(workbook.Sheets[activitiesSheetName]) : []
  const rawPricing: any[] = pricingSheetName ? XLSX.utils.sheet_to_json(workbook.Sheets[pricingSheetName]) : []

  // Helper to extract value with key aliases
  const getVal = (row: any, ...aliases: string[]): any => {
    for (const key of Object.keys(row)) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "")
      for (const alias of aliases) {
        const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, "")
        if (cleanKey === cleanAlias) {
          return row[key]
        }
      }
    }
    return undefined
  }

  const attractions: MasterAttractionRow[] = rawAttractions.map(row => {
    const galleryImages: string[] = []
    for (let i = 1; i <= 10; i++) {
      const gUrl = getVal(row, `galleryimage${i}`, `gallery${i}`, `image${i}`)
      if (gUrl && String(gUrl).trim()) {
        galleryImages.push(String(gUrl).trim())
      }
    }

    return {
      attractionId: getVal(row, "attractionid", "id"),
      nameEn: String(getVal(row, "nameen", "name", "attractionnameen") || "").trim(),
      nameAr: String(getVal(row, "namear", "attractionnamear") || "").trim(),
      slug: String(getVal(row, "slug") || "").toLowerCase().trim().replace(/[^a-z0-9-]/g, "-"),
      experienceFormat: getVal(row, "attractionformat", "format", "experienceformat"),
      accessModel: getVal(row, "freepaid", "accessmodel"),
      taglineEn: getVal(row, "taglineen", "tagline"),
      taglineAr: getVal(row, "taglinear"),
      descriptionEn: getVal(row, "descriptionen", "description"),
      descriptionAr: getVal(row, "descriptionar"),
      venueLocation: getVal(row, "venuelocation", "venue", "location"),
      storyDiscoveryIntro: getVal(row, "storydiscoveryintroduction", "storyintro", "storydiscoveryintro"),
      heroMediaUrl: getVal(row, "herolink", "heroimageurl", "heroimage", "heromediaurl"),
      logoUrl: getVal(row, "logourl", "logo"),
      galleryImages,
      status: getVal(row, "status")
    }
  }).filter(a => a.nameEn || a.slug)

  const activities: MasterActivityRow[] = rawActivities.map(row => ({
    attractionIdentifier: String(getVal(row, "attractionidentifier", "attractionslug", "attractionid", "slug") || "").trim(),
    activityId: getVal(row, "activityid", "id"),
    titleEn: String(getVal(row, "activitynameen", "titleen", "nameen", "activityname") || "").trim(),
    titleAr: String(getVal(row, "activitynamear", "titlear", "namear") || "").trim(),
    descriptionEn: getVal(row, "descriptionen", "description"),
    descriptionAr: getVal(row, "descriptionar"),
    classification: getVal(row, "activityclassification", "classification", "highlighttype"),
    primaryStoryTrack: getVal(row, "primarystorytrack", "storytrack", "primarystorytype"),
    secondaryStoryTracks: getVal(row, "secondarystorytracks", "secondarystorytypes", "secondarytracks"),
    duration: getVal(row, "duration", "durationminutes"),
    ageRange: getVal(row, "agerange", "minage"),
    accessibility: getVal(row, "accessibility"),
    coverImageUrl: getVal(row, "coverimageurl", "coverimage", "imageurl"),
    additionalImage2Url: getVal(row, "additionalimage2url", "image2", "additionalimage2"),
    additionalImage3Url: getVal(row, "additionalimage3url", "image3", "additionalimage3"),
    additionalImage4Url: getVal(row, "additionalimage4url", "image4", "additionalimage4"),
    videoUrl: getVal(row, "videourl", "video"),
    mediaStatus: getVal(row, "mediastatus"),
    contentStatus: getVal(row, "contentstatus")
  })).filter(act => act.titleEn)

  const pricing: MasterPricingRow[] = rawPricing.map(row => {
    const rawPrice = getVal(row, "priceqar", "price", "amount")
    const numPrice = typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice || 0)) || 0

    return {
      attractionIdentifier: String(getVal(row, "attractionidentifier", "attractionslug", "attractionid", "slug") || "").trim(),
      pricingId: getVal(row, "pricingid", "id"),
      titleEn: String(getVal(row, "packagenameen", "titleen", "passnameen", "nameen") || "").trim(),
      titleAr: String(getVal(row, "packagenamear", "titlear", "passnamear", "namear") || "").trim(),
      category: getVal(row, "category", "type"),
      price: numPrice,
      duration: getVal(row, "duration"),
      descriptionEn: getVal(row, "descriptionen", "description"),
      descriptionAr: getVal(row, "descriptionar"),
      includedActivities: getVal(row, "includedactivities"),
      accessModel: getVal(row, "freepaid", "accessmodel"),
      activeStatus: getVal(row, "activestatus", "status"),
      displayOrder: parseInt(String(getVal(row, "displayorder", "order") || "1")) || 1
    }
  }).filter(p => p.titleEn)

  return { attractions, activities, pricing }
}

/**
 * Validates Master Workbook data and computes record diffs with media requirement metrics.
 */
export async function validateMasterWorkbook(
  data: MasterWorkbookData,
  options?: {
    targetAttractionId?: string
    targetAttractionSlug?: string
  }
): Promise<ValidationReport> {
  const diffs: ValidationRecordDiff[] = []
  let createdCount = 0
  let updatedCount = 0
  let unchangedCount = 0
  let warningCount = 0
  let errorCount = 0

  const targetId = options?.targetAttractionId?.trim()
  const targetSlug = options?.targetAttractionSlug?.trim().toLowerCase()

  // Fetch all existing attractions from DB to compare
  const existingAttractions = await db.attraction.findMany({
    include: {
      gallery: true,
      featuresList: { include: { storyTypes: true } },
      pricing: true
    }
  })

  // 1. Validate Attractions Tab
  let rowNum = 2 // 1-indexed header is row 1
  for (const attr of data.attractions) {
    const messages: string[] = []
    let action: 'CREATE' | 'UPDATE' | 'UNCHANGED' | 'WARNING' | 'ERROR' = 'UNCHANGED'

    if (!attr.nameEn) {
      action = 'ERROR'
      messages.push("Missing required field 'Name (EN)'")
      errorCount++
    }

    // Check target attraction lock
    if (targetId && attr.attractionId && attr.attractionId !== targetId) {
      action = 'ERROR'
      messages.push(`Record attraction ID "${attr.attractionId}" does not match target attraction ID "${targetId}". Cross-attraction import blocked to prevent accidental overwrite.`)
      errorCount++
    } else if (targetSlug && attr.slug && attr.slug.toLowerCase() !== targetSlug && targetId && attr.attractionId !== targetId) {
      action = 'ERROR'
      messages.push(`Record slug "${attr.slug}" does not match target attraction "${targetSlug}". Cross-attraction import blocked.`)
      errorCount++
    }

    const cleanSlug = attr.slug || attr.nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const existing = existingAttractions.find((a: any) => 
      (attr.attractionId && a.id === attr.attractionId) || (cleanSlug && a.slug === cleanSlug)
    )

    const galleryCount = (attr.galleryImages || []).length
    let mediaStatus: 'MISSING' | 'PARTIALLY_COMPLETE' | 'READY' | 'APPROVED' = 'MISSING'
    if (galleryCount >= 10) mediaStatus = 'READY'
    else if (galleryCount > 0) mediaStatus = 'PARTIALLY_COMPLETE'

    if (action !== 'ERROR') {
      if (!existing) {
        action = 'CREATE'
        createdCount++
        messages.push(`New attraction record to be created: "${attr.nameEn}" (${cleanSlug})`)
        if (galleryCount < 10) {
          messages.push(`Notice: ${galleryCount}/10 gallery images provided (Target: minimum 10).`)
        }
      } else {
        // Compare values for updates
        const willUpdate = (
          attr.nameEn !== existing.nameEn ||
          (attr.nameAr && attr.nameAr !== existing.nameAr) ||
          (attr.taglineEn && attr.taglineEn !== existing.taglineEn) ||
          (attr.descriptionEn && attr.descriptionEn !== existing.descriptionEn) ||
          (attr.heroMediaUrl && attr.heroMediaUrl !== existing.heroMediaUrl) ||
          galleryCount > 0
        )

        if (willUpdate) {
          action = 'UPDATE'
          updatedCount++
          messages.push(`Updating existing attraction record "${existing.nameEn}" via safe merge`)
        } else {
          action = 'UNCHANGED'
          unchangedCount++
          messages.push("Record is identical to current database state")
        }
      }
    }

    diffs.push({
      sheet: 'Attraction',
      rowNumber: rowNum++,
      identifier: cleanSlug,
      titleEn: attr.nameEn,
      action,
      messages,
      mediaStatus,
      contentStatus: attr.descriptionAr && attr.nameAr ? 'READY' : 'DRAFT',
      data: attr
    })
  }

  // 2. Validate What's Inside (Activities) Tab
  rowNum = 2
  for (const act of data.activities) {
    const messages: string[] = []
    let action: 'CREATE' | 'UPDATE' | 'UNCHANGED' | 'WARNING' | 'ERROR' = 'UNCHANGED'

    if (!act.titleEn) {
      action = 'ERROR'
      messages.push("Missing required field 'Activity Name (EN)'")
      errorCount++
    }

    const parentAttraction = existingAttractions.find((a: any) => 
      a.slug === act.attractionIdentifier.toLowerCase() || a.id === act.attractionIdentifier
    ) || data.attractions.find((a: any) => 
      a.slug === act.attractionIdentifier.toLowerCase() || a.attractionId === act.attractionIdentifier
    )

    if (!parentAttraction) {
      messages.push(`Warning: No matching parent attraction found for identifier "${act.attractionIdentifier}"`)
      action = 'WARNING'
      warningCount++
    }

    // Check images
    const hasCover = Boolean(act.coverImageUrl?.trim())
    const addImgs = [act.additionalImage2Url, act.additionalImage3Url, act.additionalImage4Url].filter(Boolean)

    let mediaStatus: 'MISSING' | 'PARTIALLY_COMPLETE' | 'READY' | 'APPROVED' = 'MISSING'
    if (hasCover && addImgs.length >= 3) {
      mediaStatus = 'READY'
    } else if (hasCover || addImgs.length > 0) {
      mediaStatus = 'PARTIALLY_COMPLETE'
    }

    if (!hasCover) {
      messages.push("Media Queue: Cover image is missing (Required).")
    }
    if (addImgs.length < 3) {
      messages.push(`Media Queue: ${addImgs.length}/3 supporting images uploaded (Target: 1 cover + 3 supporting).`)
    }

    const existingActivity = existingAttractions
      .flatMap((a: any) => a.featuresList)
      .find((f: any) => (act.activityId && f.id === act.activityId) || f.titleEn.toLowerCase() === act.titleEn.toLowerCase())

    if (action !== 'ERROR') {
      if (!existingActivity) {
        action = action === 'WARNING' ? 'WARNING' : 'CREATE'
        if (action === 'CREATE') createdCount++
        messages.push(`New activity to be created & Media Queue item generated for "${act.titleEn}"`)
      } else {
        action = 'UPDATE'
        updatedCount++
        messages.push(`Existing activity "${existingActivity.titleEn}" updated via safe merge`)
      }
    }

    diffs.push({
      sheet: 'What\'s Inside',
      rowNumber: rowNum++,
      identifier: act.activityId || act.titleEn,
      titleEn: act.titleEn,
      action,
      messages,
      mediaStatus,
      contentStatus: act.titleAr && act.descriptionAr ? 'READY' : 'DRAFT',
      data: act
    })
  }

  // 3. Validate Pricing Tab
  rowNum = 2
  for (const p of data.pricing) {
    const messages: string[] = []
    let action: 'CREATE' | 'UPDATE' | 'UNCHANGED' | 'WARNING' | 'ERROR' = 'UNCHANGED'

    if (!p.titleEn) {
      action = 'ERROR'
      messages.push("Missing required field 'Package Name (EN)'")
      errorCount++
    }

    if (isNaN(p.price) || p.price < 0) {
      action = 'ERROR'
      messages.push("Price must be a valid non-negative number")
      errorCount++
    }

    const existingPricing = existingAttractions
      .flatMap((a: any) => a.pricing)
      .find((item: any) => (p.pricingId && item.id === p.pricingId) || item.titleEn.toLowerCase() === p.titleEn.toLowerCase())

    if (action !== 'ERROR') {
      if (!existingPricing) {
        action = 'CREATE'
        createdCount++
        messages.push(`New pricing tier "${p.titleEn}" (${p.price} QAR) to be created`)
      } else {
        action = 'UPDATE'
        updatedCount++
        messages.push(`Existing pricing tier "${existingPricing.titleEn}" updated`)
      }
    }

    diffs.push({
      sheet: 'Pricing',
      rowNumber: rowNum++,
      identifier: p.pricingId || p.titleEn,
      titleEn: p.titleEn,
      action,
      messages,
      data: p
    })
  }

  // Calculate Media Queue Summary
  let meetingGallery = 0
  for (const a of data.attractions) {
    if ((a.galleryImages || []).length >= 10) meetingGallery++
  }

  let meetingActivityMedia = 0
  let missingMedia = 0
  let partialMedia = 0
  let readyMedia = 0
  let approvedMedia = 0

  for (const act of data.activities) {
    const hasCover = Boolean(act.coverImageUrl?.trim())
    const addImgs = [act.additionalImage2Url, act.additionalImage3Url, act.additionalImage4Url].filter(Boolean)
    if (hasCover && addImgs.length >= 3) {
      meetingActivityMedia++
      readyMedia++
    } else if (hasCover || addImgs.length > 0) {
      partialMedia++
    } else {
      missingMedia++
    }
  }

  return {
    isValid: errorCount === 0,
    totalRows: data.attractions.length + data.activities.length + data.pricing.length,
    createdCount,
    updatedCount,
    unchangedCount,
    warningCount,
    errorCount,
    diffs,
    mediaQueueSummary: {
      totalAttractions: data.attractions.length,
      attractionsMeetingGalleryTarget: meetingGallery,
      totalActivities: data.activities.length,
      activitiesMeetingMediaTarget: meetingActivityMedia,
      missingMediaCount: missingMedia,
      partialMediaCount: partialMedia,
      readyMediaCount: readyMedia,
      approvedMediaCount: approvedMedia
    }
  }
}

/**
 * Applies the validated Master Workbook data to the database using safe, idempotent merge semantics.
 * Blank cells in spreadsheet will NEVER delete existing database content.
 */
export async function applyMasterWorkbook(
  data: MasterWorkbookData,
  options: {
    saveAsDraft?: boolean
    targetAttractionId?: string
    targetAttractionSlug?: string
  } = {}
): Promise<{ success: boolean; appliedCount: number; errors: string[] }> {
  const errors: string[] = []
  let appliedCount = 0
  const saveAsDraft = options.saveAsDraft ?? true
  const targetId = options.targetAttractionId?.trim()
  const targetSlug = options.targetAttractionSlug?.trim().toLowerCase()

  try {
    // 1. Process Attractions
    for (const attr of data.attractions) {
      if (targetId && attr.attractionId && attr.attractionId !== targetId) {
        errors.push(`Attraction ID "${attr.attractionId}" does not match target attraction "${targetId}". Skipped to prevent cross-attraction modification.`)
        continue
      }

      const cleanSlug = attr.slug || attr.nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const existing = await db.attraction.findFirst({
        where: {
          OR: [
            ...(attr.attractionId ? [{ id: attr.attractionId }] : []),
            { slug: cleanSlug }
          ]
        },
        include: { gallery: true, operations: true }
      })

      const updateData: any = {}
      if (attr.nameEn) updateData.nameEn = attr.nameEn
      if (attr.nameAr) updateData.nameAr = attr.nameAr
      if (attr.taglineEn) updateData.taglineEn = attr.taglineEn
      if (attr.taglineAr) updateData.taglineAr = attr.taglineAr
      if (attr.descriptionEn) updateData.descriptionEn = attr.descriptionEn
      if (attr.descriptionAr) updateData.descriptionAr = attr.descriptionAr
      if (attr.experienceFormat) updateData.experienceFormat = attr.experienceFormat
      if (attr.accessModel) updateData.accessModel = attr.accessModel
      if (attr.heroMediaUrl) updateData.heroMediaUrl = attr.heroMediaUrl
      if (attr.logoUrl) updateData.logoUrl = attr.logoUrl
      
      if (!saveAsDraft && attr.status) {
        updateData.isPublished = attr.status.toUpperCase() === "PUBLISHED"
      } else if (saveAsDraft && !existing) {
        updateData.isPublished = false
      }

      // Preserve existing operations JSON while merging new venueLocation & storyDiscoveryIntro
      const currentOps = (existing?.operations as any) || {}
      const updatedOps = {
        ...currentOps,
        ...(attr.venueLocation ? { venueName: attr.venueLocation } : {}),
        ...(attr.storyDiscoveryIntro ? { storyIntro: attr.storyDiscoveryIntro } : {})
      }
      updateData.operations = updatedOps

      let attractionRecord: any

      if (existing) {
        attractionRecord = await db.attraction.update({
          where: { id: existing.id },
          data: updateData
        })
        appliedCount++
      } else {
        attractionRecord = await db.attraction.create({
          data: {
            slug: cleanSlug,
            nameEn: attr.nameEn,
            nameAr: attr.nameAr || attr.nameEn,
            ...updateData
          }
        })
        appliedCount++
      }

      // Safe Gallery Merge: Update or add gallery images up to 10
      if (attr.galleryImages && attr.galleryImages.length > 0) {
        for (let idx = 0; idx < attr.galleryImages.length; idx++) {
          const imgUrl = attr.galleryImages[idx]
          if (!imgUrl) continue

          const existingItem = await db.attractionGalleryItem.findFirst({
            where: { attractionId: attractionRecord.id, orderIndex: idx }
          })

          if (existingItem) {
            await db.attractionGalleryItem.update({
              where: { id: existingItem.id },
              data: { url: imgUrl }
            })
          } else {
            await db.attractionGalleryItem.create({
              data: {
                attractionId: attractionRecord.id,
                url: imgUrl,
                orderIndex: idx
              }
            })
          }
        }
      }
    }

    // 2. Process What's Inside (Activities)
    for (const act of data.activities) {
      // Find parent attraction
      const cleanParentSlug = act.attractionIdentifier.toLowerCase().trim()
      const parent = await db.attraction.findFirst({
        where: {
          OR: [
            { id: act.attractionIdentifier },
            { slug: cleanParentSlug }
          ]
        }
      })

      if (!parent) {
        errors.push(`Could not find parent attraction for activity "${act.titleEn}" (${act.attractionIdentifier})`)
        continue
      }

      // Find existing activity by ID or (attractionId + titleEn)
      const existingActivity = await db.attractionFeature.findFirst({
        where: {
          OR: [
            ...(act.activityId ? [{ id: act.activityId }] : []),
            { attractionId: parent.id, titleEn: act.titleEn }
          ]
        },
        include: { storyTypes: true }
      })

      // Parse additional images & media queue metadata
      const currentAudience = (existingActivity?.targetAudience as any) || {}
      const addImgs = [
        act.additionalImage2Url || currentAudience.additionalImages?.[0] || "",
        act.additionalImage3Url || currentAudience.additionalImages?.[1] || "",
        act.additionalImage4Url || currentAudience.additionalImages?.[2] || ""
      ].filter(Boolean)

      const targetAudienceData = {
        ...currentAudience,
        additionalImages: addImgs,
        videoUrl: act.videoUrl || currentAudience.videoUrl || "",
        accessibility: act.accessibility || currentAudience.accessibility || "",
        mediaStatus: act.mediaStatus || currentAudience.mediaStatus || (act.coverImageUrl && addImgs.length >= 3 ? "READY" : "PARTIALLY_COMPLETE"),
        contentStatus: act.contentStatus || currentAudience.contentStatus || "READY"
      }

      const durationMinutes = act.duration ? parseInt(String(act.duration).replace(/[^0-9]/g, '')) || null : undefined
      const minAge = act.ageRange ? parseInt(String(act.ageRange).replace(/[^0-9]/g, '')) || null : undefined

      const featureData: any = {
        ...(act.titleEn ? { titleEn: act.titleEn } : {}),
        ...(act.titleAr ? { titleAr: act.titleAr } : {}),
        ...(act.descriptionEn ? { descriptionEn: act.descriptionEn } : {}),
        ...(act.descriptionAr ? { descriptionAr: act.descriptionAr } : {}),
        ...(act.classification ? { highlightType: act.classification } : {}),
        ...(act.coverImageUrl ? { imageUrl: act.coverImageUrl } : {}),
        ...(durationMinutes !== undefined ? { durationMinutes } : {}),
        ...(minAge !== undefined ? { minAge } : {}),
        targetAudience: targetAudienceData
      }

      // Link Story Types
      const primarySlug = normalizeStoryTrack(act.primaryStoryTrack)
      const secondarySlugs = (act.secondaryStoryTracks || "")
        .split(/[;,]+/)
        .map(s => normalizeStoryTrack(s))
        .filter(s => s && s !== primarySlug)

      const allSlugs = [primarySlug, ...secondarySlugs]

      // Upsert story types in DB if needed
      const storyTypeConnectIds: string[] = []
      for (const stSlug of allSlugs) {
        const defaultDef = DEFAULT_STORY_TRACKS[stSlug] || { slug: stSlug, titleEn: stSlug, titleAr: stSlug }
        let stRecord = await db.storyType.findUnique({ where: { slug: stSlug } })
        if (!stRecord) {
          stRecord = await db.storyType.create({
            data: {
              slug: stSlug,
              titleEn: defaultDef.titleEn,
              titleAr: defaultDef.titleAr
            }
          })
        }
        storyTypeConnectIds.push(stRecord.id)
      }

      if (existingActivity) {
        await db.attractionFeature.update({
          where: { id: existingActivity.id },
          data: {
            ...featureData,
            storyTypes: {
              set: storyTypeConnectIds.map(id => ({ id }))
            }
          }
        })
        appliedCount++
      } else {
        await db.attractionFeature.create({
          data: {
            attractionId: parent.id,
            titleEn: act.titleEn,
            titleAr: act.titleAr || act.titleEn,
            ...featureData,
            storyTypes: {
              connect: storyTypeConnectIds.map(id => ({ id }))
            }
          }
        })
        appliedCount++
      }
    }

    // 3. Process Pricing
    for (const p of data.pricing) {
      const cleanParentSlug = p.attractionIdentifier.toLowerCase().trim()
      const parent = await db.attraction.findFirst({
        where: {
          OR: [
            { id: p.attractionIdentifier },
            { slug: cleanParentSlug }
          ]
        }
      })

      if (!parent) {
        errors.push(`Could not find parent attraction for pricing "${p.titleEn}" (${p.attractionIdentifier})`)
        continue
      }

      const existingPricing = await db.attractionPricing.findFirst({
        where: {
          OR: [
            ...(p.pricingId ? [{ id: p.pricingId }] : []),
            { attractionId: parent.id, titleEn: p.titleEn }
          ]
        }
      })

      const pricingData: any = {
        titleEn: p.titleEn,
        titleAr: p.titleAr || p.titleEn,
        price: p.price,
        type: p.category || "ACCESS_PASS",
        ...(p.descriptionEn ? { descriptionEn: p.descriptionEn } : {}),
        ...(p.descriptionAr ? { descriptionAr: p.descriptionAr } : {})
      }

      if (existingPricing) {
        await db.attractionPricing.update({
          where: { id: existingPricing.id },
          data: pricingData
        })
        appliedCount++
      } else {
        await db.attractionPricing.create({
          data: {
            attractionId: parent.id,
            ...pricingData
          }
        })
        appliedCount++
      }
    }

    return { success: errors.length === 0, appliedCount, errors }
  } catch (error: any) {
    console.error("[APPLY_MASTER_WORKBOOK_ERROR]", error)
    return { success: false, appliedCount, errors: [error?.message || "Failed to apply workbook"] }
  }
}

/**
 * Aggregates live Attraction Content & Media Dashboard metrics across all database attractions.
 */
export async function getAttractionContentMediaMetrics(filter?: { attractionSlug?: string }) {
  const attractions = await db.attraction.findMany({
    where: filter?.attractionSlug ? { slug: filter.attractionSlug } : {},
    include: {
      gallery: true,
      featuresList: {
        include: { storyTypes: true }
      },
      pricing: true
    }
  })

  let totalContentScore = 0
  let totalArabicScore = 0
  let totalGalleryImages = 0
  let totalActivities = 0
  let activitiesWithCompleteMedia = 0
  const missingMediaQueue: any[] = []

  const attractionSummaries = attractions.map((a: any) => {
    // Content completeness check (Title, Slug, Tagline, Description, Hero, Venue)
    let contentFields = 0
    let contentFilled = 0
    let arabicFields = 0
    let arabicFilled = 0

    const checkField = (enVal: any, arVal: any) => {
      contentFields++
      if (enVal) contentFilled++
      arabicFields++
      if (arVal) arabicFilled++
    }

    checkField(a.nameEn, a.nameAr)
    checkField(a.taglineEn, a.taglineAr)
    checkField(a.descriptionEn, a.descriptionAr)
    checkField(a.heroMediaUrl, a.logoUrl)

    const galleryCount = (a.gallery || []).length
    totalGalleryImages += galleryCount

    // Activities
    const activityItems = (a.featuresList || []).map((f: any) => {
      totalActivities++
      const audience = (f.targetAudience as any) || {}
      const addImgs = (audience.additionalImages || []).filter(Boolean)
      const hasCover = Boolean(f.imageUrl)
      const isComplete = hasCover && addImgs.length >= 3

      if (isComplete) activitiesWithCompleteMedia++

      let status: 'MISSING' | 'PARTIALLY_COMPLETE' | 'READY' | 'APPROVED' = 'MISSING'
      if (isComplete) status = 'READY'
      else if (hasCover || addImgs.length > 0) status = 'PARTIALLY_COMPLETE'

      if (status === 'MISSING' || status === 'PARTIALLY_COMPLETE') {
        const canonicalSlug = (a.slug === 'urban-arena-doha-mall' ? 'urban-arena' : a.slug) || ''
        missingMediaQueue.push({
          attractionId: a.id,
          attractionSlug: canonicalSlug,
          attractionName: a.nameEn,
          activityId: f.id,
          activityName: f.titleEn,
          status,
          hasCover,
          supportingCount: addImgs.length,
          targetRemaining: (hasCover ? 0 : 1) + Math.max(0, 3 - addImgs.length)
        })
      }

      return {
        id: f.id,
        titleEn: f.titleEn,
        titleAr: f.titleAr,
        status,
        hasCover,
        supportingCount: addImgs.length
      }
    })

    const contentCompleteness = Math.round((contentFilled / contentFields) * 100)
    const arabicCompleteness = Math.round((arabicFilled / arabicFields) * 100)

    totalContentScore += contentCompleteness
    totalArabicScore += arabicCompleteness

    return {
      id: a.id,
      slug: a.slug,
      nameEn: a.nameEn,
      nameAr: a.nameAr,
      isPublished: a.isPublished,
      contentCompleteness,
      arabicCompleteness,
      galleryCount,
      galleryTarget: 10,
      activityCount: activityItems.length,
      activities: activityItems
    }
  })

  const totalCount = attractions.length || 1
  const avgContentCompleteness = Math.round(totalContentScore / totalCount)
  const avgArabicCompleteness = Math.round(totalArabicScore / totalCount)
  const activityMediaCompleteness = totalActivities > 0 ? Math.round((activitiesWithCompleteMedia / totalActivities) * 100) : 100

  return {
    overview: {
      totalAttractions: attractions.length,
      avgContentCompleteness,
      avgArabicCompleteness,
      totalGalleryImages,
      galleryTargetMetCount: attractions.filter((a: any) => (a.gallery || []).length >= 10).length,
      totalActivities,
      activityMediaCompleteness,
      pendingMediaAssignmentsCount: missingMediaQueue.length
    },
    attractions: attractionSummaries,
    missingMediaQueue
  }
}
