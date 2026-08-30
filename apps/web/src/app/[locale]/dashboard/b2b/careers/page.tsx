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
  let jobs: any[] = [];
  try {
    const [pageRes, jobsRes] = await Promise.all([
      db.pages.findUnique({
        where: { slug: "b2b-careers" },
      }),
      db.job.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      }),
    ]);
    page = pageRes;
    jobs = jobsRes;
  } catch (error) {
    console.warn("[B2B Careers Dashboard] Error querying db:", error);
  }

  const mergedContent = getMergedCMSPageContent("b2b-careers", page?.content);
  const initialData = {
    ...mergedContent,
    seo: page?.seo || mergedContent?.seo || {},
    jobs,
  };

  return <B2BCareersEditor initialData={initialData} />;
}
