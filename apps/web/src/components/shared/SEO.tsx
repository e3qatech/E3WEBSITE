import Script from "next/script"

export type SchemaType = 
  | "Organization" 
  | "WebSite" 
  | "LocalBusiness" 
  | "Service" 
  | "Event" 
  | "FAQPage" 
  | "Person" 
  | "BreadcrumbList"

interface SEOProps {
  type: SchemaType
  data: Record<string, any>
}

/**
 * Renders JSON-LD structured data for Google Rich Results.
 * Should be placed in the layout or page component.
 */
export function SEO({ type, data }: SEOProps) {
  // Ensure the base schema context is always present
  const schemaData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data
  }

  return (
    <Script
      id={`json-ld-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      strategy="afterInteractive"
    />
  )
}
