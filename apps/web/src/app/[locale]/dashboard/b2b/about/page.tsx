import { Metadata } from "next";
import { db } from "@/lib/db";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";
import { B2BAboutEditor } from "@/components/dashboard/b2b/B2BAboutEditor";

export const metadata: Metadata = {
  title: "B2B About Us CMS | E3 Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function B2BAboutPage() {
  let page: any = null;
  try {
    page = await db.pages.findUnique({
      where: { slug: "b2b-about" },
    });
  } catch (error) {
    console.warn("[B2B About Dashboard] Error querying db.pages:", error);
  }

  const mergedContent = getMergedCMSPageContent("b2b-about", page?.content);
  const initialData = {
    ...mergedContent,
    seo: page?.seo || mergedContent?.seo || {},
  };

  return <B2BAboutEditor initialData={initialData} />;
}
