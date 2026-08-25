import { ContactClient } from "@/components/b2c/ContactClient";
import { db } from "@/lib/db";
import { getPublicSettingsServer } from "@/lib/settings/public-settings";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "اتصل بنا | إي ثري قطر" : "Contact Us | E3 Qatar",
    description: isAr
      ? "تواصل مع فريق الدعم في إي ثري قطر، شاركنا تقييمك، أو استفسر عن باقاتنا وتجاربنا الترفيهية."
      : "Need support with a ticket, want to leave feedback, or have a question? We're here for you.",
  };
}

export const dynamic = "force-dynamic";

async function getContactData() {
  // Fetch active attractions for the dropdowns
  let attractions: any[] = [];
  try {
    const dbAttractions = await db.attraction.findMany({
      where: {
        isPublished: true,
        isHidden: false,
      },
    });
    attractions = dbAttractions.map((attraction: any) => ({
      attractionId: attraction.id,
      attractionNameEn: attraction.nameEn,
      attractionNameAr: attraction.nameAr || attraction.nameEn,
    }));
  } catch (e) {
    console.error("Failed to fetch attractions directly from DB:", e);
  }

  // Fetch Attraction FAQs
  let attractionFaqs: any[] = [];
  try {
    attractionFaqs = await db.attractionFaq.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        attraction: {
          select: { nameEn: true, nameAr: true },
        },
      },
    });
  } catch (e) {
    console.error("Failed to fetch attraction FAQs directly from DB:", e);
  }

  let settingsRecords: any[] = [];
  try {
    const settingModel = (db as any).siteSettings || (db as any).setting;
    if (settingModel) {
      settingsRecords = await settingModel.findMany({
        where: {
          key: { in: ["B2C_CONTACT_PAGE_SETTINGS", "B2C_CONTACT_FAQS"] },
        },
      });
    }
  } catch (e) {
    console.warn("[CONTACT PAGE DB NOTICE] Failed to query siteSettings:", e);
  }

  const settings = settingsRecords.reduce((acc, curr) => {
    try {
      acc[curr.key] = typeof curr.value === "string" ? JSON.parse(curr.value) : curr.value;
    } catch {
      acc[curr.key] = curr.value;
    }
    return acc;
  }, {} as Record<string, any>);

  const pageSettings = settings.B2C_CONTACT_PAGE_SETTINGS || {
    title: "How Can We Help?",
    tagline: "Need support with a ticket, want to leave feedback, or just have a general question? We're here for you.",
    heroMediaType: "IMAGE",
    heroMediaUrl: "",
  };

  const DEFAULT_GENERAL_FAQS = [
    {
      id: "gen-1",
      questionEn: "How do I book tickets for E3 Qatar attractions and events?",
      questionAr: "كيف يمكنني حجز تذاكر فعاليات ووجهات إي ثري قطر؟",
      answerEn:
        "You can book tickets directly online through our official Book Tickets portal or via the BookingQube ticketing platform. Select your preferred date, session time, and guest count to receive your instant digital pass.",
      answerAr:
        "يمكنك حجز التذاكر مباشرة عبر منصة الحجز الرسمية أو من خلال منصة BookingQube. اختر التاريخ والوقت وعدد التذاكر لاستلام تصريح الدخول الرقمي فوراً.",
    },
    {
      id: "gen-2",
      questionEn: "What is the policy for ticket cancellations and date rescheduling?",
      questionAr: "ما هي سياسة إلغاء التذاكر وتعديل مواعيد الحجز؟",
      answerEn:
        "Tickets can be rescheduled up to 24 hours prior to your booked session time through your confirmation link or by submitting a support request with your reference number.",
      answerAr:
        "يمكن إعادة جدولة الحجز حتى 24 ساعة قبل موعد الفعالية عبر رابط التأكيد أو بتقديم طلب دعم فني برقم الحجز الخاص بك.",
    },
    {
      id: "gen-3",
      questionEn: "Are E3 entertainment attractions suitable for children and families?",
      questionAr: "هل وجهات وفعاليات إي ثري مناسبة للأطفال والعائلات؟",
      answerEn:
        "Yes! All E3 Qatar attractions, including InflataCity, Urban Arena, and Rush Action Park, are designed with dedicated family zones, certified safety marshals, and age-graded play environments.",
      answerAr:
        "نعم بالتأكيد! جميع وجهات وفعاليات إي ثري قطر مصممة بمناطق عائلية مخصصة، ومراقبي سلامة معتمدين، ومستويات تناسب مختلف الفئات العمرية.",
    },
    {
      id: "gen-4",
      questionEn: "How can I book group passes, school trips, or corporate activations?",
      questionAr: "كيف يمكنني حجز باقات المجموعات والرحلات المدرسية والفعاليات المؤسسية؟",
      answerEn:
        "For customized group passes, birthday celebrations, or private venue buyouts, explore our Packages portal or contact our concierge team directly via WhatsApp or the Support form on this page.",
      answerAr:
        "لحجز باقات المجموعات، واحتفالات أعياد الميلاد، أو الحجوزات الخاصة الكاملة، تفضل بزيارة صفحة الباقات أو تواصل مع فريق خدمة العملاء عبر الواتساب أو نموذج الدعم.",
    },
    {
      id: "gen-5",
      questionEn: "Where are E3 Qatar attractions located and what are the operating hours?",
      questionAr: "أين تقع وجهات إي ثري قطر وما هي ساعات العمل الرسمية؟",
      answerEn:
        "Our landmark attractions and seasonal festivals operate across premier destinations in Doha and Lusail. Select any specific attraction from the topics above for accurate venue details and session timings.",
      answerAr:
        "تتوزع وجهاتنا ومهرجاناتنا في مواقع مميزة عبر الدوحة ولوسيل. يمكنك اختيار الوجهة المحددة من المواضيع أعلاه لمعرفة تفاصيل الموقع ومواعيد الفترات بدقة.",
    },
  ];

  const generalFaqs =
    Array.isArray(settings.B2C_CONTACT_FAQS) && settings.B2C_CONTACT_FAQS.length > 0
      ? settings.B2C_CONTACT_FAQS
      : DEFAULT_GENERAL_FAQS;

  const featuredFeedbacks = await db.feedback.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  }).catch(() => []);

  // Fetch central platform site settings (contact email, phone, whatsapp, address, hours, social links)
  const siteSettings = await getPublicSettingsServer();

  return { attractions, attractionFaqs, generalFaqs, pageSettings, featuredFeedbacks, siteSettings };
}

export default async function ContactPage({
  params,
}: {
  params?: Promise<{ locale: string }>;
} = {}) {
  const resolvedParams = params ? await params : { locale: "en" };
  const locale = resolvedParams?.locale || "en";
  const {
    attractions,
    attractionFaqs,
    generalFaqs,
    pageSettings,
    featuredFeedbacks,
    siteSettings,
  } = await getContactData();

  return (
    <div className="min-h-screen bg-[var(--surface-default)]">
      <ContactClient
        locale={locale}
        attractions={attractions}
        attractionFaqs={attractionFaqs}
        generalFaqs={generalFaqs}
        pageSettings={pageSettings}
        featuredFeedbacks={featuredFeedbacks}
        siteSettings={siteSettings}
      />
    </div>
  );
}
