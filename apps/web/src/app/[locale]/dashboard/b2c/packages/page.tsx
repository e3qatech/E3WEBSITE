import { PackagesCMSView } from "@/components/dashboard/b2c/PackagesCMSView";
import db from "@/lib/db";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Packages CMS | E3 Admin",
  description: "Manage group packages, pricing, inclusions, and inquiry settings for the public website.",
};

export default async function AdminPackagesPage() {
  let content: any = null;

  try {
    let page = await db.pages.findUnique({
      where: { slug: "b2c-packages" },
    });
    if (!page) {
      page = await db.pages.findUnique({
        where: { slug: "packages" },
      });
    }
    if (page?.content) {
      content = page.content;
    }
  } catch (_e) {
    // Ignore DB error
  }

  if (!content) {
    try {
      const setting = await (db as any).siteSettings.findUnique({
        where: { key: "cms_page_b2c-packages" },
      });
      if (setting?.value) {
        content = setting.value;
      }
    } catch (_e) {
      // Ignore setting error
    }
  }

  const merged = getMergedCMSPageContent("b2c-packages", content);

  return <PackagesCMSView initialData={merged} />;
}
