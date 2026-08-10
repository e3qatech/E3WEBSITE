import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import db from '@/lib/db'
import { auth } from '@/lib/auth'
import { DEFAULT_OUR_BRANDS } from '@/lib/cms-brands'

export async function GET(req: NextRequest) {
  try {
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
