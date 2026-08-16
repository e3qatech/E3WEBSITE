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
              if (existingAct) {
                await db.attractionFeature.update({
                  where: { id: existingAct.id },
                  data: {
                    titleAr: String(act.titleAr || act["Title (AR)"] || existingAct.titleAr),
                    descriptionEn: act.descriptionEn || existingAct.descriptionEn,
                    descriptionAr: act.descriptionAr || existingAct.descriptionAr,
                    imageUrl: act.imageUrl || existingAct.imageUrl,
                    highlightType: act.contentType || act.highlightType || existingAct.highlightType
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
              if (existingPrice) {
                await db.attractionPricing.update({
                  where: { id: existingPrice.id },
                  data: {
                    price: priceVal,
                    titleAr: String(p.titleAr || existingPrice.titleAr),
                    type: String(p.type || existingPrice.type)
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
                    type: String(p.type || "GENERAL")
                  }
                })
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, report })
  } catch (error: any) {
    console.error("[IMPORT_ATTRACTIONS_ERROR]", error)
    return NextResponse.json({ error: error.message || "Failed to process spreadsheet import" }, { status: 500 })
  }
}
