import { Metadata } from "next";
import { db } from "@/lib/db";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";
import { B2BContactClient } from "@/components/b2b/contact/B2BContactClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  let pageData: any = null;
  try {
    pageData = await db.pages.findUnique({
      where: { slug: "b2b-contact" },
    });
  } catch (error) {
    console.warn("[B2B Contact Metadata] Failed to fetch page from database:", error);
  }

  const cmsContent = getMergedCMSPageContent("b2b-contact", pageData?.content);
  const seo = cmsContent?.seo || {};

  const title = isAr
    ? seo.metaTitleAr || cmsContent?.header?.titleAr || "تواصل معنا وتقديم طلب العروض | إي ثري قطر"
    : seo.metaTitleEn || cmsContent?.header?.titleEn || "Contact & RFP Intake | E3 Qatar B2B";

  const description = isAr
    ? seo.metaDescriptionAr || cmsContent?.header?.subtitleAr || "تواصل مع إي ثري قطر لتنفيذ المشاريع الترفيهية الكبرى والفعاليات الحية والوجهات السياحية."
    : seo.metaDescriptionEn || cmsContent?.header?.subtitleEn || "Partner with E3 Qatar for world-class entertainment engineering, live activations, and turnkey attractions.";

  return {
    title,
    description,
    keywords: isAr ? seo.keywordsAr : seo.keywordsEn,
    alternates: {
      canonical: `/${locale}/b2b/contact`,
      languages: {
        en: "/en/b2b/contact",
        ar: "/ar/b2b/contact",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://e3.qa/${locale}/b2b/contact`,
      siteName: isAr ? "إي ثري قطر" : "E3 Qatar",
      locale: isAr ? "ar_QA" : "en_US",
      type: "website",
    },
  };
}

export default async function ContactRFPPage({ params }: PageProps) {
  const { locale } = await params;

  let pageData: any = null;
  try {
    pageData = await db.pages.findUnique({
      where: { slug: "b2b-contact" },
    });
  } catch (error) {
    console.warn("[B2B Contact Server] Failed to query database, falling back to canonical defaults:", error);
  }

  const cmsContent = getMergedCMSPageContent("b2b-contact", pageData?.content);

  return <B2BContactClient cmsData={cmsContent} locale={locale} />;
}
