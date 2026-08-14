import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isAuthorizedForPortal,
  allowedRolesForPortal,
  normalizeRole,
  isClientRole,
} from '../lib/auth-roles';
import { getAuthorizedLandingRoute, sanitizeCallbackUrl } from '../lib/landing-route';
import {
  requirePortalAccess,
  requireClientOrganization,
  requireClientRfpAccess,
  sanitizeLeadForClient,
  AppAuthError,
} from '../lib/server-auth';
import { db } from '../lib/db';

// Mock auth module
vi.mock('../lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock db queries
vi.mock('../lib/db', () => {
  const mockDb = {
    user: { findUnique: vi.fn() },
    client: { findUnique: vi.fn(), findMany: vi.fn() },
    clientMembership: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
    lead: { findUnique: vi.fn(), findMany: vi.fn() },
    media: { findUnique: vi.fn() },
    inquiry: { findMany: vi.fn() },
  };
  return { db: mockDb, default: mockDb };
});

import { auth } from '../lib/auth';

describe('QF-07: Business/Client Login & Organization-Scoped Portal RBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Signed-out portal entry
  it('1. Signed-out portal entry throws 401 and points to business login', async () => {
    (auth as any).mockResolvedValue(null);

    await expect(requirePortalAccess('business')).rejects.toThrow(AppAuthError);
    await expect(requireClientOrganization()).rejects.toThrow(AppAuthError);
  });

  // 2. EN/AR login callback
  it('2. EN/AR login callback preserves safe internal destination', () => {
    const clientUser = { role: 'CLIENT' };

    const enCallback = sanitizeCallbackUrl('/en/business/rfps/rfp-alpha-123', clientUser, 'en');
    expect(enCallback).toBe('/en/business/rfps/rfp-alpha-123');

    const arCallback = sanitizeCallbackUrl('/ar/business/rfps/rfp-alpha-123', clientUser, 'ar');
    expect(arCallback).toBe('/ar/business/rfps/rfp-alpha-123');

    const generalEnLanding = getAuthorizedLandingRoute(clientUser, 'en');
    expect(generalEnLanding).toBe('/en/business');

    const generalArLanding = getAuthorizedLandingRoute(clientUser, 'ar');
    expect(generalArLanding).toBe('/ar/business');
  });

  // 3. Own-organization lists and details
  it('3. Own-organization lists and details resolve correctly for verified member', async () => {
    const userA = {
      id: 'usr-client-alpha',
      email: 'ahmad@alpha-corp.qa',
      role: 'CLIENT',
      isActive: true,
      sessionVersion: 1,
    };
    (auth as any).mockResolvedValue({ user: userA });
    (db.user.findUnique as any).mockResolvedValue(userA);

    const clientAlpha = {
      id: 'client-alpha-org',
      company: 'Alpha Corp Qatar',
      type: 'B2B',
      industry: 'Event Technology',
      website: 'https://alpha.qa',
    };

    const membershipAlpha = {
      id: 'mem-1',
      userId: userA.id,
      clientId: clientAlpha.id,
      role: 'OWNER',
      isActive: true,
      client: clientAlpha,
    };

    (db.clientMembership.findFirst as any).mockResolvedValue(membershipAlpha);

    const orgResult = await requireClientOrganization();
    expect(orgResult.user.id).toBe(userA.id);
    expect(orgResult.client.id).toBe('client-alpha-org');
    expect(orgResult.client.company).toBe('Alpha Corp Qatar');
    expect(orgResult.membership.role).toBe('OWNER');
  });

  // 4. Protected document access & lead sanitization
  it('4. Protected document access and RFP details strip internal staff notes and scoring', () => {
    const rawLead = {
      id: 'lead-alpha-99',
      name: 'Lusail VIP Stage Production',
      company: 'Alpha Corp Qatar',
      email: 'ahmad@alpha-corp.qa',
      phone: '+974 5555 1234',
      status: 'PROPOSAL_SENT',
      value: 250000,
      probability: 0.85, // Internal score
      notes: 'Internal Staff Note: Target profit margin is 35%. Negotiate hard.', // Staff note
      createdAt: new Date('2026-06-01'),
      updatedAt: new Date('2026-06-05'),
      inquiries: [
        {
          id: 'inq-1',
          type: 'PROJECT',
          subject: 'Stage Lighting & Audio',
          message: 'We require 360-degree spatial projection mapping for Qatar National Day.',
          status: 'NEW',
          createdAt: new Date('2026-06-01'),
        },
      ],
      activities: [
        {
          id: 'act-1',
          type: 'MILESTONE',
          description: 'Acoustic feasibility study approved by lead architect.',
          timestamp: new Date('2026-06-03'),
        },
        {
          id: 'act-2',
          type: 'INTERNAL_NOTE', // Private staff note
          description: 'Staff internal discussion: Competitor bid received at 220k.',
          timestamp: new Date('2026-06-04'),
        },
      ],
    };

    const sanitized = sanitizeLeadForClient(rawLead);

    // Verify sensitive internal fields are stripped
    expect((sanitized as any).notes).toBeUndefined();
    expect((sanitized as any).probability).toBeUndefined();

    // Verify public/client-visible fields are intact
    expect(sanitized?.id).toBe('lead-alpha-99');
    expect(sanitized?.company).toBe('Alpha Corp Qatar');
    expect(sanitized?.status).toBe('PROPOSAL_SENT');
    expect(sanitized?.inquiries?.length).toBe(1);
    expect(sanitized?.inquiries?.[0].message).toContain('360-degree spatial projection');

    // Verify internal activity note is filtered out
    expect(sanitized?.activities?.length).toBe(1);
    expect(sanitized?.activities?.[0].type).toBe('MILESTONE');
    expect(sanitized?.activities?.[0].description).toBe('Acoustic feasibility study approved by lead architect.');
  });

  // 5. Cross-tenant denial
  it('5. Cross-tenant denial: Organization A user attempting to access Organization B is rejected', async () => {
    const userA = {
      id: 'usr-client-alpha',
      email: 'ahmad@alpha-corp.qa',
      role: 'CLIENT',
      isActive: true,
      sessionVersion: 1,
    };
    (auth as any).mockResolvedValue({ user: userA });
    (db.user.findUnique as any).mockResolvedValue(userA);

    const clientAlpha = {
      id: 'client-alpha-org',
      company: 'Alpha Corp Qatar',
    };

    const membershipAlpha = {
      id: 'mem-1',
      userId: userA.id,
      clientId: clientAlpha.id,
      role: 'MEMBER',
      isActive: true,
      client: clientAlpha,
    };

    (db.clientMembership.findFirst as any).mockResolvedValue(membershipAlpha);

    // User A attempts to access Organization B's ID
    await expect(requireClientOrganization('client-beta-org')).rejects.toThrow(
      /Access denied: You do not have permission to access another organization/i
    );

    // User A attempts to access an RFP belonging to Beta Corp
    const rfpBeta = {
      id: 'lead-beta-777',
      name: 'Secret Beta Project',
      company: 'Beta Industries',
      email: 'info@beta-corp.qa',
      status: 'WON',
      inquiries: [],
      activities: [],
    };
    (db.lead.findUnique as any).mockResolvedValue(rfpBeta);

    await expect(requireClientRfpAccess('lead-beta-777')).rejects.toThrow(
      /RFP record not found or access denied/i
    );
  });

  // 6. Direct URL and API authorization
  it('6. Direct URL and API authorization: Candidate role cannot access business portal', async () => {
    const candidateUser = {
      id: 'cand-1',
      email: 'jobseeker@example.com',
      role: 'CANDIDATE',
      isActive: true,
      sessionVersion: 1,
    };
    (auth as any).mockResolvedValue({ user: candidateUser });
    (db.user.findUnique as any).mockResolvedValue(candidateUser);

    await expect(requirePortalAccess('business')).rejects.toThrow(
      /This account is not authorized for this portal/i
    );
    expect(isAuthorizedForPortal('CANDIDATE', 'business')).toBe(false);
  });

  // 7. Expired session or inactive account
  it('7. Expired session or inactive account is rejected by authentication helper', async () => {
    const inactiveUser = {
      id: 'usr-inactive',
      email: 'inactive@example.qa',
      role: 'CLIENT',
      isActive: false,
      sessionVersion: 1,
    };
    (auth as any).mockResolvedValue({ user: inactiveUser });
    (db.user.findUnique as any).mockResolvedValue(inactiveUser);

    await expect(requirePortalAccess('business')).rejects.toThrow(/Account is inactive/i);
  });

  // 8. Unsafe callback rejection
  it('8. Unsafe callback URLs are sanitized to authorized landing route', () => {
    const user = { role: 'CLIENT' };

    expect(sanitizeCallbackUrl('https://malicious.com/steal', user, 'en')).toBe('/en/business');
    expect(sanitizeCallbackUrl('//malicious.com', user, 'en')).toBe('/en/business');
    expect(sanitizeCallbackUrl('\\\\malicious.com', user, 'en')).toBe('/en/business');
    expect(sanitizeCallbackUrl('/%5Cevil.com', user, 'en')).toBe('/en/business');
    expect(sanitizeCallbackUrl('javascript:alert(document.cookie)', user, 'en')).toBe('/en/business');
    expect(sanitizeCallbackUrl('data:text/html,<script>alert(1)</script>', user, 'en')).toBe('/en/business');
    expect(sanitizeCallbackUrl('/en/dashboard', user, 'en')).toBe('/en/business'); // Role elevation attempt blocked
  });

  // 9. B2B/CRM admin access preservation
  it('9. B2B/CRM admin access preservation: SUPER_ADMIN and SALES_ADMIN maintain full CRM access', async () => {
    const adminUser = {
      id: 'admin-super',
      email: 'admin@e3.qa',
      role: 'SUPER_ADMIN',
      isActive: true,
      sessionVersion: 1,
    };
    (auth as any).mockResolvedValue({ user: adminUser });
    (db.user.findUnique as any).mockResolvedValue(adminUser);

    const leadBeta = {
      id: 'lead-beta-777',
      name: 'Beta Global Dome',
      company: 'Beta Industries',
      email: 'info@beta-corp.qa',
      status: 'WON',
      inquiries: [],
      activities: [],
    };
    (db.lead.findUnique as any).mockResolvedValue(leadBeta);

    const adminAccess = await requireClientRfpAccess('lead-beta-777');
    expect(adminAccess.user.role).toBe('SUPER_ADMIN');
    expect(adminAccess.lead.id).toBe('lead-beta-777');

    const allowedAdminRoles = allowedRolesForPortal('admin');
    expect(allowedAdminRoles).toContain('SUPER_ADMIN');
    expect(allowedAdminRoles).toContain('SALES_ADMIN');
  });

  // Additional check: normalizeRole and isClientRole
  it('10. BUSINESS_USER role normalizes to CLIENT role', () => {
    expect(normalizeRole('BUSINESS_USER')).toBe('CLIENT');
    expect(normalizeRole('business')).toBe('CLIENT');
    expect(isClientRole('BUSINESS_USER')).toBe(true);
    expect(isAuthorizedForPortal('BUSINESS_USER', 'business')).toBe(true);
  });
});
