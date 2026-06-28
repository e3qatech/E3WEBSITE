import type { Metadata } from "next"
import { Inter, Noto_Sans_Arabic } from "next/font/google"
import Script from "next/script"
import { SEO } from "@/components/shared/SEO"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { AuthProvider } from "@/components/layout/AuthProvider"
import { PortalSwitcher } from "@/components/layout/PortalSwitcher"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-arabic",
  preload: true
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await db.setting.findMany({
    where: { key: 'faviconUrl' }
  });
  const faviconUrl = settings.find(s => s.key === 'faviconUrl')?.value as string | undefined;

  return {
    title: {
      template: "%s | E3 - Event Engineering Experts",
      default: "E3 - We Build Experiences | Event Engineering Experts",
    },
    description: "Qatar's premier event engineering and entertainment agency. We specialize in transforming spaces into unforgettable experiences for both B2B and B2C clients.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa'),
    icons: faviconUrl ? {
      icon: faviconUrl,
      apple: faviconUrl,
    } : undefined,
    openGraph: {
      title: "E3 - We Build Experiences",
      description: "End-to-end event engineering, entertainment solutions, and immersive installations in Qatar and the MENA region.",
      url: "/",
      siteName: "E3 Qatar",
      locale: "en_QA",
      type: "website",
      images: [
        {
          url: "/og-image-default.jpg", 
          width: 1200,
          height: 630,
          alt: "E3 Event Engineering Experts",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "E3 - We Build Experiences",
      description: "Qatar's premier event engineering agency.",
      images: ["/og-image-default.jpg"],
    },
    alternates: {
      canonical: "/",
      languages: {
        "en": "/en/",
        "ar": "/ar/"
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

  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${notoSansArabic.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans bg-[var(--surface-default)] text-[var(--text-primary)]" suppressHydrationWarning>
        <Script id="theme-script">
          {`
            (function() {
              try {
                var storedTheme = localStorage.getItem('theme');
                if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else if (storedTheme === 'light') {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (e) {}
            })();
          `}
        </Script>
        <AuthProvider session={session}>
          <ThemeProvider>
            {/* Global Organization JSON-LD Schema */}
            <SEO 
              type="Organization" 
              data={{
                name: "Event Engineering Experts (E3)",
                url: "https://e3.qa",
                logo: "https://e3.qa/logo.png",
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+974-4400-0000",
                  contactType: "customer service",
                  availableLanguage: ["English", "Arabic"]
                },
                sameAs: [
                  "https://www.linkedin.com/company/e3qatar",
                  "https://twitter.com/e3qatar"
                ]
              }} 
            />
            
            <PortalSwitcher />
            
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
