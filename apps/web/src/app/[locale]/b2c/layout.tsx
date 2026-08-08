import { Footer } from "@/components/layout/Footer";
import { B2CThemeProvider, B2CPageShell } from "@/components/ui/B2CThemeComponents";
import { B2CExperienceProvider, B2CSceneHost, B2CRouteTransition } from "@/components/b2c/runtime/B2CExperienceRuntime";
import { PulseOrbitNav } from "@/components/b2c/nav/PulseOrbitNav";
import db from "@/lib/db";

export default async function B2CLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let settingsMap: Record<string, any> = {};
  try {
    const settingModel = (db as any).siteSettings || (db as any).setting;
    if (settingModel) {
      const settings = await settingModel.findMany({
        where: { type: "GENERAL" }
      });
      settingsMap = settings.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
    }
  } catch (e) {
    console.warn("[B2C LAYOUT NOTICE] Failed to query siteSettings:", e);
  }

  let orbitPage: any = null;
  try {
    orbitPage = await db.pages.findUnique({
      where: { slug: "pulse-orbit" }
    });
  } catch (e) {
    console.warn("[B2C LAYOUT NOTICE] Failed to query pulse-orbit page:", e);
  }

  return (
    <B2CExperienceProvider>
      <B2CThemeProvider locale={locale}>
        <B2CPageShell className="flex flex-col min-h-screen relative bg-slate-950 text-slate-100">
          <B2CSceneHost preset="ambient-particles" colorAccent="#10b981" />
          <PulseOrbitNav locale={locale} settings={settingsMap} orbitData={orbitPage?.content as any} />
          <main className="flex-1 pt-20 relative z-10">
            <B2CRouteTransition>{children}</B2CRouteTransition>
          </main>
          <Footer
            portal="b2c"
            settings={settingsMap}
          />
        </B2CPageShell>
      </B2CThemeProvider>
    </B2CExperienceProvider>
  );
}
