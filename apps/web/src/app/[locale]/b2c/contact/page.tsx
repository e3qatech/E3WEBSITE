import { ContactClient } from "@/components/b2c/ContactClient";
import { db } from "@/lib/db";

export const metadata = {
  title: "Contact Us | E3 Qatar",
  description: "Need support, want to leave feedback, or have a question? We're here for you.",
};

export const dynamic = 'force-dynamic';

async function getContactData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Fetch active attractions for the dropdowns
  let attractions: any[] = [];
  try {
    const dbAttractions = await db.attraction.findMany({
      where: {
        isPublished: true,
        isHidden: false,
      }
    });
    attractions = dbAttractions.map(attraction => ({
      attractionId: attraction.id,
      attractionNameEn: attraction.nameEn,
      attractionNameAr: attraction.nameAr
    }));
  } catch (e) {
    console.error("Failed to fetch attractions directly from DB:", e);
  }
  
  // Fetch Attraction FAQs
  let attractionFaqs: any[] = [];
  try {
    attractionFaqs = await db.attractionFaq.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        attraction: {
          select: { nameEn: true, nameAr: true }
        }
      }
    });
  } catch (e) {
    console.error("Failed to fetch attraction FAQs directly from DB:", e);
  }

  // Fetch Settings and Featured Feedback from DB directly since this is a Server Component
  const settingsRecords = await db.setting.findMany({
    where: { 
      key: { in: ["B2C_CONTACT_PAGE_SETTINGS", "B2C_CONTACT_FAQS"] }
    }
  });

  const settings = settingsRecords.reduce((acc, curr) => {
    try {
      acc[curr.key] = typeof curr.value === 'string' ? JSON.parse(curr.value) : curr.value;
    } catch(e) {
      acc[curr.key] = curr.value;
    }
    return acc;
  }, {} as Record<string, any>);

  const pageSettings = settings.B2C_CONTACT_PAGE_SETTINGS || {
    title: "How Can We Help?",
    tagline: "Need support with a ticket, want to leave feedback, or just have a general question? We're here for you.",
    heroMediaType: "IMAGE",
    heroMediaUrl: ""
  };

  const generalFaqs = settings.B2C_CONTACT_FAQS || [];

  const featuredFeedbacks = await db.feedback.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return { attractions, attractionFaqs, generalFaqs, pageSettings, featuredFeedbacks };
}

export default async function ContactPage() {
  const { attractions, attractionFaqs, generalFaqs, pageSettings, featuredFeedbacks } = await getContactData();

  return (
    <div className="min-h-screen bg-[var(--surface-default)]">
      <ContactClient 
        attractions={attractions} 
        attractionFaqs={attractionFaqs} 
        generalFaqs={generalFaqs}
        pageSettings={pageSettings}
        featuredFeedbacks={featuredFeedbacks}
      />
    </div>
  );
}
