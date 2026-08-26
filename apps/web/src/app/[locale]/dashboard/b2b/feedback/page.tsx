import { Metadata } from "next";
import db from "@/lib/db";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";
import { B2BFeedbackEditor } from "@/components/dashboard/b2b/B2BFeedbackEditor";

export const metadata: Metadata = {
  title: "B2B Feedback CMS | E3 Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function B2BFeedbackPage() {
  let page: any = null;
  try {
    page = await db.pages.findUnique({
      where: { slug: "b2b-feedback" },
    });
  } catch (error) {
    console.warn("[B2B Feedback Dashboard] Error querying db.pages:", error);
  }

  const mergedContent = getMergedCMSPageContent("b2b-feedback", page?.content);
  const initialData = {
    ...mergedContent,
    seo: page?.seo || mergedContent?.seo || {},
  };

  return <B2BFeedbackEditor initialData={initialData} />;
}
