import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackageMicrositeClient } from "@/components/b2c/PackageMicrositeClient";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const isAr = locale === "ar";

  const pkg = await db.package.findFirst({
    where: {
      OR: [{ slug }, { id: slug }]
    }
  });

  if (!pkg) {
    return { title: "Package Not Found | E3 Qatar" };
  }

  const title = isAr
    ? `${pkg.titleAr || pkg.titleEn} | باقات إي ثري`
    : `${pkg.titleEn} | E3 Packages Qatar`;

  const description = isAr
    ? (pkg.shortDescriptionAr || pkg.shortDescriptionEn || "")
    : (pkg.shortDescriptionEn || "");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://e3.qa";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: pkg.coverMediaUrl ? [pkg.coverMediaUrl] : undefined,
      url: `${baseUrl}/${locale}/b2c/packages/${pkg.slug}`
    }
  };
}

export default async function PackageMicrositePage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await props.params;

  const pkg = await db.package.findFirst({
    where: {
      OR: [{ slug }, { id: slug }]
    },
    include: {
      attraction: true,
      brand: true,
      location: true
    }
  });

  if (!pkg) {
    notFound();
  }

  // Related packages
  const relatedPackages = await db.package.findMany({
    where: {
      category: pkg.category,
      id: { not: pkg.id },
      isPublished: true
    },
    take: 3
  });

  return (
    <div className="min-h-screen bg-[var(--surface-default)]">
      <PackageMicrositeClient
        locale={locale}
        pkg={pkg}
        relatedPackages={relatedPackages}
      />
    </div>
  );
}
