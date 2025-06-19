// lib/locations/seo/mobileOptimizer.ts
/**
 * Mobile-first optimization utilities
 */
export const mobileOptimizer = {
    /**
     * Get responsive image sizes for different screen widths
     */
    getResponsiveImageSizes(baseUrl: string): string {
      return `${baseUrl}?w=480 480w, ${baseUrl}?w=768 768w, ${baseUrl}?w=1024 1024w, ${baseUrl}?w=1280 1280w`;
    },
    
    /**
     * Get optimal image dimensions for different components
     */
    getImageDimensions(componentType: 'card' | 'hero' | 'thumbnail'): { width: number, height: number } {
      switch (componentType) {
        case 'hero':
          return { width: 1280, height: 640 };
        case 'card':
          return { width: 480, height: 320 };
        case 'thumbnail':
          return { width: 120, height: 120 };
        default:
          return { width: 480, height: 320 };
      }
    },
    
    /**
     * Get mobile-optimized CSS classes
     */
    getMobileClasses(componentType: string): string {
      const baseClasses = 'w-full';
      
      switch (componentType) {
        case 'articleCard':
          return `${baseClasses} md:w-1/2 lg:w-1/3 p-2`;
        case 'profileCard':
          return `${baseClasses} md:w-1/2 lg:w-1/4 p-2`;
        case 'proposalCard':
          return `${baseClasses} md:w-1/2 lg:w-1/3 p-2`;
        case 'articleContent':
          return `${baseClasses} max-w-prose mx-auto px-4`;
        default:
          return baseClasses;
      }
    }
  };