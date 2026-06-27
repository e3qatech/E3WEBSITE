import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionType, email, phone, token } = body;

    if (!actionType) {
      return NextResponse.json({ error: 'Missing actionType' }, { status: 400 });
    }

    if (actionType === 'SUBSCRIBE') {
      if (!email && !phone) {
        return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 });
      }

      const { preferences } = body;

      // Generate a random token for verification
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Check if subscriber exists
      let subscriber = null;
      if (email) subscriber = await db.subscriber.findUnique({ where: { email } });
      if (!subscriber && phone) subscriber = await db.subscriber.findUnique({ where: { phone } });

      if (subscriber) {
        // Update existing subscriber
        subscriber = await db.subscriber.update({
          where: { id: subscriber.id },
          data: {
            email: email || subscriber.email,
            phone: phone || subscriber.phone,
            preferences: preferences || subscriber.preferences,
          }
        });
        return NextResponse.json({ message: 'Subscription updated.' }, { status: 200 });
      }

      subscriber = await db.subscriber.create({
        data: {
          email: email || null,
          phone: phone || null,
          token: verificationToken,
          preferences: preferences || null,
        }
      });

      // MOCK: In production, send email/SMS with a link like /verify?token=${verificationToken}
      console.log(`[MOCK EMAIL/SMS] Verification link: /api/subscribe?actionType=VERIFY&token=${verificationToken}`);

      return NextResponse.json({ message: 'Subscription created. Check email/phone for verification.' }, { status: 201 });
    }

    if (actionType === 'VERIFY') {
      if (!token) {
        return NextResponse.json({ error: 'Missing verification token' }, { status: 400 });
      }

      const subscriber = await db.subscriber.findUnique({
        where: { token }
      });

      if (!subscriber) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
      }

      if (subscriber.isVerified) {
        return NextResponse.json({ message: 'Already verified' });
      }

      await db.subscriber.update({
        where: { id: subscriber.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          token: null // invalidate token after use
        }
      });

      return NextResponse.json({ message: 'Successfully verified' });
    }

    return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
  } catch (error: any) {
    console.error('[SUBSCRIBE_POST]', error);
    if (error.code === 'P2002') {
       return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
   // Support GET /api/subscribe?token=XYZ to verify easily from email links
   try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
       return NextResponse.json({ error: 'Missing verification token' }, { status: 400 });
    }

    const subscriber = await db.subscriber.findUnique({
      where: { token }
    });

    if (!subscriber) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    if (!subscriber.isVerified) {
      await db.subscriber.update({
        where: { id: subscriber.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          token: null 
        }
      });
    }

    // In production, you might redirect to a success page
    return NextResponse.json({ message: 'Successfully verified subscription!' });
   } catch (error: any) {
      console.error('[SUBSCRIBE_GET]', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}
