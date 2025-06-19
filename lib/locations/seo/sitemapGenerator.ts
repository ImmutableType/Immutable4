// lib/locations/seo/sitemapGenerator.ts
/**
 * Generate XML sitemaps for Google News
 */
export const sitemapGenerator = {
    /**
     * Generate a news sitemap XML string
     */
    generateNewsSitemap(articles: any[], baseUrl: string): string {
      // Calculate the publication date range (last 2 days for Google News)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      // Filter articles published in the last 2 days
      const recentArticles = articles.filter(article => {
        const publishDate = new Date(article.createdAt);
        return publishDate >= twoDaysAgo;
      });
      
      // Build the sitemap XML
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';
      
      recentArticles.forEach(article => {
        // Format the publication date in W3C format (YYYY-MM-DDThh:mm:ssTZD)
        const pubDate = new Date(article.createdAt).toISOString();
        
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${article.url}</loc>\n`;
        xml += '    <news:news>\n';
        xml += '      <news:publication>\n';
        xml += '        <news:name>ImmutableType</news:name>\n';
        xml += '        <news:language>en</news:language>\n';
        xml += '      </news:publication>\n';
        xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
        xml += `      <news:title>${this.escapeXml(article.title)}</news:title>\n`;
        xml += '    </news:news>\n';
        xml += '  </url>\n';
      });
      
      xml += '</urlset>';
      return xml;
    },
    
    /**
     * Escape special characters for XML
     */
    escapeXml(unsafe: string): string {
      return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
          default: return c;
        }
      });
    },
    
    /**
     * Generate a sitemap for a specific location
     */
    generateLocationSitemap(city: string, state: string, articles: any[]): string {
      const baseUrl = `https://immutable3-aooutvlo3-immutabletypes-projects.vercel.app/locations/${state.toLowerCase()}/${city.toLowerCase()}`;
      return this.generateNewsSitemap(articles, baseUrl);
    }
  };