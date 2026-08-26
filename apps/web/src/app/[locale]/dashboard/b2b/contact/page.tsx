import { Metadata } from "next";
import { db } from "@/lib/db";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";
import { B2BContactEditor } from "@/components/dashboard/b2b/B2BContactEditor";

export const metadata: Metadata = {
  title: "B2B Contact CMS | E3 Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function B2BContactPage() {
  let page: any = null;
  try {
    page = await db.pages.findUnique({
      where: { slug: "b2b-contact" },
    });
  } catch (error) {
    console.warn("[B2B Contact Dashboard] Error querying db.pages:", error);
  }

  const mergedContent = getMergedCMSPageContent("b2b-contact", page?.content);
  const initialData = {
    ...mergedContent,
    seo: page?.seo || mergedContent?.seo || {},
  };

  return <B2BContactEditor initialData={initialData} />;
}
