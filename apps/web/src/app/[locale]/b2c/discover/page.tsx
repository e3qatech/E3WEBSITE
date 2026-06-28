import { Metadata } from "next";
import { DiscoverClient } from "@/components/b2c/DiscoverClient";

import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "Discover E3 | Event Engineering Experts",
  description: "Learn about the E3 story, our heritage, corporate team, and how to book VIP or corporate experiences.",
};

export default async function DiscoverPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;

  const setting = await prisma.setting.findUnique({
    where: { key: "B2C_DISCOVER_PAGE_SETTINGS" }
  });

  const settings = setting ? (typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value) : null;

  return <DiscoverClient locale={locale} initialSettings={settings} />;
}
