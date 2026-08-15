import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';
import { CalendarPageManager } from '@/components/dashboard/b2c/CalendarPageManager';

export const metadata: Metadata = {
  title: 'Calendar Page Settings | E3 CMS',
};

export default async function CalendarPageEditorPage({
  params,
}: {
  params?: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user && process.env.NODE_ENV === 'production') {
    const resolvedParams = params ? await params : { locale: 'en' };
    redirect(`/${resolvedParams.locale || 'en'}/login`);
  }

  const userRole = (session?.user as any)?.role;
  if (userRole && !hasPermission(userRole, 'b2c.content.read') && !hasPermission(userRole, 'b2c.calendar.manage')) {
    const resolvedParams = params ? await params : { locale: 'en' };
    redirect(`/${resolvedParams.locale || 'en'}/dashboard`);
  }

  return <CalendarPageManager />;
}
