import { Suspense } from "react"
import type { Metadata } from "next"
import { Manrope, IBM_Plex_Sans_Arabic } from "next/font/google"
import Script from "next/script"
import { SEO } from "@/components/shared/SEO"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { AuthProvider } from "@/components/layout/AuthProvider"
import { NavigationProgressBar } from "@/components/layout/NavigationProgressBar"
import { ChunkErrorRecovery } from "@/components/layout/ChunkErrorRecovery"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { memoryCache } from "@/lib/cache/memory-cache"
import { buildLocalBusinessSchema, getBaseUrl } from "@/lib/seo-helper"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  preload: true
})

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-ibm-arabic",
  preload: true
})

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl: string | undefined = undefined;
  try {
    faviconUrl = await memoryCache.getOrSet('favicon_url', 300_000, async () => {
      const settings = await db.setting.findMany({
        where: { key: 'faviconUrl' }
      });
      return settings.find((s: any) => s.key === 'faviconUrl')?.value as string | undefined;
    });
  } catch (error) {
    console.error("Error fetching favicon metadata:", error);
  }

  const baseUrl = getBaseUrl();

  return {
    title: {
      template: "%s | Events & Entertainment Enterprises (E3 Qatar)",
      default: "Events & Entertainment Enterprises (E3 Qatar) | Premier Live Events, Production & Attractions",
    },
    description: "Qatar's premier event management company, turnkey corporate event organizer, and live entertainment destination operator in Doha. Specializing in festival staging, exhibition booth fabrication, AV production, and landmark attractions.",
    keywords: [
      "events & entertainment enterprises",
      "events and entertainment enterprises qatar",
      "event management company qatar",
      "corporate events doha",
      "event production qatar",
      "exhibition stand fabrication doha",
      "stage lighting av rental qatar",
      "family entertainment qatar",
      "theme parks doha",
      "inflatarun qatar",
      "شركة تنظيم فعاليات في قطر",
      "تنظيم معارض ومؤتمرات بالدوحة",
      "تجهيز مسارح واستاندات قطر",
      "فعاليات قطر",
    ],
    metadataBase: new URL(baseUrl),
    icons: {
      icon: [
        { url: faviconUrl || '/favicon.ico', sizes: 'any' },
        { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      shortcut: faviconUrl || '/favicon.ico',
    },
    manifest: '/site.webmanifest',
    openGraph: {
      title: "Events & Entertainment Enterprises (E3 Qatar) | Premier Live Events, Production & Attractions",
      description: "Premier event management, corporate conference organization, turnkey AV staging, and landmark entertainment attractions in Qatar.",
      url: baseUrl,
      siteName: "Events & Entertainment Enterprises (E3 Qatar)",
      locale: "en_US",
      alternateLocale: ["ar_QA"],
      type: "website",
      images: [
        {
          url: "/og-image-default.jpg", 
          width: 1200,
          height: 630,
          alt: "Events & Entertainment Enterprises (E3 Qatar)",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Events & Entertainment Enterprises (E3 Qatar) | Live Events & Attractions",
      description: "Qatar's premier event management, production, and live entertainment agency.",
      images: ["/og-image-default.jpg"],
    },
    alternates: {
      canonical: baseUrl,
      languages: {
        "en": `${baseUrl}/en`,
        "ar": `${baseUrl}/ar`,
        "x-default": `${baseUrl}/en`,
      }
    }
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  const baseUrl = getBaseUrl();

  return (
    <html lang="en" data-theme="dark" className={`${manrope.variable} ${ibmPlexSansArabic.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-48x48.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96" />
        <link rel="icon" href="/favicon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#090d16" />
      </head>
      <body className="antialiased font-sans bg-[var(--surface-default)] text-[var(--text-primary)]" suppressHydrationWarning>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var stored = localStorage.getItem('e3-admin-theme') || localStorage.getItem('themePreference') || localStorage.getItem('theme');
                var isDark = stored === 'dark' || (!stored || stored === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false);
                var theme = isDark ? 'dark' : 'light';
                var root = document.documentElement;
                root.setAttribute('data-theme', theme);
                root.classList.remove('dark', 'light');
                root.classList.add(theme);
                root.style.colorScheme = theme;
              } catch (e) {}
            })();
          `}
        </Script>
        <AuthProvider session={session}>
          <ThemeProvider>
            <ChunkErrorRecovery />
            <Suspense fallback={null}>
              <NavigationProgressBar />
            </Suspense>
            {/* Global Organization & LocalBusiness JSON-LD Schema */}
            <SEO 
              type="Organization" 
              data={{
                name: "Events & Entertainment Enterprises (E3 Qatar)",
                alternateName: [
                  "Events & Entertainment Enterprises",
                  "E3 Qatar",
                  "E3",
                  "إيفنتس آند إنترتينمنت إنتربرايزس",
                  "إي ثري قطر",
                  "إي ثري للفعاليات والترفيه"
                ],
                url: baseUrl,
                logo: `${baseUrl}/logo.png`,
                image: `${baseUrl}/og-image-default.jpg`,
                description: "Qatar's premier event management company, corporate event organizer, stage engineering expert, and live entertainment destination operator in Doha.",
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+974 3048 9955",
                  contactType: "customer service",
                  availableLanguage: ["English", "Arabic"]
                },
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Palm Tower B, 36th Floor, Office 3602, West Bay",
                  addressLocality: "Doha",
                  addressRegion: "Doha",
                  addressCountry: "QA"
                },
                sameAs: [
                  "https://www.linkedin.com/company/e3qatar",
                  "https://www.instagram.com/e3qatar",
                  "https://www.facebook.com/e3qatar",
                  "https://x.com/e3qatar",
                  "https://www.youtube.com/@e3qatar"
                ]
              }} 
            />
            <SEO
              type="LocalBusiness"
              data={buildLocalBusinessSchema()}
            />
            
            {children}
            <SpeedInsights />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
