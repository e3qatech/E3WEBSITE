import { Metadata } from "next";
import { DiscoverClient } from "@/components/b2c/DiscoverClient";
import db from "@/lib/db";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";
import { isGuinnessPublicationAllowed } from "@/lib/guinness-gate";
import { getPublicCaseStudies } from "@/lib/case-studies";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";

  let rawContent: any = null;
  try {
    const page = await db.pages.findFirst({
      where: {
        OR: [
          { slug: "b2b-discover" },
          { slug: "b2c-discover" },
          { slug: "discover" },
        ],
      },
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
  const canonicalUrl = `${baseUrl}/${locale}/b2b/discover`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/b2b/discover`,
        ar: `${baseUrl}/ar/b2b/discover`,
        "x-default": `${baseUrl}/en/b2b/discover`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: isAr ? "إي ثري قطر" : "E3 Qatar",
      locale: isAr ? "ar_QA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: seo.indexingDirective !== "NOINDEX",
      follow: seo.followDirective !== "NOFOLLOW",
    },
  };
}

export default async function B2BDiscoverPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const isAr = locale === "ar";

  let rawContent: any = null;
  let employeeProfiles: any[] = [];
  let partners: any[] = [];
  let clients: any[] = [];
  let caseStudies: any[] = [];
  let services: any[] = [];
  let jobs: any[] = [];
  let insights: any[] = [];

  // All parallel batch fetch for maximum performance
  try {
    const [pageRes, empRes, partRes, clientRes, casesRes, servRes, jobRes, insRes] =
      await Promise.allSettled([
        db.pages.findFirst({
          where: {
            OR: [
              { slug: "b2b-discover" },
              { slug: "b2c-discover" },
              { slug: "discover" },
            ],
          },
        }),
        db.employeeProfile.findMany({
          where: { isActive: true },
          orderBy: { order: "asc" },
        }),
        db.partner.findMany({
          where: { isVisible: true },
          orderBy: { orderIndex: "asc" },
        }),
        db.client.findMany({ where: { isVisible: true } }),
        getPublicCaseStudies({ limit: 6 }),
        db.service.findMany({
          where: { isVisible: true },
          take: 6,
        }),
        db.job.findMany({
          where: { isPublished: true },
          take: 6,
        }),
        db.insight.findMany({
          where: { publishStatus: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          take: 6,
        }),
      ]);

    if (pageRes.status === "fulfilled" && pageRes.value?.content) {
      rawContent = pageRes.value.content;
    }
    if (empRes.status === "fulfilled") employeeProfiles = empRes.value || [];
    if (partRes.status === "fulfilled") partners = partRes.value || [];
    if (clientRes.status === "fulfilled") clients = clientRes.value || [];
    if (casesRes.status === "fulfilled") caseStudies = casesRes.value || [];
    if (servRes.status === "fulfilled") services = servRes.value || [];
    if (jobRes.status === "fulfilled") jobs = jobRes.value || [];
    if (insRes.status === "fulfilled") insights = insRes.value || [];
  } catch (err) {
    console.warn("[B2B DISCOVER BATCH FETCH NOTICE] Safe fallback for references:", err);
  }

  const content = getMergedCMSPageContent("b2c-discover", rawContent);

  // Server-side Guinness publication gate
  const guinnessGate = isGuinnessPublicationAllowed(content.recordBreaking);
  const guinnessAllowed = guinnessGate.allowed;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://e3.qa";

  // Build JSON-LD Structured Data
  const jsonLdData: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${baseUrl}/${locale}/b2b/discover#webpage`,
      url: `${baseUrl}/${locale}/b2b/discover`,
      name: isAr ? "استكشف إي ثري قطر" : "Discover E3 Qatar",
      description: isAr ? content.about?.summaryAr : content.about?.summaryEn,
      inLanguage: isAr ? "ar" : "en",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        name: isAr ? "إي ثري قطر" : "E3 Qatar",
        url: baseUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "E3 Qatar",
      legalName: "E3 Entertainment & Spatial Engineering WLL",
      url: baseUrl,
      foundingDate: "2020",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lusail City",
        addressCountry: "QA",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: isAr ? "الرئيسية" : "Home",
          item: `${baseUrl}/${locale}/b2b`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: isAr ? "استكشف إي ثري" : "Discover",
          item: `${baseUrl}/${locale}/b2b/discover`,
        },
      ],
    },
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
