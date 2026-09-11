/**
 * Centralized SEO & Canonical URL Engine for E3 Qatar
 * Guarantees 100% absolute canonical URLs, correct multi-lingual hreflang
 * alternates (en, ar, x-default), and Google-compliant Schema.org structured data.
 */

export function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw || raw.includes('localhost') || raw.includes('127.0.0.1')) {
    return 'https://eeeqa.com';
  }
  return raw.replace(/\/+$/, '');
}

export function getCanonicalUrl(locale: string, path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If path already starts with /en or /ar
  if (cleanPath.startsWith('/en/') || cleanPath === '/en') {
    return `${baseUrl}${cleanPath}`;
  }
  if (cleanPath.startsWith('/ar/') || cleanPath === '/ar') {
    return `${baseUrl}${cleanPath}`;
  }

  return `${baseUrl}/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

export function getSeoAlternates(path: string, currentLocale: string): {
  canonical: string;
  languages: {
    en: string;
    ar: string;
    'x-default': string;
  };
} {
  const baseUrl = getBaseUrl();
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Strip leading locale prefix if present to obtain relative subpath
  if (normalizedPath.startsWith('/en/')) {
    normalizedPath = normalizedPath.replace(/^\/en/, '');
  } else if (normalizedPath === '/en') {
    normalizedPath = '';
  } else if (normalizedPath.startsWith('/ar/')) {
    normalizedPath = normalizedPath.replace(/^\/ar/, '');
  } else if (normalizedPath === '/ar') {
    normalizedPath = '';
  }

  const subpath = normalizedPath === '/' ? '' : normalizedPath;
  const enUrl = `${baseUrl}/en${subpath}`;
  const arUrl = `${baseUrl}/ar${subpath}`;
  const canonical = currentLocale === 'ar' ? arUrl : enUrl;

  return {
    canonical,
    languages: {
      en: enUrl,
      ar: arUrl,
      'x-default': enUrl,
    },
  };
}

export interface LocalBusinessSchemaOptions {
  locale?: string;
  name?: string;
  description?: string;
  url?: string;
  telephone?: string;
  email?: string;
}

export function buildLocalBusinessSchema(options?: LocalBusinessSchemaOptions) {
  const baseUrl = getBaseUrl();
  const isAr = options?.locale === 'ar';

  return {
    '@context': 'https://schema.org',
    '@type': ['EntertainmentBusiness', 'LocalBusiness', 'Organization'],
    name: isAr
      ? 'إيفنتس آند إنترتينمنت إنتربرايزس (إي ثري قطر)'
      : 'Events & Entertainment Enterprises (E3 Qatar)',
    alternateName: [
      'Events & Entertainment Enterprises',
      'E3 Qatar',
      'E3',
      'إيفنتس آند إنترتينمنت إنتربرايزس',
      'إي ثري',
      'إي ثري قطر',
      'إي ثري للفعاليات والترفيه',
    ],
    description: isAr
      ? 'الشركة الرائدة في قطر لتنظيم وإدارة الفعاليات والمؤتمرات والمعارض وتطوير الوجهات الترفيهية العائلية بالدوحة.'
      : "Qatar's premier event management company, corporate event organizer, stage engineering expert, and entertainment destination operator in Doha.",
    url: options?.url || (isAr ? `${baseUrl}/ar` : `${baseUrl}/en`),
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/og-image-default.jpg`,
    telephone: options?.telephone || '+974 3048 9955',
    email: options?.email || 'info@eeeqa.com',
    priceRange: '$$',
    currenciesAccepted: 'QAR, USD',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Palm Tower B, 36th Floor, Office 3602, West Bay',
      addressLocality: 'Doha',
      addressRegion: 'Doha',
      addressCountry: 'QA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.3217,
      longitude: 51.5310,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '09:00',
        closes: '22:00',
      },
    ],
    areaServed: [
      {
        '@type': 'Country',
        name: 'Qatar',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Doha',
      },
      {
        '@type': 'Country',
        name: 'Saudi Arabia',
      },
      {
        '@type': 'Country',
        name: 'United Arab Emirates',
      },
    ],
    sameAs: [
      'https://www.linkedin.com/company/e3qatar',
      'https://www.instagram.com/e3qatar',
      'https://www.facebook.com/e3qatar',
      'https://x.com/e3qatar',
      'https://www.youtube.com/@e3qatar',
    ],
  };
}
