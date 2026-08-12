import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';
    const portal = searchParams.get('portal'); // 'b2c' | 'b2b' | 'all'

    let whereClause: any = {};
    if (publishedOnly) {
      whereClause.isActive = true;
    }
    if (portal === 'b2c') {
      whereClause.showOnB2C = true;
    } else if (portal === 'b2b') {
      whereClause.showOnB2B = true;
    }

    let brands = await db.brandIP.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        category: true,
        relationships: true,
        placements: {
          include: {
            attraction: true,
            locations: true,
          }
        },
      },
      orderBy: [
        { b2cDisplayOrder: 'asc' },
        { updatedAt: 'desc' }
      ]
    });

    if (brands.length === 0 && !publishedOnly) {
      // Auto seed canonical brands into db.brandIP
      const defaultBrands = [
        {
          slug: "bookingqube",
          nameEn: "BookingQube",
          nameAr: "بوكينج كيوب",
          taglineEn: "Wholly Owned Ticketing & Spatial Engine",
          taglineAr: "منظومة حجز التذاكر والتسجيل الرقمي المملوكة لـ E3",
          shortDescriptionEn: "E3's proprietary digital ticketing platform powering venue access, RFID wristbands, and automated guest flow across all destinations.",
          shortDescriptionAr: "منظومة حجز التذاكر الرقمية المبتكرة المملوكة لـ E3 والتي تدير دخول الزوار والتسجيل الرقمي في كافة الوجهات.",
          primaryLogoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop",
          isActive: true,
          showOnB2C: true,
          showOnB2B: true,
          showInWorldsCreated: true,
          showInB2BPortfolio: true,
          featureOnB2C: true,
          featureOnB2B: true,
          lifecycleStatus: "ACTIVE",
          b2cDisplayOrder: 1,
          b2bDisplayOrder: 1,
          b2cCtaUrl: "https://bookingqube.e3qatar.com",
          b2bInquiryUrl: "/b2b/contact?subject=BookingQube"
        },
        {
          slug: "inflatarun",
          nameEn: "InflataRUN",
          nameAr: "إنفلاتارن",
          taglineEn: "World Record Inflatable Obstacle Park",
          taglineAr: "منتزه العقبات الممتد الحاصل على رقم قياسي في غينيس",
          shortDescriptionEn: "The official 1,055-meter Guinness World Record inflatable obstacle course, attracting over 150,000 visitors per season in Qatar.",
          shortDescriptionAr: "مضمار العقبات الترفيهي الممتد لمسافة 1,055 متراً والحاصل على رقم غينيس القياسي العالمي.",
          primaryLogoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400&auto=format&fit=crop",
          isActive: true,
          showOnB2C: true,
          showOnB2B: true,
          showInWorldsCreated: true,
          showInB2BPortfolio: true,
          featureOnB2C: true,
          featureOnB2B: true,
          lifecycleStatus: "ACTIVE",
          b2cDisplayOrder: 2,
          b2bDisplayOrder: 2,
          b2cCtaUrl: "/b2c/attractions/inflatarun",
          b2bInquiryUrl: "/b2b/contact?subject=InflataRUN"
        },
        {
          slug: "space-tribe",
          nameEn: "Space Tribe",
          nameAr: "سبايس ترايب",
          taglineEn: "Immersive Futuristic Entertainment Zone",
          taglineAr: "وجهة الترفيه المستقبلي التفاعلي للشباب والعائلات",
          shortDescriptionEn: "A high-energy sci-fi theme park featuring futuristic laser tag, cyber neon arenas, and multi-level spatial challenges.",
          shortDescriptionAr: "منطقة الترفيه التفاعلي المستقبلي المزودة بأحدث تقنيات ألعاب الليزر والمغامرات الفضائية.",
          primaryLogoUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop",
          isActive: true,
          showOnB2C: true,
          showOnB2B: true,
          showInWorldsCreated: true,
          showInB2BPortfolio: true,
          featureOnB2C: true,
          featureOnB2B: true,
          lifecycleStatus: "ACTIVE",
          b2cDisplayOrder: 3,
          b2bDisplayOrder: 3,
          b2cCtaUrl: "/b2c/attractions/space-tribe",
          b2bInquiryUrl: "/b2b/contact?subject=SpaceTribe"
        },
        {
          slug: "urban-cafe",
          nameEn: "Urban Café",
          nameAr: "أوربان كافيه",
          taglineEn: "Signature Destination F&B Concept",
          taglineAr: "علامة المأكولات والمشروبات المتكاملة داخل وجهات E3",
          shortDescriptionEn: "E3's proprietary food & beverage brand providing gourmet refreshments, specialty coffee, and family dining inside E3 parks.",
          shortDescriptionAr: "علامة الضيافة والمأكولات والمشروبات الفاخرة المدمجة ضمن وجهات ومجمعات E3 الترفيهية.",
          primaryLogoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400&auto=format&fit=crop",
          isActive: true,
          showOnB2C: true,
          showOnB2B: true,
          showInWorldsCreated: false,
          showInB2BPortfolio: true,
          featureOnB2C: false,
          featureOnB2B: true,
          lifecycleStatus: "ACTIVE",
          b2cDisplayOrder: 4,
          b2bDisplayOrder: 4,
          b2cCtaUrl: "/b2c/discover",
          b2bInquiryUrl: "/b2b/contact?subject=UrbanCafe"
        }
      ];

      for (const b of defaultBrands) {
        await db.brandIP.upsert({
          where: { slug: b.slug },
          update: {},
          create: b
        });
      }

      brands = await db.brandIP.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        include: {
          category: true,
          relationships: true,
          placements: {
            include: {
              attraction: true,
              locations: true,
            }
          },
        },
        orderBy: [
          { b2cDisplayOrder: 'asc' },
          { updatedAt: 'desc' }
        ]
      });
    }

    return NextResponse.json(brands);
  } catch (error: any) {
    console.error('Failed to fetch brands:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !['SUPER_ADMIN', 'SUPPORT_ADMIN', 'SALES_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Default values mapping
    const slug = data.slug || data.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { category, relationships, placements, linkedHighlights, relationshipIds, categoryId, ...brandData } = data;
    
    const brand = await db.brandIP.create({
      data: {
        ...brandData,
        slug,
        categoryId: categoryId || null,
        relationships: relationshipIds ? {
            connect: relationshipIds.map((id: string) => ({ id }))
        } : undefined
      }
    });

    return NextResponse.json(brand);
  } catch (error: any) {
    console.error('Failed to create brand:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
