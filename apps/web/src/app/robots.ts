import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa'

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/en/',
        '/ar/',
        '/b2c/',
        '/b2b/'
      ],
      disallow: [
        '/api/',
        '/dashboard/',
        '/auth/',
        '/private/',
        '/*.json$'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
