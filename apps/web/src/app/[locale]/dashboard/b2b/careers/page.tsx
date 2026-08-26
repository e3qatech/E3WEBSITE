import { Metadata } from "next";
import { db } from "@/lib/db";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";
import { B2BCareersEditor } from "@/components/dashboard/b2b/B2BCareersEditor";

export const metadata: Metadata = {
  title: "B2B Careers CMS | E3 Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function B2BCareersPage() {
  let page: any = null;
  try {
    page = await db.pages.findUnique({
      where: { slug: "b2b-careers" },
    });
  } catch (error) {
    console.warn("[B2B Careers Dashboard] Error querying db.pages:", error);
  }

  const mergedContent = getMergedCMSPageContent("b2b-careers", page?.content);
  const initialData = {
    ...mergedContent,
    seo: page?.seo || mergedContent?.seo || {},
  };

  return <B2BCareersEditor initialData={initialData} />;
}
