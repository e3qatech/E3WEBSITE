import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { calculateCampaignMetrics, generateCampaignCloseOutReport } from '@/lib/influencer/reports-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const auth = await checkInfluencerAuth(req, 'influencerReport.read');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode'); // 'closeout' or 'metrics'
  const exportFormat = searchParams.get('export'); // 'csv' or 'json'

  // Enforce export capability
  if (exportFormat) {
    const exportAuth = await checkInfluencerAuth(req, 'influencerReport.export');
    if (!exportAuth.isAuthed) {
      return NextResponse.json({ error: 'Forbidden: Missing export capability' }, { status: 403 });
    }

    if (exportFormat === 'csv') {
      const metrics = await calculateCampaignMetrics(campaignId);
      const csv = `Metric,Value\nReach,${metrics.reach}\nViews,${metrics.views}\nEngagementRate,${metrics.engagementRate}%\nTickets,${metrics.ticketCount}\nGrossRevenue,${metrics.grossRevenue} QAR\nNetRevenue,${metrics.netRevenue} QAR\nSpend,${metrics.campaignSpend} QAR\nROI,${metrics.attributedReturn}x`;
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="campaign-${campaignId}-report.csv"`,
        },
      });
    }
  }

  try {
    if (mode === 'closeout') {
      const report = await generateCampaignCloseOutReport(campaignId);
      return NextResponse.json(report);
    }

    const metrics = await calculateCampaignMetrics(campaignId);
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
