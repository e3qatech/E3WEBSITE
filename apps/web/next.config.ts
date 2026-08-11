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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://prod.spline.design https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://booking.e3.qa https://cdn.e3.qa https://images.unsplash.com https://*.public.blob.vercel-storage.com; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'self' https://booking.e3.qa https://my.spline.design https://www.youtube.com https://player.vimeo.com; media-src 'self' data: blob: https://assets.mixkit.co https://*.public.blob.vercel-storage.com https://cdn.e3.qa https://booking.e3.qa; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
};

export default withBundleAnalyzer(nextConfig);
