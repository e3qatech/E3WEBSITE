/**
 * Idempotent Partner URL Repair Script
 * Replaces legacy `https://eeeqa.com/assets/partners/` URLs with canonical relative paths:
 * - `https://eeeqa.com/assets/partners/e3-logo.svg` -> `/assets/partners/e3-logo.svg`
 * - `https://eeeqa.com/assets/partners/doha-mall-logo.svg` -> `/assets/partners/doha-mall-logo.svg`
 * 
 * Safe to execute multiple times without unintended mutations.
 */

import { db } from "@/lib/db"

export function normalizeLegacyPartnerUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()
  if (!trimmed) return null

  const match = trimmed.match(/^https?:\/\/(?:www\.)?eeeqa\.com\/assets\/partners\/(.+)$/i)
  if (match) {
    return `/assets/partners/${match[1]}`
  }
  return trimmed
}

export function repairJsonPartnerUrls(data: any): { modified: boolean; result: any } {
  if (!data) return { modified: false, result: data }

  const jsonStr = JSON.stringify(data)
  
  if (jsonStr.includes("eeeqa.com/assets/partners/")) {
    const repairedStr = jsonStr.replace(/https?:\/\/(?:www\.)?eeeqa\.com\/assets\/partners\//gi, "/assets/partners/")
    try {
      const repairedJson = JSON.parse(repairedStr)
      return { modified: true, result: repairedJson }
    } catch {
      return { modified: false, result: data }
    }
  }

  return { modified: false, result: data }
}

export async function repairPartnerUrls() {
  console.log("=== STARTING IDEMPOTENT PARTNER URL REPAIR ===")
  let updatedAttractions = 0
  let updatedPartners = 0
  let updatedBrands = 0

  try {
    // 1. Repair Attractions JSON fields (partners, operations, metadata)
    const attractions = await db.attraction.findMany()
    console.log(`Found ${attractions.length} attraction records to inspect.`)

    for (const attr of attractions) {
      let needsUpdate = false
      const updateData: any = {}

      if (attr.partners) {
        const { modified, result } = repairJsonPartnerUrls(attr.partners)
        if (modified) {
          updateData.partners = result
          needsUpdate = true
        }
      }

      if (attr.operations) {
        const { modified, result } = repairJsonPartnerUrls(attr.operations)
        if (modified) {
          updateData.operations = result
          needsUpdate = true
        }
      }

      if (needsUpdate) {
        await db.attraction.update({
          where: { id: attr.id },
          data: updateData
        })
        console.log(`✓ Repaired partner URLs for attraction: ${attr.nameEn} (${attr.slug})`)
        updatedAttractions++
      }
    }

    // 2. Repair Partner table if present
    try {
      const partners = await (db as any).partner?.findMany()
      if (Array.isArray(partners)) {
        for (const p of partners) {
          if (p.logoUrl && p.logoUrl.includes("eeeqa.com/assets/partners/")) {
            const repaired = normalizeLegacyPartnerUrl(p.logoUrl)
            await (db as any).partner.update({
              where: { id: p.id },
              data: { logoUrl: repaired }
            })
            console.log(`✓ Repaired partner logoUrl for: ${p.name}`)
            updatedPartners++
          }
        }
      }
    } catch (_e) {
      // Partner table check fallback
    }

    // 3. Repair Brand table if present
    try {
      const brands = await db.brand.findMany()
      for (const b of brands) {
        if (b.logoUrl && b.logoUrl.includes("eeeqa.com/assets/partners/")) {
          const repaired = normalizeLegacyPartnerUrl(b.logoUrl)
          await db.brand.update({
            where: { id: b.id },
            data: { logoUrl: repaired }
          })
          console.log(`✓ Repaired brand logoUrl for: ${b.nameEn}`)
          updatedBrands++
        }
      }
    } catch (_e) {
      // Brand table check fallback
    }

    console.log("=== REPAIR SUMMARY ===")
    console.log(`• Updated Attractions: ${updatedAttractions}`)
    console.log(`• Updated Partners: ${updatedPartners}`)
    console.log(`• Updated Brands: ${updatedBrands}`)
    console.log("✓ Partner URL repair completed successfully.")
  } catch (error: any) {
    console.error("[ERROR] Partner URL repair script failed:", error?.message || error)
  }
}

if (process.argv[1] && process.argv[1].includes("repair-partner-urls")) {
  repairPartnerUrls().catch(console.error).finally(() => process.exit(0))
}
