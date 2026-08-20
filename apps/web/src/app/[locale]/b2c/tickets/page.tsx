import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function TicketsPage(props: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const locale = params.locale || 'en';

  const queryParams = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v));
      } else if (typeof value === 'string') {
        queryParams.set(key, value);
      }
    }
  }

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  redirect(`/${locale}/b2c/calendar${queryString}`);
}
