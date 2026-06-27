/**
 * BookingQube API Integration Library
 */

const BOOKINGQUBE_BASE_URL = process.env.NEXT_PUBLIC_BOOKINGQUBE_URL || 'https://booking.e3.qa'
const BOOKINGQUBE_API_KEY = process.env.BOOKINGQUBE_API_KEY || 'mock_api_key'

export interface TimeSlot {
  timeSlot: string
  available: boolean
  total: number
  price: number
}

/**
 * Generates a deep link to the BookingQube checkout flow
 */
export function generateTicketUrl(
  attractionId: string, 
  ticketTypeId: string, 
  quantity: number = 1, 
  date?: string
): string {
  const url = new URL(`${BOOKINGQUBE_BASE_URL}/book`)
  url.searchParams.set('attraction', attractionId)
  url.searchParams.set('ticket', ticketTypeId)
  url.searchParams.set('qty', quantity.toString())
  
  if (date) {
    url.searchParams.set('date', date)
  }
  
  return url.toString()
}

/**
 * Checks live ticket availability using Next.js 30-second fetch cache
 * Server-side ONLY. Do not expose this to client components directly.
 */
export async function checkAvailability(attractionId: string, date: string): Promise<TimeSlot[]> {
  try {
    const response = await fetch(`${BOOKINGQUBE_BASE_URL}/api/v1/availability?attraction=${attractionId}&date=${date}`, {
      headers: {
        'Authorization': `Bearer ${BOOKINGQUBE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      // 30 second cache validation (replaces Redis requirement for this specific read)
      next: { revalidate: 30 } 
    })

    if (!response.ok) {
      console.error(`BookingQube API error: ${response.statusText}`)
      return []
    }

    const data = await response.json()
    return data.timeSlots || []
  } catch (error) {
    console.error('Failed to fetch BookingQube availability:', error)
    // Fallback if down: return empty array so UI can show "temporarily unavailable"
    return []
  }
}
