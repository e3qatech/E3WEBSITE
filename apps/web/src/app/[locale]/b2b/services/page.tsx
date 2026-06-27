import { ServicesClient } from "@/components/b2b/ServicesClient";

export const metadata = {
  title: "B2B Services | E3 Qatar",
  description: "End-to-end event engineering, entertainment solutions, and immersive installations.",
};

export const dynamic = 'force-dynamic';

async function getServicesData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/services?isVisible=true`, { cache: 'no-store' });
  if (!res.ok) {
    return [];
  }
  const json = await res.json();
  return json.data || [];
}

export default async function ServicesPage() {
  const servicesData = await getServicesData();
  
  return (
    <main className="min-h-screen bg-[var(--surface-default)]">
      <ServicesClient services={servicesData} />
    </main>
  );
}
