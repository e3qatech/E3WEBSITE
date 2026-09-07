import { Metadata } from "next";
import { PortalGateway } from "@/components/home/PortalGateway";
import { SEO } from "@/components/shared/SEO";
import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { MotionCapabilityProvider } from "@/lib/motion/capability-context";
import db from "@/lib/db";
import { GatewayCustomizationPayload, DEFAULT_GATEWAY_CMS_PAYLOAD } from "@/types/gateway-cms";
import { getBaseUrl } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

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

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  
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

  const title = cmsData.seoAccess?.seoTitleEn || "E3 Qatar | Event Management Company, Corporate Production & Live Entertainment";
  const description = cmsData.seoAccess?.seoDescEn || "Qatar's premier event management company, turnkey corporate event organizer, and live entertainment destination operator in Doha. Specializing in festival staging, exhibition booth fabrication, AV production, and landmark attractions.";
  const ogImage = cmsData.seoAccess?.ogImage || `${baseUrl}/og-image-default.jpg`;

  return {
    title,
    description,
    keywords: [
      "event management company qatar",
      "corporate events doha",
      "event production qatar",
      "exhibition stand fabrication doha",
      "stage lighting av rental qatar",
      "family entertainment qatar",
      "theme parks doha",
      "inflatarun qatar",
    ],
    alternates: {
      canonical: baseUrl,
      languages: {
        'en': `${baseUrl}/en`,
        'ar': `${baseUrl}/ar`,
        'x-default': `${baseUrl}/en`,
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

async function loadGatewayCmsData(): Promise<GatewayCustomizationPayload> {
  try {
    const record = await db.setting.findUnique({
      where: { key: 'gateway_customization_published' },
    });
    return record?.value ? mergeGatewayPayload(record.value) : DEFAULT_GATEWAY_CMS_PAYLOAD;
  } catch (_e) {
    return DEFAULT_GATEWAY_CMS_PAYLOAD;
  }
}

export default async function Home() {
  const baseUrl = getBaseUrl();
  const cmsData = await loadGatewayCmsData();

  return (
    <LocaleProvider defaultLocale="en">
      <MotionCapabilityProvider>
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
      </MotionCapabilityProvider>
    </LocaleProvider>
  );
}
