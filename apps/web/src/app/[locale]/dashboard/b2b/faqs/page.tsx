import { Metadata } from "next";
import db from "@/lib/db";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";
import { B2BFAQsEditor } from "@/components/dashboard/b2b/B2BFAQsEditor";

export const metadata: Metadata = {
  title: "B2B FAQs CMS | E3 Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function B2BFAQsPage() {
  let page: any = null;
  try {
    page = await db.pages.findUnique({
      where: { slug: "b2b-faqs" },
    });
  } catch (error) {
    console.warn("[B2B FAQs Dashboard] Error querying db.pages:", error);
  }

  const mergedContent = getMergedCMSPageContent("b2b-faqs", page?.content);
  const initialData = {
    ...mergedContent,
    seo: page?.seo || mergedContent?.seo || {},
  };

  return <B2BFAQsEditor initialData={initialData} />;
}
