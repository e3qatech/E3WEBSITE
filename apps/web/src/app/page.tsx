import { Metadata } from "next"
import { PortalGateway } from "@/components/home/PortalGateway"
import { SEO } from "@/components/shared/SEO"

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa'
  
  return {
    title: "E3 - We Build Experiences | Event Engineering Experts",
    description: "Qatar's premier event engineering and entertainment agency. We specialize in transforming spaces into unforgettable experiences for both B2B and B2C clients.",
    alternates: {
      canonical: baseUrl,
      languages: {
        'en': `${baseUrl}/en`,
        'ar': `${baseUrl}/ar`,
      },
    },
    openGraph: {
      title: "E3 - We Build Experiences | Event Engineering Experts",
      description: "Qatar's premier event engineering and entertainment agency.",
      url: baseUrl,
      images: [
        {
          url: `${baseUrl}/og-image-default.jpg`,
          width: 1200,
          height: 630,
          alt: "E3 Event Engineering",
        },
      ],
    },
  }
}

export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa'

  return (
    <>
      <SEO 
        type="WebSite"
        data={{
          name: "E3 - Event Engineering Experts",
          url: baseUrl,
          potentialAction: {
            "@type": "SearchAction",
            target: `${baseUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <PortalGateway />
    </>
  )
}
