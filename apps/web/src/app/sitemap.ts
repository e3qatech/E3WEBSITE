import { MetadataRoute } from 'next';
import db from '@/lib/db';
import { getPublicCaseStudies } from '@/lib/case-studies';
import { getBaseUrl } from '@/lib/seo-helper';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // 1. Published Public Static Subpaths (B2B, B2C, Creators, Legal)
  // NOTE: Bare unlocalized paths (/b2b, /b2c) are strictly omitted because they 308-redirect to localized URLs.
  // We list direct 200-OK canonical EN and AR entries with full bidirectional hreflang alternates.
  const staticPathList = [
    { path: '/b2b', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/b2b/services', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/b2b/case-studies', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/b2b/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/b2b/careers', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/b2b/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/b2b/discover', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/b2c', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/b2c/attractions', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/b2c/calendar', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/b2c/packages', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/b2c/discover', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/b2c/insights', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/b2c/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/creators', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/creators/apply', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/careers', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/privacy', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/terms', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  // Root entry (eeeqa.com) + explicit localized root entries (/en, /ar)
  const now = new Date();
  const rootRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1.0,
      alternates: {
        languages: {
          en: `${baseUrl}/en`,
          ar: `${baseUrl}/ar`,
          'x-default': `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1.0,
      alternates: {
        languages: {
          en: `${baseUrl}/en`,
          ar: `${baseUrl}/ar`,
          'x-default': `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/ar`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1.0,
      alternates: {
        languages: {
          en: `${baseUrl}/en`,
          ar: `${baseUrl}/ar`,
          'x-default': `${baseUrl}/en`,
        },
      },
    },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPathList.flatMap((item) => [
    {
      url: `${baseUrl}/en${item.path}`,
      lastModified: now,
      changeFrequency: item.changeFrequency,
      priority: item.priority,
      alternates: {
        languages: {
          en: `${baseUrl}/en${item.path}`,
          ar: `${baseUrl}/ar${item.path}`,
          'x-default': `${baseUrl}/en${item.path}`,
        },
      },
    },
    {
      url: `${baseUrl}/ar${item.path}`,
      lastModified: now,
      changeFrequency: item.changeFrequency,
      priority: item.priority,
      alternates: {
        languages: {
          en: `${baseUrl}/en${item.path}`,
          ar: `${baseUrl}/ar${item.path}`,
          'x-default': `${baseUrl}/en${item.path}`,
        },
      },
    },
  ]);

  try {
    const [attractions, services, caseStudies, packages, teamMembers] = await Promise.all([
      db?.attraction?.findMany ? db.attraction.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }).catch(() => []) : Promise.resolve([]),
      db?.service?.findMany ? db.service.findMany({ where: { isVisible: true }, select: { slug: true, updatedAt: true } }).catch(() => []) : Promise.resolve([]),
      getPublicCaseStudies({ select: { slug: true, updatedAt: true } }).catch(() => []),
      db?.package?.findMany ? db.package.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }).catch(() => []) : Promise.resolve([]),
      db?.employeeProfile?.findMany ? db.employeeProfile.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }).catch(() => []) : Promise.resolve([]),
    ]);

    // 3. Map Dynamic Routes to Sitemap with explicit EN/AR pairs
    const dynamicRoutes: MetadataRoute.Sitemap = [
      ...attractions.flatMap((item: any) => {
        const canonicalSlug = item.slug === 'urban-arena-doha-mall' ? 'urban-arena' : item.slug;
        return [
          {
            url: `${baseUrl}/en/b2c/attractions/${canonicalSlug}`,
            lastModified: item.updatedAt || now,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
            alternates: {
              languages: {
                en: `${baseUrl}/en/b2c/attractions/${canonicalSlug}`,
                ar: `${baseUrl}/ar/b2c/attractions/${canonicalSlug}`,
                'x-default': `${baseUrl}/en/b2c/attractions/${canonicalSlug}`,
              },
            },
          },
          {
            url: `${baseUrl}/ar/b2c/attractions/${canonicalSlug}`,
            lastModified: item.updatedAt || now,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
            alternates: {
              languages: {
                en: `${baseUrl}/en/b2c/attractions/${canonicalSlug}`,
                ar: `${baseUrl}/ar/b2c/attractions/${canonicalSlug}`,
                'x-default': `${baseUrl}/en/b2c/attractions/${canonicalSlug}`,
              },
            },
          },
        ];
      }),
      ...services.flatMap((item: any) => [
        {
          url: `${baseUrl}/en/b2b/services/${item.slug}`,
          lastModified: item.updatedAt || now,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
          alternates: {
            languages: {
              en: `${baseUrl}/en/b2b/services/${item.slug}`,
              ar: `${baseUrl}/ar/b2b/services/${item.slug}`,
              'x-default': `${baseUrl}/en/b2b/services/${item.slug}`,
            },
          },
        },
        {
          url: `${baseUrl}/ar/b2b/services/${item.slug}`,
          lastModified: item.updatedAt || now,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
          alternates: {
            languages: {
              en: `${baseUrl}/en/b2b/services/${item.slug}`,
              ar: `${baseUrl}/ar/b2b/services/${item.slug}`,
              'x-default': `${baseUrl}/en/b2b/services/${item.slug}`,
            },
          },
        },
      ]),
      ...caseStudies.flatMap((item: any) => [
        {
          url: `${baseUrl}/en/b2b/case-studies/${item.slug}`,
          lastModified: item.updatedAt || now,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
          alternates: {
            languages: {
              en: `${baseUrl}/en/b2b/case-studies/${item.slug}`,
              ar: `${baseUrl}/ar/b2b/case-studies/${item.slug}`,
              'x-default': `${baseUrl}/en/b2b/case-studies/${item.slug}`,
            },
          },
        },
        {
          url: `${baseUrl}/ar/b2b/case-studies/${item.slug}`,
          lastModified: item.updatedAt || now,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
          alternates: {
            languages: {
              en: `${baseUrl}/en/b2b/case-studies/${item.slug}`,
              ar: `${baseUrl}/ar/b2b/case-studies/${item.slug}`,
              'x-default': `${baseUrl}/en/b2b/case-studies/${item.slug}`,
            },
          },
        },
      ]),
      ...packages
        .filter((item: any) => Boolean(item.slug))
        .flatMap((item: any) => [
          {
            url: `${baseUrl}/en/b2c/packages/${item.slug}`,
            lastModified: item.updatedAt || now,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
            alternates: {
              languages: {
                en: `${baseUrl}/en/b2c/packages/${item.slug}`,
                ar: `${baseUrl}/ar/b2c/packages/${item.slug}`,
                'x-default': `${baseUrl}/en/b2c/packages/${item.slug}`,
              },
            },
          },
          {
            url: `${baseUrl}/ar/b2c/packages/${item.slug}`,
            lastModified: item.updatedAt || now,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
            alternates: {
              languages: {
                en: `${baseUrl}/en/b2c/packages/${item.slug}`,
                ar: `${baseUrl}/ar/b2c/packages/${item.slug}`,
                'x-default': `${baseUrl}/en/b2c/packages/${item.slug}`,
              },
            },
          },
        ]),
      ...teamMembers
        .filter((item: any) => Boolean(item.slug))
        .flatMap((item: any) => [
          {
            url: `${baseUrl}/en/b2b/team/${item.slug}`,
            lastModified: item.updatedAt || now,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
            alternates: {
              languages: {
                en: `${baseUrl}/en/b2b/team/${item.slug}`,
                ar: `${baseUrl}/ar/b2b/team/${item.slug}`,
                'x-default': `${baseUrl}/en/b2b/team/${item.slug}`,
              },
            },
          },
          {
            url: `${baseUrl}/ar/b2b/team/${item.slug}`,
            lastModified: item.updatedAt || now,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
            alternates: {
              languages: {
                en: `${baseUrl}/en/b2b/team/${item.slug}`,
                ar: `${baseUrl}/ar/b2b/team/${item.slug}`,
                'x-default': `${baseUrl}/en/b2b/team/${item.slug}`,
              },
            },
          },
        ]),
    ];

    return [...rootRoutes, ...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [...rootRoutes, ...staticRoutes];
  }
}
