import { notFound } from "next/navigation";
import { Metadata } from "next";
import { NotFoundView } from "@/components/shared/NotFoundView";

export async function generateMetadata(props: {
  params: Promise<{ locale: string; notFound?: string[] }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";

  return {
    title: isAr ? "الصفحة غير موجودة (404) | إي ثري قطر" : "404 — Page Not Found | E3 Qatar",
    description: isAr
      ? "الصفحة المطلوبة غير موجودة أو تم نقلها."
      : "The requested coordinate or page was not found within E3 Qatar.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function CatchAllNotFoundPage(props: {
  params: Promise<{ locale: string; notFound?: string[] }>;
}) {
  const { locale } = await props.params;
  return <NotFoundView locale={locale} />;
}
