import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export const URBAN_ARENA_TARGET_ID = 'cmqy7l8iq000gxxg441lib86l'
export const CANONICAL_SLUG = 'urban-arena'
export const LEGACY_SLUG = 'urban-arena-doha-mall'

export interface CanonicalRepairResult {
  repaired: boolean
  previousSlug?: string
  currentSlug: string
  attractionId: string
  logs: string[]
}

/**
 * Idempotent database repair function for Urban Arena canonical slug migration.
 * Runs inside a transaction and ensures the target attraction record strictly
 * uses the canonical slug 'urban-arena' without touching activities, pricing,
 * media, translations, booking data or publication status.
 */
export async function repairUrbanArenaCanonicalSlug(): Promise<CanonicalRepairResult> {
  const logs: string[] = []

  try {
    const result = await (db as any).$transaction(async (tx: any) => {
      // 1. Target by exact attraction ID first, with fallback to legacy slug/name
      let attraction = await tx.attraction.findUnique({
        where: { id: URBAN_ARENA_TARGET_ID }
      })

      if (!attraction) {
        attraction = await tx.attraction.findFirst({
          where: {
            OR: [
              { slug: LEGACY_SLUG },
              { slug: CANONICAL_SLUG },
              { nameEn: 'Urban Arena' }
            ]
          }
        })
      }

      if (!attraction) {
        logs.push(`[CANONICAL_REPAIR] Target attraction "${URBAN_ARENA_TARGET_ID}" not found in database.`)
        return {
          repaired: false,
          currentSlug: CANONICAL_SLUG,
          attractionId: URBAN_ARENA_TARGET_ID,
          logs
        }
      }

      const previousSlug = attraction.slug

      // 2. If the slug is already canonical 'urban-arena', perform NO update
      if (previousSlug === CANONICAL_SLUG) {
        logs.push(`[CANONICAL_REPAIR] Attraction ID "${attraction.id}" is already on canonical slug "${CANONICAL_SLUG}". No database update needed.`)
        return {
          repaired: false,
          previousSlug,
          currentSlug: CANONICAL_SLUG,
          attractionId: attraction.id,
          logs
        }
      }

      // 3. Check for any other conflicting record that might have 'urban-arena'
      const existingOther = await tx.attraction.findFirst({
        where: {
          slug: CANONICAL_SLUG,
          id: { not: attraction.id }
        }
      })

      if (existingOther) {
        logs.push(`[CANONICAL_REPAIR] Conflict resolution: Renaming unexpected duplicate record "${existingOther.id}".`)
        await tx.attraction.update({
          where: { id: existingOther.id },
          data: { slug: `urban-arena-duplicate-${Date.now()}` }
        })
      }

      // 4. Update ONLY the slug and ticketingUrl if containing legacy slug
      // Preserves all activities, pricing, media, translations, booking data, and publication status intact
      const updatePayload: any = {
        slug: CANONICAL_SLUG
      }
      if (attraction.ticketingUrl && attraction.ticketingUrl.includes(LEGACY_SLUG)) {
        updatePayload.ticketingUrl = attraction.ticketingUrl.replace(LEGACY_SLUG, CANONICAL_SLUG)
      }

      const updated = await tx.attraction.update({
        where: { id: attraction.id },
        data: updatePayload
      })

      logs.push(`[CANONICAL_REPAIR] Transaction committed: Successfully updated Urban Arena ("${attraction.id}") slug from "${previousSlug}" to "${CANONICAL_SLUG}".`)

      return {
        repaired: true,
        previousSlug,
        currentSlug: updated.slug,
        attractionId: updated.id,
        logs
      }
    })

    // 5. Revalidate all affected public and studio routes across English & Arabic
    try {
      revalidatePath('/en/b2c/attractions/urban-arena')
      revalidatePath('/ar/b2c/attractions/urban-arena')
      revalidatePath('/en/b2c/attractions/urban-arena-doha-mall')
      revalidatePath('/ar/b2c/attractions/urban-arena-doha-mall')
      revalidatePath('/en/b2c/attractions')
      revalidatePath('/ar/b2c/attractions')
      revalidatePath('/en/dashboard/b2c/attractions')
      revalidatePath('/ar/dashboard/b2c/attractions')
      revalidatePath('/en/dashboard/b2c/attractions/workbook')
      revalidatePath('/ar/dashboard/b2c/attractions/workbook')
      if (result.attractionId) {
        revalidatePath(`/en/dashboard/b2c/attractions/${result.attractionId}/edit`)
        revalidatePath(`/ar/dashboard/b2c/attractions/${result.attractionId}/edit`)
      }
    } catch (_revalidateErr) {
      // Ignored in non-server-action / build contexts
    }

    result.logs.forEach((l: string) => console.log(l))
    return result
  } catch (error: any) {
    console.error("[CANONICAL_REPAIR_ERROR]", error)
    return {
      repaired: false,
      currentSlug: CANONICAL_SLUG,
      attractionId: URBAN_ARENA_TARGET_ID,
      logs: [`[CANONICAL_REPAIR_ERROR] ${error.message || error}`]
    }
  }
}
