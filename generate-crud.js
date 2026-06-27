const fs = require('fs');
const path = require('path');

const models = [
  { name: 'pricing', dbModel: 'attractionPricing', requireFields: ['titleEn', 'titleAr', 'price'] },
  { name: 'offers', dbModel: 'attractionOffer', requireFields: ['code', 'discount'] },
  { name: 'faq', dbModel: 'attractionFaq', requireFields: ['questionEn', 'questionAr', 'answerEn', 'answerAr'] },
  { name: 'gallery', dbModel: 'attractionGalleryItem', requireFields: ['url'] },
  { name: 'social', dbModel: 'attractionSocialLink', requireFields: ['platform', 'url'] },
];

const basePath = path.join(__dirname, 'apps', 'web', 'src', 'app', 'api', 'attractions', '[id]');

for (const model of models) {
  const dir = path.join(basePath, model.name);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const content = `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attractionId } = await params;
    const items = await db.${model.dbModel}.findMany({
      where: { attractionId },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('[ATTRACTIONS_${model.name.toUpperCase()}_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== 'SUPER_ADMIN' && (session.user as any).role !== 'SALES_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { id: attractionId } = await params;
    const body = await req.json();

    const missing = ${JSON.stringify(model.requireFields)}.find(f => body[f] === undefined);
    if (missing) return NextResponse.json({ error: 'Missing required field: ' + missing }, { status: 400 });

    const newItem = await db.${model.dbModel}.create({
      data: {
        attractionId,
        ...body
      },
    });

    await redis.del(\`attractions:detail:\${attractionId}\`);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error('[ATTRACTIONS_${model.name.toUpperCase()}_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || ((session.user as any).role !== 'SUPER_ADMIN' && (session.user as any).role !== 'SALES_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { id: attractionId } = await params;
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    if (!itemId) return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });

    await db.${model.dbModel}.delete({
      where: { id: itemId, attractionId },
    });

    await redis.del(\`attractions:detail:\${attractionId}\`);
    return NextResponse.json({ message: 'Item deleted' });
  } catch (error: any) {
    console.error('[ATTRACTIONS_${model.name.toUpperCase()}_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
`;

  fs.writeFileSync(path.join(dir, 'route.ts'), content);
}
console.log('Done generating simple CRUD routes');
