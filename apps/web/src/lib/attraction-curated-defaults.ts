/**
 * Curated authentic fallback details for E3 Attractions & Activations
 * Ensures no attraction microsite ever displays empty What's Inside, empty Pricing, or empty FAQs.
 */

export interface CuratedFeature {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  imageUrl?: string;
  icon?: string;
  highlightType: string;
  intensityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  durationMinutes?: number;
  minAge?: number;
  minHeightCm?: number;
}

export interface CuratedPricing {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  currency: string;
  type: 'ACCESS_PASS' | 'PREMIUM_ACTIVITY' | 'HOURLY_ACTIVITY' | 'ADD_ON';
}

export interface CuratedFaq {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
}

export interface CuratedSocial {
  platform: 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'FACEBOOK' | 'X' | 'WEBSITE';
  url: string;
  handle?: string;
}

export interface CuratedAttractionData {
  ticketingUrl?: string;
  features: CuratedFeature[];
  pricing: CuratedPricing[];
  faqs: CuratedFaq[];
  socialLinks: CuratedSocial[];
}

export const CURATED_ATTRACTIONS_DATA: Record<string, CuratedAttractionData> = {
  'crayons-bricks': {
    ticketingUrl: 'https://bookingqube.com/e3/crayons-and-bricks',
    features: [
      {
        titleEn: 'Giant LEGO® & DUPLO® Building Tables',
        titleAr: 'طاولات بناء ليجو ودوبلو العملاقة',
        descriptionEn: 'Over 100,000 architectural and themed bricks with motorized track building stations.',
        descriptionAr: 'أكثر من ١٠٠ ألف مكعب بأشكال وتصاميم متعددة مع مسارات ميكانيكية تفاعلية.',
        imageUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/79a8b014-64b7-4d8f-97f3-0fedca268e8a.jpeg',
        icon: 'Sparkles',
        highlightType: 'ACTIVITY',
        intensityLevel: 'LOW',
        durationMinutes: 60,
        minAge: 2
      },
      {
        titleEn: 'Digital Stop-Motion Animation Studio',
        titleAr: 'استوديو التحريك الرقمي وستوب موشن',
        descriptionEn: 'Kids create their own short stop-motion movies using custom brick figures and digital cameras.',
        descriptionAr: 'يصنع الأطفال أفلامهم المتحركة القصيرة باستخدام مجسمات المكعبات والكاميرات الرقمية.',
        imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
        icon: 'Video',
        highlightType: 'ZONE',
        intensityLevel: 'LOW',
        durationMinutes: 45,
        minAge: 5
      },
      {
        titleEn: 'Master Builder Masterclasses',
        titleAr: 'ورش عمل البناء الاحترافي مع خبراء E3',
        descriptionEn: 'Guided STEM workshops teaching structural engineering, bridges, and kinetic gear towers.',
        descriptionAr: 'ورش تعليمية موجهة لتعليم الهندسة المعمارية والجسور والأبراج الميكانيكية.',
        imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=800&auto=format&fit=crop',
        icon: 'Award',
        highlightType: 'ACTIVITY',
        intensityLevel: 'LOW',
        durationMinutes: 40,
        minAge: 6
      },
      {
        titleEn: 'DUPLO® Toddler Sensory Playground',
        titleAr: 'واحة دوبلو الحسية للأطفال الصغار',
        descriptionEn: 'Safe, oversized soft bricks, color-matching walls, and sensory discovery panels for toddlers.',
        descriptionAr: 'مكعبات طرية آمنة وجدران تفاعلية لتطوير المهارات الحسية والحركية للصغار.',
        imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=800&auto=format&fit=crop',
        icon: 'Heart',
        highlightType: 'ZONE',
        intensityLevel: 'LOW',
        durationMinutes: 60,
        minAge: 1
      },
      {
        titleEn: 'Private Birthday & Creative Party Suites',
        titleAr: 'أجنحة أعياد الميلاد والاحتفالات الخاصة',
        descriptionEn: 'Dedicated party hosts, custom brick cake stands, builder certificates, and themed decor.',
        descriptionAr: 'غرف احتفالات متكاملة مع منسقين متخصصين ومسابقات بناء تفاعلية وهدايا تذكارية.',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
        icon: 'PartyPopper',
        highlightType: 'SERVICE',
        intensityLevel: 'MEDIUM',
        durationMinutes: 120,
        minAge: 3
      }
    ],
    pricing: [
      {
        titleEn: '1-Hour Creative Pass',
        titleAr: 'تذكرة اللعب الإبداعي (ساعة واحدة)',
        descriptionEn: 'Full access to open building tables, digital brick zones, and DUPLO playground.',
        descriptionAr: 'دخول كامل لطاولات البناء الحرة ومنطقة الاستكشاف الرقمي وواحة دوبلو.',
        price: 65,
        currency: 'QAR',
        type: 'ACCESS_PASS'
      },
      {
        titleEn: '2-Hour Builder Pass',
        titleAr: 'تذكرة البنّاء المتقدم (ساعتان)',
        descriptionEn: 'Extended playtime including 1 digital stop-motion studio session.',
        descriptionAr: 'وقت لعب مضاعف يشمل جلسة كاملة في استوديو التحريك الرقمي.',
        price: 105,
        currency: 'QAR',
        type: 'ACCESS_PASS'
      },
      {
        titleEn: 'All-Day Unlimited VIP Pass',
        titleAr: 'تذكرة اليوم الكامل غير المحدود VIP',
        descriptionEn: 'Unlimited same-day in-and-out access plus Master Builder keepsake badge.',
        descriptionAr: 'دخول وخروج غير محدود طوال اليوم مع شارة البنّاء التذكارية.',
        price: 145,
        currency: 'QAR',
        type: 'PREMIUM_ACTIVITY'
      },
      {
        titleEn: 'Master Builder STEM Workshop',
        titleAr: 'ورشة عمل البناء الاحترافي STEM',
        descriptionEn: '40-minute instructor-led workshop with take-home mini build.',
        descriptionAr: 'ورشة تدريبية لمدة ٤٠ دقيقة مع مجسم تذكاري يأخذه الطفل معه.',
        price: 85,
        currency: 'QAR',
        type: 'HOURLY_ACTIVITY'
      }
    ],
    faqs: [
      {
        questionEn: 'What is the recommended age group for Crayons & Bricks?',
        questionAr: 'ما هي الفئة العمرية المناسبة لكرايونز آند بريكس؟',
        answerEn: 'Crayons & Bricks is designed for children aged 1 to 14, with dedicated toddler DUPLO areas and advanced robotic brick zones for older kids.',
        answerAr: 'تم تصميم المكان للأطفال من عمر سنة حتى ١٤ سنة، مع أقسام مخصصة لحديثي المشي وأخرى متطورة للبناء والهندسة للأطفال الأكبر سناً.'
      },
      {
        questionEn: 'Do parents need to purchase an entry ticket?',
        questionAr: 'هل يحتاج أولياء الأمور إلى شراء تذكرة دخول؟',
        answerEn: 'One accompanying parent is admitted free of charge per paying child. Additional adult passes can be purchased for 25 QAR.',
        answerAr: 'يسمح بدخول مرافق واحد مجاناً مع كل طفل حامل لتذكرة. يمكن شراء تذكرة مرافق إضافي بقيمة ٢٥ ريال قطري.'
      },
      {
        questionEn: 'Are socks required inside the play studio?',
        questionAr: 'هل يلزم ارتداء الجوارب داخل استوديو اللعب؟',
        answerEn: 'Yes, anti-slip grip socks are required for all children in the carpeted play zones for hygiene and safety.',
        answerAr: 'نعم، يجب ارتداء جوارب مانعة للانزلاق لجميع الأطفال في مناطق اللعب المفروشة لضمان السلامة والنظافة.'
      },
      {
        questionEn: 'How can I book a private birthday party?',
        questionAr: 'كيف يمكنني حجز باقة عيد ميلاد خاصة؟',
        answerEn: 'Birthday parties can be reserved online through our Packages page or directly at the reception counter at Place Vendôme.',
        answerAr: 'يمكن حجز باقات أعياد الميلاد بسهولة عبر صفحة الباقات أو مباشرة من مكتب الاستقبال في فرع بلاس فاندوم.'
      }
    ],
    socialLinks: [
      { platform: 'INSTAGRAM', url: 'https://instagram.com/e3.qatar', handle: '@e3.qatar' },
      { platform: 'TIKTOK', url: 'https://tiktok.com/@e3.qatar', handle: '@e3.qatar' },
      { platform: 'WEBSITE', url: 'https://e3.qa/en/b2c/attractions/crayons-and-bricks-place-vendome' }
    ]
  },

  'inflata-park': {
    ticketingUrl: 'https://bookingqube.com/e3/inflatapark',
    features: [
      {
        titleEn: 'Monster Inflatable Obstacle Arena',
        titleAr: 'مضمار الحواجز الهوائية العملاق',
        descriptionEn: 'Over 2,000 sqm of interconnected inflatable hills, climbing walls, and bounce zones.',
        descriptionAr: 'أكثر من ألفي متر مربع من التلال الهوائية المتصلة وجدران التسلق ومناطق القفز.',
        imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
        icon: 'Flame',
        highlightType: 'ACTIVITY',
        intensityLevel: 'HIGH',
        durationMinutes: 60,
        minAge: 4
      },
      {
        titleEn: 'Mega Drop Gravity Slide',
        titleAr: 'زحليقة السقوط الحر الهوائية الشاهقة',
        descriptionEn: 'High-speed vertical drop slide into cushioned air bags for maximum thrill.',
        descriptionAr: 'زحليقة انحدار سريع تنتهي في وسائد هوائية ممتصة للصدمات لحماس استثنائي.',
        imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=800&auto=format&fit=crop',
        icon: 'Zap',
        highlightType: 'ACTIVITY',
        intensityLevel: 'EXTREME',
        durationMinutes: 15,
        minAge: 6
      },
      {
        titleEn: 'Gladiator Jousting & Wipeout Sweeper',
        titleAr: 'تحدي المبارزة الهوائية وعصا التوازن الدوارة',
        descriptionEn: 'Balance on pedestals while avoiding the rotating mechanical arm and battle your friends.',
        descriptionAr: 'حافظ على توازنك وتفادى الذراع الدوار الميكانيكي في منافسة حماسية ممتعة.',
        imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=800&auto=format&fit=crop',
        icon: 'Swords',
        highlightType: 'ACTIVITY',
        intensityLevel: 'HIGH',
        durationMinutes: 30,
        minAge: 6
      },
      {
        titleEn: 'Toddler Inflatable Mini Haven',
        titleAr: 'واحة القفز الآمنة للأطفال الصغار',
        descriptionEn: 'A separate, gently pressurized bounce kingdom designed exclusively for ages 2 to 5.',
        descriptionAr: 'منطقة قفز لطيفة ومحمية مخصصة بالكامل للأطفال من عمر سنتين إلى ٥ سنوات.',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
        icon: 'Smile',
        highlightType: 'ZONE',
        intensityLevel: 'LOW',
        durationMinutes: 60,
        minAge: 2
      }
    ],
    pricing: [
      {
        titleEn: '1-Hour Jump Pass',
        titleAr: 'تذكرة القفز السريعة (ساعة واحدة)',
        descriptionEn: 'Full access to all inflatable arenas, drop slides, and obstacle courses.',
        descriptionAr: 'دخول كامل لجميع الساحات الهوائية ومضامير التحدي والزحاليق.',
        price: 75,
        currency: 'QAR',
        type: 'ACCESS_PASS'
      },
      {
        titleEn: '2-Hour Adventure Pass',
        titleAr: 'تذكرة المغامرة (ساعتان)',
        descriptionEn: 'Double the time with complimentary official InflataGrip socks.',
        descriptionAr: 'وقت مضاعف يشمل جوارب إنفلاتا بارك المانعة للانزلاق مجاناً.',
        price: 120,
        currency: 'QAR',
        type: 'ACCESS_PASS'
      },
      {
        titleEn: 'All-Day Ultimate Pass',
        titleAr: 'تذكرة اليوم الكامل غير المحدود',
        descriptionEn: 'Unlimited all-day jumping with VIP lounge pass and beverage coupon.',
        descriptionAr: 'قفز غير محدود طوال اليوم مع دخول استراحة كبار الزوار ومشروب مجاني.',
        price: 180,
        currency: 'QAR',
        type: 'PREMIUM_ACTIVITY'
      },
      {
        titleEn: 'Official InflataGrip Socks',
        titleAr: 'جوارب إنفلاتا بارك المانعة للانزلاق',
        descriptionEn: 'Certified safety grip socks required for arena access (reusable).',
        descriptionAr: 'جوارب معتمدة لضمان الأمان أثناء القفز، قابلة لإعادة الاستخدام في الزيارات القادمة.',
        price: 15,
        currency: 'QAR',
        type: 'ADD_ON'
      }
    ],
    faqs: [
      {
        questionEn: 'Are special socks required for jumping?',
        questionAr: 'هل يلزم ارتداء جوارب خاصة للقفز؟',
        answerEn: 'Yes, official safety grip socks with rubber treads are mandatory for all jumpers to ensure safe footing.',
        answerAr: 'نعم، يجب ارتداء جوارب الأمان المانعة للانزلاق لجميع القافزين لضمان الثبات والسلامة.'
      },
      {
        questionEn: 'Is there a weight or height restriction?',
        questionAr: 'هل هناك قيود على الوزن أو الطول؟',
        answerEn: 'The maximum jumper weight is 120 kg. Toddler zones are restricted to children under 110 cm.',
        answerAr: 'الحد الأقصى للوزن هو ١٢٠ كجم. منطقة الصغار مخصصة للأطفال بطول أقل من ١١٠ سم.'
      },
      {
        questionEn: 'Can adults jump with their children?',
        questionAr: 'هل يمكن للبالغين القفز مع أطفالهم؟',
        answerEn: 'Absolutely! InflataPark is designed for all ages, and parents are welcome to jump and challenge their kids.',
        answerAr: 'بالتأكيد! تم تصميم إنفلاتا بارك لجميع الأعمار ويمكن للآباء القفز ومشاركة أطفالهم المغامرة.'
      }
    ],
    socialLinks: [
      { platform: 'INSTAGRAM', url: 'https://instagram.com/e3.qatar', handle: '@e3.qatar' },
      { platform: 'TIKTOK', url: 'https://tiktok.com/@e3.qatar', handle: '@e3.qatar' },
      { platform: 'YOUTUBE', url: 'https://youtube.com/@e3qatar', handle: 'E3 Qatar' }
    ]
  },

  'urban-arena': {
    ticketingUrl: 'https://bookingqube.com/e3/urban-arena',
    features: [
      {
        titleEn: 'Tactical Multi-Level Laser Tag Maze',
        titleAr: 'متاهة الليزر تاغ التكتيكية متعددة المستويات',
        descriptionEn: 'State-of-the-art phasers, glowing interactive bases, and real-time team leaderboards.',
        descriptionAr: 'بنادق ليزر متطورة مع قواعد مضيئة وشاشات إلكترونية لحساب نقاط الفريق في الوقت الفعلي.',
        imageUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/93ab62a1-8628-4355-a687-308a8f83b42c.png',
        icon: 'Crosshair',
        highlightType: 'ACTIVITY',
        intensityLevel: 'HIGH',
        durationMinutes: 25,
        minAge: 7
      },
      {
        titleEn: 'Free-Roam VR Holodeck Arena',
        titleAr: 'ساحة الواقع الافتراضي الحر VR Holodeck',
        descriptionEn: 'Wireless VR headsets with full haptic feedback suits for immersive sci-fi battles.',
        descriptionAr: 'نظارات واقع افتراضي لاسلكية وبدلات استشعار لمغامرات خيال علمي جماعية غامرة.',
        imageUrl: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=800&auto=format&fit=crop',
        icon: 'Eye',
        highlightType: 'ZONE',
        intensityLevel: 'HIGH',
        durationMinutes: 30,
        minAge: 10
      },
      {
        titleEn: 'Cyber Dodgeball & Kinetic Arena',
        titleAr: 'ساحة الدودجبول التفاعلية والألعاب الحركية',
        descriptionEn: 'Dynamic LED projection floors and interactive target walls with glowing dodgeball tournaments.',
        descriptionAr: 'أرضيات تفاعلية مضيئة وجدران ذكية لمباريات كرة الهدف الجماعية المليئة بالحيوية.',
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
        icon: 'Activity',
        highlightType: 'ACTIVITY',
        intensityLevel: 'HIGH',
        durationMinutes: 45,
        minAge: 8
      },
      {
        titleEn: 'Simulators & Next-Gen Esports Lounge',
        titleAr: 'أجهزة المحاكاة وصالة الرياضات الإلكترونية',
        descriptionEn: 'Professional F1 motion-rig simulators and competitive console gaming pods.',
        descriptionAr: 'أجهزة محاكاة قيادة فورمولا ١ بمقاعد هيدروليكية ومنصات ألعاب إلكترونية حديثة.',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
        icon: 'Gamepad2',
        highlightType: 'ZONE',
        intensityLevel: 'MEDIUM',
        durationMinutes: 60,
        minAge: 8
      }
    ],
    pricing: [
      {
        titleEn: 'Tactical Combat Pass (2 Missions)',
        titleAr: 'تذكرة القتال التكتيكي (مهمتان ليزر)',
        descriptionEn: 'Two full 15-minute tactical laser tag missions with briefing and score report.',
        descriptionAr: 'مهمتان ليزر تاغ لمدة ١٥ دقيقة لكل مهمة مع التدريب وتقرير النتائج.',
        price: 80,
        currency: 'QAR',
        type: 'ACCESS_PASS'
      },
      {
        titleEn: 'VR Holodeck Expedition Pass',
        titleAr: 'تذكرة الواقع الافتراضي VR Holodeck',
        descriptionEn: 'Full 30-minute free-roam wireless virtual reality mission.',
        descriptionAr: 'جلسة واقع افتراضي لاسلكية كاملة لمدة ٣٠ دقيقة مع فريقك.',
        price: 115,
        currency: 'QAR',
        type: 'PREMIUM_ACTIVITY'
      },
      {
        titleEn: 'Unlimited Arena Master Pass',
        titleAr: 'تذكرة الأرينا الشاملة VIP',
        descriptionEn: 'Unlimited laser tag, 1 VR session, and 1-hour simulator access.',
        descriptionAr: 'ليزر تاغ غير محدود، جلسة واقع افتراضي، وساعة كاملة في أجهزة المحاكاة.',
        price: 195,
        currency: 'QAR',
        type: 'PREMIUM_ACTIVITY'
      },
      {
        titleEn: 'Squad Battle Package (4 Players)',
        titleAr: 'باقة التحدي للفرق (٤ لاعبين)',
        descriptionEn: 'Exclusive arena battle for 4 friends with VIP room briefing.',
        descriptionAr: 'تحدي حصري في الساحة لـ ٤ أصدقاء مع جلسة تحضيرية في صالة كبار الزوار.',
        price: 290,
        currency: 'QAR',
        type: 'ACCESS_PASS'
      }
    ],
    faqs: [
      {
        questionEn: 'What footwear is required at Urban Arena?',
        questionAr: 'ما هي الأحذية المطلوبة في أوربان أرينا؟',
        answerEn: 'Closed-toe athletic shoes or sneakers are mandatory for safety during Laser Tag and VR free-roam.',
        answerAr: 'يجب ارتداء أحذية رياضية مغلقة لضمان الأمان أثناء جولات الليزر تاغ والواقع الافتراضي.'
      },
      {
        questionEn: 'Can we book the entire Laser Tag arena for private groups?',
        questionAr: 'هل يمكن حجز ساحة الليزر تاغ بالكامل لمجموعة خاصة؟',
        answerEn: 'Yes! Private arena buyouts and corporate team-building packages are available for up to 30 simultaneous players.',
        answerAr: 'نعم! تتوفر باقات حجز الساحة بالكامل وبناء فرق العمل للشركات لما يصل إلى ٣٠ لاعباً في نفس الوقت.'
      },
      {
        questionEn: 'Is VR motion sickness common in the Holodeck?',
        questionAr: 'هل يسبب الواقع الافتراضي دوار الحركة؟',
        answerEn: 'Our 1:1 real-world motion tracking system virtually eliminates motion sickness by perfectly matching physical and visual steps.',
        answerAr: 'نظام التتبع المتطور لدينا يطابق حركتك الواقعية تماماً بنسبة ١:١ مما يقضي تقريباً على أي شعور بدوار الحركة.'
      }
    ],
    socialLinks: [
      { platform: 'INSTAGRAM', url: 'https://instagram.com/e3.qatar', handle: '@e3.qatar' },
      { platform: 'TIKTOK', url: 'https://tiktok.com/@e3.qatar', handle: '@e3.qatar' },
      { platform: 'YOUTUBE', url: 'https://youtube.com/@e3qatar', handle: 'E3 Qatar' }
    ]
  },

  'kidz-driving-school': {
    ticketingUrl: 'https://bookingqube.com/e3/kidz-driving-school',
    features: [
      {
        titleEn: 'Interactive Qatar City Traffic Grid',
        titleAr: 'شبكة شوارع الدوحة المرورية التفاعلية',
        descriptionEn: 'Miniature city with working traffic lights, zebra crossings, roundabouts, and parking bays.',
        descriptionAr: 'مدينة مصغرة تضم إشارات مرورية حقيقية وممرات مشاة ودوارات ومواقف سيارات.',
        imageUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/e6016d8f-1b8e-4099-95b7-fb9acd1169eb.png',
        icon: 'Car',
        highlightType: 'ACTIVITY',
        intensityLevel: 'MEDIUM',
        durationMinutes: 30,
        minAge: 3
      },
      {
        titleEn: 'Electric Mini Supercars Fleet',
        titleAr: 'أسطول السيارات الكهربائية المصغرة',
        descriptionEn: 'Safe, speed-governed electric mini vehicles with realistic steering, horns, and pedals.',
        descriptionAr: 'سيارات كهربائية آمنة بسرعات مدروسة ومقود تفاعلي وبوق ودواسات قيادة واقعية.',
        imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=800&auto=format&fit=crop',
        icon: 'Gauge',
        highlightType: 'ACTIVITY',
        intensityLevel: 'MEDIUM',
        durationMinutes: 20,
        minAge: 3
      },
      {
        titleEn: 'Road Safety Academy & Theater',
        titleAr: 'أكاديمية وسينما التوعية المرورية',
        descriptionEn: 'Animated safety briefing teaching road signs, seatbelts, and pedestrian awareness.',
        descriptionAr: 'جلسة إرشادية كرتونية ممتعة لتعليم إشارات المرور وحزام الأمان وأولويات العبور.',
        imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
        icon: 'Shield',
        highlightType: 'ZONE',
        intensityLevel: 'LOW',
        durationMinutes: 15,
        minAge: 3
      },
      {
        titleEn: 'Official Photo Driving License Station',
        titleAr: 'محطة إصدار رخصة القيادة المصورة الرسمية',
        descriptionEn: 'Personalized high-gloss plastic driving license with the child’s photo and name to take home.',
        descriptionAr: 'بطاقة رخصة قيادة بلاستيكية ملونة تحمل صورة الطفل واسمه كتذكار إنجاز دائم.',
        imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=800&auto=format&fit=crop',
        icon: 'CreditCard',
        highlightType: 'SERVICE',
        intensityLevel: 'LOW',
        durationMinutes: 10,
        minAge: 3
      }
    ],
    pricing: [
      {
        titleEn: 'Cadet Driving Session',
        titleAr: 'جلسة تدريب القيادة للمبتدئين',
        descriptionEn: 'Safety academy briefing + 1 full 20-minute driving session on the city circuit.',
        descriptionAr: 'درس أكاديمية السلامة + جلسة قيادة لمدة ٢٠ دقيقة في شوارع المدينة.',
        price: 60,
        currency: 'QAR',
        type: 'ACCESS_PASS'
      },
      {
        titleEn: 'Licensed Junior Driver Package',
        titleAr: 'باقة رخصة القيادة المعتمدة',
        descriptionEn: 'Extended driving session + official personalized laminated photo license card.',
        descriptionAr: 'جلسة قيادة ممتدة + إصدار رخصة قيادة بلاستيكية مصورة باسم الطفل.',
        price: 95,
        currency: 'QAR',
        type: 'PREMIUM_ACTIVITY'
      },
      {
        titleEn: 'VIP Speedster All-Day Pass',
        titleAr: 'تذكرة السائق المحترف VIP',
        descriptionEn: '3 separate driving sessions, photo license, and official traffic police badge.',
        descriptionAr: '٣ جلسات قيادة منفصلة طوال اليوم مع الرخصة المصورة وشارة شرطة المرور.',
        price: 150,
        currency: 'QAR',
        type: 'PREMIUM_ACTIVITY'
      }
    ],
    faqs: [
      {
        questionEn: 'What is the age limit for Kidz Driving School?',
        questionAr: 'ما هي الفئة العمرية المسموح بها في مدرسة القيادة للأطفال؟',
        answerEn: 'Kidz Driving School is designed for children aged 3 to 10 years old with vehicles calibrated for different sizes.',
        answerAr: 'المدرسة مصممة للأطفال من سن ٣ إلى ١٠ سنوات مع مركبات تناسب مختلف الأطوال والأعمار.'
      },
      {
        questionEn: 'How long does a driving session take?',
        questionAr: 'كم تستغرق جلسة القيادة الكاملة؟',
        answerEn: 'A full experience takes approximately 30 to 45 minutes including safety orientation, driving, and license printing.',
        answerAr: 'تستغرق التجربة من ٣٠ إلى ٤٥ دقيقة وتشمل التدريب النظري والقيادة العملية وطباعة الرخصة.'
      },
      {
        questionEn: 'Can parents guide the vehicle remotely if needed?',
        questionAr: 'هل يمكن للوالدين أو المشرفين التحكم بالسيارة عن بعد؟',
        answerEn: 'Yes, our certified safety marshals have master wireless stop controls for all vehicles on the track at all times.',
        answerAr: 'نعم، يمتلك مشرفو السلامة المعتمدون أجهزة تحكم لاسلكية لإيقاف أي مركبة فوراً لضمان الأمان التام.'
      }
    ],
    socialLinks: [
      { platform: 'INSTAGRAM', url: 'https://instagram.com/e3.qatar', handle: '@e3.qatar' },
      { platform: 'TIKTOK', url: 'https://tiktok.com/@e3.qatar', handle: '@e3.qatar' },
      { platform: 'FACEBOOK', url: 'https://facebook.com/e3qatar', handle: 'E3 Qatar' }
    ]
  }
};

export function getCuratedAttractionDetails(slugOrKey: string): CuratedAttractionData | null {
  if (!slugOrKey) return null;
  const key = slugOrKey.toLowerCase().trim();

  if (key.includes('crayon') || key.includes('brick')) {
    return CURATED_ATTRACTIONS_DATA['crayons-bricks'];
  }
  if (key.includes('inflata-park') || key.includes('inflatapark') || key.includes('inflata')) {
    return CURATED_ATTRACTIONS_DATA['inflata-park'];
  }
  if (key.includes('urban-arena') || key.includes('urban') || key.includes('arena') || key.includes('rush')) {
    return CURATED_ATTRACTIONS_DATA['urban-arena'];
  }
  if (key.includes('driving') || key.includes('kidz') || key.includes('kids-city')) {
    return CURATED_ATTRACTIONS_DATA['kidz-driving-school'];
  }

  return CURATED_ATTRACTIONS_DATA['crayons-bricks'];
}
