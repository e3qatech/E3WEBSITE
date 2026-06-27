import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.BOOKINGQUBE_WEBHOOK_SECRET || 'mock_secret'

// In a real environment, this would be Redis or a Database table
// We use a global Set to mock idempotency across dev hot-reloads
const processedEvents = new Set<string>()

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-bookingqube-signature')
    
    // 1. Verify Signature
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.warn('BookingQube Webhook: Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 2. Parse payload
    const payload = JSON.parse(rawBody)
    const eventId = payload.id
    const eventType = payload.type
    
    // 3. Check Idempotency (prevent duplicate processing)
    if (eventId && processedEvents.has(eventId)) {
      console.log(`BookingQube Webhook: Ignored duplicate event ${eventId}`)
      return NextResponse.json({ received: true, status: 'duplicate_ignored' })
    }

    // 4. Handle Event
    console.log(`BookingQube Webhook: Processing ${eventType} [${eventId}]`)
    
    switch (eventType) {
      case 'ticket.purchased':
        // Update database occupancy
        // Try to emit to socket server via internal fetch
        // In a real Vercel/serverless env, you'd use Pusher or Redis PubSub here
        break
      case 'ticket.cancelled':
        break
      case 'event.capacity_changed':
        break
      default:
        console.log(`BookingQube Webhook: Unhandled event type ${eventType}`)
    }

    // Mark as processed
    if (eventId) {
      processedEvents.add(eventId)
    }

    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('BookingQube Webhook Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
