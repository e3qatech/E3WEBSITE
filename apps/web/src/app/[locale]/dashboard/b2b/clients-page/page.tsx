import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";
import { B2BPartnersEditor } from "@/components/dashboard/b2b/B2BPartnersEditor";

export const metadata: Metadata = {
  title: "B2B Partners & Clients Page Editor | E3 Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PartnersPageEditor(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const session = await auth();
  if (
    !session ||
    !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN", "B2B_ADMIN"].includes(
      (session.user as any)?.role
    )
  ) {
    redirect(`/${locale}/login/admin`);
  }

  let page: any = null;
  try {
    page = await db.pages.findUnique({
      where: { slug: "b2b-partners" },
    });
  } catch (error) {
    console.warn("[B2B Partners Dashboard] Error querying db.pages:", error);
  }

  const mergedContent = getMergedCMSPageContent("b2b-partners", page?.content);
  const initialData = {
    ...mergedContent,
    seo: page?.seo || mergedContent?.seo || {},
  };

  return <B2BPartnersEditor initialData={initialData} />;
}
