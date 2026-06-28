import { MetadataRoute } from 'next';
import db from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa';

  // 1. Static Routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: {
          en: `${baseUrl}/en`,
          ar: `${baseUrl}/ar`,
        },
      },
    },
    {
      url: `${baseUrl}/b2b`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/en/b2b`,
          ar: `${baseUrl}/ar/b2b`,
        },
      },
    },
    {
      url: `${baseUrl}/b2c`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/en/b2c`,
          ar: `${baseUrl}/ar/b2c`,
        },
      },
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: {
          en: `${baseUrl}/en/auth/login`,
          ar: `${baseUrl}/ar/auth/login`,
        },
      },
    },
  ];

  try {
    // 2. Fetch Dynamic Routes
    const [attractions, services, caseStudies, teamMembers, events] = await Promise.all([
      db.attractions.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
      db.services.findMany({ where: { isVisible: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
      db.caseStudies.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
      db.teamMembers.findMany({ where: { isPublished: true }, select: { id: true, updatedAt: true } }).catch(() => []),
      db.calendarEvents.findMany({ where: { isPublished: true }, select: { id: true, updatedAt: true } }).catch(() => []),
    ]);

    // 3. Map Dynamic Routes to Sitemap
    const dynamicRoutes: MetadataRoute.Sitemap = [
      ...attractions.map((item) => ({
        url: `${baseUrl}/b2c/attractions/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: {
            en: `${baseUrl}/en/b2c/attractions/${item.slug}`,
            ar: `${baseUrl}/ar/b2c/attractions/${item.slug}`,
          },
        },
      })),
      ...services.map((item) => ({
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
      ...caseStudies.map((item) => ({
        url: `${baseUrl}/b2b/case-studies/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: {
          languages: {
            en: `${baseUrl}/en/b2b/case-studies/${item.slug}`,
            ar: `${baseUrl}/ar/b2b/case-studies/${item.slug}`,
          },
        },
      })),
      ...teamMembers.map((item) => ({
        url: `${baseUrl}/b2b/team/${item.id}`,
        lastModified: item.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
        alternates: {
          languages: {
            en: `${baseUrl}/en/b2b/team/${item.id}`,
            ar: `${baseUrl}/ar/b2b/team/${item.id}`,
          },
        },
      })),
      ...events.map((item) => ({
        url: `${baseUrl}/b2c/events/${item.id}`,
        lastModified: item.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.7,
        alternates: {
          languages: {
            en: `${baseUrl}/en/b2c/events/${item.id}`,
            ar: `${baseUrl}/ar/b2c/events/${item.id}`,
          },
        },
      })),
    ];

    return [...routes, ...dynamicRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Graceful degradation: return just static routes if DB fails
    return routes;
  }
}
