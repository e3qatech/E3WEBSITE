import { Metadata } from 'next';
import { SocialMediaManagerView } from '@/components/admin/social-media/SocialMediaManagerView';
import { auth } from '@/lib/auth';
import { DashboardAccessDenied } from '@/components/dashboard/ui/DashboardAccessDenied';

export const metadata: Metadata = {
  title: 'Social Media Manager | E3 Qatar Dashboard',
  description: 'Manage platform API integrations, connected social accounts, content moderation, feeds, and website placement.',
};

export const dynamic = 'force-dynamic';

const AUTHORIZED_ROLES = [
  'SUPER_ADMIN',
  'SALES_ADMIN',
  'SUPPORT_ADMIN',
  'B2C_ADMIN',
  'B2B_ADMIN',
  'HR_ADMIN',
  'OPERATIONS_ADMIN',
  'STAFF',
  'INTEGRATION_MANAGER',
  'CONTENT_MANAGER',
  'EDITOR',
  'VIEWER',
];

export default async function SocialMediaDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const session = await auth();
  const rawRole = (session?.user as any)?.role;
  const userRole = rawRole ? String(rawRole).trim().toUpperCase() : null;

  if (!userRole || !AUTHORIZED_ROLES.includes(userRole)) {
    return (
      <DashboardAccessDenied
        title={isAr ? "الوصول مقيّد" : "Access Restricted"}
        message={
          isAr
            ? "حسابك الحالي لا يمتلك الصلاحيات الإدارية الكافية للوصول إلى إدارة منصات التواصل الاجتماعي وموجز الأخبار."
            : "Your current account does not have sufficient permissions to view or manage the Social Media Hub."
        }
        requiredPermission="VIEW_SOCIAL_MANAGER"
      />
    );
  }

  return <SocialMediaManagerView />;
}
