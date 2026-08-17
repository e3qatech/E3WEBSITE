import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import * as XLSX from "xlsx"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const isDryRun = formData.get("dryRun") !== "false" // default to dry run unless explicitly 'false'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })

    // Read all 8 standard sheets
    const attractionsSheet = workbook.Sheets["Attractions"] || workbook.Sheets[workbook.SheetNames[0]]
    const locationsSheet = workbook.Sheets["Locations"]
    const activitiesSheet = workbook.Sheets["Activities"] || workbook.Sheets["Features"]
    const pricingSheet = workbook.Sheets["Pricing"] || workbook.Sheets["Tickets"]
    const gallerySheet = workbook.Sheets["Gallery"]
    const faqsSheet = workbook.Sheets["FAQs"]
    const partnersSheet = workbook.Sheets["Partners"]
    const socialSheet = workbook.Sheets["Social & News"] || workbook.Sheets["Social"]

    const rawAttractions: any[] = attractionsSheet ? XLSX.utils.sheet_to_json(attractionsSheet) : []
    const rawLocations: any[] = locationsSheet ? XLSX.utils.sheet_to_json(locationsSheet) : []
    const rawActivities: any[] = activitiesSheet ? XLSX.utils.sheet_to_json(activitiesSheet) : []
    const rawPricing: any[] = pricingSheet ? XLSX.utils.sheet_to_json(pricingSheet) : []
    const rawGallery: any[] = gallerySheet ? XLSX.utils.sheet_to_json(gallerySheet) : []
    const rawFaqs: any[] = faqsSheet ? XLSX.utils.sheet_to_json(faqsSheet) : []
    const rawPartners: any[] = partnersSheet ? XLSX.utils.sheet_to_json(partnersSheet) : []

    const report = {
      dryRun: isDryRun,
      totalRows: rawAttractions.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
      diffs: [] as Array<{
        slug: string
        nameEn: string
        action: 'CREATE' | 'UPDATE' | 'NOOP'
        details: string[]
      }>
    }

    // Process Attractions
    for (const row of rawAttractions) {
      const nameEn = String(row.nameEn || row.Name || row["Name (EN)"] || "").trim()
      const nameAr = String(row.nameAr || row["Name (AR)"] || nameEn).trim()
      const slugRaw = String(row.slug || row.Slug || nameEn).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      if (!slugRaw || !nameEn) {
        report.skipped++
        report.errors.push(`Row missing nameEn or slug: ${JSON.stringify(row)}`)
        continue
      }

      // Check existing attraction
      const existing = await db.attraction.findFirst({
        where: { slug: slugRaw },
        include: {
          pricing: true,
          faqs: true,
          gallery: true,
          featuresList: true,
          attractionLocations: true
        }
      })

      const action = existing ? 'UPDATE' : 'CREATE'
      const details: string[] = []

        // Deep merge non-empty values
      const updateData: any = {}
      if (nameEn) updateData.nameEn = nameEn
      if (nameAr) updateData.nameAr = nameAr
      if (row.entityType || row["Entity Type"]) updateData.entityType = String(row.entityType || row["Entity Type"]).trim().toUpperCase()
      if (row.experienceFormat || row["Experience Format"]) updateData.experienceFormat = String(row.experienceFormat || row["Experience Format"]).trim().toUpperCase()
      if (row.accessModel || row["Access Model"]) updateData.accessModel = String(row.accessModel || row["Access Model"]).trim().toUpperCase()
      if (row.durationModel || row["Duration Model"]) updateData.durationModel = String(row.durationModel || row["Duration Model"]).trim().toUpperCase()
      if (row.environment || row["Environment"]) updateData.environment = String(row.environment || row["Environment"]).trim().toUpperCase()
      if (row.taglineEn || row["Tagline (EN)"]) updateData.taglineEn = String(row.taglineEn || row["Tagline (EN)"]).trim()
      if (row.taglineAr || row["Tagline (AR)"]) updateData.taglineAr = String(row.taglineAr || row["Tagline (AR)"]).trim()
      if (row.descriptionEn || row["Description (EN)"]) updateData.descriptionEn = String(row.descriptionEn || row["Description (EN)"]).trim()
      if (row.descriptionAr || row["Description (AR)"]) updateData.descriptionAr = String(row.descriptionAr || row["Description (AR)"]).trim()
      if (row.heroMediaUrl || row["Hero Media URL"]) updateData.heroMediaUrl = String(row.heroMediaUrl || row["Hero Media URL"]).trim()
      if (row.logoUrl || row["Logo URL"]) updateData.logoUrl = String(row.logoUrl || row["Logo URL"]).trim()
      if (row.isPublished !== undefined && row.isPublished !== "") {
        updateData.isPublished = Boolean(row.isPublished === true || String(row.isPublished).toLowerCase() === "true" || row.isPublished === 1)
      }

      if (action === 'CREATE') {
        report.created++
        details.push(`New attraction record to be created: ${nameEn}`)
      } else {
        report.updated++
        details.push(`Existing record updated with deep merge: ${nameEn}`)
      }

      // Sub-sheet matching for activities, pricing, gallery, faqs
      const matchingActivities = rawActivities.filter(a => String(a.attractionSlug || a.slug || a.AttractionSlug).trim().toLowerCase() === slugRaw)
      const matchingPricing = rawPricing.filter(p => String(p.attractionSlug || p.slug || p.AttractionSlug).trim().toLowerCase() === slugRaw)
      const matchingGallery = rawGallery.filter(g => String(g.attractionSlug || g.slug || g.AttractionSlug).trim().toLowerCase() === slugRaw)
      const matchingFaqs = rawFaqs.filter(f => String(f.attractionSlug || f.slug || f.AttractionSlug).trim().toLowerCase() === slugRaw)

      if (matchingActivities.length > 0) details.push(`${matchingActivities.length} activities mapped`)
      if (matchingPricing.length > 0) details.push(`${matchingPricing.length} pricing passes mapped`)
      if (matchingGallery.length > 0) details.push(`${matchingGallery.length} gallery images mapped`)
      if (matchingFaqs.length > 0) details.push(`${matchingFaqs.length} FAQs mapped`)

      report.diffs.push({
        slug: slugRaw,
        nameEn,
        action,
        details
      })

      // Commit if not dry run
      if (!isDryRun) {
        let attractionId = existing?.id

        if (!existing) {
          const created = await db.attraction.create({
            data: {
              slug: slugRaw,
              nameEn: nameEn,
              nameAr: nameAr,
              entityType: updateData.entityType || "ATTRACTION",
              experienceFormat: updateData.experienceFormat || "PERMANENT_FEC",
              accessModel: updateData.accessModel || "PAID",
              durationModel: updateData.durationModel || "PERMANENT",
              environment: updateData.environment || "INDOOR",
              taglineEn: updateData.taglineEn || "",
              taglineAr: updateData.taglineAr || "",
              descriptionEn: updateData.descriptionEn || "",
              descriptionAr: updateData.descriptionAr || "",
              heroMediaUrl: updateData.heroMediaUrl || "",
              logoUrl: updateData.logoUrl || "",
              isPublished: updateData.isPublished ?? false,
              isFeatured: false,
              isB2bVisible: true
            }
          })
          attractionId = created.id
        } else {
          await db.attraction.update({
            where: { id: existing.id },
            data: updateData
          })
        }

        if (attractionId) {
          // Upsert Activities if provided in sheet
          if (matchingActivities.length > 0) {
            for (let i = 0; i < matchingActivities.length; i++) {
              const act = matchingActivities[i]
              const titleEn = String(act.titleEn || act.title || act["Title (EN)"] || "").trim()
              if (!titleEn) continue

              const existingAct = existing?.featuresList.find((f: any) => f.titleEn.toLowerCase() === titleEn.toLowerCase())
              const primaryTrackSlug = String(act.primaryStoryTrackSlug || act.primaryStoryTrack || act["Primary Story Track"] || "").trim().toLowerCase()
              const secondaryTrackSlugs = String(act.secondaryStoryTrackSlugs || act.secondaryStoryTracks || act["Secondary Story Tracks"] || "").split(/[;,|]/).map((s: string) => s.trim().toLowerCase()).filter(Boolean)

              // Lookup story types by slug
              let primaryStoryTypeId: string | null = null
              let secondaryStoryTypeIds: string[] = []

              if (primaryTrackSlug) {
                const st = await db.storyType.findFirst({ where: { slug: primaryTrackSlug } })
                if (st) primaryStoryTypeId = st.id
              }

              if (secondaryTrackSlugs.length > 0) {
                const secSts = await db.storyType.findMany({ where: { slug: { in: secondaryTrackSlugs } } })
                secondaryStoryTypeIds = secSts.map((s: any) => s.id)
              }

              if (existingAct) {
                await db.attractionFeature.update({
                  where: { id: existingAct.id },
                  data: {
                    titleAr: String(act.titleAr || act["Title (AR)"] || existingAct.titleAr),
                    descriptionEn: act.descriptionEn || existingAct.descriptionEn,
                    descriptionAr: act.descriptionAr || existingAct.descriptionAr,
                    imageUrl: act.imageUrl || existingAct.imageUrl,
                    highlightType: act.contentType || act.highlightType || existingAct.highlightType,
                    primaryStoryTypeId: primaryStoryTypeId || existingAct.primaryStoryTypeId,
                    secondaryStoryTypeIds: secondaryStoryTypeIds.length > 0 ? secondaryStoryTypeIds : existingAct.secondaryStoryTypeIds
                  }
                })
              } else {
                await db.attractionFeature.create({
                  data: {
                    attractionId,
                    titleEn,
                    titleAr: String(act.titleAr || act["Title (AR)"] || titleEn),
                    descriptionEn: String(act.descriptionEn || act["Description (EN)"] || ""),
                    descriptionAr: String(act.descriptionAr || act["Description (AR)"] || ""),
                    imageUrl: String(act.imageUrl || ""),
                    highlightType: String(act.contentType || act.highlightType || "ACTIVITY"),
                    primaryStoryTypeId,
                    secondaryStoryTypeIds: secondaryStoryTypeIds.length > 0 ? secondaryStoryTypeIds : null,
                    orderIndex: i
                  }
                })
              }
            }
          }

          // Upsert Pricing if provided in sheet
          if (matchingPricing.length > 0) {
            for (const p of matchingPricing) {
              const pTitle = String(p.titleEn || p.title || p["Title (EN)"] || "").trim()
              if (!pTitle) continue
              const existingPrice = existing?.pricing.find((ep: any) => ep.titleEn.toLowerCase() === pTitle.toLowerCase())
              const priceVal = parseFloat(p.price || p["Price (QAR)"]) || 0
              const rawType = String(p.type || p.category || p["Category"] || p["Pass Category"] || (existingPrice ? existingPrice.type : "ACCESS_PASS")).toUpperCase().trim()
              const normalizedType = rawType.includes("PREMIUM") 
                ? "PREMIUM_ACTIVITY" 
                : rawType.includes("HOURLY") 
                ? "HOURLY_ACTIVITY" 
                : (rawType.includes("ADD") || rawType.includes("ADDON")) 
                ? "ADD_ON" 
                : "ACCESS_PASS"

              if (existingPrice) {
                await db.attractionPricing.update({
                  where: { id: existingPrice.id },
                  data: {
                    price: priceVal,
                    titleAr: String(p.titleAr || existingPrice.titleAr),
                    type: normalizedType
                  }
                })
              } else {
                await db.attractionPricing.create({
                  data: {
                    attractionId,
                    titleEn: pTitle,
                    titleAr: String(p.titleAr || pTitle),
                    price: priceVal,
                    currency: String(p.currency || "QAR"),
                    type: normalizedType
                  }
                })
              }
            }
          }
        }
      }
    }

    // Record import job in DB
    const batchNumber = `E3-IMP-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
    const importJob = await db.importJob.create({
      data: {
        batchNumber,
        fileName: file.name,
        fileType: "XLSX",
        intakeMethod: "SPREADSHEET_WORKBOOK",
        targetType: "ATTRACTION",
        recordsCreated: report.created,
        recordsUpdated: report.updated,
        recordsSkipped: report.skipped,
        status: isDryRun ? "DRAFT_READY" : "APPLIED",
        uploadedBy: (session.user as any)?.email || "admin",
        appliedRecordIds: report.diffs.map(d => d.slug),
        errorReport: report.errors.length > 0 ? { errors: report.errors } : null
      }
    })

    return NextResponse.json({ success: true, report, importJob })
  } catch (error: any) {
    console.error("[IMPORT_ATTRACTIONS_ERROR]", error)
    return NextResponse.json({ error: error.message || "Failed to process spreadsheet import" }, { status: 500 })
  }
}
