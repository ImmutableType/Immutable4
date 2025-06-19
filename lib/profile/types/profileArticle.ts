// lib/profile/types/profileArticle.ts
// Unified type definitions for profile article display (Community + Portfolio)

// Base interface for all profile articles
export interface BaseProfileArticle {
    id: string;
    title: string;
    description: string;
    contentUrl: string;
    category: string;
    location: string;
    tags: string[];
    author: string;
    authorName?: string;
    timestamp: bigint;
    isActive: boolean;
    createdAt: string; // ISO string for display
    contentHash?: string;
    transactionHash?: string;
  }
  
  // Community article from blockchain
  export interface ProfileCommunityArticle extends BaseProfileArticle {
    type: 'community';
    originalAuthor: string;
    sourceDomain: string;
    fee: bigint; // 0.009 FLOW
  }
  
  // Portfolio article from blockchain  
  export interface ProfilePortfolioArticle extends BaseProfileArticle {
    type: 'portfolio';
    originalAuthor: string;
    sourceDomain: string;
    publicationName: string;
    originalPublishDate: string;
    portfolioType: 'verification' | 'showcase';
    fee: bigint; // 1 FLOW
  }
  
  // Union type for all profile articles
  export type ProfileArticle = ProfileCommunityArticle | ProfilePortfolioArticle;
  
  // Props for displaying articles in profile cards
  export interface ProfileArticleCardData {
    id: string;
    title: string;
    summary: string;
    imageUrl?: string;
    author: {
      name: string;
      id: string;
      stats?: {
        articlesPublished?: number;
        credibility?: number;
        location?: string;
      };
    };
    createdAt: string;
    verifiedAt: string;
    location?: {
      city: string;
      state: string;
      neighborhood?: string;
    };
    category?: string;
    tags?: string[];
    contentHash?: string;
    type: 'community' | 'portfolio';
    
    // Community-specific fields
    sourceUrl?: string;
    sourceName?: string;
    
    // Portfolio-specific fields  
    originalUrl?: string;
    publicationName?: string;
    originalAuthor?: string;
    originalPublishDate?: string;
    portfolioType?: 'verification' | 'showcase';
    
    // Display props
    onClick?: () => void;
    className?: string;
  }
  
  // Service response interfaces
  export interface ProfileArticleStats {
    totalCommunityArticles: number;
    totalPortfolioArticles: number;
    totalArticles: number;
    postsToday: number;
    remainingToday: number;
  }
  
  export interface ProfileArticlesResponse {
    communityArticles: ProfileCommunityArticle[];
    portfolioArticles: ProfilePortfolioArticle[];
    stats: ProfileArticleStats;
  }
  
  // Filter and sorting options
  export type ProfileArticleFilter = 'all' | 'community' | 'portfolio';
  
  export type ProfileArticleSortBy = 'newest' | 'oldest' | 'title';
  
  export interface ProfileArticleQuery {
    filter: ProfileArticleFilter;
    sortBy: ProfileArticleSortBy;
    limit?: number;
    offset?: number;
  }
  
  // Transform blockchain data to card display format
  export function transformToCardData(
    article: ProfileArticle, 
    authorName: string,
    authorId: string
  ): ProfileArticleCardData {
    const baseData = {
      id: article.id,
      title: article.title,
      summary: article.description,
      author: {
        name: authorName,
        id: authorId,
        stats: {
          articlesPublished: 0, // Will be populated by service
          location: article.location
        }
      },
      createdAt: article.createdAt,
      verifiedAt: article.createdAt,
      location: parseLocation(article.location),
      category: article.category,
      tags: article.tags,
      contentHash: article.contentHash,
      type: article.type
    };
  
    if (article.type === 'community') {
      return {
        ...baseData,
        sourceUrl: article.contentUrl,
        sourceName: article.sourceDomain
      };
    } else {
      return {
        ...baseData,
        originalUrl: article.contentUrl,
        publicationName: article.publicationName,
        originalAuthor: article.originalAuthor,
        originalPublishDate: article.originalPublishDate,
        portfolioType: article.portfolioType
      };
    }
  }
  
  // Helper function to parse location string into object
  function parseLocation(locationString: string): {city: string; state: string; neighborhood?: string} | undefined {
    if (!locationString) return undefined;
    
    const parts = locationString.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return {
        city: parts[0],
        state: parts[1],
        neighborhood: parts[2] || undefined
      };
    }
    
    return undefined;
  }
  
  // Constants for article limits and fees
  export const ARTICLE_CONSTANTS = {
    COMMUNITY: {
      FEE_FLOW: 0.009,
      DAILY_LIMIT: 20
    },
    PORTFOLIO: {
      FEE_FLOW: 1.0,
      DAILY_LIMIT: 50
    }
  } as const;