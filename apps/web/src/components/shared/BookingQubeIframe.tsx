"use client"

import { useEffect, useRef, useState } from "react"
import { generateTicketUrl } from "@/lib/bookingqube"

interface BookingQubeIframeProps {
  attractionId: string
  ticketTypeId: string
  className?: string
}

export function BookingQubeIframe({ attractionId, ticketTypeId, className = "" }: BookingQubeIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(600) // Default fallback height
  const [isLoading, setIsLoading] = useState(true)

  const checkoutUrl = generateTicketUrl(attractionId, ticketTypeId)

  useEffect(() => {
    // Listen for cross-origin messages from the BookingQube iframe
    // so it can dynamically resize based on the checkout steps
    const handleMessage = (event: MessageEvent) => {
      // Security check: only accept messages from the trusted domain
      const BOOKINGQUBE_URL = process.env.NEXT_PUBLIC_BOOKINGQUBE_URL || 'https://booking.e3.qa'
      if (!event.origin.includes(new URL(BOOKINGQUBE_URL).hostname)) return

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data.type === 'bookingqube:resize' && data.height) {
          setHeight(data.height)
        }
      } catch (e) {
        // Ignore parsing errors for unrelated messages
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <div className={`relative w-full overflow-hidden rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] shadow-sm ${className}`} style={{ height: `${height}px`, transition: 'height 0.3s ease' }}>
      
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--surface-default)] z-10 animate-pulse">
          <div className="w-12 h-12 border-4 border-[var(--border-level-2)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          <p className="mt-4 text-[var(--text-secondary)] font-medium">Loading secure checkout...</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={checkoutUrl}
        className="absolute inset-0 w-full h-full border-none"
        title="BookingQube Secure Checkout"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-payment"
        onLoad={() => setIsLoading(false)}
        aria-busy={isLoading}
      />
    </div>
  )
}
