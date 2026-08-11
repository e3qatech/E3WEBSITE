import { auth } from '@/lib/auth'
import { DEFAULT_SOCIAL_CHANNELS, DEFAULT_SOCIAL_POSTS } from '@/lib/cms-social'
import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  try {
    let posts: any[] = []
    let channels: any[] = []

    try {
      posts = await db.socialPost.findMany({
        where: { isApproved: true, isVisible: true },
        orderBy: { postDate: 'desc' },
        take: 12
      })
      channels = await db.socialChannel.findMany({
        where: { isVisible: true },
        orderBy: { sortPriority: 'asc' }
      })
    } catch (_dbErr) {
      posts = []
      channels = []
    }

    if (posts.length === 0) posts = DEFAULT_SOCIAL_POSTS
    if (channels.length === 0) channels = DEFAULT_SOCIAL_CHANNELS

    return NextResponse.json({
      data: {
        channels,
        posts,
        lastSync: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[GET /api/cms/social] error:', error)
    return NextResponse.json({
      data: {
        channels: DEFAULT_SOCIAL_CHANNELS,
        posts: DEFAULT_SOCIAL_POSTS,
        lastSync: new Date().toISOString()
      }
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action, postId, isApproved, isVisible } = body

    if (action === 'TOGGLE_APPROVAL' && postId) {
      try {
        await db.socialPost.update({
          where: { id: postId },
          data: {
            ...(isApproved !== undefined && { isApproved }),
            ...(isVisible !== undefined && { isVisible })
          }
        })
      } catch (dbErr) {
        console.warn('[DB WARN /api/cms/social] SocialPost update failed:', dbErr)
      }
    }

    revalidatePath('/[locale]/b2c', 'layout')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/cms/social] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
