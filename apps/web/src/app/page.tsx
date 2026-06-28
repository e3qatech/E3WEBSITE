import { Metadata } from "next"
import { PortalGateway } from "@/components/home/PortalGateway"
import { SEO } from "@/components/shared/SEO"
import db from "@/lib/db"

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

export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa'

  const settings = await db.setting.findMany({
    where: {
      key: { in: ['gatewayB2CTitle', 'gatewayB2CDesc', 'gatewayB2BTitle', 'gatewayB2BDesc'] }
    }
  });

  const b2cTitle = settings.find(s => s.key === 'gatewayB2CTitle')?.value as string | undefined;
  const b2cDesc = settings.find(s => s.key === 'gatewayB2CDesc')?.value as string | undefined;
  const b2bTitle = settings.find(s => s.key === 'gatewayB2BTitle')?.value as string | undefined;
  const b2bDesc = settings.find(s => s.key === 'gatewayB2BDesc')?.value as string | undefined;

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
      <PortalGateway 
        b2cTitle={b2cTitle}
        b2cDesc={b2cDesc}
        b2bTitle={b2bTitle}
        b2bDesc={b2bDesc}
      />
    </>
  )
}
