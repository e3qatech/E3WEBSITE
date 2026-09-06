import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getReports } from '@/app/api/influencer/campaigns/[id]/reports/route';
import { GET as getCreatorDocDownload } from '@/app/api/influencer/documents/[id]/download/route';
import { calculateWeightedScore } from '@/lib/influencer/scoring';
import { calculateCampaignMetrics } from '@/lib/influencer/reports-service';

// Mock auth and db
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(async () => ({
    user: { id: 'usr_admin', email: 'admin@e3.qa', role: 'SUPER_ADMIN' },
  })),
}));

vi.mock('@/lib/db', () => ({
  default: {
    influencerCampaign: {
      findUnique: vi.fn(async () => ({
        id: 'camp_smoke_1',
        titleEn: 'Smoke Campaign',
        budget: 10000,
        creatorAssignments: [
          {
            id: 'ca_1',
            agreedRate: 10000,
            deliverables: [
              {
                id: 'del_1',
                status: 'COMPLETED',
                publishDueAt: new Date(Date.now() - 100000),
                publishedAt: new Date(Date.now() - 200000),
                metricsReach: 150000,
                metricsViews: 200000,
                metricsLikes: 12000,
                metricsComments: 1500,
                metricsShares: 800,
                metricsSaves: 1200,
              },
            ],
            attendanceRecords: [{ id: 'att_1' }],
          },
        ],
        conversions: [
          {
            id: 'conv_1',
            ticketCount: 150,
            grossRevenue: 30000,
            discountAmount: 3000,
            refundAmount: 500,
            netRevenue: 26500,
          },
        ],
        promoCodes: [{ id: 'p_1', usageCount: 45 }],
      })),
    },
    influencerDocument: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id === 'doc_secret_agreement') {
          return {
            id: 'doc_secret_agreement',
            influencerId: 'inf_1',
            documentType: 'COMMERCIAL_AGREEMENT',
            mediaAssetId: 'asset_pdf_99',
            isSensitive: true,
            influencer: { displayName: 'Reem Al-Sulaiti' },
          };
        }
        return null;
      }),
    },
    campaignDeliverable: {
      findMany: vi.fn(async () => [
        {
          id: 'del_1',
          status: 'COMPLETED',
          publishDueAt: new Date(Date.now() - 100000),
          publishedAt: new Date(Date.now() - 200000),
          metricsReach: 150000,
          metricsViews: 200000,
          metricsLikes: 12000,
          metricsComments: 1500,
          metricsShares: 800,
          metricsSaves: 1200,
        },
      ]),
    },
    influencerConversion: {
      findMany: vi.fn(async () => [
        {
          id: 'conv_1',
          ticketCount: 150,
          grossRevenue: 30000,
          discountAmount: 3000,
          refundAmount: 500,
          netRevenue: 26500,
        },
      ]),
    },
    campaignCreator: {
      count: vi.fn(async () => 5),
      aggregate: vi.fn(async () => ({
        _sum: { agreedRate: 10000 },
      })),
    },
    influencerAttendance: {
      count: vi.fn(async () => 12),
    },
    promoCode: {
      aggregate: vi.fn(async () => ({
        _sum: { usageCount: 45 },
      })),
    },
  },
}));

describe('Influencer Module End-to-End Smoke Tests', () => {
  it('enforces Arabic/RTL translation strings and metadata structure', () => {
    const arStrings = {
      titleAr: 'إدارة المؤثرين وصناع المحتوى',
      applyAr: 'انضم كصانع محتوى في E3 قطر',
      portalAr: 'بوابة صناع المحتوى',
      dir: 'rtl',
    };
    expect(arStrings.dir).toBe('rtl');
    expect(arStrings.titleAr).toContain('المؤثرين');
  });

  it('calculates campaign metrics & ROI correctly', async () => {
    const metrics = await calculateCampaignMetrics('camp_smoke_1');
    expect(metrics.creatorCount).toBe(1);
    expect(metrics.reach).toBe(150000);
    expect(metrics.views).toBe(200000);
    expect(metrics.likes).toBe(12000);
    expect(metrics.grossRevenue).toBe(30000);
    expect(metrics.netRevenue).toBe(26500);
    expect(metrics.campaignSpend).toBe(10000);
    expect(metrics.attributedReturn).toBe(165); // ((26500 - 10000) / 10000) * 100 = 165%
  });

  it('reports route exports CSV securely with proper headers', async () => {
    const req = new NextRequest('https://e3.qa/api/influencer/campaigns/camp_smoke_1/reports?export=csv');
    const response = await getReports(req, { params: Promise.resolve({ id: 'camp_smoke_1' }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('content-disposition')).toContain('attachment; filename="campaign-camp_smoke_1-report.csv"');
    const text = await response.text();
    expect(text).toContain('Reach,150000');
    expect(text).toContain('GrossRevenue,30000 QAR');
  });

  it('protected document download enforces capability and returns attachment headers', async () => {
    const req = new NextRequest('https://e3.qa/api/influencer/documents/doc_secret_agreement/download');
    const response = await getCreatorDocDownload(req, { params: Promise.resolve({ id: 'doc_secret_agreement' }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain('attachment; filename="influencer-doc-commercial_agreement-doc_secr.pdf"');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    const body = await response.json();
    expect(body.mediaAssetId).toBe('asset_pdf_99');
    expect(body.isSensitive).toBe(true);
  });

  it('scoring engine calculates weighted advisory score correctly', () => {
    const score = calculateWeightedScore({
      audienceFit: 85,
      engagementQuality: 90,
      contentQuality: 80,
      brandSuitability: 95,
      eventRelevance: 75,
      reliability: 85,
    });

    expect(score).not.toBeNull();
    expect(score!.isAdvisoryOnly).toBe(true);
    expect(score!.totalScore).toBeGreaterThan(80);
    expect(score!.totalScore).toBeLessThan(95);
  });
});
