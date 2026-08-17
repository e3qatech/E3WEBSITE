import { db } from "@/lib/db"

/**
 * Idempotent database repair function for Urban Arena canonical slug migration.
 * Ensures the database record for Urban Arena uses the canonical slug 'urban-arena'.
 */
export async function repairUrbanArenaCanonicalSlug(): Promise<{
  repaired: boolean
  previousSlug?: string
  currentSlug: string
  attractionId?: string
}> {
  try {
    const legacyAttraction = await db.attraction.findFirst({
      where: {
        OR: [
          { slug: 'urban-arena-doha-mall' },
          { nameEn: 'Urban Arena', slug: { not: 'urban-arena' } }
        ]
      }
    })

    if (legacyAttraction) {
      // Check if another record already has 'urban-arena'
      const existingCanonical = await db.attraction.findUnique({
        where: { slug: 'urban-arena' }
      })

      if (!existingCanonical || existingCanonical.id === legacyAttraction.id) {
        await db.attraction.update({
          where: { id: legacyAttraction.id },
          data: {
            slug: 'urban-arena',
            ticketingUrl: legacyAttraction.ticketingUrl?.replace('urban-arena-doha-mall', 'urban-arena')
          }
        })

        return {
          repaired: true,
          previousSlug: legacyAttraction.slug,
          currentSlug: 'urban-arena',
          attractionId: legacyAttraction.id
        }
      }
    }

    const current = await db.attraction.findFirst({
      where: {
        OR: [
          { slug: 'urban-arena' },
          { nameEn: 'Urban Arena' }
        ]
      }
    })

    return {
      repaired: false,
      currentSlug: current?.slug || 'urban-arena',
      attractionId: current?.id
    }
  } catch (error) {
    console.error("[REPAIR_URBAN_ARENA_ERROR]", error)
    return {
      repaired: false,
      currentSlug: 'urban-arena'
    }
  }
}
