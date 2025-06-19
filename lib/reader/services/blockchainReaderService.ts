// File: lib/reader/services/blockchainReaderService.ts
import { Article } from '../types/article';
import { FeedFilters } from '../types/feed';
import { ArticleMetrics, TipTransaction, VoteAction } from '../types/engagement';
import unifiedArticleService from './unifiedArticleService';

// Add a delay to simulate network requests (can be removed for production)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Blockchain reader service - now using unified article service
export const blockchainReaderService = {
  // Get list of articles from blockchain with optional filtering
  getArticles: async (filters?: Partial<FeedFilters>): Promise<Article[]> => {
    await delay(300); // Simulate network delay
    
    try {
      console.log('BlockchainReaderService: Fetching articles with filters:', filters);
      return await unifiedArticleService.getAllArticles(filters);
    } catch (error) {
      console.error('Failed to fetch articles from blockchain:', error);
      return [];
    }
  },

  // ✅ UPDATED: Get ALL articles including native/encrypted types
  getAllArticles: async (): Promise<Article[]> => {
    await delay(300);
    
    try {
      console.log('BlockchainReaderService: Fetching ALL article types');
      
      // Fetch all articles without filtering by type
      const allArticles = await unifiedArticleService.getAllArticles();
      
      // Ensure we include ALL article types including native/encrypted
      const filteredArticles = allArticles.filter(article => {
        // Include community, portfolio, AND native articles
        return article.articleType && 
               ['community', 'portfolio', 'native'].includes(article.articleType);
      });
      
      console.log(`Found ${filteredArticles.length} articles of all types`);
      return filteredArticles;
      
    } catch (error) {
      console.error('Failed to fetch all articles from blockchain:', error);
      return [];
    }
  },
  
  // Get a specific article by ID from blockchain
  getArticleById: async (id: string): Promise<Article | null> => {
    await delay(200);
    
    try {
      console.log(`BlockchainReaderService: Fetching article ${id}`);
      return await unifiedArticleService.getArticleById(id);
    } catch (error) {
      console.error(`Failed to fetch article ${id} from blockchain:`, error);
      return null;
    }
  },
  
  // Get engagement metrics for an article (placeholder implementation)
  getArticleMetrics: async (articleId: string): Promise<ArticleMetrics | null> => {
    await delay(200);
    
    // For now, return zero metrics - remove mock data
    return {
      articleId,
      viewCount: 0,
      uniqueViewers: 0,
      tipTotal: 0,
      tipCount: 0,
      commentCount: 0,
      votes: {
        up: 0,
        down: 0,
        emoji: {}
      }
    };
  },
  
  // Placeholder implementations for engagement (to be implemented with blockchain later)
  addVote: async (
    articleId: string,
    userId: string,
    voteType: 'up' | 'down' | 'emoji',
    emoji?: string
  ): Promise<VoteAction> => {
    await delay(400);
    
    const vote: VoteAction = {
      id: `vote-${Date.now()}`,
      articleId,
      voter: userId,
      voteType,
      emoji: voteType === 'emoji' ? emoji : undefined,
      timestamp: new Date().toISOString()
    };
    
    return vote;
  },
  
  addTip: async (
    articleId: string,
    userId: string,
    amount: number,
    message?: string
  ): Promise<TipTransaction> => {
    await delay(600);
    
    const tip: TipTransaction = {
      id: `tip-${Date.now()}`,
      articleId,
      sender: userId,
      amount,
      timestamp: new Date().toISOString(),
      message
    };
    
    return tip;
  },
  
  getUserEngagement: async (articleId: string, userId: string): Promise<{
    hasVoted: boolean;
    hasTipped: boolean;
    userVote?: VoteAction;
    userTip?: TipTransaction;
  }> => {
    await delay(300);
    
    return {
      hasVoted: false,
      hasTipped: false
    };
  },
  
  recordView: async (articleId: string, userId: string): Promise<void> => {
    await delay(100);
    console.log(`View recorded for blockchain article ${articleId} by user ${userId}`);
  }
};

export default blockchainReaderService;