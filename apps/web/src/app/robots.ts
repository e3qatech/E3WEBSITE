import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://e3.qa';
  const isProduction =
    process.env.VERCEL_ENV === 'production' ||
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ||
    (!process.env.VERCEL_ENV && process.env.NODE_ENV === 'production');

  if (!isProduction) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/auth/', '/candidate/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
