import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { PageTransition } from "@/components/layout/PageTransition";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <LocaleProvider>
      <PageTransition>
        {children}
      </PageTransition>
    </LocaleProvider>
  );
}
