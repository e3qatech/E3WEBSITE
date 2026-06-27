import { TicketsClient } from "@/components/b2c/TicketsClient";

export const metadata = {
  title: "Tickets | E3 Qatar",
  description: "Get tickets to Qatar's most exciting attractions.",
};

export const dynamic = 'force-dynamic'; // Prevent static building since it relies on DB/API

async function getTicketsData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/tickets`, { cache: 'no-store' });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export default async function TicketsPage() {
  const ticketsData = await getTicketsData();

  return (
    <div className="min-h-screen bg-[var(--surface-default)] pt-20">
      <TicketsClient ticketsData={ticketsData} />
    </div>
  );
}
