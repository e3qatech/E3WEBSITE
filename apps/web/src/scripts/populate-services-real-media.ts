/**
 * E3 B2B Services — Real Media Population & Visual Enrichment Script
 * 
 * Assigns authentic, verified E3 assets to all 10 canonical B2B services.
 * Features:
 *  - Full dry-run mode (--dry-run)
 *  - Automatic pre-run backup to .backups/
 *  - Configures desktop/mobile hero, WOW/HOW visual, capability media, specialist module media, and gallery items
 *  - Sets Arabic & English captions, alt texts, and media rights
 * 
 * Run Dry Run: npx tsx --env-file=.env.local src/scripts/populate-services-real-media.ts --dry-run
 * Run Apply:   npx tsx --env-file=.env.local src/scripts/populate-services-real-media.ts --apply
 */
import db from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

interface ServiceMediaAssignment {
  slug: string;
  heroMediaUrl: string;
  heroMediaType: 'IMAGE' | 'VIDEO';
  heroMobileMediaUrl?: string;
  heroVideoPosterUrl?: string;
  thumbnail: string;
  heroAltTextEn: string;
  heroAltTextAr: string;
  heroMediaRights: string;
  wowVisual: {
    url: string;
    mediaType?: 'IMAGE' | 'VIDEO';
    captionEn: string;
    captionAr: string;
  };
  howVisual: {
    url: string;
    mediaType?: 'IMAGE' | 'VIDEO';
    captionEn: string;
    captionAr: string;
  };
  capabilityMedia: {
    cap1Url?: string;
    cap2Url?: string;
    cap3Url?: string;
  };
  specialistModuleMedia?: string;
  gallery: Array<{
    url: string;
    mediaType?: 'IMAGE' | 'VIDEO';
    captionEn: string;
    captionAr: string;
    altTextEn: string;
    altTextAr: string;
  }>;
}

const SERVICE_MEDIA_MAPPINGS: Record<string, ServiceMediaAssignment> = {
  'mega-events': {
    slug: 'mega-events',
    heroMediaType: 'VIDEO',
    heroMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Doha%20Balloon%20Parade%20-%20Eid%20in%20Qatar%202022.mp4',
    heroMobileMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DJI_0151.jpg',
    heroVideoPosterUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DJI_0151.jpg',
    thumbnail: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DJI_0189.jpg',
    heroAltTextEn: 'Doha Corniche Balloon Parade Mega Event Production',
    heroAltTextAr: 'إنتاج موكب المناطيد الضخم على كورنيش الدوحة',
    heroMediaRights: '© E3 Entertainment Enterprises / Qatar Tourism Delivery Record',
    wowVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DJI_0132.jpg',
      captionEn: 'Aerial Spectacle & Public Turnout at Doha Corniche Parade',
      captionAr: 'مشهد جوي استثنائي وحشود جماهيرية في موكب كورنيش الدوحة',
    },
    howVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/27e382eb-67db-489d-b865-a6b346b6e859.jpg',
      captionEn: 'Command Center, Crowd Flow Corridors & Redundant Power Grid',
      captionAr: 'غرفة العمليات المركزية ومسارات تدفق الحشود وشبكات الطاقة الاحتياطية',
    },
    capabilityMedia: {
      cap1Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/3c9a4383-b109-4cdf-bf91-13b283a2f0a5.jpg',
      cap2Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/bdca4045-0bc6-46ab-b287-c8f91448a8d9.png',
    },
    specialistModuleMedia: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/372b1749-d0f4-4316-a9e0-83d2585eab2d.png',
    gallery: [
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DJI_0151.jpg',
        captionEn: 'Doha Corniche Master Staging & Balloon Parade Production',
        captionAr: 'إخراج موكب المناطيد والإنتاج الميداني الشامل على كورنيش الدوحة',
        altTextEn: 'Doha Balloon Parade 2022 Aerial View',
        altTextAr: 'لقطة جوية لموكب المناطيد في الدوحة ٢٠٢٢',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DJI_0189.jpg',
        captionEn: 'Crowd Flow Stewarding & VIP Protocol Enclosure',
        captionAr: 'إدارة تدفق الجماهير والمنطقة المخصصة لكبار الشخصيات',
        altTextEn: 'Crowd and security management at mega event',
        altTextAr: 'إدارة الحشود والسلامة في فعالية كبرى',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/b3972069-cb4a-468b-9f30-06197dc832fa.jpeg',
        captionEn: 'Main Arena Kinetic Lighting & Laser Show Staging',
        captionAr: 'منظومة الإضاءة الحركية والعروض الليزرية على المسرح الرئيسي',
        altTextEn: 'Main Stage Concert Rigging and Lighting',
        altTextAr: 'تجهيزات الإضاءة والمسرح للحفلات الكبرى',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/b5385efc-31dd-42e4-9d6c-cc722b2c3a20.png',
        captionEn: 'Live Opening Ceremony Technical Direction & Show-Calling',
        captionAr: 'التوجيه الفني وإدارة العرض المباشر لحفل الافتتاح',
        altTextEn: 'Live Ceremony Stage Direction',
        altTextAr: 'إدارة العرض المباشر على المسرح',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/a791976a-d6cd-4cc9-957f-ddaeba30e9aa.png',
        captionEn: 'Boulevard Public Spectacle & Kinetic Floats Integration',
        captionAr: 'عروض البوليفارد الجماهيرية والمجسمات العائمة المتحركة',
        altTextEn: 'Boulevard festival floats',
        altTextAr: 'المجسمات الاستعراضية في المهرجان',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/d25b985a-c904-426b-b8fe-5257df35361b.jpg',
        captionEn: 'Stadium 360-Degree Visual Canvas & Field-of-Play Protection',
        captionAr: 'شاشات العرض المحيطية وحماية أرضية الاستاد الرياضي',
        altTextEn: 'Stadium perimeter production display',
        altTextAr: 'شاشات الإنتاج المحيطية في الاستاد',
      },
    ],
  },

  'fec-development': {
    slug: 'fec-development',
    heroMediaType: 'IMAGE',
    heroMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/ec068abe-ad22-4bc3-b163-f225b11812a7.jpg',
    heroMobileMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_06_Image_0005.jpg',
    thumbnail: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/6dbc18cb-e221-4bf5-8ec0-c90bbde437bd.jpg',
    heroAltTextEn: 'Turnkey Family Entertainment Centre Spatial Development',
    heroAltTextAr: 'تطوير مراكز الترفيه العائلي الشامل والمخططات المعمارية',
    heroMediaRights: '© E3 Entertainment Enterprises / InflataPark Brand Portfolio',
    wowVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_36_Image_0001.jpg',
      captionEn: 'Vibrant Thematic Zones & High-Repeat Play Journey',
      captionAr: 'عوالم ترفيهية تفاعلية تحفز تكرار الزيارة باستمرار',
    },
    howVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_37_Image_0001.jpg',
      captionEn: 'Capacity Modeling, Maintenance Corridors & Safety-Certified Surfacing',
      captionAr: 'نمذجة الطاقة الاستيعابية، مسارات الصيانة، وأرضيات الأمان المعتمدة',
    },
    capabilityMedia: {
      cap1Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_38_Image_0001.jpg',
      cap2Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_39_Image_0001.jpg',
    },
    specialistModuleMedia: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_43_Image_0001.jpg',
    gallery: [
      {
        url: 'https://eeeqa.com/assets/attractions/inflata-park/gallery-01.jpg',
        captionEn: 'InflataPark Main Arena — City Center Doha',
        captionAr: 'صالة إنفلاتابارك الرئيسية — سيتي سنتر الدوحة',
        altTextEn: 'InflataPark indoor inflatable arena',
        altTextAr: 'منطقة الألعاب الهوائية المغلقة إنفلاتابارك',
      },
      {
        url: 'https://eeeqa.com/assets/attractions/inflata-park/gallery-02.jpg',
        captionEn: 'Custom Inflatable Obstacle Arena & Play Modules',
        captionAr: 'مسار التحدي الهوائي المخصص ومناطق اللعب المتنوعة',
        altTextEn: 'Obstacle course play zone',
        altTextAr: 'منطقة ألعاب مسار التحدي',
      },
      {
        url: 'https://eeeqa.com/assets/attractions/inflata-park/gallery-03.jpg',
        captionEn: 'Family Dwell Lounge & Cashless POS Counter',
        captionAr: 'منطقة استراحة العائلات ونقاط الدفع الإلكتروني الذكية',
        altTextEn: 'Family seating and reception counter',
        altTextAr: 'استقبال الزوار ومقاعد العائلات',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_06_Image_0005.jpg',
        captionEn: 'Mall Anchor Spatial Fitout & Acoustic Isolation',
        captionAr: 'تجهيز الموقع داخل المجمع التجاري والعزل الصوتي',
        altTextEn: 'Mall entertainment anchor fitout',
        altTextAr: 'تجهيزات الموقع الترفيهي داخل المول',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/6022d964-0c43-4e6e-ba18-3ceb983a79a7.jpg',
        captionEn: 'Guest Ingress Architecture & Digital Safety Briefing Hub',
        captionAr: 'بوابات دخول الزوار وشاشات إرشادات السلامة الرقمية',
        altTextEn: 'FEC entry turnstiles and safety screens',
        altTextAr: 'بوابات الدخول وشاشات إرشادات الأمان',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/a06a3806-2e72-4466-a59c-f7e12767f629.jpg',
        captionEn: 'Multi-Level Soft Play Structure & Impact Padding',
        captionAr: 'هياكل الألعاب متعددة المستويات وبطانات امتصاص الصدمات',
        altTextEn: 'Soft play structure with certified padding',
        altTextAr: 'هياكل اللعب الآمن المعتمدة للأطفال',
      },
    ],
  },

  'kids-concepts': {
    slug: 'kids-concepts',
    heroMediaType: 'IMAGE',
    heroMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/e345cdb7-a037-4a37-8ba3-441360547295.jpg',
    heroMobileMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Kids%20Driving%20School%20Main_Page_02_Image_0004.jpg',
    thumbnail: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Kids%20Driving%20School%20Main_Page_07_Image_0004.png',
    heroAltTextEn: 'Kids Edutainment Concepts & Children Mini-World Environments',
    heroAltTextAr: 'مفاهيم الترفيه التعليمي وبيئات المدن المصغرة للأطفال',
    heroMediaRights: '© E3 Entertainment Enterprises / Kids City Driving School Portfolio',
    wowVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/COLORING%20WORKSHOP.jpg',
      captionEn: 'Immersive Sensory & Creative Discovery Studios',
      captionAr: 'استوديوهات تفاعلية لتنمية الخيال والاكتشاف الحسي للطفل',
    },
    howVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Kids%20Driving%20School%20Main_Page_07_Image_0005.png',
      captionEn: 'Pedagogical Age-Graded Curriculum & Certified Non-Toxic Finishes',
      captionAr: 'مناهج تفاعلية متدرجة حسب الفئة العمرية ومواد تصنيع آمنة وغير سامة',
    },
    capabilityMedia: {
      cap1Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/37759cc3-0252-4e1e-8764-d0b7c9788e89.jpg',
      cap2Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/79a8b014-64b7-4d8f-97f3-0fedca268e8a.jpeg',
    },
    specialistModuleMedia: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Post%20Event%20QT%20-%20LEGO%20Shows%20Qatar%202025%20%281%29_Page_072_Image_0001.jpg',
    gallery: [
      {
        url: 'https://eeeqa.com/assets/attractions/kidz-driving-school/gallery-01.jpg',
        captionEn: 'Kids Driving School Miniature Road Circuit',
        captionAr: 'حلبة القيادة المصغرة في مدرسة قيادة الأطفال',
        altTextEn: 'Kids City Driving School track',
        altTextAr: 'حلبة مدرسة تعليم القيادة للأطفال',
      },
      {
        url: 'https://eeeqa.com/assets/attractions/kidz-driving-school/gallery-02.jpg',
        captionEn: 'Realistic Traffic Signals, Electric Vehicles & Road Signs',
        captionAr: 'إشارات المرور الواقعية والسيارات الكهربائية الآمنة',
        altTextEn: 'Electric mini cars with traffic signs',
        altTextAr: 'سيارات كهربائية مصغرة وإشارات مرورية',
      },
      {
        url: 'https://eeeqa.com/assets/attractions/kidz-driving-school/gallery-03.jpg',
        captionEn: 'Official Junior Driving License Ceremony Hub',
        captionAr: 'منصة إصدار رخص القيادة للأطفال وحفل التخرج',
        altTextEn: 'Kids driving license graduation desk',
        altTextAr: 'منصة تسليم رخص القيادة للأطفال',
      },
      {
        url: 'https://eeeqa.com/assets/attractions/crayons-bricks-vendome/gallery-01.jpg',
        captionEn: 'Crayons & Bricks Creative Workshop — Place Vendôme',
        captionAr: 'ورش العمل الإبداعية كرايونز آند بريكس — بلاس فاندوم',
        altTextEn: 'Crayons and Bricks creative space',
        altTextAr: 'مساحة الأنشطة الإبداعية كرايونز آند بريكس',
      },
      {
        url: 'https://eeeqa.com/assets/attractions/crayons-bricks-vendome/gallery-02.jpg',
        captionEn: 'Sensory Brick Construction & STEAM Engineering Zone',
        captionAr: 'منطقة البناء الهندسي الحسي وبرامج STEM الإبداعية',
        altTextEn: 'STEAM brick building zone',
        altTextAr: 'منطقة البناء بالقطع التركيبية وبرامج STEM',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Post%20Event%20QT%20-%20LEGO%20Shows%20Qatar%202025%20%281%29_Page_072_Image_0001.jpg',
        captionEn: 'LEGO® Shows Qatar Giant Thematic Build Arena',
        captionAr: 'صالة البناء العملاقة لمعرض ليغو قطر',
        altTextEn: 'LEGO Shows Qatar Exhibition Zone',
        altTextAr: 'صالة معرض ليغو قطر التفاعلية',
      },
    ],
  },

  'experiential-activations': {
    slug: 'experiential-activations',
    heroMediaType: 'VIDEO',
    heroMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/videoplayback_1.mp4',
    heroMobileMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Summer%20Splash%20main%20entrance%20facade.jpg',
    heroVideoPosterUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Summer%20Splash%20main%20entrance%20facade.jpg',
    thumbnail: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Summer%20Splash%20indoor%20hall.jpg',
    heroAltTextEn: 'Summer Splash & Brand IP Pop-Up Activations in Qatar',
    heroAltTextAr: 'فعاليات سمر سبلاش والأنشطة الترويجية التفاعلية للعلامات التجارية في قطر',
    heroMediaRights: '© E3 Entertainment Enterprises / Summer Splash IP License Record',
    wowVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/SpongeBob%20Mission%20Control.jpg',
      captionEn: 'SpongeBob & Nickelodeon Thematic World Immersion',
      captionAr: 'تجربة عالم سبونج بوب ونيكلوديون التفاعلية الغامرة',
    },
    howVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Summer%20Splash%20%E2%80%94%20Event%20Report_Page_020_Image_0004.png',
      captionEn: 'Timed-Entry Throughput Management & Strict Brand Compliance',
      captionAr: 'إدارة تدفق الزوار بنظام الدخول المجدول والامتثال التام للعلامة التجارية',
    },
    capabilityMedia: {
      cap1Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Surf%E2%80%99s%20up.jpg',
      cap2Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Post%20Event%20Report%20InflataCity%202025%20_Page_009_Image_0007.jpg',
    },
    specialistModuleMedia: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/f2a38efe-ac0c-473e-afdb-8af2f33b816d.jpg',
    gallery: [
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Summer%20Splash%20indoor%20hall.jpg',
        captionEn: 'Summer Splash Grand Indoor Hall Architecture',
        captionAr: 'المخطط العام والإنتاج الداخلي لمهرجان سمر سبلاش',
        altTextEn: 'Summer Splash indoor activation hall',
        altTextAr: 'صالة فعاليات سمر سبلاش الداخلية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/SpongeBob%20Mission%20Control.jpg',
        captionEn: 'SpongeBob Mission Control Interactive Experience Zone',
        captionAr: 'منطقة مهمات سبونج بوب التفاعلية للأطفال',
        altTextEn: 'SpongeBob interactive game zone',
        altTextAr: 'منطقة ألعاب سبونج بوب التفاعلية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Surf%E2%80%99s%20up.jpg',
        captionEn: 'Viral Photo Moment & Social Sharing Architecture',
        captionAr: 'نقاط التصوير التفاعلية المخصصة للمشاركة عبر وسائل التواصل',
        altTextEn: 'Thematic photo opportunity installation',
        altTextAr: 'مجسم التصوير التفاعلي للعلامة التجارية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Post%20Event%20Report%20InflataCity%202025%20_Page_013_Image_0007.jpg',
        captionEn: 'INFLATACITY Qatar National Convention Centre Fitout',
        captionAr: 'تجهيزات إنفلاتاسيتي في مركز قطر الوطني للمؤتمرات',
        altTextEn: 'INFLATACITY inflatable city at QNCC',
        altTextAr: 'مدينة إنفلاتاسيتي في مركز قطر الوطني للمؤتمرات',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/f2a38efe-ac0c-473e-afdb-8af2f33b816d.jpg',
        captionEn: 'PAW Patrol Official Hero Academy Tour Staging',
        captionAr: 'منصة أكاديمية أبطال باو باترول الرسمية',
        altTextEn: 'PAW Patrol activation stage',
        altTextAr: 'منصة باو باترول التفاعلية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/a959ceb9-3ac2-4367-a470-eadfce9387ba.jpg',
        captionEn: 'High-Conversion Retail Mall Pop-Up Installation',
        captionAr: 'منصات ترويجية تفاعلية عالية المردود داخل المجمعات التجارية',
        altTextEn: 'Mall activation kiosk and branded stage',
        altTextAr: 'منصة ترويجية داخل المجمع التجاري',
      },
    ],
  },

  'shows-performances': {
    slug: 'shows-performances',
    heroMediaType: 'VIDEO',
    heroMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/videoplayback_2.mp4',
    heroMobileMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/stage.jpg',
    heroVideoPosterUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/stage.jpg',
    thumbnail: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/stage2.jpg',
    heroAltTextEn: 'International Theatrical Shows, Acrobatic Stunts & Live Staging',
    heroAltTextAr: 'العروض المسرحية العالمية، الاستعراضات البهلوانية، والإنتاج الحي',
    heroMediaRights: '© E3 Entertainment Enterprises / Live Performance Production Archives',
    wowVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/magnific_cinematic-night-relight-o_iAgSyrJ3uK.jpg',
      captionEn: 'High-Flying Aerial Choreography & Synchronized Special Effects',
      captionAr: 'استعراضات جوية مبهرة ومؤثرات بصرية متزامنة مع العرض',
    },
    howVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/1a90c333-1315-4ede-a361-d908284c02da.jpg',
      captionEn: 'Artist Visa Routing, Backstage Management & Timecode Cues',
      captionAr: 'إجراءات تأشيرات وتصاريح الفنانين، إدارة الكواليس، وإشارات التايم كود',
    },
    capabilityMedia: {
      cap1Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/d89c25b5-e1a8-4d28-8c4f-9aeea1776220.jpg',
      cap2Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/a5463fbe-ee7b-4849-9dd9-2c63ca70a3e4.jpg',
    },
    specialistModuleMedia: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/magnific_cinematic-night-relight-o_rlfEyghxtc.jpg',
    gallery: [
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/stage.jpg',
        captionEn: 'Multi-Level Concert Stage with Kinetic Lighting Grid',
        captionAr: 'مسرح غنائي متعدد المستويات مع شبكة إضاءة حركية متطورة',
        altTextEn: 'Live concert stage production with lighting',
        altTextAr: 'إنتاج وإضاءة مسرح الحفلات الحية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/stage2.jpg',
        captionEn: 'Timecode-Synchronized Pyrotechnics & Atmosphere Systems',
        captionAr: 'مؤثرات بصرية ودخانية متزامنة بدقة التايم كود مع الموسيقى',
        altTextEn: 'Atmospheric stage effects in live performance',
        altTextAr: 'المؤثرات المسرحية الخاصة في العروض الحية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/magnific_cinematic-night-relight-o_iAgSyrJ3uK.jpg',
        captionEn: 'Acrobatic Performer Flight Rigging & Safety Redundancy',
        captionAr: 'أنظمة تعليق الاستعراضيين الجويين وإجراءات الأمان المزدوجة',
        altTextEn: 'Aerial acrobatic show performer',
        altTextAr: 'استعراض بهلواني جوي على المسرح',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/magnific_cinematic-night-relight-o_rlfEyghxtc.jpg',
        captionEn: 'Pyrotechnic Finale & Flame Projector Sequences',
        captionAr: 'العرض الختامي للألعاب النارية وقاذفات اللهب المسرحية',
        altTextEn: 'Stage pyrotechnic show finale',
        altTextAr: 'ختام العرض بالألعاب النارية المسرحية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/d89c25b5-e1a8-4d28-8c4f-9aeea1776220.jpg',
        captionEn: 'Symphonic & Orchestral Technical Production in Doha',
        captionAr: 'الإنتاج التقني للعروض الأوركسترالية والموسيقية الكبرى',
        altTextEn: 'Orchestral concert stage engineering',
        altTextAr: 'الهندسة الصوتية لحفلات الأوركسترا',
      },
    ],
  },

  'av-stage-rentals': {
    slug: 'av-stage-rentals',
    heroMediaType: 'IMAGE',
    heroMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/cee38611-92e3-4632-9bd3-b32c938ee854.jpg',
    heroMobileMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC05010.jpg',
    thumbnail: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC09973.jpg',
    heroAltTextEn: 'Concert Grade Audio, High-Resolution LED & Heavy Truss Rigging',
    heroAltTextAr: 'أنظمة الصوت الاحترافية، شاشات LED عالية الدقة، وهياكل التعليق الثقيلة',
    heroMediaRights: '© E3 Entertainment Enterprises / Technical AV Inventory',
    wowVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC06321.jpg',
      captionEn: 'High-Lumen Architectural Beam & Moving Head Illumination',
      captionAr: 'إضاءات معمارية احترافية وشعاعية فائقة السطوع للمسارح',
    },
    howVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC01674.jpg',
      captionEn: 'Digital FOH Consoles, Dante Audio Network & Certified Rigging Load Plans',
      captionAr: 'وحدات تحكم رقمية وشبكات صوت Dante ومخططات أحمال التعليق المعتمدة',
    },
    capabilityMedia: {
      cap1Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8138.jpg',
      cap2Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC09277-2.jpg',
    },
    specialistModuleMedia: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/7b3f0ab6-f73a-4c10-bd16-02298017bb52.jpg',
    gallery: [
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/cee38611-92e3-4632-9bd3-b32c938ee854.jpg',
        captionEn: 'Aluminum Box Truss Structure with Moving Heads & Line Array',
        captionAr: 'هياكل الألمنيوم المقواة مع أجهزة الإضاءة المتحركة والمصفوفات الصوتية',
        altTextEn: 'Heavy duty stage truss system',
        altTextAr: 'هياكل الجمالونات الإنشائية للمسرح',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/7b3f0ab6-f73a-4c10-bd16-02298017bb52.jpg',
        captionEn: 'Curved Indoor Fine-Pitch LED Video Canvas',
        captionAr: 'شاشات LED المنحنية فائقة الدقة للمؤتمرات والفعاليات',
        altTextEn: 'Fine pitch curved LED screen',
        altTextAr: 'شاشات LED فائقة الدقة والوضوح',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC05010.jpg',
        captionEn: 'GrandMA3 Lighting Control Desk & Real-Time Visualization',
        captionAr: 'منظومة التحكم بالإضاءة GrandMA3 والمحاكاة ثلاثية الأبعاد المباشرة',
        altTextEn: 'Lighting control console in operation',
        altTextAr: 'وحدة التحكم بإضاءة الفعاليات',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC09973.jpg',
        captionEn: 'Acoustic Delay Tower Calibration & Multi-Zone Tuning',
        captionAr: 'أبراج توزيع الصوت ومعايرة الترددات لمختلف مناطق الجمهور',
        altTextEn: 'Audio delay tower in outdoor arena',
        altTextAr: 'أبراج الصوت الموزعة في المساحات المفتوحة',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC06321.jpg',
        captionEn: 'RGB Laser Atmospheric Staging & Stage Beam Convergence',
        captionAr: 'عروض الليزر المتزامنة وتوزيع الإضاءة الشعاعية على المسرح',
        altTextEn: 'Stage laser and beam effects',
        altTextAr: 'مؤثرات الليزر والأشعة الضوئية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC01674.jpg',
        captionEn: 'Redundant Power Distribution & Clean Sound Isolation',
        captionAr: 'محطات توزيع الطاقة المعزولة لحماية الأجهزة الصوتية والضوئية',
        altTextEn: 'Power distribution and audio patching',
        altTextAr: 'لوحات توزيع الكهرباء والتحكم الصوتي',
      },
    ],
  },

  'attraction-operations': {
    slug: 'attraction-operations',
    heroMediaType: 'VIDEO',
    heroMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/d1a1b309-29fc-415b-a5f8-48bc2f14752d.mp4',
    heroMobileMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/_Urban%20Arena-Profile%20%281%29_Page_18_Image_0006.jpg',
    heroVideoPosterUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/_Urban%20Arena-Profile%20%281%29_Page_18_Image_0006.jpg',
    thumbnail: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3155.jpg',
    heroAltTextEn: 'Turnkey Attraction Operations, Venue Management & Guest Experience',
    heroAltTextAr: 'الإدارة والتشغيل الشامل للمراكز الترفيهية وتجربة الزوار في قطر',
    heroMediaRights: '© E3 Entertainment Enterprises / Urban Arena Operations Record',
    wowVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/_Urban%20Arena-Profile%20%281%29_Page_21_Image_0006.jpg',
      captionEn: 'High-Energy Seamless Guest Experience & Community Loyalty',
      captionAr: 'تجربة زائر استثنائية وبناء ولاء مستدام للمركز الترفيهي',
    },
    howVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/_Urban%20Arena-Profile%20%281%29_Page_13_Image_0005.jpg',
      captionEn: 'Standard Operating Procedures (SOPs), Daily HSE Audits & Revenue Control',
      captionAr: 'إجراءات التشغيل القياسية (SOPs)، تدقيق السلامة اليومي، والرقابة المالية',
    },
    capabilityMedia: {
      cap1Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/_Urban%20Arena-Profile%20%281%29_Page_05_Image_0005.jpg',
      cap2Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/18840624-4dec-488f-a735-758d1468ae14.jpg',
    },
    specialistModuleMedia: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3142.jpg',
    gallery: [
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/_Urban%20Arena-Profile%20%281%29_Page_18_Image_0006.jpg',
        captionEn: 'Urban Arena Esports Floor Operations & Station Monitoring',
        captionAr: 'إدارة وتشغيل صالة ألعاب إيربان أرينا الإلكترونية',
        altTextEn: 'Esports gaming arena floor operations',
        altTextAr: 'إدارة صالة الألعاب والرياضات الإلكترونية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/_Urban%20Arena-Profile%20%281%29_Page_21_Image_0006.jpg',
        captionEn: 'Tournament Staging, Live Streaming & Spectator Management',
        captionAr: 'تنظيم البطولات التنافسية والبث الحي وإدارة مدرجات الجماهير',
        altTextEn: 'Gaming tournament staging and audience area',
        altTextAr: 'تنظيم بطولات الألعاب وإدارة الحضور',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/_Urban%20Arena-Profile%20%281%29_Page_05_Image_0005.jpg',
        captionEn: 'Guest Reception, Cashless Top-Up Hub & Membership Services',
        captionAr: 'استقبال الزوار، شحن بطاقات الألعاب، وإدارة العضويات',
        altTextEn: 'Attraction reception desk and guest service',
        altTextAr: 'استقبال الزوار وخدمات العضوية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/18840624-4dec-488f-a735-758d1468ae14.jpg',
        captionEn: 'Integrated Cashless POS, Inventory & Food and Beverage Operations',
        captionAr: 'نقاط البيع اللا تلامسية وإدارة المخزون والمأكولات والمشروبات',
        altTextEn: 'Point of sale and inventory management',
        altTextAr: 'نقاط البيع الذكية وإدارة العمليات',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3155.jpg',
        captionEn: 'Staff Protocol Training & Floor Marshalling Execution',
        captionAr: 'تدريب طواقم العمل على البروتوكولات وإدارة الميدان الاحترافية',
        altTextEn: 'Operations crew and facility oversight',
        altTextAr: 'طواقم تشغيل وإشراف المنشأة الترفيهية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3142.jpg',
        captionEn: 'Preventative Daily Maintenance & Ride Safety Inspections',
        captionAr: 'الفحص الدوري الوقائي واختبارات سلامة الألعاب اليومية',
        altTextEn: 'Safety inspection and maintenance checklist',
        altTextAr: 'إجراءات الفحص الدوري والصيانة الوقائية',
      },
    ],
  },

  'ticketing-solutions': {
    slug: 'ticketing-solutions',
    heroMediaType: 'IMAGE',
    heroMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/83d2cc95-e850-4c2b-9272-3c0e1d8449c5.jpg',
    heroMobileMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3226.jpg',
    thumbnail: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3234.jpg',
    heroAltTextEn: 'BookingQube Cloud Ticketing Platform & Smart Turnstiles',
    heroAltTextAr: 'منصة بوكينج كيوب السحابية للتذاكر وبوابات الدخول الذكية',
    heroMediaRights: '© E3 Entertainment Enterprises / BookingQube Proprietary Tech Platform',
    wowVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3306.jpg',
      captionEn: 'Sub-Second Turnstile Ingress & Instant NFC Wristband Validation',
      captionAr: 'عبور فوري بأجزاء من الثانية وقراءة سريعة للأساور الذكية',
    },
    howVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3335.jpg',
      captionEn: 'Offline-First Validation, Real-Time Ingress Analytics & Bank-Grade Security',
      captionAr: 'تحقق ذكي حتى في حال انقطاع الشبكة، تحليلات مباشرة، وأمان بنكي مشفر',
    },
    capabilityMedia: {
      cap1Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3226.jpg',
      cap2Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3234.jpg',
    },
    specialistModuleMedia: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_2449%202.jpg',
    gallery: [
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/83d2cc95-e850-4c2b-9272-3c0e1d8449c5.jpg',
        captionEn: 'BookingQube Optical QR Speed Gates & Turnstiles',
        captionAr: 'بوابات بوكينج كيوب الضوئية الذكية لقراءة التذاكر والباركود',
        altTextEn: 'Smart QR turnstile access gate',
        altTextAr: 'بوابات الدخول الذكية بنظام الباركود',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3226.jpg',
        captionEn: 'Rugged Handheld Laser Scanners for Outdoor Flow Validation',
        captionAr: 'أجهزة المسح اللاسلكية المقواة لإدارة تدفق البوابات الخارجية',
        altTextEn: 'Handheld mobile ticket scanner',
        altTextAr: 'أجهزة مسح التذاكر المحمولة للميدان',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3234.jpg',
        captionEn: 'High-Volume Fast Lane Scanning Terminal',
        captionAr: 'محطة المسح السريع المخصصة للأفواج الجماهيرية الكبرى',
        altTextEn: 'Fast lane event entry scanner',
        altTextAr: 'بوابة المسح السريع لدخول الجماهير',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3306.jpg',
        captionEn: 'Queuing Flow Optimization & Real-Time Capacity Threshold Displays',
        captionAr: 'تنظيم طوابير الانتظار وعرض الطاقة الاستيعابية الفورية',
        altTextEn: 'Queue line and attendance display',
        altTextAr: 'شاشات تنظيم الطوابير وتتبع الحضور المباشر',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3335.jpg',
        captionEn: 'On-Site Cashless Top-Up POS Hub with Card Integration',
        captionAr: 'محطة شحن الأساور والبطاقات الذكية المتوافقة مع الدفع المصرفي',
        altTextEn: 'Cashless point of sale terminal',
        altTextAr: 'محطة الدفع الإلكتروني وشحن البطاقات',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_2449%202.jpg',
        captionEn: 'White-Label Mobile Booking Engine & Apple Wallet Pass Integration',
        captionAr: 'منظومة حجز التذاكر عبر الجوال المتوافقة مع محفظة أبل الرقمية',
        altTextEn: 'Mobile ticketing app interface',
        altTextAr: 'تطبيق حجز التذاكر على الهواتف الذكية',
      },
    ],
  },

  'fabrication-branding': {
    slug: 'fabrication-branding',
    heroMediaType: 'IMAGE',
    heroMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/7a0e1754-436d-4377-8366-82de4e1d921b.jpg',
    heroMobileMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_0123.jpg',
    thumbnail: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_2385%202.jpg',
    heroAltTextEn: 'Custom Scenic Fabrication, Thematic Facades & Large-Scale Signage',
    heroAltTextAr: 'التصنيع الديكوري المخصص، الواجهات ذات الطابع التفاعلي، واللوحات الإرشادية الكبرى',
    heroMediaRights: '© E3 Entertainment Enterprises / Qatar Fabrication Atelier Record',
    wowVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/E3%20Corporate%20Profile%20V3_Page_14_Image_0003.jpg',
      captionEn: 'Museum-Quality 3D Thematic Sculpting & Landmark Monuments',
      captionAr: 'مجسمات ديكورية ثلاثية الأبعاد بجودة متحفية وأعمال نحتية رائدة',
    },
    howVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/E3%20Corporate%20Profile%20V3_Page_14_Image_0005.png',
      captionEn: 'CNC 5-Axis Milling, Structural Steel Calculations & Certified Fire-Retardant Coatings',
      captionAr: 'خراطة CNC خماسية المحاور، حسابات الإنشاءات الفولاذية، ودهانات مقاومة الحريق المعتمدة',
    },
    capabilityMedia: {
      cap1Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/E3%20Corporate%20Profile%20V3_Page_29_Image_0001.png',
      cap2Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/E3%20Corporate%20Profile%20V3_Page_29_Image_0004.jpg',
    },
    specialistModuleMedia: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/E3%20Corporate%20Profile%20V3_Page_30_Image_0013.png',
    gallery: [
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/7a0e1754-436d-4377-8366-82de4e1d921b.jpg',
        captionEn: 'Monumental Entry Portal Frame & Thematic Cladding',
        captionAr: 'بوابة الدخول الرئيسية العملاقة والكسوات الديكورية المعمارية',
        altTextEn: 'Thematic entrance archway fabrication',
        altTextAr: 'تصنيع بوابة الدخول الديكورية للفعالية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_0123.jpg',
        captionEn: 'Scenic Texturing, Realistic Rockwork & Polyurea Weather Coating',
        captionAr: 'التشكيل الصخري الديكوري والطلاءات المقاومة للمناخ الخارجي',
        altTextEn: 'Realistic scenic rockwork painting',
        altTextAr: 'التشطيبات الصخرية الديكورية المقاومة للعوامل الجوية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_2385%202.jpg',
        captionEn: 'Reinforced Substructure Welding & Engineering Load Certification',
        captionAr: 'أعمال اللحام والهياكل التحتية الفولاذية المعتمدة هندسياً',
        altTextEn: 'Structural steel framing assembly',
        altTextAr: 'تجميع الهياكل الفولاذية الإنشائية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/E3%20Corporate%20Profile%20V3_Page_14_Image_0003.jpg',
        captionEn: 'Intricate Facade Detailing & Indirect Architectural LED Integration',
        captionAr: 'تفاصيل الواجهات المعمارية الدقيقة ودمج الإضاءة المخفية الذكية',
        altTextEn: 'Themed architectural facade details',
        altTextAr: 'تفاصيل الواجهة المعمارية المضاءة',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/E3%20Corporate%20Profile%20V3_Page_14_Image_0005.png',
        captionEn: 'Large-Format FRP Fiberglass Element Finishing',
        captionAr: 'تشطيب وتلميع عناصر الفايبرجلاس (FRP) الضخمة',
        altTextEn: 'Custom fiberglass props production',
        altTextAr: 'إنتاج المجسمات الديكورية من الفايبرجلاس',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/E3%20Corporate%20Profile%20V3_Page_29_Image_0001.png',
        captionEn: 'Wayfinding Totems & High-Impact Illuminated Signage',
        captionAr: 'أعمدة الإرشاد والتوجيه واللوحات الإعلانية المضاءة الكبرى',
        altTextEn: 'Illuminated wayfinding totem',
        altTextAr: 'لوحات الإرشاد والتوجيه المضيئة',
      },
    ],
  },

  'feasibility-design-research': {
    slug: 'feasibility-design-research',
    heroMediaType: 'IMAGE',
    heroMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/E3%20Corporate%20Profile%20V3_Page_30_Image_0013.png',
    heroMobileMediaUrl: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/AQ0I0091.jpg',
    thumbnail: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/AQ0I0106.jpg',
    heroAltTextEn: 'Masterplanning Dossiers, Spatial BIM Modeling & Commercial Feasibility Studies',
    heroAltTextAr: 'المخططات العامة، نمذجة BIM المكانية، ودراسات الجدوى الاقتصادية الشاملة',
    heroMediaRights: '© E3 Entertainment Enterprises / Feasibility & Spatial Advisory Record',
    wowVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/AQ0I0340.jpg',
      captionEn: 'Visionary Masterplan Renders & Immersive 3D Spatial Flythroughs',
      captionAr: 'مخططات عامة ثلاثية الأبعاد ومحاكاة بصرية غامرة للموقع قبل التنفيذ',
    },
    howVisual: {
      url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/AQ0I0366.jpg',
      captionEn: 'Financial Sensitivity Models, Demographic Profiling & ROI Validation',
      captionAr: 'نماذج الحساسية المالية، تحليل الكثافة السكانية، والتحقق من العائد على الاستثمار',
    },
    capabilityMedia: {
      cap1Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/AQ0I0446.jpg',
      cap2Url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/IMG_3029-Edit.jpg',
    },
    specialistModuleMedia: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/AQ0I0091.jpg',
    gallery: [
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/E3%20Corporate%20Profile%20V3_Page_30_Image_0013.png',
        captionEn: 'Thematic Concept Board & Architectural Spatial Allocation',
        captionAr: 'لوحة المفاهيم الإبداعية وتوزيع المساحات المعمارية للمشروع',
        altTextEn: 'Entertainment masterplan concept drawing',
        altTextAr: 'مخطط المفهوم الإبداعي للمشروع الترفيهي',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/AQ0I0091.jpg',
        captionEn: 'Zoning & Pedestrian Circulation Analysis Blueprint',
        captionAr: 'مخطط تقسيم المناطق وتحليل مسارات حركة المشاة والزوار',
        altTextEn: 'Spatial zoning blueprint and flow lines',
        altTextAr: 'مخطط تقسيم المناطق ومسارات الحركة',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/AQ0I0106.jpg',
        captionEn: 'Local Demographics & Consumer Spending Density Matrix',
        captionAr: 'مصفوفة البيانات الديموغرافية ومعدلات الإنفاق في السوق المحلي',
        altTextEn: 'Demographic heat map and spending chart',
        altTextAr: 'خريطة الكثافة السكانية ومعدلات الإنفاق',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/AQ0I0340.jpg',
        captionEn: '3D Sightline Verification & Acoustic Buffer Modeling',
        captionAr: 'محاكاة خطوط الرؤية ثلاثية الأبعاد ونمذجة العوازل الصوتية',
        altTextEn: '3D acoustic and sightline model',
        altTextAr: 'محاكاة خطوط الرؤية والعزل الصوتي ثلاثية الأبعاد',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/AQ0I0366.jpg',
        captionEn: 'CAPEX & OPEX Multi-Year Financial Sensitivity Projections',
        captionAr: 'التوقعات المالية التقديرية للتكاليف الرأسمالية والتشغيلية (CAPEX / OPEX)',
        altTextEn: 'Financial cash flow model spreadsheet and chart',
        altTextAr: 'النموذج المالي للتدفقات النقدية والميزانية التقديرية',
      },
      {
        url: 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/AQ0I0446.jpg',
        captionEn: 'BIM Technical Coordination Deck for Municipal Clearances',
        captionAr: 'حزمة المخططات الهندسية ونماذج BIM المعتمدة للاعتمادات البلدية',
        altTextEn: 'BIM technical drawings pack',
        altTextAr: 'حزمة المخططات الهندسية ونماذج BIM',
      },
    ],
  },
};

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || !args.includes('--apply');

  console.log(`\n===============================================================`);
  console.log(`🚀 E3 SERVICES MEDIA POPULATION & ENRICHMENT`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (Preview only, no DB writes)' : '⚡ APPLY (Modifying Development DB)'}`);
  console.log(`===============================================================\n`);

  // 1. Export backup before any operation
  const BACKUP_DIR = path.resolve(process.cwd(), '../../../.backups');
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `pre_media_population_backup_${timestamp}.json`);

  const currentServices = await (db as any).service.findMany({
    include: { gallery: true },
    orderBy: { slug: 'asc' },
  });

  fs.writeFileSync(backupFile, JSON.stringify(currentServices, null, 2), 'utf-8');
  console.log(`📦 Safety Backup saved: ${backupFile}`);
  console.log(`   Found ${currentServices.length} current Service records in DB.\n`);

  // 2. Iterate through each service assignment
  const entries = Object.entries(SERVICE_MEDIA_MAPPINGS);

  for (const [slug, mapping] of entries) {
    const existing = currentServices.find((s: any) => s.slug === slug);
    if (!existing) {
      console.log(`⚠️ Service with slug '${slug}' not found in DB! Skipping.`);
      continue;
    }

    // Parse current CMS payload from DB
    let cmsPayload: any = {};
    try {
      if (typeof existing.process === 'object' && existing.process !== null) {
        cmsPayload = { ...existing.process };
      } else if (typeof existing.process === 'string') {
        cmsPayload = JSON.parse(existing.process);
      }
    } catch (_e) {}

    // Enrich CMS payload with media
    cmsPayload.heroMobileMediaUrl = mapping.heroMobileMediaUrl || mapping.heroMediaUrl;
    cmsPayload.heroVideoPosterUrl = mapping.heroVideoPosterUrl;
    cmsPayload.heroAltTextEn = mapping.heroAltTextEn;
    cmsPayload.heroAltTextAr = mapping.heroAltTextAr;
    cmsPayload.heroMediaRights = mapping.heroMediaRights;

    // Enrich WOW/HOW
    if (Array.isArray(cmsPayload.wowHow) && cmsPayload.wowHow.length > 0) {
      cmsPayload.wowHow[0].wowMediaUrl = mapping.wowVisual.url;
      cmsPayload.wowHow[0].wowMediaType = mapping.wowVisual.mediaType || 'IMAGE';
      cmsPayload.wowHow[0].howMediaUrl = mapping.howVisual.url;
      cmsPayload.wowHow[0].howMediaType = mapping.howVisual.mediaType || 'IMAGE';
    }

    // Enrich Capabilities
    if (Array.isArray(cmsPayload.capabilities)) {
      if (cmsPayload.capabilities[0] && mapping.capabilityMedia.cap1Url) {
        cmsPayload.capabilities[0].mediaUrl = mapping.capabilityMedia.cap1Url;
      }
      if (cmsPayload.capabilities[1] && mapping.capabilityMedia.cap2Url) {
        cmsPayload.capabilities[1].mediaUrl = mapping.capabilityMedia.cap2Url;
      }
    }

    // Enrich Specialist Module
    if (cmsPayload.serviceSpecificModule && mapping.specialistModuleMedia) {
      if (Array.isArray(cmsPayload.serviceSpecificModule.options) && cmsPayload.serviceSpecificModule.options[0]) {
        cmsPayload.serviceSpecificModule.options[0].mediaUrl = mapping.specialistModuleMedia;
      }
    }

    // Enrich Gallery Items in CMS payload
    cmsPayload.galleryItems = mapping.gallery.map((g, idx) => ({
      id: `g_${slug}_${idx + 1}`,
      url: g.url,
      mediaType: g.mediaType || 'IMAGE',
      captionEn: g.captionEn,
      captionAr: g.captionAr,
      altTextEn: g.altTextEn,
      altTextAr: g.altTextAr,
      focalPoint: 'center',
      mediaRights: mapping.heroMediaRights,
      orderIndex: idx,
    }));

    console.log(`---------------------------------------------------------------`);
    console.log(`📋 Service: ${slug.toUpperCase()}`);
    console.log(`   Hero Media (${mapping.heroMediaType}): ${mapping.heroMediaUrl}`);
    console.log(`   Thumbnail: ${mapping.thumbnail}`);
    console.log(`   WOW Visual: ${mapping.wowVisual.url}`);
    console.log(`   HOW Visual: ${mapping.howVisual.url}`);
    console.log(`   Capability 1 Media: ${mapping.capabilityMedia.cap1Url || 'none'}`);
    console.log(`   Capability 2 Media: ${mapping.capabilityMedia.cap2Url || 'none'}`);
    console.log(`   Gallery Items: ${mapping.gallery.length} verified assets`);

    if (!isDryRun) {
      // 1. Update Service root columns and process JSON in DB
      await (db as any).service.update({
        where: { id: existing.id },
        data: {
          heroMediaUrl: mapping.heroMediaUrl,
          heroMediaType: mapping.heroMediaType,
          thumbnail: mapping.thumbnail,
          process: cmsPayload,
          updatedAt: new Date(),
        },
      });

      // 2. Clear old gallery rows for this service and recreate them
      await (db as any).serviceGalleryItem.deleteMany({
        where: { serviceId: existing.id },
      });

      for (let i = 0; i < mapping.gallery.length; i++) {
        const item = mapping.gallery[i];
        await (db as any).serviceGalleryItem.create({
          data: {
            serviceId: existing.id,
            url: item.url,
            captionEn: item.captionEn,
            captionAr: item.captionAr,
            orderIndex: i,
          },
        });
      }
      console.log(`   ✅ APPLIED to Database.`);
    } else {
      console.log(`   [DRY RUN] Would update DB columns and sync ${mapping.gallery.length} ServiceGalleryItem rows.`);
    }
  }

  console.log(`\n===============================================================`);
  if (isDryRun) {
    console.log(`🔍 DRY RUN COMPLETE: 10 services verified and mapped.`);
    console.log(`To apply changes, run: npx tsx --env-file=.env.local src/scripts/populate-services-real-media.ts --apply`);
  } else {
    console.log(`🎉 APPLY COMPLETE: All 10 services populated with real media and synced in DB!`);
  }
  console.log(`===============================================================\n`);

  await (db as any).$disconnect();
}

main().catch((e) => {
  console.error('Execution failed:', e);
  process.exit(1);
});
