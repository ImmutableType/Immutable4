// lib/locations/seo/urlOptimizer.ts
import { Article } from '../../reader/types/article';

export const urlOptimizer = {
  extractIdFromSlug(slug: string): string {
    const parts = slug.split('-');
    return parts[0] || slug;
  },

  // Generate URL-friendly slug from title
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')         // Spaces to hyphens
      .replace(/-+/g, '-')          // Multiple hyphens to single
      .replace(/^-|-$/g, '')        // Remove leading/trailing hyphens
      .trim();
  },

  // Parse location string to URL path
  parseLocationToPath(locationString: string): { state: string; city: string } | null {
    if (!locationString) return null;
    
    const parts = locationString.split(',').map(part => part.trim());
    if (parts.length < 2) return null;
    
    const city = parts[0].toLowerCase().replace(/\s+/g, '-');
    let state = parts[1].toLowerCase();
    
    // Handle state abbreviations (Miami-focused for now)
    const stateMap: Record<string, string> = {
      'fl': 'florida',
      'florida': 'florida',
      'ca': 'california', 
      'california': 'california',
      'tx': 'texas',
      'texas': 'texas',
      'ny': 'new-york',
      'new york': 'new-york'
    };
    
    state = stateMap[state] || state.replace(/\s+/g, '-');
    
    return { state, city };
  },

  // Map contract categories to URL paths
  mapCategoryToUrl(category: string): string {
    const categoryMap: Record<string, string> = {
      'News': 'general',
      'Politics': 'government',
      'Business': 'business',
      'Sports': 'sports',
      'Tech': 'tech',
      'Technology': 'tech',
      'Entertainment': 'entertainment',
      'Health': 'health',
      'Science': 'science',
      'Opinion': 'opinion',
      'Investigative': 'investigative'
    };
    
    return categoryMap[category] || category.toLowerCase().replace(/\s+/g, '-');
  },

  // Build complete geographic URL for article
  buildGeographicUrl(article: Article): string | null {
    try {
      // Parse location
      const locationPath = this.parseLocationToPath(article.location);
      if (!locationPath) {
        console.log(`Invalid location for article ${article.id}:`, article.location);
        return null;
      }
      
      // For now, only support Miami
      if (locationPath.city !== 'miami' || locationPath.state !== 'florida') {
        console.log(`Non-Miami article ${article.id}, using fallback`);
        return null;
      }
      
      // Map category
      const categoryPath = this.mapCategoryToUrl(article.category);
      
      // Generate slug with article ID prefix for uniqueness
      const titleSlug = this.generateSlug(article.title);
      const slug = `${article.id}-${titleSlug}`;
      
      // Build URL
      return `/${locationPath.city}/news/${categoryPath}/${slug}`;
      
    } catch (error) {
      console.error(`Error building geographic URL for article ${article.id}:`, error);
      return null;
    }
  },

  // Extract article ID from geographic slug
  extractArticleIdFromSlug(slug: string): string {
    const parts = slug.split('-');
    return parts[0] || slug;
  },

  // Validate if city is supported
  isValidCity(city: string): boolean {
    // For MVP, only Miami is supported
    return city.toLowerCase() === 'miami';
  },

  // ✅ UPDATED: Build breadcrumb data for article pages (FIXED URLS)
  buildArticleBreadcrumbs(city: string, state: string, category: string, title: string) {
    return [
      { name: 'Reader', href: '/reader' },
      { 
        name: `${state.charAt(0).toUpperCase() + state.slice(1)}`, 
        href: `/locations/${state.toLowerCase()}` // ✅ Fixed: Points to existing Florida page
      },
      { 
        name: `${city.charAt(0).toUpperCase() + city.slice(1)}, ${state.toUpperCase()}`, 
        href: `/locations/${state.toLowerCase()}/${city.toLowerCase()}` 
      },
      { name: this.getCategoryDisplayName(category), href: null }, // No link for category
      { name: title, href: null }
    ];
  },

  // Get display name for category
  getCategoryDisplayName(categoryPath: string): string {
    const displayMap: Record<string, string> = {
      'general': 'General News',
      'government': 'Government & Politics',
      'business': 'Business & Economy',
      'sports': 'Sports',
      'tech': 'Technology',
      'entertainment': 'Entertainment',
      'health': 'Health & Medicine',
      'science': 'Science',
      'opinion': 'Opinion & Editorial',
      'investigative': 'Investigative Journalism'
    };
    
    return displayMap[categoryPath] || categoryPath.charAt(0).toUpperCase() + categoryPath.slice(1);
  }
};