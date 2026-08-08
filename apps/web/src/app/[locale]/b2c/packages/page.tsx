import { PackagesClient } from "@/components/b2c/PackagesClient";

export const metadata = {
  title: "Packages & Birthday Parties | E3 Qatar",
  description: "Book corporate team building outings, VIP birthday parties, and exclusive venue buyouts in Qatar.",
};

export const dynamic = 'force-dynamic';

export default async function PackagesPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-default)] pt-20">
      <PackagesClient />
    </div>
  );
}
