import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { B2BServicesEditor } from "@/components/dashboard/b2b/B2BServicesEditor";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";

export const metadata: Metadata = {
  title: "B2B Services Page Editor | E3 Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ServicesPageEditor(props: {
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

  const [page, services, caseStudies] = await Promise.all([
    db.pages.findUnique({
      where: { slug: "b2b-services" },
    }),
    db.service.findMany({
      orderBy: { titleEn: "asc" },
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleAr: true,
        isVisible: true,
        isPublished: true,
        isFeatured: true,
      },
    }),
    db.caseStudy.findMany({
      where: { isPublished: true },
      orderBy: { titleEn: "asc" },
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleAr: true,
        year: true,
        clientName: true,
      },
    }),
  ]);

  const mergedContent = getMergedCMSPageContent("b2b-services", page?.content);
  const initialContent = {
    ...mergedContent,
    seo: page?.seo || mergedContent?.seo || {},
  };

  return (
    <B2BServicesEditor
      initialData={initialContent}
      services={services}
      caseStudies={caseStudies}
    />
  );
}
