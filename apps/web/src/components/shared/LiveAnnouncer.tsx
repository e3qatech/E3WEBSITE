"use client"

import { useEffect, useState } from "react"

// A simple global state mechanism could be used here (e.g., Zustand) 
// but for standalone portability we'll use a custom event listener.
export function announceToScreenReader(message: string) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("a11y-announce", { detail: message })
    window.dispatchEvent(event)
  }
}

export function LiveAnnouncer() {
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    const handleAnnounce = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      setAnnouncement(customEvent.detail)
      // Clear after a moment so the same message can be announced again if needed
      setTimeout(() => setAnnouncement(""), 3000)
    }

    window.addEventListener("a11y-announce", handleAnnounce)
    return () => window.removeEventListener("a11y-announce", handleAnnounce)
  }, [])

  return (
    <div 
      className="sr-only" 
      aria-live="polite" 
      aria-atomic="true" 
      role="status"
    >
      {announcement}
    </div>
  )
}
