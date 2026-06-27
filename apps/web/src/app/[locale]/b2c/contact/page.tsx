import { ContactClient } from "@/components/b2c/ContactClient";

export const metadata = {
  title: "Contact Us | E3 Qatar",
  description: "Need support, want to leave feedback, or have a question? We're here for you.",
};

export const dynamic = 'force-dynamic';

async function getContactData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Fetch active attractions for the dropdowns
  const attRes = await fetch(`${baseUrl}/api/tickets`, { cache: 'no-store' });
  const attractions = attRes.ok ? await attRes.json() : [];
  
  // Fetch FAQs
  const faqRes = await fetch(`${baseUrl}/api/contact/b2c?type=faq`, { cache: 'no-store' });
  const faqs = faqRes.ok ? await faqRes.json() : [];

  return { attractions, faqs };
}

export default async function ContactPage() {
  const { attractions, faqs } = await getContactData();

  return (
    <div className="min-h-screen bg-[var(--surface-default)] pt-20">
      <ContactClient attractions={attractions} faqs={faqs} />
    </div>
  );
}
