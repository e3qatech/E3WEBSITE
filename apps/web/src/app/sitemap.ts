import { MetadataRoute } from 'next'

// In a real app, these would come from your CMS/Database
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Mock fetching dynamic data
  const attractions = ['winter-wonderland', 'lusail-boulevard', 'doha-quest']
  const services = ['event-engineering', 'immersive-installations', 'talent-management']
  const caseStudies = ['world-cup-2022', 'qatar-economic-forum']

  const languages = ['en', 'ar']

  const generateAlternates = (path: string) => {
    return {
      languages: {
        'en': `${baseUrl}/en${path}`,
        'ar': `${baseUrl}/ar${path}`,
      }
    }
  }

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/b2c',
    '/b2c/tickets',
    '/b2c/contact',
    '/b2b',
    '/b2b/services',
    '/b2b/case-studies',
    '/b2b/contact',
  ].map((route) => ({
    url: `${baseUrl}/en${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
    alternates: generateAlternates(route)
  }))

  // 2. Dynamic Routes (Attractions)
  const attractionRoutes = attractions.map((slug) => ({
    url: `${baseUrl}/en/b2c/attractions/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
    alternates: generateAlternates(`/b2c/attractions/${slug}`)
  }))

  // 3. Dynamic Routes (Services)
  const serviceRoutes = services.map((slug) => ({
    url: `${baseUrl}/en/b2b/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
    alternates: generateAlternates(`/b2b/services/${slug}`)
  }))

  // 4. Dynamic Routes (Case Studies)
  const caseStudyRoutes = caseStudies.map((slug) => ({
    url: `${baseUrl}/en/b2b/case-studies/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    alternates: generateAlternates(`/b2b/case-studies/${slug}`)
  }))

  return [
    ...staticRoutes,
    ...attractionRoutes,
    ...serviceRoutes,
    ...caseStudyRoutes
  ]
}
