import { Metadata } from "next";
import db from "@/lib/db";
import { InsightsClient } from "@/components/b2c/InsightsClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";

  const title = isAr ? "الأخبار والرؤى والمقالات | إي ثري قطر" : "Insights, News & Press | E3 Qatar";
  const description = isAr
    ? "اكتشف أحدث المقالات والبيانات الصحفية وتقارير الفعاليات الترفيهية والتجارب الحية في قطر."
    : "Explore the latest articles, press releases, event recaps, and immersive entertainment insights across Qatar.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: isAr ? "ar_QA" : "en_US",
    },
    alternates: {
      canonical: `/${locale}/b2c/insights`,
      languages: {
        en: "/en/b2c/insights",
        ar: "/ar/b2c/insights",
      },
    },
  };
}

export default async function InsightsHubPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  let insights: any[] = [];

  try {
    insights = await db.insight.findMany({
      where: {
        publishStatus: "PUBLISHED",
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            firstNameAr: true,
            lastNameAr: true,
            designation: true,
            designationAr: true,
            profileImage: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { featured: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
    });
  } catch (error) {
    console.error("[InsightsHubPage] Failed to fetch insights:", error);
  }

  return (
    <InsightsClient
      initialInsights={insights}
      locale={locale}
    />
  );
}
