import { Metadata } from "next";
import db from "@/lib/db";
import { AttractionsClient } from "./AttractionsClient";

export const metadata: Metadata = {
  title: "Experiences | E3",
};

export const dynamic = "force-dynamic";

// Next.js App Router server component
export default async function AttractionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const correlationId = `corr_b2c_${locale}`;

  let cmsPage: any = null;
  let attractions: any[] = [];
  let isDbError = false;

  try {
    // Fetch CMS settings
    cmsPage = await db.pages.findUnique({
      where: { slug: "b2c-landing" },
    });

    // Fetch published attractions to seed the client store (better SEO and initial load)
    // Include gallery and pricing for the cards
    attractions = await db.attraction.findMany({
      where: { isPublished: true },
      include: {
        gallery: {
          orderBy: { orderIndex: "asc" },
          take: 1,
        },
        pricing: {
          take: 1,
        },
      },
      take: 50,
    });
  } catch (error) {
    isDbError = true;
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(
      `[DB ERROR] correlationId=${correlationId} route=/b2c message="${errorMsg.replace(/[\r\n]+/g, " ")}"`,
    );
  }

  const cmsData = cmsPage?.content || {};

  return (
    <AttractionsClient
      locale={locale}
      cmsData={cmsData as any}
      initialAttractions={attractions as any}
      isDbError={isDbError}
      correlationId={correlationId}
    />
  );
}
