// lib/locations/seo/schemaGenerator.ts
/**
 * Generate schema.org JSON-LD for location pages
 */
export const schemaGenerator = {
    /**
     * Generate LocalBusiness schema for city landing page
     */
    generateLocalBusinessSchema(city: string, state: string) {
      return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': `ImmutableType ${city}`,
        'description': `Local news, journalists, and community proposals for ${city}, ${state}`,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': city,
          'addressRegion': state,
          'addressCountry': 'US'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': 0, // Would be populated with actual coordinates
          'longitude': 0
        },
        'url': `https://immutable3-aooutvlo3-immutabletypes-projects.vercel.app/locations/${state.toLowerCase()}/${city.toLowerCase()}`,
        'telephone': '',
        'openingHoursSpecification': {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
          ],
          'opens': '00:00',
          'closes': '23:59'
        }
      };
    },
    
    /**
     * Generate BreadcrumbList schema for navigation
     */
    generateBreadcrumbSchema(city: string, state: string, subsection?: string, itemTitle?: string) {
      const items = [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://immutable3-aooutvlo3-immutabletypes-projects.vercel.app/'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Locations',
          'item': 'https://immutable3-aooutvlo3-immutabletypes-projects.vercel.app/locations'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': state,
          'item': `https://immutable3-aooutvlo3-immutabletypes-projects.vercel.app/locations/${state.toLowerCase()}`
        },
        {
          '@type': 'ListItem',
          'position': 4,
          'name': city,
          'item': `https://immutable3-aooutvlo3-immutabletypes-projects.vercel.app/locations/${state.toLowerCase()}/${city.toLowerCase()}`
        }
      ];
      
      if (subsection) {
        items.push({
          '@type': 'ListItem',
          'position': 5,
          'name': subsection,
          'item': `https://immutable3-aooutvlo3-immutabletypes-projects.vercel.app/locations/${state.toLowerCase()}/${city.toLowerCase()}/${subsection.toLowerCase()}`
        });
      }
      
      if (itemTitle) {
        items.push({
          '@type': 'ListItem',
          'position': subsection ? 6 : 5,
          'name': itemTitle,
          'item': '' // Current page, no URL needed
        });
      }
      
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items
      };
    }
  };