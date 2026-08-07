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
  const settings = await db.setting.findMany({
    where: { type: "GENERAL" }
  });

  return (
    <B2CExperienceProvider>
      <B2CThemeProvider locale={locale}>
        <B2CPageShell className="flex flex-col min-h-screen relative bg-slate-950 text-slate-100">
          <B2CSceneHost preset="ambient-particles" colorAccent="#10b981" />
          <PulseOrbitNav locale={locale} />
          <main className="flex-1 pt-20 relative z-10">
            <B2CRouteTransition>{children}</B2CRouteTransition>
          </main>
          <Footer
            portal="b2c"
            settings={settings.reduce((acc, curr) => ({...acc, [curr.key]: curr.value}), {})}
          />
        </B2CPageShell>
      </B2CThemeProvider>
    </B2CExperienceProvider>
  );
}
