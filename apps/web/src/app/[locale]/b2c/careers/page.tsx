import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CareersPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale || 'en';
  redirect(`/${locale}/b2c/packages`);
}
