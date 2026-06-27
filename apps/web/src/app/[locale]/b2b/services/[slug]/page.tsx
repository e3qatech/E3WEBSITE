import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ServiceDetailClient } from '@/components/b2b/ServiceDetailClient';
import type { Metadata, ResolvingMetadata } from 'next';
import React from 'react';

// Next.js 15 requires params to be a Promise
type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  
  const service = await db.service.findUnique({
    where: { slug, isVisible: true },
    select: { titleEn: true, taglineEn: true, seo: true, thumbnail: true }
  });

  if (!service) {
    return { title: 'Not Found' };
  }

  const seo = service.seo as any;
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: seo?.metaTitle || `${service.titleEn} | E3 Qatar`,
    description: seo?.metaDescription || service.taglineEn,
    keywords: seo?.keywords || [],
    openGraph: {
      images: service.thumbnail ? [service.thumbnail, ...previousImages] : previousImages,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  // We can fetch data directly in Server Components
  const service = await db.service.findUnique({
    where: { slug, isVisible: true },
    include: {
      gallery: {
        orderBy: { orderIndex: 'asc' },
      },
      projects: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!service) {
    notFound();
  }

  // Generate JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.titleEn,
    description: service.taglineEn || '',
    provider: {
      '@type': 'Organization',
      name: 'E3 Qatar',
      url: 'https://e3.qa'
    },
    url: `https://e3.qa/b2b/services/${service.slug}`,
    image: service.thumbnail || ''
  };

  return (
    <>
      {/* Inject JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[var(--surface-default)]">
        <ServiceDetailClient service={service} />
      </main>
    </>
  );
}
