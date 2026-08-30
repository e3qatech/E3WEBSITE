import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { ToastProvider } from "@/components/dashboard/ui/ToastProvider";
import { MotionCapabilityProvider } from "@/lib/motion/capability-context";
import { FloatingSocialDock } from "@/components/layout/FloatingSocialDock";

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
      <MotionCapabilityProvider>
        <ToastProvider>
          {children}
          <FloatingSocialDock />
        </ToastProvider>
      </MotionCapabilityProvider>
    </LocaleProvider>
  );
}
