import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { DEFAULT_SCORING_WEIGHTS } from '@/lib/influencer/scoring';
import { scoringWeightsSchema } from '@/lib/influencer/validations';

export async function GET(req: NextRequest) {
  const auth = await checkInfluencerAuth(req, 'influencerSettings.manage');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const config = await (db as any).influencerScoringConfig.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!config) {
      return NextResponse.json({
        ...DEFAULT_SCORING_WEIGHTS,
        isActive: true,
      });
    }

    return NextResponse.json({
      audienceFitWeight: config.audienceFitWeight,
      engagementQualityWeight: config.engagementQualityWeight,
      contentQualityWeight: config.contentQualityWeight,
      brandSuitabilityWeight: config.brandSuitabilityWeight,
      eventRelevanceWeight: config.eventRelevanceWeight,
      reliabilityWeight: config.reliabilityWeight,
      isActive: config.isActive,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await checkInfluencerAuth(req, 'influencerSettings.manage');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = scoringWeightsSchema.parse(body);

    // Deactivate previous active configs
    await (db as any).influencerScoringConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Create new active config
    const newConfig = await (db as any).influencerScoringConfig.create({
      data: {
        ...validated,
        isActive: true,
        updatedById: auth.userId,
      },
    });

    return NextResponse.json(newConfig);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
