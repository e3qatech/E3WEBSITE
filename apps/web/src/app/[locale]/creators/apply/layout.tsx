import { Metadata } from "next";
import { getBaseUrl } from "@/lib/seo-helper";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";
  const baseUrl = getBaseUrl();

  const title = isAr
    ? "انضم كصانع محتوى | تقديم الطلب | إي ثري قطر"
    : "Join as a Creator | Application Portal | E3 Qatar";

  const description = isAr
    ? "قدم طلبك للانضمام إلى شبكة صناع المحتوى والمؤثرين في إي ثري قطر، واستفد من فرص التعاون الحصري وتغطية كبرى الفعاليات."
    : "Apply to join the E3 Qatar Creator Collective for exclusive event invitations, campaign collaborations, and brand partnerships in Doha.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/creators/apply`,
      languages: {
        en: `${baseUrl}/en/creators/apply`,
        ar: `${baseUrl}/ar/creators/apply`,
        "x-default": `${baseUrl}/en/creators/apply`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/creators/apply`,
      images: [{ url: `${baseUrl}/og-image-default.jpg` }],
    },
  };
}

export default function CreatorApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
