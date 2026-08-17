import { MetadataRoute } from 'next';
import db from '@/lib/db';
import { getPublicCaseStudies } from '@/lib/case-studies';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa';

  // 1. Published Public Static Routes
  const staticPathList = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/b2b', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/b2b/services', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/b2b/cases', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/b2b/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/b2b/careers', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/b2b/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/b2c', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/b2c/attractions', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/b2c/calendar', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/b2c/tickets', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/b2c/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/careers', priority: 0.7, changeFrequency: 'weekly' as const },
  ];

  const routes: MetadataRoute.Sitemap = staticPathList.map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
    alternates: {
      languages: {
        en: `${baseUrl}/en${item.path}`,
        ar: `${baseUrl}/ar${item.path}`,
      },
    },
  }));

  try {
    // 2. Fetch Published Dynamic Routes (QF-05, QF-24)
    const [attractions, services, caseStudies, teamMembers] = await Promise.all([
      db.attraction.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
      db.service.findMany({ where: { isVisible: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
      getPublicCaseStudies({ select: { slug: true, updatedAt: true } }).catch(() => []),
      db.employeeProfile.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
    ]);

    // 3. Map Dynamic Routes to Sitemap
    const dynamicRoutes: MetadataRoute.Sitemap = [
      ...attractions.map((item: any) => {
        const canonicalSlug = item.slug === 'urban-arena-doha-mall' ? 'urban-arena' : item.slug
        return {
          url: `${baseUrl}/en/b2c/attractions/${canonicalSlug}`,
          lastModified: item.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
          alternates: {
            languages: {
              en: `${baseUrl}/en/b2c/attractions/${canonicalSlug}`,
              ar: `${baseUrl}/ar/b2c/attractions/${canonicalSlug}`,
              'x-default': `${baseUrl}/en/b2c/attractions/${canonicalSlug}`,
            },
          },
        }
      }),
      ...services.map((item: any) => ({
        url: `${baseUrl}/b2b/services/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates: {
          languages: {
            en: `${baseUrl}/en/b2b/services/${item.slug}`,
            ar: `${baseUrl}/ar/b2b/services/${item.slug}`,
          },
        },
      })),
      ...caseStudies.map((item: any) => ({
        url: `${baseUrl}/b2b/cases/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: {
          languages: {
            en: `${baseUrl}/en/b2b/cases/${item.slug}`,
            ar: `${baseUrl}/ar/b2b/cases/${item.slug}`,
          },
        },
      })),
      ...teamMembers
        .filter((item: any) => Boolean(item.slug))
        .flatMap((item: any) => [
          {
            url: `${baseUrl}/en/b2b/team/${item.slug}`,
            lastModified: item.updatedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
            alternates: {
              languages: {
                en: `${baseUrl}/en/b2b/team/${item.slug}`,
                ar: `${baseUrl}/ar/b2b/team/${item.slug}`,
              },
            },
          },
          {
            url: `${baseUrl}/ar/b2b/team/${item.slug}`,
            lastModified: item.updatedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
            alternates: {
              languages: {
                en: `${baseUrl}/en/b2b/team/${item.slug}`,
                ar: `${baseUrl}/ar/b2b/team/${item.slug}`,
              },
            },
          },
        ]),
    ];

    return [...routes, ...dynamicRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
