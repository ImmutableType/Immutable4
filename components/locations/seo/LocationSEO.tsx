// components/locations/seo/LocationSEO.tsx
'use client'
import React from 'react';
import Head from 'next/head';
import { schemaGenerator } from '../../../lib/locations/seo/schemaGenerator';
import { metadataService } from '../../../lib/locations/seo/metadataService';

interface LocationSEOProps {
  city: string;
  state: string;
  section?: string;
  itemTitle?: string;
  type?: 'landing' | 'news' | 'journalists' | 'proposals' | 'community';
  data?: any;
}

export const LocationSEO: React.FC<LocationSEOProps> = ({ 
  city, 
  state, 
  section, 
  itemTitle,
  type = 'landing',
  data
}) => {
  // Get metadata for the page
  const metadata = metadataService.getLocationPageMetadata(city, state, section, itemTitle);
  
  // Generate appropriate schema based on page type
  let schema: any;
  
  switch (type) {
    case 'landing':
      schema = schemaGenerator.generateLocalBusinessSchema(city, state);
      break;
    case 'news':
      // For news list, include breadcrumbs and section info
      schema = [
        schemaGenerator.generateBreadcrumbSchema(city, state, section, itemTitle),
        // Additional news list schema could be added here
      ];
      break;
    case 'journalists':
      // For journalists list, include breadcrumbs and section info
      schema = [
        schemaGenerator.generateBreadcrumbSchema(city, state, section, itemTitle),
        // Additional journalists list schema could be added here
      ];
      break;
    case 'proposals':
      // For proposals list, include breadcrumbs and section info
      schema = [
        schemaGenerator.generateBreadcrumbSchema(city, state, section, itemTitle),
        // Additional proposals list schema could be added here
      ];
      break;
    case 'community':
      // For community curation, include breadcrumbs and section info
      schema = [
        schemaGenerator.generateBreadcrumbSchema(city, state, section, itemTitle),
        // Additional community curation schema could be added here
      ];
      break;
    default:
      schema = schemaGenerator.generateBreadcrumbSchema(city, state, section, itemTitle);
  }
  
  return (
    <Head>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <link rel="canonical" href={metadata.canonical} />
      
      {/* Open Graph metadata */}
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:url" content={metadata.canonical} />
      <meta property="og:image" content={metadata.ogImage} />
      <meta property="og:type" content={metadata.ogType} />
      
      {/* Twitter card metadata */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:image" content={metadata.ogImage} />
      
      {/* Mobile optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#B3211E" />
      
      {/* Location-specific metadata */}
      <meta name="geo.placename" content={`${city}, ${state}`} />
      <meta name="geo.region" content={`US-${state.substring(0, 2).toUpperCase()}`} />
      
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </Head>
  );
};