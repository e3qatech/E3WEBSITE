import React from 'react';

type SchemaType = 
  | 'Organization' 
  | 'WebSite' 
  | 'LocalBusiness' 
  | 'Service' 
  | 'Event' 
  | 'FAQPage' 
  | 'Person' 
  | 'BreadcrumbList';

interface SEOProps {
  type: SchemaType;
  data: Record<string, any>;
}

export function SEO({ type, data }: SEOProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
