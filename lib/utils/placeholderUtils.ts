// lib/utils/placeholderUtils.ts
/**
 * Generates a visually appealing SVG placeholder image based on item properties
 * @param item Object with id and optional category
 * @returns Data URL containing SVG image
 */
export function getColorPlaceholder(item: { id: string, category?: string }): string {
    // Generate a hash from the item ID for consistent colors
    const hash = item.id.split('').reduce((hash: number, char: string) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0);
    
    // Use the hash to generate a vibrant HSL color
    const hue = Math.abs(hash % 360);
    const saturation = 80;
    const lightness = 65;
    const category = item.category || 'News';
    const initial = category.charAt(0).toUpperCase();
    
    // Create a more visually appealing SVG with gradient background
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:hsl(${hue}, ${saturation}%, ${lightness}%);stop-opacity:1" />
            <stop offset="100%" style="stop-color:hsl(${(hue + 40) % 360}, ${saturation}%, ${lightness - 20}%);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="200" fill="url(#grad)" rx="12" ry="12"/>
        <text x="200" y="105" font-family="Arial, sans-serif" font-size="90" 
              font-weight="bold" fill="rgba(255,255,255,0.8)" text-anchor="middle">
          ${initial}
        </text>
        <text x="200" y="160" font-family="Arial, sans-serif" font-size="24" 
              font-weight="500" fill="rgba(255,255,255,0.7)" text-anchor="middle">
          ${category.substring(0, 12)}${category.length > 12 ? '...' : ''}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }