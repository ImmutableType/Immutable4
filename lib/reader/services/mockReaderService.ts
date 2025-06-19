// File: lib/reader/services/mockReaderService.ts
import { Article } from '../types/article';
import { FeedFilters, FeedSortOptions, ProposalSummary } from '../types/feed';
import { ArticleMetrics, TipTransaction, VoteAction } from '../types/engagement';

// Empty mock data since we're transitioning to blockchain
const articleData: Article[] = [];
const articleDetailsData: Record<string, Article> = {};
const engagementData: {
  votes: Record<string, {
    count: {
      up: number;
      down: number;
      emoji: Record<string, number>;
    };
    users: Record<string, {
      type: 'up' | 'down' | 'emoji';
      emoji?: string;
      timestamp: string;
    }>;
  }>;
  tips: Record<string, {
    total: number;
    count: number;
    transactions: Array<{
      id: string;
      sender: string;
      amount: number;
      timestamp: string;
      message?: string;
    }>;
  }>;
} = { votes: {}, tips: {} };

// Add a delay to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock reader service - transitioning to blockchain
export const mockReaderService = {
  // Get list of articles with optional filtering
  getArticles: async (filters?: Partial<FeedFilters>): Promise<Article[]> => {
    await delay(500);
    console.warn('mockReaderService.getArticles called - this should use blockchain service instead');
    return []; // Return empty array since we're using blockchain now
  },
  
  // Get a specific article by ID
  getArticleById: async (id: string): Promise<Article | null> => {
    await delay(300);
    console.warn('mockReaderService.getArticleById called - this should use blockchain service instead');
    return null;
  },
  
  // Get articles and proposals for a unified feed
  getFeed: async (
    filters?: Partial<FeedFilters>,
    sort?: Partial<FeedSortOptions>,
    proposals?: ProposalSummary[]
  ): Promise<{articles: Article[], proposals: ProposalSummary[]}> => {
    await delay(700);
    console.warn('mockReaderService.getFeed called - this should use blockchain service instead');
    return { articles: [], proposals: proposals || [] };
  },
  
  // Get engagement metrics for an article
  getArticleMetrics: async (articleId: string): Promise<ArticleMetrics | null> => {
    await delay(200);
    
    return {
      articleId,
      viewCount: Math.floor(Math.random() * 100) + 10,
      uniqueViewers: Math.floor(Math.random() * 80) + 5,
      tipTotal: Math.floor(Math.random() * 50) + 5,
      tipCount: Math.floor(Math.random() * 10) + 1,
      commentCount: Math.floor(Math.random() * 20) + 1,
      votes: {
        up: Math.floor(Math.random() * 15) + 1,
        down: Math.floor(Math.random() * 5),
        emoji: {
          '👍': Math.floor(Math.random() * 10) + 1,
          '👏': Math.floor(Math.random() * 8) + 1,
          '🔥': Math.floor(Math.random() * 6) + 1,
          '🤔': Math.floor(Math.random() * 4) + 1
        }
      }
    };
  },
  
  // Simulate a user voting on an article
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
  
  // Simulate a user tipping an article
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
  
  // Check if a user has interacted with an article
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
  
  // Increment view count for an article
  recordView: async (articleId: string, userId: string): Promise<void> => {
    await delay(100);
    console.log(`View recorded for article ${articleId} by user ${userId}`);
  }
};

// Export for use in components
export default mockReaderService;