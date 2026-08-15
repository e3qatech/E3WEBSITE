import { redirect } from "next/navigation";

export default async function B2CCalendarRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale || "en"}/dashboard/b2c/calendar-page`);
}
