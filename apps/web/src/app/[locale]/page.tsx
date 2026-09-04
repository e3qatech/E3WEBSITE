import { Metadata } from "next";
import { PortalGateway } from "@/components/home/PortalGateway";
import { SEO } from "@/components/shared/SEO";
import db from "@/lib/db";
import { GatewayCustomizationPayload, DEFAULT_GATEWAY_CMS_PAYLOAD } from "@/types/gateway-cms";

export const revalidate = 300;

function mergeGatewayPayload(raw: any): GatewayCustomizationPayload {
  if (!raw || typeof raw !== "object") return DEFAULT_GATEWAY_CMS_PAYLOAD;
  return {
    ...DEFAULT_GATEWAY_CMS_PAYLOAD,
    ...raw,
    english: { ...DEFAULT_GATEWAY_CMS_PAYLOAD.english, ...(raw.english || {}) },
    arabic: { ...DEFAULT_GATEWAY_CMS_PAYLOAD.arabic, ...(raw.arabic || {}) },
    logo: { ...DEFAULT_GATEWAY_CMS_PAYLOAD.logo, ...(raw.logo || {}) },
    b2cDesktopMedia: raw.b2cDesktopMedia || DEFAULT_GATEWAY_CMS_PAYLOAD.b2cDesktopMedia,
    b2cMobileMedia: raw.b2cMobileMedia || raw.b2cDesktopMedia || DEFAULT_GATEWAY_CMS_PAYLOAD.b2cMobileMedia,
    b2bDesktopMedia: raw.b2bDesktopMedia || DEFAULT_GATEWAY_CMS_PAYLOAD.b2bDesktopMedia,
    b2bMobileMedia: raw.b2bMobileMedia || raw.b2bDesktopMedia || DEFAULT_GATEWAY_CMS_PAYLOAD.b2bMobileMedia,
    visual: { ...DEFAULT_GATEWAY_CMS_PAYLOAD.visual, ...(raw.visual || {}) },
    seoAccess: { ...DEFAULT_GATEWAY_CMS_PAYLOAD.seoAccess, ...(raw.seoAccess || {}) },
  };
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa';
  
  let cmsData = DEFAULT_GATEWAY_CMS_PAYLOAD;
  try {
    const record = await db.setting.findUnique({
      where: { key: 'gateway_customization_published' },
    });
    if (record?.value) {
      cmsData = mergeGatewayPayload(record.value);
    }
  } catch (_e) {
    // Fallback to default payload
  }

  const en = cmsData.english;
  const ar = cmsData.arabic;
  const seo = cmsData.seoAccess;

  const title = isAr
    ? (seo.seoTitleAr || ar.headlineAr || "إي ثري - نصنع التجارب والفعاليات في قطر")
    : (seo.seoTitleEn || en.headlineEn || "E3 - We Build Experiences | Event Engineering Experts");

  const description = isAr
    ? (seo.seoDescAr || ar.b2cDescAr || "الوجهة الرائدة في قطر لهندسة الفعاليات الاستثنائية والترفيه.")
    : (seo.seoDescEn || en.b2cDescEn || "Qatar's premier event engineering and entertainment agency.");

  const ogImage = seo.ogImage || `${baseUrl}/og-image-default.jpg`;
  const canonicalUrl = `${baseUrl}/${locale}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en`,
        'ar': `${baseUrl}/ar`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      locale: isAr ? 'ar_QA' : 'en_US',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: isAr ? "إي ثري لهندسة الفعاليات" : "E3 Event Engineering",
        },
      ],
    },
  };
}

export default async function GatewayLocalePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const isAr = locale === "ar";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa';

  let cmsData = DEFAULT_GATEWAY_CMS_PAYLOAD;
  try {
    const record = await db.setting.findUnique({
      where: { key: 'gateway_customization_published' },
    });
    if (record?.value) {
      cmsData = mergeGatewayPayload(record.value);
    }
  } catch (_e) {
    // Fallback
  }

  const en = cmsData.english;
  const ar = cmsData.arabic;

  return (
    <>
      <SEO 
        type="WebSite"
        data={{
          name: isAr ? (ar.headlineAr || "إي ثري قطر") : (en.headlineEn || "E3 Qatar"),
          url: `${baseUrl}/${locale}`,
          potentialAction: {
            "@type": "SearchAction",
            target: `${baseUrl}/${locale}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <PortalGateway cmsData={cmsData} />
    </>
  );
}
