import { Metadata } from "next";
import { DiscoverClient } from "@/components/b2c/DiscoverClient";
import db from "@/lib/db";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";
import { isGuinnessPublicationAllowed } from "@/lib/guinness-gate";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";

  let rawContent: any = null;
  try {
    const page = await db.pages.findUnique({
      where: { slug: "b2c-discover" }
    });
    if (page && page.content) {
      rawContent = page.content;
    }
  } catch (e) {
    console.warn("[DISCOVER METADATA DB NOTICE] Failed to query pages table:", e);
  }

  const content = getMergedCMSPageContent("b2c-discover", rawContent);
  const seo = content.seo || {};

  const title = isAr
    ? (seo.metaTitleAr || "استكشف إي ثري قطر | الهندسة والترفيه التفاعلي الغامر")
    : (seo.metaTitleEn || "Discover E3 Qatar | Immersive Entertainment & Engineering");

  const description = isAr
    ? (seo.metaDescriptionAr || "تعرف على قصة إي ثري قطر، قيادتها، رقم غينيس القياسي، وتكنولوجيا بوكينج كيوب والفعاليات.")
    : (seo.metaDescriptionEn || "Discover the E3 story, leadership, record-breaking InflataRUN achievement, BookingQube tech, and group packages in Qatar.");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://e3.qa";
  const canonicalUrl = `${baseUrl}/${locale}/b2c/discover`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/b2c/discover`,
        ar: `${baseUrl}/ar/b2c/discover`,
        "x-default": `${baseUrl}/en/b2c/discover`
      }
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "E3 Qatar",
      locale: isAr ? "ar_QA" : "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    },
    robots: {
      index: seo.indexingDirective !== "NOINDEX",
      follow: seo.followDirective !== "NOFOLLOW"
    }
  };
}

export default async function DiscoverPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const isAr = locale === "ar";

  let rawContent: any = null;
  try {
    const page = await db.pages.findUnique({
      where: { slug: "b2c-discover" }
    });
    if (page && page.content) {
      rawContent = page.content;
    }
  } catch (e) {
    console.warn("[DISCOVER PAGE DB NOTICE] Failed to query pages table:", e);
  }

  const content = getMergedCMSPageContent("b2c-discover", rawContent);

  // Batch-fetch referenced records from Prisma safely
  let employeeProfiles: any[] = [];
  let partners: any[] = [];
  let clients: any[] = [];
  let caseStudies: any[] = [];
  let services: any[] = [];
  let jobs: any[] = [];
  let insights: any[] = [];

  try {
    [employeeProfiles, partners, clients, caseStudies, services, jobs, insights] = await Promise.all([
      db.employeeProfile.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" }
      }).catch(() => []),
      db.partner.findMany({
        where: { isVisible: true },
        orderBy: { orderIndex: "asc" }
      }).catch(() => []),
      db.client.findMany({ where: { isVisible: true } }).catch(() => []),
      db.caseStudy.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 6
      }).catch(() => []),
      db.service.findMany({
        where: { isVisible: true },
        take: 6
      }).catch(() => []),
      db.job.findMany({
        where: { isPublished: true },
        take: 6
      }).catch(() => []),
      db.insight.findMany({
        where: { publishStatus: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 6
      }).catch(() => [])
    ]);
  } catch (err) {
    console.warn("[DISCOVER BATCH FETCH NOTICE] Safe fallback for references:", err);
  }

  // Server-side Guinness publication gate — evaluated before rendering
  const guinnessGate = isGuinnessPublicationAllowed(content.recordBreaking);
  const guinnessAllowed = guinnessGate.allowed;
  if (!guinnessAllowed) {
    console.info(`[DISCOVER GUINNESS GATE] Badge suppressed: ${guinnessGate.reason}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://e3.qa";

  // Build JSON-LD Structured Data
  const jsonLdData: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${baseUrl}/${locale}/b2c/discover#webpage`,
      "url": `${baseUrl}/${locale}/b2c/discover`,
      "name": isAr ? "استكشف إي ثري قطر" : "Discover E3 Qatar",
      "description": isAr ? content.about?.summaryAr : content.about?.summaryEn,
      "inLanguage": isAr ? "ar" : "en",
      "isPartOf": {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "name": "E3 Qatar",
        "url": baseUrl
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": "E3 Qatar",
      "legalName": "E3 Entertainment & Spatial Engineering WLL",
      "url": baseUrl,
      "foundingDate": "2020",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Lusail City",
        "addressCountry": "QA"
      },
      "knowsAbout": [
        "Spatial Entertainment",
        "Kinetic Staging",
        "Inflatable Obstacle Courses",
        "Event Ticketing & Access Control"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": isAr ? "الرئيسية" : "Home",
          "item": `${baseUrl}/${locale}/b2c`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": isAr ? "استكشف إي ثري" : "Discover",
          "item": `${baseUrl}/${locale}/b2c/discover`
        }
      ]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <DiscoverClient
        locale={locale}
        initialSettings={content}
        employeeProfiles={employeeProfiles}
        partners={partners}
        clients={clients}
        caseStudies={caseStudies}
        services={services}
        jobs={jobs}
        insights={insights}
        guinnessAllowed={guinnessAllowed}
      />
    </>
  );
}
