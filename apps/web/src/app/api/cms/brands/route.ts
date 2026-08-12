import { auth } from '@/lib/auth'
import { DEFAULT_OUR_BRANDS } from '@/lib/cms-brands'
import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  try {
    let brands: any[] = []
    try {
      brands = await db.brandIP.findMany({
        where: { isActive: true },
        orderBy: { b2cDisplayOrder: 'asc' }
      })
    } catch (_dbErr) {
      brands = []
    }

    if (brands.length > 0) {
      // Map canonical BrandIP to Partner format for legacy consumers
      const mapped = brands.map(b => ({
        id: b.id,
        slug: b.slug,
        name: b.nameEn,
        nameAr: b.nameAr,
        relationship: b.primaryRelationshipId || 'SUBSIDIARY',
        description: b.shortDescriptionEn || b.b2cShortDescOverrideEn || b.taglineEn || '',
        descriptionAr: b.shortDescriptionAr || b.b2cShortDescOverrideAr || b.taglineAr || '',
        logoUrl: b.primaryLogoUrl || b.lightLogoUrl || b.darkLogoUrl || '',
        logoPrimary: b.primaryLogoUrl || b.lightLogoUrl || '',
        logoLight: b.lightLogoUrl || '',
        logoDark: b.darkLogoUrl || '',
        brandColor: '#8b5cf6',
        featureOnB2CLanding: b.featureOnB2C ?? b.showOnB2C ?? true,
        featureOnB2BPartners: b.featureOnB2B ?? b.showOnB2B ?? true,
        isVisible: b.isActive,
        externalUrl: b.b2cCtaUrl || b.b2bInquiryUrl || ''
      }))
      return NextResponse.json({ data: mapped })
    }

    // Fallback query to db.partner
    let partners: any[] = []
    try {
      partners = await db.partner.findMany({
        where: {
          OR: [
            { category: 'OUR_BRAND' },
            { featureOnB2CLanding: true }
          ]
        },
        orderBy: { orderIndex: 'asc' }
      })
    } catch (_dbErr) {
      partners = []
    }

    if (partners.length === 0) {
      return NextResponse.json({ data: DEFAULT_OUR_BRANDS })
    }

    return NextResponse.json({ data: partners })
  } catch (error) {
    console.error('[GET /api/cms/brands] error:', error)
    return NextResponse.json({ data: DEFAULT_OUR_BRANDS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, name, nameAr, relationship, description, descriptionAr, logoUrl, featureOnB2CLanding, isVisible } = body

    let brandRecord: any = null
    try {
      if (id) {
        brandRecord = await db.partner.update({
          where: { id },
          data: {
            name,
            nameAr,
            relationship: relationship || 'OWNED',
            description,
            descriptionAr,
            logoUrl,
            featureOnB2CLanding: featureOnB2CLanding ?? true,
            isVisible: isVisible ?? true,
          }
        })
      } else {
        brandRecord = await db.partner.create({
          data: {
            name,
            nameAr,
            category: 'OUR_BRAND',
            relationship: relationship || 'OWNED',
            description,
            descriptionAr,
            logoUrl,
            featureOnB2CLanding: featureOnB2CLanding ?? true,
            isVisible: isVisible ?? true,
          }
        })
      }
    } catch (dbErr) {
      console.warn('[DB WARN /api/cms/brands] Partner DB update failed:', dbErr)
      brandRecord = { id: id || `brand-${Date.now()}`, ...body }
    }

    revalidatePath('/[locale]/b2c', 'layout')
    revalidatePath('/[locale]/b2b/clients', 'page')

    return NextResponse.json({ success: true, data: brandRecord })
  } catch (error) {
    console.error('[POST /api/cms/brands] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
