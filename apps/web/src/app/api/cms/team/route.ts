import { auth } from '@/lib/auth'
import { DEFAULT_CORE_TEAM } from '@/lib/cms-team'
import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  try {
    let teamMembers: any[] = []
    try {
      teamMembers = await db.employeeProfile.findMany({
        where: {
          isActive: true,
          featureOnB2CLanding: true,
        },
        orderBy: { b2cOrder: 'asc' }
      })
    } catch (_dbErr) {
      teamMembers = []
    }

    if (teamMembers.length === 0) {
      return NextResponse.json({ data: DEFAULT_CORE_TEAM })
    }

    const formatted = teamMembers.map(m => ({
      id: m.id,
      slug: m.slug,
      nameEn: m.nameEn || m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Team Member',
      nameAr: m.nameAr || (m.firstNameAr ? `${m.firstNameAr} ${m.lastNameAr || ''}`.trim() : (m.name || m.nameEn || `${m.firstName || ''} ${m.lastName || ''}`.trim())),
      roleEn: m.b2cRoleEn || m.designation || 'Executive',
      roleAr: m.b2cRoleAr || m.designationAr || m.designation || 'قيادي',
      bioEn: m.b2cBioEn || m.aboutSummary || m.tagline || '',
      bioAr: m.b2cBioAr || m.aboutSummaryAr || m.bioEn || m.tagline || '',
      portrait: m.b2cPortrait || m.portrait || m.profileImage || DEFAULT_CORE_TEAM[0].portrait,
      featureOnB2CLanding: m.featureOnB2CLanding,
      isCoreTeam: m.isCoreTeam,
      b2cOrder: m.b2cOrder,
      showProfileLink: true,
      b2cVisibility: true,
      status: 'PUBLISHED'
    }))

    return NextResponse.json({ data: formatted })
  } catch (error) {
    console.error('[GET /api/cms/team] error:', error)
    return NextResponse.json({ data: DEFAULT_CORE_TEAM })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, featureOnB2CLanding, isCoreTeam, b2cRoleEn, b2cRoleAr, b2cBioEn, b2cBioAr, b2cOrder } = body

    let updated: any = null
    try {
      updated = await db.employeeProfile.update({
        where: { id },
        data: {
          ...(featureOnB2CLanding !== undefined && { featureOnB2CLanding }),
          ...(isCoreTeam !== undefined && { isCoreTeam }),
          ...(b2cRoleEn !== undefined && { b2cRoleEn }),
          ...(b2cRoleAr !== undefined && { b2cRoleAr }),
          ...(b2cBioEn !== undefined && { b2cBioEn }),
          ...(b2cBioAr !== undefined && { b2cBioAr }),
          ...(b2cOrder !== undefined && { b2cOrder }),
        }
      })
    } catch (dbErr) {
      console.warn('[DB WARN /api/cms/team] EmployeeProfile DB update failed:', dbErr)
      updated = { id, ...body }
    }

    revalidatePath('/[locale]/b2c', 'layout')
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[POST /api/cms/team] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
