// lib/profile/services/profileArticleService.ts
// Service to fetch articles from both Community and Portfolio contracts for profile display

import { ethers } from 'ethers';
import { 
  ProfileArticle, 
  ProfileCommunityArticle, 
  ProfilePortfolioArticle,
  ProfileArticlesResponse,
  ProfileArticleStats,
  ProfileArticleQuery,
  ProfileArticleFilter
} from '../types/profileArticle';
import { CommunityArticleService } from '../../blockchain/contracts/CommunityArticleService';
import { PortfolioArticleService } from '../../blockchain/contracts/PortfolioArticleService';
import communityDeployment from '../../../deployments/CommunityArticles.json';
import portfolioDeployment from '../../../deployments/PortfolioArticles.json';

export class ProfileArticleService {
  private communityService: CommunityArticleService;
  private portfolioService: PortfolioArticleService;
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider) {
    console.log('ProfileArticleService - Community address:', communityDeployment.address);
    console.log('ProfileArticleService - Portfolio address:', portfolioDeployment.address);
    this.provider = provider;
    this.communityService = new CommunityArticleService(communityDeployment.address, provider);
    this.portfolioService = new PortfolioArticleService(portfolioDeployment.address, provider);
  }

  /**
   * Get all articles for a profile (Community + Portfolio)
   */
  async getProfileArticles(
    authorAddress: string,
    query: ProfileArticleQuery = { filter: 'all', sortBy: 'newest' }
  ): Promise<ProfileArticlesResponse> {
    try {
      // Fetch from both contracts in parallel
      const [communityIds, portfolioIds, communityStats, portfolioStats] = await Promise.all([
        this.communityService.getArticlesByAuthor(authorAddress),
        this.portfolioService.getArticlesByAuthor(authorAddress),
        this.communityService.getUserPostingStats(authorAddress),
        this.portfolioService.getUserPostingStats(authorAddress)
      ]);

      // Fetch full article data
      const [communityArticles, portfolioArticles] = await Promise.all([
        this.fetchCommunityArticles(communityIds),
        this.fetchPortfolioArticles(portfolioIds)
      ]);

      // Apply filtering
      const filteredCommunity = query.filter === 'portfolio' ? [] : communityArticles;
      const filteredPortfolio = query.filter === 'community' ? [] : portfolioArticles;

      // Sort articles
      const sortedCommunity = this.sortArticles(filteredCommunity, query.sortBy);
      const sortedPortfolio = this.sortArticles(filteredPortfolio, query.sortBy);

      // Create stats
      const stats: ProfileArticleStats = {
        totalCommunityArticles: communityArticles.length,
        totalPortfolioArticles: portfolioArticles.length,
        totalArticles: communityArticles.length + portfolioArticles.length,
        postsToday: communityStats.postsToday + portfolioStats.postsToday,
        remainingToday: Math.min(communityStats.remainingToday, portfolioStats.remainingToday)
      };

      return {
        communityArticles: sortedCommunity,
        portfolioArticles: sortedPortfolio,
        stats
      };

    } catch (error) {
      console.error('Error fetching profile articles:', error);
      return {
        communityArticles: [],
        portfolioArticles: [],
        stats: {
          totalCommunityArticles: 0,
          totalPortfolioArticles: 0,
          totalArticles: 0,
          postsToday: 0,
          remainingToday: 0
        }
      };
    }
  }

  /**
   * Get combined articles list (mixed Community + Portfolio, sorted chronologically)
   */
  async getCombinedArticles(
    authorAddress: string,
    limit: number = 10,
    sortBy: 'newest' | 'oldest' = 'newest'
  ): Promise<ProfileArticle[]> {
    const response = await this.getProfileArticles(authorAddress, { 
      filter: 'all', 
      sortBy, 
      limit 
    });

    // Combine and sort by timestamp
    const allArticles: ProfileArticle[] = [
      ...response.communityArticles,
      ...response.portfolioArticles
    ];

    return this.sortArticles(allArticles, sortBy).slice(0, limit);
  }

  /**
   * Get articles by specific type
   */
  async getArticlesByType(
    authorAddress: string,
    type: 'community' | 'portfolio',
    limit: number = 10
  ): Promise<ProfileArticle[]> {
    try {
      if (type === 'community') {
        const articleIds = await this.communityService.getArticlesByAuthor(authorAddress);
        const articles = await this.fetchCommunityArticles(articleIds);
        return articles.slice(0, limit);
      } else {
        const articleIds = await this.portfolioService.getArticlesByAuthor(authorAddress);
        const articles = await this.fetchPortfolioArticles(articleIds);
        return articles.slice(0, limit);
      }
    } catch (error) {
      console.error(`Error fetching ${type} articles:`, error);
      return [];
    }
  }

  /**
   * Get posting statistics for profile dashboard
   */
  async getPostingStats(authorAddress: string): Promise<ProfileArticleStats> {
    try {
      const [communityStats, portfolioStats] = await Promise.all([
        this.communityService.getUserPostingStats(authorAddress),
        this.portfolioService.getUserPostingStats(authorAddress)
      ]);

      return {
        totalCommunityArticles: communityStats.totalPosts,
        totalPortfolioArticles: portfolioStats.totalPosts,
        totalArticles: communityStats.totalPosts + portfolioStats.totalPosts,
        postsToday: communityStats.postsToday + portfolioStats.postsToday,
        remainingToday: Math.min(communityStats.remainingToday, portfolioStats.remainingToday)
      };
    } catch (error) {
      console.error('Error fetching posting stats:', error);
      return {
        totalCommunityArticles: 0,
        totalPortfolioArticles: 0,
        totalArticles: 0,
        postsToday: 0,
        remainingToday: 0
      };
    }
  }

  /**
   * Get single article by ID and type
   */
  async getArticleById(
    articleId: string, 
    type: 'community' | 'portfolio'
  ): Promise<ProfileArticle | null> {
    try {
      if (type === 'community') {
        const article = await this.communityService.getArticle(articleId);
        return article ? this.transformCommunityArticle(article) : null;
      } else {
        const article = await this.portfolioService.getArticle(articleId);
        return article ? this.transformPortfolioArticle(article) : null;
      }
    } catch (error) {
      console.error(`Error fetching ${type} article ${articleId}:`, error);
      return null;
    }
  }

  // Private helper methods

  private async fetchCommunityArticles(articleIds: string[]): Promise<ProfileCommunityArticle[]> {
    const articles: ProfileCommunityArticle[] = [];
    
    for (const id of articleIds) {
      try {
        const article = await this.communityService.getArticle(id);
        if (article) {
          articles.push(this.transformCommunityArticle(article));
        }
      } catch (error) {
        console.error(`Error fetching community article ${id}:`, error);
      }
    }
    
    return articles;
  }

  private async fetchPortfolioArticles(articleIds: string[]): Promise<ProfilePortfolioArticle[]> {
    const articles: ProfilePortfolioArticle[] = [];
    
    for (const id of articleIds) {
      try {
        const article = await this.portfolioService.getArticle(id);
        if (article) {
          articles.push(this.transformPortfolioArticle(article));
        }
      } catch (error) {
        console.error(`Error fetching portfolio article ${id}:`, error);
      }
    }
    
    return articles;
  }

  private transformCommunityArticle(article: any): ProfileCommunityArticle {
    return {
      type: 'community',
      id: article.id,
      title: article.title,
      description: article.description,
      contentUrl: article.contentUrl,
      category: article.category,
      location: article.location,
      tags: article.tags,
      originalAuthor: article.originalAuthor,
      sourceDomain: article.sourceDomain,
      author: article.author,
      timestamp: article.timestamp,
      isActive: article.isActive,
      createdAt: new Date(Number(article.timestamp) * 1000).toISOString(),
      fee: BigInt('9000000000000000') // 0.009 FLOW in wei
    };
  }

  private transformPortfolioArticle(article: any): ProfilePortfolioArticle {
    return {
      type: 'portfolio',
      id: article.id,
      title: article.title,
      description: article.description,
      contentUrl: article.contentUrl,
      category: article.category,
      location: article.location,
      tags: article.tags,
      originalAuthor: article.originalAuthor,
      sourceDomain: article.sourceDomain,
      publicationName: article.publicationName,
      originalPublishDate: article.originalPublishDate,
      portfolioType: article.portfolioType as 'verification' | 'showcase',
      author: article.author,
      timestamp: article.timestamp,
      isActive: article.isActive,
      createdAt: new Date(Number(article.timestamp) * 1000).toISOString(),
      fee: BigInt('1000000000000000000') // 1 FLOW in wei
    };
  }

  private sortArticles<T extends ProfileArticle>(
    articles: T[], 
    sortBy: 'newest' | 'oldest' | 'title'
  ): T[] {
    return [...articles].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return Number(b.timestamp) - Number(a.timestamp);
        case 'oldest':
          return Number(a.timestamp) - Number(b.timestamp);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }
}

// Helper function to create service instance
export function createProfileArticleService(provider: ethers.Provider): ProfileArticleService {
  return new ProfileArticleService(provider);
}

// Default export
export default ProfileArticleService;