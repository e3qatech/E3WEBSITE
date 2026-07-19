import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { B2CThemeProvider, B2CPageShell } from "@/components/ui/B2CThemeComponents";
import db from "@/lib/db";

export default async function B2CLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await db.setting.findMany({
    where: { type: "GENERAL" }
  });
  
  const lightLogoUrl = settings.find(s => s.key === 'lightLogoUrl')?.value as string | undefined;
  const darkLogoUrl = settings.find(s => s.key === 'darkLogoUrl')?.value as string | undefined;

  return (
    <B2CThemeProvider locale={locale}>
      <B2CPageShell className="flex flex-col min-h-screen">
        <Header portal="b2c" lightLogoUrl={lightLogoUrl} darkLogoUrl={darkLogoUrl} />
        <main className="flex-1 pt-24">
          {children}
        </main>
        <Footer 
          portal="b2c" 
          settings={settings.reduce((acc, curr) => ({...acc, [curr.key]: curr.value}), {})}
        />
      </B2CPageShell>
    </B2CThemeProvider>
  );
}
