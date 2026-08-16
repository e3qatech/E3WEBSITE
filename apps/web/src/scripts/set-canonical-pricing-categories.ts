import { db } from '../lib/db';

async function main() {
  console.log('=== SETTING CANONICAL PRICING CATEGORIES ===');

  const urbanArena = await db.attraction.findFirst({
    where: { slug: 'urban-arena-doha-mall' },
    include: { pricing: true, faqs: true }
  });

  if (!urbanArena) {
    console.error('Urban Arena not found!');
    process.exit(1);
  }

  // 1. Update Urban Arena Pricing Categories to strict Enum
  const accessPassTitles = [
    'rookie pass – 45 minutes',
    'pro pass – 90 minutes',
    'companion pass',
    'ultimate all-day pass',
    'bazooka ball – one game'
  ];

  const premiumActivityTitles = [
    'laser tag – one game',
    'paintless paintball',
    'archery challenge'
  ];

  const hourlyActivityTitles = [
    'standard billiards – one hour',
    'interactive ar billiards – one hour'
  ];

  for (const tier of urbanArena.pricing) {
    const titleNorm = tier.titleEn.toLowerCase().trim();
    let newType = 'ACCESS_PASS';

    if (accessPassTitles.some(t => titleNorm.includes(t) || t.includes(titleNorm))) {
      newType = 'ACCESS_PASS';
    } else if (premiumActivityTitles.some(t => titleNorm.includes(t) || t.includes(titleNorm))) {
      newType = 'PREMIUM_ACTIVITY';
    } else if (hourlyActivityTitles.some(t => titleNorm.includes(t) || t.includes(titleNorm))) {
      newType = 'HOURLY_ACTIVITY';
    }

    console.log(`Setting ${tier.titleEn} (${tier.id}) -> ${newType}`);
    await db.attractionPricing.update({
      where: { id: tier.id },
      data: { type: newType }
    });
  }

  // 2. Add complete, high-quality Arabic and English FAQs for Urban Arena (>= 2 FAQs)
  const existingFaqs = await db.attractionFaq.findMany({
    where: { attractionId: urbanArena.id }
  });

  const desiredFaqs = [
    {
      questionEn: 'Is Urban Arena open daily?',
      questionAr: 'هل يعمل أوربان أرينا يومياً؟',
      answerEn: 'Yes, Urban Arena operates daily during mall operating hours from 10:00 AM to 11:00 PM, with extended hours on weekends.',
      answerAr: 'نعم، يفتح أوربان أرينا أبوابه يومياً وفق ساعات عمل المول من الساعة 10:00 صباحاً حتى 11:00 مساءً، مع ساعات إضافية في عطلات نهاية الأسبوع.',
      orderIndex: 0
    },
    {
      questionEn: 'What is the recommended age for activities at Urban Arena?',
      questionAr: 'ما هو العمر الموصى به للأنشطة في أوربان أرينا؟',
      answerEn: 'Activities are designed for guests aged 6 and above. Children under 12 must be accompanied by an adult companion.',
      answerAr: 'تم تصميم الأنشطة للزوار من عمر 6 سنوات فما فوق. ويجب مرافقة الأطفال دون سن 12 عاماً من قبل شخص بالغ.',
      orderIndex: 1
    },
    {
      questionEn: 'Where is Urban Arena located inside Doha Mall?',
      questionAr: 'أين يقع أوربان أرينا داخل دوحة مول؟',
      answerEn: 'Urban Arena is located on the P Floor near the Food Court in Doha Mall, Abu Hamour.',
      answerAr: 'يقع أوربان أرينا في الطابق P بجوار منطقة المطاعم في دوحة مول، منطقة أبو هامور.',
      orderIndex: 2
    },
    {
      questionEn: 'Do I need to book in advance before visiting?',
      questionAr: 'هل يتطلب الدخول حجزاً مسبقاً قبل الزيارة؟',
      answerEn: 'Advance online booking is recommended to secure preferred time slots, but on-site walk-in tickets are also available subject to capacity.',
      answerAr: 'يُفضل الحجز المسبق عبر الإنترنت لضمان التوقيت المناسب، وتتوفر أيضاً التذاكر المباشرة عند الوصول وفق الطاقة الاستيعابية.',
      orderIndex: 3
    }
  ];

  // Upsert FAQs
  for (const df of desiredFaqs) {
    const existing = existingFaqs.find((f: any) => f.questionEn.toLowerCase() === df.questionEn.toLowerCase());
    if (existing) {
      await db.attractionFaq.update({
        where: { id: existing.id },
        data: {
          questionAr: df.questionAr,
          answerEn: df.answerEn,
          answerAr: df.answerAr,
          orderIndex: df.orderIndex
        }
      });
    } else {
      await db.attractionFaq.create({
        data: {
          attractionId: urbanArena.id,
          questionEn: df.questionEn,
          questionAr: df.questionAr,
          answerEn: df.answerEn,
          answerAr: df.answerAr,
          orderIndex: df.orderIndex
        }
      });
    }
  }

  // 3. Normalize all other attraction pricing records in DB to valid controlled enum
  const allPricing = await db.attractionPricing.findMany();
  for (const p of allPricing) {
    const t = (p.type || '').toUpperCase().trim();
    let norm = 'ACCESS_PASS';
    if (t === 'ACCESS_PASS' || t === 'GENERAL' || t === 'ACCESS' || t === 'GENERAL PASS') norm = 'ACCESS_PASS';
    else if (t === 'PREMIUM_ACTIVITY' || t === 'PREMIUM' || t === 'VIP' || t.includes('PREMIUM')) norm = 'PREMIUM_ACTIVITY';
    else if (t === 'HOURLY_ACTIVITY' || t === 'HOURLY' || t === 'TIMED' || t.includes('HOURLY')) norm = 'HOURLY_ACTIVITY';
    else if (t === 'ADD_ON' || t === 'ADDON' || t === 'ADD-ON') norm = 'ADD_ON';

    if (p.type !== norm) {
      await db.attractionPricing.update({
        where: { id: p.id },
        data: { type: norm }
      });
    }
  }

  console.log('[SUCCESS] All pricing categories and FAQs normalized.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
