import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import db from "@/lib/db";

export default async function B2BLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await db.setting.findMany({
    where: {
      key: { in: [
        'lightLogoUrl', 'darkLogoUrl',
        'contactEmail', 'contactPhone', 'addressEn', 'addressAr', 
        'siteNameEn', 'siteNameAr', 'socialInstagram', 'socialTwitter', 
        'socialLinkedin', 'socialYoutube', 'socialSnapchat', 'socialFacebook', 
        'bookingqubeWebsite'
      ] }
    }
  });
  
  const lightLogoUrl = settings.find(s => s.key === 'lightLogoUrl')?.value as string | undefined;
  const darkLogoUrl = settings.find(s => s.key === 'darkLogoUrl')?.value as string | undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <Header portal="b2b" lightLogoUrl={lightLogoUrl} darkLogoUrl={darkLogoUrl} />
      <main className="flex-1 pt-24">
        {children}
      </main>
      <Footer 
        portal="b2b" 
        settings={settings.reduce((acc, curr) => ({...acc, [curr.key]: curr.value}), {})}
      />
    </div>
  );
}
