import { Metadata } from "next";
import { DiscoverClient } from "@/components/b2c/DiscoverClient";

import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

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

  const page = await prisma.pages.findUnique({
    where: { slug: "b2c-discover" }
  });

  const settings = page?.content || null;

  return <DiscoverClient locale={locale} initialSettings={settings} />;
}
