import { Metadata } from "next";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { GeneralSettingsView } from "@/components/dashboard/settings/GeneralSettingsView";
import { getMaskedAdminSettings } from "@/lib/settings/public-settings";

export const metadata: Metadata = {
  title: "General Settings | E3 Admin",
};

export const dynamic = 'force-dynamic';

export default async function GeneralSettingsPage({
  params,
}: {
  params?: Promise<{ locale: string }>;
}) {
  const resolvedParams = params ? await params : { locale: 'en' };
  const locale = resolvedParams?.locale || 'en';

  const session = await auth();
  if (!session?.user && process.env.NODE_ENV !== 'development') {
    redirect(`/${locale}/login/admin`);
  }

  const userRole = (session?.user as any)?.role || (process.env.NODE_ENV === 'development' ? 'SUPER_ADMIN' : undefined);
  const isAuthorized = process.env.NODE_ENV === 'development' || hasPermission(userRole, 'settings.general.manage');

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <h2 className="text-xl font-bold text-red-500 mb-2">
          {locale === 'ar' ? 'غير مصرح بالدخول' : 'Access Denied'}
        </h2>
        <p className="text-zinc-400">
          {locale === 'ar'
            ? 'لا تملك الصلاحيات الكافية للوصول إلى إعدادات النظام العامة.'
            : 'You do not have permission to view or manage general site settings.'}
        </p>
      </div>
    );
  }

  const settingsRecords = await db.setting.findMany({
    where: { type: { in: ["GENERAL", "INTEGRATION"] } },
  });

  const maskedSettings = getMaskedAdminSettings(settingsRecords || []);

  return <GeneralSettingsView initialSettings={maskedSettings} />;
}
