import { LocaleProvider } from "@/components/layout/LocaleProvider";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const { locale } = await params;
  return (
    <LocaleProvider>
      {children}
    </LocaleProvider>
  );
}
