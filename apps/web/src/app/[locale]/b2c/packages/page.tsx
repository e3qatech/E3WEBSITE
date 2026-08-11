import { Metadata } from "next";
import { PackagesClient } from "@/components/b2c/PackagesClient";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Packages | E3 Qatar",
  description: "Book VIP birthday parties, corporate team-building outings, and exclusive venue buyouts across Qatar.",
};

export default async function PackagesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: _locale } = await props.params;

  let settings: any = null;

  try {
    const page = await db.pages.findUnique({
      where: { slug: "b2c-packages" }
    });
    if (page && page.content) {
      settings = page.content;
    }
  } catch (e) {
    console.warn("[PACKAGES PAGE DB NOTICE] Failed to query pages table:", e);
  }

  if (!settings) {
    try {
      const settingModel = (db as any).siteSettings || (db as any).setting;
      if (settingModel) {
        const settingRecord = await settingModel.findUnique({
          where: { key: "cms_page_b2c-packages" }
        });
        if (settingRecord && settingRecord.value) {
          settings = settingRecord.value;
        }
      }
    } catch (e) {
      console.warn("[PACKAGES PAGE DB NOTICE] Failed to query siteSettings:", e);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--surface-default)] pt-20">
      <PackagesClient initialSettings={settings} />
    </div>
  );
}
