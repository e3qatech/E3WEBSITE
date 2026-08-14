import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BusinessHubClient } from '../components/business/BusinessHubClient';
import { RfpDetailClient } from '../components/business/RfpDetailClient';

vi.mock('next/navigation', () => ({
  usePathname: () => '/en/business',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signOut: vi.fn(),
}));

describe('QF-07: Business Portal UI & Localized Presentation', () => {
  const mockOrg = {
    id: 'org-test-1',
    company: 'Doha Expo Consortium',
    type: 'B2B',
    industry: 'Cultural Infrastructure',
    website: 'https://dohaexpo.qa',
  };

  const mockUser = {
    id: 'usr-1',
    name: 'Nasser Al-Kuwari',
    email: 'nasser@dohaexpo.qa',
    role: 'CLIENT',
  };

  const mockMembers = [
    {
      id: 'mem-1',
      role: 'OWNER',
      user: {
        id: 'usr-1',
        name: 'Nasser Al-Kuwari',
        email: 'nasser@dohaexpo.qa',
        role: 'CLIENT',
      },
    },
  ];

  const mockRfps = [
    {
      id: 'lead-test-101',
      name: 'Interactive Pavilions System',
      company: 'Doha Expo Consortium',
      email: 'nasser@dohaexpo.qa',
      status: 'PROPOSAL_SENT',
      createdAt: '2026-06-15T10:00:00.000Z',
      updatedAt: '2026-06-16T12:00:00.000Z',
      inquiries: [
        {
          id: 'inq-1',
          type: 'PROJECT',
          message: 'Turnkey interactive digital domes for 2026 exhibition.',
          status: 'NEW',
          createdAt: '2026-06-15T10:00:00.000Z',
        },
      ],
      activities: [
        {
          id: 'act-1',
          type: 'STATUS_CHANGE',
          description: 'Technical proposal submitted to client.',
          timestamp: '2026-06-16T12:00:00.000Z',
        },
      ],
    },
  ];

  it('1. Renders English Business Hub with organization name, metrics, and RFP list', () => {
    const html = renderToStaticMarkup(
      <BusinessHubClient
        user={mockUser}
        membershipRole="OWNER"
        organization={mockOrg}
        members={mockMembers}
        rfps={mockRfps}
        locale="en"
      />
    );

    expect(html).toContain('Doha Expo Consortium');
    expect(html).toContain('Client Enterprise Portal');
    expect(html).toContain('Interactive Pavilions System');
    expect(html).toContain('Proposal Ready');
    expect(html).toContain('Submit New RFP');
  });

  it('2. Renders Arabic Business Hub with localized strings and RTL direction', () => {
    const html = renderToStaticMarkup(
      <BusinessHubClient
        user={mockUser}
        membershipRole="OWNER"
        organization={mockOrg}
        members={mockMembers}
        rfps={mockRfps}
        locale="ar"
      />
    );

    expect(html).toContain('dir="rtl"');
    expect(html).toContain('بوابة العملاء والمشاريع');
    expect(html).toContain('تقديم طلب مشروع (RFP)');
    expect(html).toContain('عرض السعر جاهز');
    expect(html).toContain('طلبات المشاريع وعروض الأسعار');
  });

  it('3. Renders empty state when organization has no submitted RFPs', () => {
    const html = renderToStaticMarkup(
      <BusinessHubClient
        user={mockUser}
        membershipRole="MEMBER"
        organization={mockOrg}
        members={mockMembers}
        rfps={[]}
        locale="en"
      />
    );

    expect(html).toContain('No RFPs or Inquiries Yet');
    expect(html).toContain('Submit First RFP');
  });

  it('4. Renders RFP Detail view with sanitized scope and client-visible milestone stream', () => {
    const html = renderToStaticMarkup(
      <RfpDetailClient
        rfp={mockRfps[0]}
        organization={mockOrg}
        locale="en"
      />
    );

    expect(html).toContain('Interactive Pavilions System');
    expect(html).toContain('Turnkey interactive digital domes');
    expect(html).toContain('Client-Visible Milestone Stream');
    expect(html).toContain('Technical proposal submitted to client.');
  });
});
