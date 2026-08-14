/**
 * QF-11: Canonical Contract for B2B Clients/Partners vs CRM Clients
 *
 * Domain 1: B2B Clients & Partners (Public Brand & Showcase)
 * - Model: Partner (PostgreSQL table `Partner`)
 * - Manager Route: /[locale]/dashboard/b2b/clients
 * - Owned Fields: name, logoUrl, website, category, description, isVisible, orderIndex
 * - Canonical APIs: /api/b2b/partners, /api/partners
 * - Public Consumers: B2B Landing, Brand Portfolio, Partner Grid, Constellation
 * - Non-owned: Tenant memberships, user credentials, commercial RFPs, CRM pipelines
 *
 * Domain 2: CRM Clients & Organization Tenants (Tenant Accounts & Commercial Activity)
 * - Model: Client (PostgreSQL table `Client`)
 * - Manager Route: /[locale]/dashboard/crm/clients
 * - Owned Fields: company, type, industry, website, assignedRepId, memberships (ClientMembership)
 * - Canonical APIs: /api/crm/clients, /api/admin/clients/[id]/members
 * - Private Consumers: Business Portal, RFP negotiation, organization users
 * - Non-owned: Public showcase ranking, marketing logo assets, landing page display
 */

export interface B2BPartnerEntity {
  id: string;
  name: string;
  website?: string | null;
  category: string;
  description?: string | null;
  logoUrl?: string | null;
  isVisible: boolean;
  orderIndex: number;
}

export interface CRMClientEntity {
  id: string;
  company: string;
  type: string;
  industry?: string | null;
  website?: string | null;
  assignedRepId?: string | null;
  memberships?: any[];
}

export const DOMAIN_BOUNDARIES = {
  B2B_PARTNERS: {
    key: 'B2B_PARTNERS',
    nameEn: 'Public B2B Clients & Partners Showcase',
    nameAr: 'دليل شركاء وعملاء الواجهة العامة',
    path: '/dashboard/b2b/clients',
    apiEndpoint: '/api/b2b/partners',
    model: 'Partner',
    scope: 'PUBLIC_SHOWCASE',
  },
  CRM_CLIENTS: {
    key: 'CRM_CLIENTS',
    nameEn: 'Authenticated Tenant Organizations & CRM Clients',
    nameAr: 'منظومة الحسابات والشركات في CRM',
    path: '/dashboard/crm/clients',
    apiEndpoint: '/api/crm/clients',
    model: 'Client',
    scope: 'TENANT_ACCOUNTS',
  },
} as const;
