import { Footer } from "@/components/layout/Footer";
import { B2CThemeProvider, B2CPageShell } from "@/components/ui/B2CThemeComponents";
import { B2CExperienceProvider, B2CSceneHost, B2CRouteTransition } from "@/components/b2c/runtime/B2CExperienceRuntime";
import { PulseOrbitNav } from "@/components/b2c/nav/PulseOrbitNav";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";
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
      where: { slug: "b2c-pulse-orbit" }
    });
    if (!orbitPage) {
      orbitPage = await db.pages.findUnique({
        where: { slug: "pulse-orbit" }
      });
    }
  } catch (e) {
    console.warn("[B2C LAYOUT NOTICE] Failed to query pulse-orbit page:", e);
  }

  if (!orbitPage || !orbitPage.content) {
    try {
      const settingModel = (db as any).siteSettings || (db as any).setting;
      if (settingModel) {
        let setting = await settingModel.findUnique({
          where: { key: "cms_page_b2c-pulse-orbit" }
        });
        if (!setting) {
          setting = await settingModel.findUnique({
            where: { key: "cms_page_pulse-orbit" }
          });
        }
        if (setting && setting.value) {
          orbitPage = { content: setting.value };
        }
      }
    } catch (e) {
      console.warn("[B2C LAYOUT NOTICE] Failed to query siteSettings for pulse-orbit:", e);
    }
  }

  let b2cPages: any[] = [];
  try {
    b2cPages = await db.pages.findMany({
      where: {
        slug: { in: ["b2c-landing", "b2c-discover", "b2c-attractions", "b2c-calendar", "b2c-packages"] }
      }
    });
  } catch (e) {
    console.warn("[B2C LAYOUT NOTICE] Failed to query b2c pages for footer settings:", e);
  }

  const pageContentMap = b2cPages.reduce((acc: any, page: any) => {
    acc[page.slug] = page.content;
    return acc;
  }, {});

  const landingContent = getMergedCMSPageContent("b2c-landing", pageContentMap["b2c-landing"]);
  const discoverContent = getMergedCMSPageContent("b2c-discover", pageContentMap["b2c-discover"]);
  const attractionsContent = getMergedCMSPageContent("b2c-attractions", pageContentMap["b2c-attractions"]);
  const calendarContent = getMergedCMSPageContent("b2c-calendar", pageContentMap["b2c-calendar"]);
  const packagesContent = getMergedCMSPageContent("b2c-packages", pageContentMap["b2c-packages"]);

  const activeFooterMedia = 
    discoverContent?.footerMediaUrl || discoverContent?.footer?.backgroundMediaUrl ||
    attractionsContent?.footerMedia?.mediaUrl ||
    calendarContent?.footerMedia?.mediaUrl ||
    packagesContent?.footerMedia?.mediaUrl ||
    landingContent?.footerMedia?.mediaUrl ||
    settingsMap.footerMediaUrl || settingsMap.footerBackgroundMediaUrl;

  const activeFooterMediaType = 
    discoverContent?.footerMediaType || discoverContent?.footer?.backgroundMediaType ||
    attractionsContent?.footerMedia?.mediaType ||
    calendarContent?.footerMedia?.mediaType ||
    packagesContent?.footerMedia?.mediaType ||
    landingContent?.footerMedia?.mediaType ||
    settingsMap.footerMediaType || settingsMap.footerBackgroundMediaType || "IMAGE";

  const activeFooterPosterUrl = 
    discoverContent?.footerPosterUrl || discoverContent?.footer?.backgroundPosterUrl ||
    attractionsContent?.footerMedia?.posterMediaUrl ||
    calendarContent?.footerMedia?.posterMediaUrl ||
    packagesContent?.footerMedia?.posterMediaUrl ||
    landingContent?.footerMedia?.posterMediaUrl ||
    settingsMap.footerPosterUrl || settingsMap.footerBackgroundPosterUrl;

  const mergedFooterSettings = {
    ...settingsMap,
    footerMediaUrl: activeFooterMedia,
    footerMediaType: activeFooterMediaType,
    footerPosterUrl: activeFooterPosterUrl
  };

  const orbitData = getMergedCMSPageContent("b2c-pulse-orbit", orbitPage?.content);

  return (
    <B2CExperienceProvider>
      <B2CThemeProvider locale={locale}>
        <B2CPageShell className="flex flex-col min-h-screen relative bg-slate-950 text-slate-100">
          <B2CSceneHost preset="ambient-particles" colorAccent="#10b981" />
          <PulseOrbitNav locale={locale} settings={settingsMap} orbitData={orbitData} type="b2c" />
          <main className="flex-1 pt-20 relative z-10">
            <B2CRouteTransition>{children}</B2CRouteTransition>
          </main>
          <Footer portal="b2c" settings={mergedFooterSettings} />
        </B2CPageShell>
      </B2CThemeProvider>
    </B2CExperienceProvider>
  );
}
