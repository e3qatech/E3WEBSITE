import { Metadata } from "next";
import { PortalGateway } from "@/components/home/PortalGateway";
import { SEO } from "@/components/shared/SEO";
import db from "@/lib/db";
import { GatewayCustomizationPayload, DEFAULT_GATEWAY_CMS_PAYLOAD } from "@/types/gateway-cms";

import { memoryCache } from "@/lib/cache/memory-cache";
import { getBaseUrl } from "@/lib/seo-helper";

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

async function getCachedGatewayPayload(): Promise<GatewayCustomizationPayload> {
  return memoryCache.getOrSet('setting_gateway_customization_published', 60_000, async () => {
    try {
      const record = await db.setting.findUnique({
        where: { key: 'gateway_customization_published' },
      });
      if (record?.value) {
        return mergeGatewayPayload(record.value);
      }
    } catch (_e) {}
    return DEFAULT_GATEWAY_CMS_PAYLOAD;
  });
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";
  const baseUrl = getBaseUrl();
  
  const cmsData = await getCachedGatewayPayload();
  const en = cmsData.english;
  const ar = cmsData.arabic;
  const seo = cmsData.seoAccess;

  const defaultTitleEn = "E3 Qatar | Event Management Company, Corporate Production & Live Entertainment";
  const defaultTitleAr = "إي ثري قطر | لتنظيم وإدارة الفعاليات والمؤتمرات وتطوير الوجهات الترفيهية";
  const defaultDescEn = "Qatar's premier event management company, turnkey corporate event organizer, and live entertainment destination operator in Doha. Specializing in festival staging, exhibition booth fabrication, AV production, and landmark attractions.";
  const defaultDescAr = "الشركة الرائدة في قطر لتنظيم وإدارة الفعاليات الكبرى والمؤتمرات والمعارض بالدوحة. خدمات الإنتاج الفني وتجهيز المسارح والصوتيات وتطوير أضخم الوجهات والفعاليات الترفيهية.";

  const title = isAr
    ? (seo.seoTitleAr || defaultTitleAr)
    : (seo.seoTitleEn || defaultTitleEn);

  const description = isAr
    ? (seo.seoDescAr || defaultDescAr)
    : (seo.seoDescEn || defaultDescEn);

  const ogImage = seo.ogImage || `${baseUrl}/og-image-default.jpg`;
  const canonicalUrl = `${baseUrl}/${locale}`;

  return {
    title,
    description,
    keywords: isAr
      ? [
          "شركة تنظيم فعاليات قطر",
          "تنظيم مؤتمرات ومعارض الدوحة",
          "تجهيز مسارح قطر",
          "شركات تنظيم حفلات الدوحة",
          "أماكن ترفيهية في قطر",
          "فعاليات قطر اليوم",
        ]
      : [
          "event management company qatar",
          "corporate events doha",
          "event production qatar",
          "exhibition stand fabrication doha",
          "family entertainment qatar",
          "theme parks doha",
          "inflatarun qatar",
        ],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en`,
        'ar': `${baseUrl}/ar`,
        'x-default': `${baseUrl}/en`,
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
  const baseUrl = getBaseUrl();

  const cmsData = await getCachedGatewayPayload();

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
