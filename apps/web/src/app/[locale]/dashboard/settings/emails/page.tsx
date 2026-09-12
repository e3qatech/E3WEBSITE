import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getEmailTemplateConfig } from '@/lib/email-templates';
import { EmailTemplatesManagerView } from '@/components/dashboard/settings/EmailTemplatesManagerView';

export const metadata: Metadata = {
  title: 'Email Templates & Replies | E3 Admin',
};

export const dynamic = 'force-dynamic';

export default async function EmailTemplatesSettingsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  const session = await auth();
  if (!session?.user && process.env.NODE_ENV !== 'development') {
    redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/settings/emails`);
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
            ? 'لا تملك الصلاحيات الكافية لتعديل قوالب البريد الإلكتروني.'
            : 'You do not have permission to view or manage automated email reply templates.'}
        </p>
      </div>
    );
  }

  const config = await getEmailTemplateConfig();

  return <EmailTemplatesManagerView initialConfig={config} />;
}
