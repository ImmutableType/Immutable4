// components/locations/schema/LocationProposalSchema.tsx
import React from 'react';
import Head from 'next/head';

interface LocationProposalSchemaProps {
  proposals: any[];
  city: string;
  state: string;
}

export const LocationProposalSchema: React.FC<LocationProposalSchemaProps> = ({ proposals, city, state }) => {
  // Create JSON-LD structured data for news proposals
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': proposals.map((proposal, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Event',
        'name': proposal.title,
        'description': proposal.summary,
        'image': proposal.imageUrl || '',
        'startDate': proposal.createdAt,
        'endDate': proposal.timeline?.endDate || '',
        'organizer': {
          '@type': 'Person',
          'name': proposal.proposerName || 'Community Member'
        },
        'location': {
          '@type': 'Place',
          'name': `${city}, ${state}`,
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': city,
            'addressRegion': state,
            'addressCountry': 'US'
          }
        },
        'offers': {
          '@type': 'Offer',
          'price': proposal.fundingGoal,
          'priceCurrency': 'USD',
          'availability': proposal.status === 'active' ? 'InStock' : 'SoldOut'
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': `https://immutable3-aooutvlo3-immutabletypes-projects.vercel.app/locations/${state}/${city}/proposals/${proposal.id}`
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