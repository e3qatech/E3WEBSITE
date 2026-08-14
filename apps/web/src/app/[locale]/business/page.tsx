import React from 'react';
import { redirect } from 'next/navigation';
import { requirePortalAccess, requireClientOrganization, sanitizeLeadForClient, AppAuthError } from '@/lib/server-auth';
import { BusinessHubClient } from '@/components/business/BusinessHubClient';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BusinessDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  let authResult: any = null;
  try {
    await requirePortalAccess('business');
    authResult = await requireClientOrganization();
  } catch (error: any) {
    if (error instanceof AppAuthError && error.statusCode === 401) {
      redirect(`/${locale}/login/business?callbackUrl=/${locale}/business`);
    }

    // Access denied / missing membership state
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 p-8 rounded-3xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isAr ? 'غير مصرح بالدخول' : 'Access Denied'}
          </h2>
          <p className="text-xs text-zinc-400">
            {isAr
              ? 'هذا الحساب غير مرتبط بعضوية نشطة في بوابة الشركات. يرجى التواصل مع مسؤول المؤسسة.'
              : 'This account is not associated with an active enterprise membership. Please contact your organization administrator.'}
          </p>
          <a
            href={`/${locale}/login/business`}
            className="inline-block px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-all"
          >
            {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
          </a>
        </div>
      </div>
    );
  }

  const { user, membership, client } = authResult;

  // Fallback organization representation for Admin users browsing without active client membership
  const organizationData = client || {
    id: 'org-admin-view',
    company: 'E3 Enterprise Administration',
    type: 'B2B',
    industry: 'Entertainment Engineering',
    website: 'https://e3.qa',
  };

  // Fetch organization members
  let members: any[] = [];
  if (client?.id) {
    try {
      members = await db.clientMembership.findMany({
        where: { clientId: client.id, isActive: true },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    } catch (_e) {
      members = [];
    }
  }

  // Fetch organization-scoped RFPs / Leads
  let rfps: any[] = [];
  try {
    const rawLeads = await db.lead.findMany({
      where: client?.company
        ? {
            OR: [
              { company: { equals: client.company, mode: 'insensitive' } },
              ...(user?.email ? [{ email: { equals: user.email, mode: 'insensitive' } }] : []),
            ],
          }
        : user?.email
        ? { email: { equals: user.email, mode: 'insensitive' } }
        : {},
      include: {
        inquiries: { orderBy: { createdAt: 'desc' } },
        activities: { orderBy: { timestamp: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    rfps = (rawLeads || []).map(sanitizeLeadForClient);
  } catch (_e) {
    rfps = [];
  }

  return (
    <BusinessHubClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      membershipRole={membership?.role || 'MEMBER'}
      organization={organizationData}
      members={members}
      rfps={rfps}
      locale={locale}
    />
  );
}
