// lib/reader/services/unifiedArticleService.ts
// SIMPLIFIED: One job - display native articles using read service

import { Article } from '../types/article';
import { FeedFilters } from '../types/feed';
import EncryptedArticleReadService from '../../blockchain/contracts/EncryptedArticleReadService';

export class UnifiedArticleService {
  private encryptedReadService: EncryptedArticleReadService;

  constructor() {
    this.encryptedReadService = new EncryptedArticleReadService();
  }

  // ONE JOB: Get native articles using read service
  async getAllArticles(filters?: Partial<FeedFilters>): Promise<Article[]> {
    console.log('🔥 UNIFIED: Getting native articles only...');
    
    const articles: Article[] = [];
    
    // Check IDs 1-20 for native articles
    for (let i = 1; i <= 20; i++) {
      try {
        const raw = await this.encryptedReadService.getArticle(i);
        
        // If it has a title, it's a real article
        if (raw?.title && raw.title.length > 0) {
          console.log(`🔥 FOUND NATIVE ARTICLE ${i}: ${raw.title}`);
          
          articles.push({
            id: `native_${i}`,
            title: raw.title,
            content: raw.encryptedContent || raw.summary,
            summary: raw.summary,
            author: raw.author,
            authorName: `Journalist ${raw.author.slice(0, 6)}`,
            authorType: 'Journalist',
            contentHash: String(i),
            createdAt: new Date(Number(raw.publishedAt) * 1000).toISOString(),
            location: raw.location || 'Miami, FL',
            category: raw.category || 'News',
            tags: [],
            articleType: 'native',
            readerMetrics: {
              viewCount: 0,
              tipAmount: 0,
              commentCount: 0
            }
          });
        }
      } catch (e) {
        // Skip missing articles
      }
    }
    
    console.log(`🔥 UNIFIED FOUND ${articles.length} native articles total`);
    return articles;
  }

  // Simplified methods for compatibility
  async getArticleById(id: string): Promise<Article | null> {
    const articles = await this.getAllArticles();
    return articles.find(a => a.id === id) || null;
  }

  async getCategories(): Promise<string[]> {
    return ['News', 'Politics', 'Technology'];
  }

  async getLocations(): Promise<string[]> {
    return ['Miami, FL'];
  }
}

// Create singleton instance
export const unifiedArticleService = new UnifiedArticleService();
export default unifiedArticleService;