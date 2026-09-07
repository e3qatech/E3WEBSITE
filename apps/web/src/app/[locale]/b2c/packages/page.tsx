import { Metadata } from "next";
import { PackagesClient } from "@/components/b2c/PackagesClient";
import db from "@/lib/db";
import { getBaseUrl } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";
  const baseUrl = getBaseUrl();

  const title = isAr
    ? "باقات الفعاليات وحفلات أعياد الميلاد والشركات في قطر | إي ثري"
    : "Group Entertainment Packages & Birthday Bookings in Qatar | E3";

  const description = isAr
    ? "احجز باقات حفلات أعياد الميلاد، فعاليات بناء فريق العمل للشركات، والزيارات الجماعية الحصرية في أفضل وجهات قطر الترفيهية."
    : "Book VIP birthday parties, corporate team outings, school field trips, and exclusive venue buyouts across Qatar's top attractions.";

  return {
    title,
    description,
    keywords: isAr
      ? ["باقات ترفيهية قطر", "حفلات اعياد ميلاد الدوحة", "حجوزات شركات فعاليات قطر", "عروض ترفيه جماعي قطر"]
      : ["entertainment packages qatar", "birthday parties doha", "corporate outings qatar", "group venue buyouts qatar"],
    alternates: {
      canonical: `${baseUrl}/${locale}/b2c/packages`,
      languages: {
        en: `${baseUrl}/en/b2c/packages`,
        ar: `${baseUrl}/ar/b2c/packages`,
        "x-default": `${baseUrl}/en/b2c/packages`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/b2c/packages`,
      images: [{ url: `${baseUrl}/og-image-default.jpg` }],
    },
  };
}

export default async function PackagesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  let settings: any = null;

  try {
    let page = await db.pages.findUnique({
      where: { slug: "b2c-packages-page" }
    });
    if (!page) {
      page = await db.pages.findUnique({
        where: { slug: "b2c-packages" }
      });
    }
    if (page && page.content) {
      settings = page.content;
    }
  } catch (e) {
    console.warn("[PACKAGES PAGE DB NOTICE] Failed to query pages table:", e);
  }

  let packages: any[] = [];
  try {
    packages = await db.package.findMany({
      where: { isPublished: true },
      include: {
        attraction: { select: { id: true, nameEn: true, nameAr: true, slug: true } },
        brand: { select: { id: true, nameEn: true, nameAr: true } },
        location: { select: { id: true, nameEn: true, nameAr: true } }
      },
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" }
      ]
    });
  } catch (e) {
    console.warn("[PACKAGES PAGE DB NOTICE] Failed to query packages:", e);
  }

  let categories: any[] = [];
  try {
    categories = await db.packageCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" }
    });
  } catch (e) {
    console.warn("[PACKAGES PAGE DB NOTICE] Failed to query package categories:", e);
  }

  return (
    <div className="min-h-screen bg-[var(--surface-default)]">
      <PackagesClient locale={locale} initialSettings={settings} packages={packages} categories={categories} />
    </div>
  );
}
