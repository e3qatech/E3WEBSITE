import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { ToastProvider } from "@/components/dashboard/ui/ToastProvider";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  await params;
  return (
    <LocaleProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </LocaleProvider>
  );
}
