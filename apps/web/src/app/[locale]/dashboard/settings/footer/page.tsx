import { Metadata } from "next";
import { db } from "@/lib/db";
import { FooterSettingsView } from "@/components/dashboard/settings/FooterSettingsView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Global Footers (B2B & B2C) | E3 Dashboard",
  };
}

export default async function FooterSettingsPage() {
  let initialSettings: Record<string, string> = {};

  try {
    const settingsRecords = await db.setting.findMany();
    settingsRecords.forEach((s: any) => {
      initialSettings[s.key] = s.value;
    });
  } catch (error) {
    console.warn("Failed to fetch settings from database:", error);
  }

  return <FooterSettingsView initialSettings={initialSettings} />;
}
