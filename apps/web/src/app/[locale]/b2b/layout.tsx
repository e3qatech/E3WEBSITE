import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function B2BLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header portal="b2b" />
      <main className="flex-1 pt-24">
        {children}
      </main>
      <Footer portal="b2b" />
    </div>
  );
}
