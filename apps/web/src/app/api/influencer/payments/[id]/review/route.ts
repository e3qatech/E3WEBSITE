import { NextRequest, NextResponse } from 'next/server';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { reviewInfluencerPayment } from '@/lib/influencer/commercial-service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paymentId } = await params;

  try {
    const body = await req.json();
    const action = body.action as 'APPROVE' | 'SUBMIT_PAYMENT' | 'MARK_PAID' | 'HOLD' | 'CANCEL';

    if (!action) {
      return NextResponse.json({ error: 'Review action is required (APPROVE, SUBMIT_PAYMENT, MARK_PAID, HOLD, CANCEL)' }, { status: 400 });
    }

    // Strict capability separation: marking paid requires elevated finance permission
    const requiredCap = action === 'MARK_PAID' ? 'influencerFinance.markPaid' : 'influencerFinance.update';
    const auth = await checkInfluencerAuth(req, requiredCap);

    if (!auth.isAuthed) {
      return NextResponse.json({
        error: `Unauthorized: ${requiredCap} capability required to execute '${action}'`,
      }, { status: 403 });
    }

    const updated = await reviewInfluencerPayment({
      paymentId,
      action,
      paymentReference: body.paymentReference,
      paymentMethod: body.paymentMethod,
      financeNotes: body.financeNotes,
      actorId: auth.userId,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
