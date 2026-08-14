import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { ToastProvider } from "@/components/dashboard/ui/ToastProvider";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === 'ar' ? 'ar' : 'en';

  return (
    <LocaleProvider defaultLocale={validLocale}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </LocaleProvider>
  );
}
