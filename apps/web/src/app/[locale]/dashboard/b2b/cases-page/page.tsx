import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { B2BCasesEditor } from "@/components/dashboard/b2b/B2BCasesEditor";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";

export const metadata: Metadata = {
  title: "B2B Case Studies Page Editor | E3 Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CasesPageEditor(props: {
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

  const [page, caseStudies, services, employeeProfiles] = await Promise.all([
    db.pages.findUnique({
      where: { slug: "b2b-cases" },
    }),
    db.caseStudy.findMany({
      orderBy: { titleEn: "asc" },
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleAr: true,
        clientName: true,
        year: true,
        category: true,
        isPublished: true,
        isFeatured: true,
      },
    }),
    db.service.findMany({
      orderBy: { titleEn: "asc" },
      select: { id: true, slug: true, titleEn: true, titleAr: true },
    }),
    db.employeeProfile.findMany({
      orderBy: { firstName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        designation: true,
        profileImage: true,
        department: true,
      },
    }),
  ]);

  const mergedContent = getMergedCMSPageContent("b2b-cases", page?.content);
  const initialContent = {
    ...mergedContent,
    seo: page?.seo || mergedContent?.seo || {},
  };

  return (
    <B2BCasesEditor
      initialData={initialContent}
      caseStudies={caseStudies}
      services={services}
      employeeProfiles={employeeProfiles}
    />
  );
}
