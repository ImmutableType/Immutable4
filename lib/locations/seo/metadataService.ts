// lib/locations/seo/metadataService.ts
/**
 * Service for handling publication metadata
 */
export const metadataService = {
    /**
     * Format publication date with proper timezone
     */
    formatPublicationDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    },
    
    /**
     * Get article freshness indicator
     */
    getFreshnessIndicator(dateString: string): string {
      const publishDate = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 24) {
        return diffHours < 1 ? 'Just published' : `${diffHours} hours ago`;
      } else if (diffHours < 48) {
        return 'Yesterday';
      } else if (diffHours < 168) { // 7 days
        return `${Math.floor(diffHours / 24)} days ago`;
      } else {
        return '';
      }
    },
    
    /**
     * Get SEO metadata for location pages
     */
    getLocationPageMetadata(city: string, state: string, section?: string, itemTitle?: string) {
      const baseTitle = `${city}, ${state}`;
      let title = baseTitle;
      let description = `Local news, journalists, and community proposals for ${city}, ${state}`;
      
      if (section === 'news') {
        title = `Local News for ${baseTitle}`;
        description = `Stay informed with the latest local news and updates from ${city}, ${state}`;
      } else if (section === 'journalists') {
        title = `Local Journalists in ${baseTitle}`;
        description = `Meet the journalists covering local stories in ${city}, ${state}`;
      } else if (section === 'proposals') {
        title = `Community News Proposals for ${baseTitle}`;
        description = `Support and engage with community-driven journalism proposals in ${city}, ${state}`;
      }
      
      if (itemTitle) {
        title = `${itemTitle} | ${title}`;
      }
      
      return {
        title,
        description,
        canonical: `https://immutable3-aooutvlo3-immutabletypes-projects.vercel.app/locations/${state.toLowerCase()}/${city.toLowerCase()}${section ? '/' + section : ''}${itemTitle ? '' : ''}`,
        ogImage: '/typewriter-logo.png',
        ogType: section === 'news' ? 'article' : 'website'
      };
    }
  };