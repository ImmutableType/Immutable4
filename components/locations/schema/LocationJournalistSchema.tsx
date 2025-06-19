// components/locations/schema/LocationJournalistSchema.tsx
import React from 'react';
import Head from 'next/head';

interface LocationJournalistSchemaProps {
  journalists: any[];
  city: string;
  state: string;
}

export const LocationJournalistSchema: React.FC<LocationJournalistSchemaProps> = ({ journalists, city, state }) => {
  // Create JSON-LD structured data for journalists
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': journalists.map((journalist, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Person',
        'name': journalist.name,
        'description': journalist.bio || '',
        'image': journalist.imageUrl || '',
        'jobTitle': 'Journalist',
        'worksFor': {
          '@type': 'Organization',
          'name': 'ImmutableType'
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': `https://immutable3-aooutvlo3-immutabletypes-projects.vercel.app/profile/${journalist.id}`
        },
        'knowsAbout': journalist.locations?.coverage?.map((c: { expertise: string }) => c.expertise) || [],
        'workLocation': {
          '@type': 'Place',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': city,
            'addressRegion': state,
            'addressCountry': 'US'
          }
        }
      }
    }))
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </Head>
  );
};