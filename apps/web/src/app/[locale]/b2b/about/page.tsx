import { Metadata } from "next";
import { db } from "@/lib/db";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";
import { B2BAboutClient } from "@/components/b2b/about/B2BAboutClient";

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
      where: { slug: "b2b-about" },
    });
  } catch (error) {
    console.warn("[B2B About Metadata] Failed to query page from database:", error);
  }

  const cmsContent = getMergedCMSPageContent("b2b-about", pageData?.content);
  const seo = cmsContent?.seo || {};

  const title = isAr
    ? seo.metaTitleAr || cmsContent?.header?.titleAr || "من نحن | إي ثري قطر لهندسة الفعاليات والوجهات"
    : seo.metaTitleEn || cmsContent?.header?.titleEn || "About Us | E3 Qatar Event Engineering & Attractions";

  const description = isAr
    ? seo.metaDescriptionAr || cmsContent?.header?.subtitleAr || "تعرف على إي ثري قطر، مسيرتنا، فريق القيادة، قيمنا ورؤيتنا في هندسة وتطوير كبرى الوجهات الترفيهية."
    : seo.metaDescriptionEn || cmsContent?.header?.subtitleEn || "Learn about E3 Qatar, our story, leadership, core values, and our mission to engineer mega-scale entertainment destinations.";

  return {
    title,
    description,
    keywords: isAr ? seo.keywordsAr : seo.keywordsEn,
    alternates: {
      canonical: `/${locale}/b2b/about`,
      languages: {
        en: "/en/b2b/about",
        ar: "/ar/b2b/about",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://e3.qa/${locale}/b2b/about`,
      siteName: isAr ? "إي ثري قطر" : "E3 Qatar",
      locale: isAr ? "ar_QA" : "en_US",
      type: "website",
    },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;

  let employeeProfiles: any[] = [];
  let pageData: any = null;

  try {
    const [profiles, page] = await Promise.all([
      db.employeeProfile.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        take: 12,
      }),
      db.pages.findUnique({
        where: { slug: "b2b-about" },
      }),
    ]);
    employeeProfiles = profiles;
    pageData = page;
  } catch (error) {
    console.error("[B2B About Server Loader] Error fetching database records:", error);
  }

  const cmsContent = getMergedCMSPageContent("b2b-about", pageData?.content);

  return (
    <B2BAboutClient
      cmsData={cmsContent}
      employeeProfiles={employeeProfiles}
      locale={locale}
    />
  );
}
