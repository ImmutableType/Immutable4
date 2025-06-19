// components/locations/schema/LocationNewsSchema.tsx
import React from 'react';
import Head from 'next/head';

interface LocationNewsSchemaProps {
  articles: any[];
  city: string;
  state: string;
}

export const LocationNewsSchema: React.FC<LocationNewsSchemaProps> = ({ articles, city, state }) => {
  // Create JSON-LD structured data for news articles
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': articles.map((article, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'NewsArticle',
        'headline': article.title,
        'description': article.summary,
        'image': article.imageUrl || '',
        'datePublished': article.createdAt,
        'dateModified': article.updatedAt || article.createdAt,
        'author': {
          '@type': 'Person',
          'name': article.authorName || 'Unknown',
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'ImmutableType',
          'logo': {
            '@type': 'ImageObject',
            'url': '/typewriter-logo.png'
          }
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': `https://immutable3-aooutvlo3-immutabletypes-projects.vercel.app/locations/${state}/${city}/news/${article.id}`
        },
        'articleSection': article.category,
        'keywords': article.tags ? article.tags.join(', ') : '',
        'isAccessibleForFree': 'True'
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