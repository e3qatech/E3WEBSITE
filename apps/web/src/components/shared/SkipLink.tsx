"use client"

export function SkipLink() {
  return (
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-[9999] focus:p-4 focus:bg-[var(--surface-default)] focus:text-[var(--text-primary)] focus:outline focus:outline-2 focus:outline-[var(--brand-primary)]"
    >
      Skip to main content
    </a>
  )
}
