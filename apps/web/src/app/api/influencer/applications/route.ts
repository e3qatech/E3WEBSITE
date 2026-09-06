import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { submitPublicApplication } from '@/lib/influencer/application-service';
import { publicApplicationSchema } from '@/lib/influencer/validations';
import { rateLimit } from '@/lib/rate-limit';

// Public submission + Admin inbox listing
export async function GET(req: NextRequest) {
  const auth = await checkInfluencerAuth(req, 'influencer.review');
  if (!auth.isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);

  const where: any = {};
  if (status) where.status = status;

  const skip = (page - 1) * pageSize;

  try {
    const [total, items] = await Promise.all([
      (db as any).influencerApplication.count({ where }),
      (db as any).influencerApplication.findMany({
        where,
        include: {
          influencer: {
            include: { platforms: true },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      items,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // 1. Rate limit by client IP (5 requests per 5 minutes)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const ipLimiter = await rateLimit(`influencer:apply:ip:${ip}`, 5, 300);
  if (!ipLimiter.success) {
    return NextResponse.json(
      {
        error: 'Too many applications from this network. Please wait a few minutes.',
        errorAr: 'تم إرسال عدد كبير من الطلبات من هذه الشبكة. يرجى الانتظار لبضع دقائق.',
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // 2. Secondary rate limit by normalized email to prevent targeted spamming
    const cleanEmail = body?.email ? String(body.email).trim().toLowerCase() : null;
    if (cleanEmail) {
      const emailLimiter = await rateLimit(`influencer:apply:email:${cleanEmail}`, 3, 300);
      if (!emailLimiter.success) {
        return NextResponse.json(
          {
            error: 'Too many applications submitted for this email address. Please try again later.',
            errorAr: 'تم إرسال عدد كبير من الطلبات لهذا البريد الإلكتروني. يرجى المحاولة لاحقاً.',
          },
          { status: 429 }
        );
      }
    }

    const validated = publicApplicationSchema.parse(body);
    const result = await submitPublicApplication(validated);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Validation error',
        errorAr: 'خطأ في التحقق من صحة البيانات المدخلة.',
      },
      { status: 400 }
    );
  }
}
