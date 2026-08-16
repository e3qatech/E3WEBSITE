import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';
import { CalendarPageManager } from '@/components/dashboard/b2c/CalendarPageManager';
import { db } from '@/lib/db';
import { getMergedCMSPageContent } from '@/lib/cms-default-pages';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Calendar Page Settings | E3 CMS',
};

export default async function CalendarPageEditorPage({
  params,
}: {
  params?: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const resolvedParams = params ? await params : { locale: 'en' };
  const locale = resolvedParams.locale || 'en';

  if (!session?.user && process.env.NODE_ENV === 'production') {
    redirect(`/${locale}/login`);
  }

  const userRole = (session?.user as any)?.role;
  if (userRole && !hasPermission(userRole, 'b2c.content.read') && !hasPermission(userRole, 'b2c.calendar.manage') && userRole !== 'SUPER_ADMIN') {
    redirect(`/${locale}/dashboard`);
  }

  let pageSettings: any = null;
  let discounts: any[] = [];
  let attractions: any[] = [];

  try {
    const [pageRes, settingsRes, offersRes, attractionsRes] = await Promise.all([
      db.pages.findUnique({ where: { slug: 'b2c-calendar' } }).catch(() => null),
      db.setting.findUnique({ where: { key: 'B2C_CALENDAR_PAGE_SETTINGS' } }).catch(() => null),
      db.attractionOffer.findMany({
        include: { attraction: { select: { nameEn: true } } },
        orderBy: { createdAt: 'desc' }
      }).catch(() => []),
      db.attraction.findMany({
        where: { isPublished: true },
        select: { id: true, nameEn: true, nameAr: true },
        orderBy: { nameEn: 'asc' }
      }).catch(() => [])
    ]);

    const rawContent = pageRes?.content || settingsRes?.value || {};
    pageSettings = getMergedCMSPageContent('b2c-calendar', rawContent);
    discounts = offersRes || [];
    attractions = attractionsRes || [];
  } catch (err) {
    console.warn('[CALENDAR_PAGE_CMS_PREFETCH_NOTICE]', err);
  }

  return (
    <CalendarPageManager 
      initialPageSettings={pageSettings ? JSON.parse(JSON.stringify(pageSettings)) : undefined}
      initialDiscounts={discounts ? JSON.parse(JSON.stringify(discounts)) : undefined}
      initialAttractions={attractions ? JSON.parse(JSON.stringify(attractions)) : undefined}
    />
  );
}
