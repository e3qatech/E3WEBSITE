import { Metadata } from "next";
import { DiscoverClient } from "@/components/b2c/DiscoverClient";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discover E3 Qatar | Immersive Entertainment & Engineering",
  description: "Learn about the E3 story, our heritage, spatial entertainment technology, leadership team, and custom group packages in Qatar.",
};

export default async function DiscoverPage(props: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params;

  let settings: any = null;

  try {
    const page = await db.pages.findUnique({
      where: { slug: "b2c-discover" }
    });
    if (page && page.content) {
      settings = page.content;
    }
  } catch (e) {
    console.warn("[DISCOVER PAGE DB NOTICE] Failed to query pages table:", e);
  }

  if (!settings) {
    try {
      const settingModel = (db as any).siteSettings || (db as any).setting;
      if (settingModel) {
        const settingRecord = await settingModel.findUnique({
          where: { key: "cms_page_b2c-discover" }
        });
        if (settingRecord && settingRecord.value) {
          settings = settingRecord.value;
        }
      }
    } catch (e) {
      console.warn("[DISCOVER PAGE DB NOTICE] Failed to query siteSettings:", e);
    }
  }

  return <DiscoverClient locale={locale} initialSettings={settings} />;
}
