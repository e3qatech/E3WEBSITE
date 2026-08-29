import type { NextConfig } from 'next';
import createBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'booking.e3.qa' },
      { protocol: 'https', hostname: 'cdn.e3.qa' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://prod.spline.design https://my.spline.design https://*.spline.design https://vercel.live https://www.youtube.com https://s.ytimg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://booking.e3.qa https://cdn.e3.qa https://images.unsplash.com https://*.public.blob.vercel-storage.com https://i.ytimg.com https://*.ytimg.com https://my.spline.design https://prod.spline.design https://*.spline.design; font-src 'self' data:; connect-src 'self' https: wss: https://vercel.live https://*.vercel.live https://my.spline.design https://prod.spline.design https://*.spline.design; frame-src 'self' https://vercel.live https://*.vercel.live https://booking.e3.qa https://my.spline.design https://prod.spline.design https://*.spline.design https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com https://*.youtube.com https://*.youtube-nocookie.com https://player.vimeo.com https://vimeo.com https://*.vimeo.com; media-src 'self' data: blob: https://assets.mixkit.co https://*.public.blob.vercel-storage.com https://cdn.e3.qa https://booking.e3.qa https://my.spline.design https://prod.spline.design https://*.spline.design; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      // 0. Urban Arena Canonical Public Slug Migration
      {
        source: '/:locale(en|ar)/b2c/attractions/urban-arena-doha-mall',
        destination: '/:locale/b2c/attractions/urban-arena',
        permanent: true,
      },
      {
        source: '/b2c/attractions/urban-arena-doha-mall',
        destination: '/en/b2c/attractions/urban-arena',
        permanent: true,
      },

      // 0. Balloon Parade Duplicate Case Study 301 Consolidation (QF-13-C)
      {
        source: '/:locale(en|ar)/b2b/cases/doha-balloon-parade',
        destination: '/:locale/b2b/case-studies/doha-balloon-parade-2022',
        permanent: true,
      },
      {
        source: '/b2b/cases/doha-balloon-parade',
        destination: '/en/b2b/case-studies/doha-balloon-parade-2022',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/b2b/case-studies/doha-balloon-parade',
        destination: '/:locale/b2b/case-studies/doha-balloon-parade-2022',
        permanent: true,
      },
      {
        source: '/b2b/case-studies/doha-balloon-parade',
        destination: '/en/b2b/case-studies/doha-balloon-parade-2022',
        permanent: true,
      },

      // 1. Case Studies Canonical Aliases (QF-05 Canonical Migration)
      {
        source: '/:locale(en|ar)/b2b/cases',
        destination: '/:locale/b2b/case-studies',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/b2b/cases/:slug',
        destination: '/:locale/b2b/case-studies/:slug',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/cases',
        destination: '/:locale/b2b/case-studies',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/cases/:slug',
        destination: '/:locale/b2b/case-studies/:slug',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/case-studies',
        destination: '/:locale/b2b/case-studies',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/case-studies/:slug',
        destination: '/:locale/b2b/case-studies/:slug',
        permanent: true,
      },

      // 2. Services Aliases & Canonical Routing
      {
        source: '/:locale(en|ar)/b2b/services/fec',
        destination: '/:locale/b2b/services/fec-development',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/b2b/services/family-entertainment-centers',
        destination: '/:locale/b2b/services/fec-development',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/services/fec',
        destination: '/:locale/b2b/services/fec-development',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/services/family-entertainment-centers',
        destination: '/:locale/b2b/services/fec-development',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/b2b/services/design-research',
        destination: '/:locale/b2b/services/feasibility-design-research',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/b2b/services/e3-rentals',
        destination: '/:locale/b2b/services/av-stage-rentals',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/services',
        destination: '/:locale/b2b/services',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/services/:slug',
        destination: '/:locale/b2b/services/:slug',
        permanent: true,
      },

      // 3. Contact & Partner Contact Aliases
      {
        source: '/partners-contact',
        destination: '/en/b2b/contact',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/partners-contact',
        destination: '/:locale/b2b/contact',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/b2b/rfp',
        destination: '/:locale/b2b/contact',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/contact/b2b',
        destination: '/:locale/b2b/contact',
        permanent: true,
      },

      // 4. B2C Attractions, Calendar, Support Aliases
      {
        source: '/:locale(en|ar)/attractions',
        destination: '/:locale/b2c/attractions',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/attractions/:slug',
        destination: '/:locale/b2c/attractions/:slug',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/calendar',
        destination: '/:locale/b2c/calendar',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/events',
        destination: '/:locale/b2c/calendar',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/b2c/events',
        destination: '/:locale/b2c/calendar',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/contact/b2c',
        destination: '/:locale/b2c/contact',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/support',
        destination: '/:locale/b2c/contact',
        permanent: true,
      },

      // 5. Social Media Manager Legacy Route Redirects
      {
        source: '/admin/social-media',
        destination: '/en/dashboard/social-media',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/admin/social-media',
        destination: '/:locale/dashboard/social-media',
        permanent: true,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
};

export default withBundleAnalyzer(nextConfig);
