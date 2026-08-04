import { Metadata } from "next";
import { PortalGateway } from "@/components/home/PortalGateway";
import { SEO } from "@/components/shared/SEO";
import db from "@/lib/db";
import { GatewayCustomizationPayload, DEFAULT_GATEWAY_CMS_PAYLOAD } from "@/types/gateway-cms";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa';
  
  let cmsData = DEFAULT_GATEWAY_CMS_PAYLOAD;
  try {
    const record = await db.setting.findUnique({
      where: { key: 'gateway_customization_published' },
    });
    if (record?.value) {
      cmsData = record.value as unknown as GatewayCustomizationPayload;
    }
  } catch (_e) {
    // Fallback to default payload
  }

  const title = cmsData.seoAccess?.seoTitleEn || "E3 - We Build Experiences | Event Engineering Experts";
  const description = cmsData.seoAccess?.seoDescEn || "Qatar's premier event engineering and entertainment agency.";
  const ogImage = cmsData.seoAccess?.ogImage || `${baseUrl}/og-image-default.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: baseUrl,
      languages: {
        'en': `${baseUrl}/en`,
        'ar': `${baseUrl}/ar`,
      },
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "E3 Event Engineering",
        },
      ],
    },
  };
}

export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa';

  let cmsData = DEFAULT_GATEWAY_CMS_PAYLOAD;
  try {
    const record = await db.setting.findUnique({
      where: { key: 'gateway_customization_published' },
    });
    if (record?.value) {
      cmsData = record.value as unknown as GatewayCustomizationPayload;
    }
  } catch (_e) {
    // Fallback
  }

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
      <PortalGateway cmsData={cmsData} />
    </>
  );
}
