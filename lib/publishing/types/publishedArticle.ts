// lib/publishing/types/publishedArticle.ts
// Instead of importing from profile directly, we'll define a minimal type for now
interface ProfileReference {
    id: string;
    displayName?: string;
    walletAddress: string;
    avatarUrl?: string;
    isVerified?: boolean;
  }
  
  // Base article type (shared fields)
  export interface BaseArticle {
    id: string;
    title: string;
    shortDescription: string;  // For Article Card display
    contentHash: string;       // IPFS hash of article metadata
    authorId: string;          // Profile ID of publisher
    category: string;
    tags: string[];
    location: string;          // Geography tag
    createdAt: string;
    publishedAt: string;
    fee: number;               // .5 FLOW standard fee
    mintType: 'community' | 'portfolio' | 'native';
    transactionHash?: string;  // Blockchain transaction reference
    author?: ProfileReference; // Populated author profile
  }
  
  // Rest of the file remains the same

// Community Curation (external article)
export interface CommunityArticle extends BaseArticle {
  mintType: 'community';
  originalUrl: string;
  sourceDomain: string;
  originalAuthor?: string;    // Credit for original author
  proposalCreated?: boolean;  // If a proposal was created from this
  proposalId?: string;        // Reference to created proposal
}

// Portfolio Verification 
export interface PortfolioArticle extends BaseArticle {
  mintType: 'portfolio';
  originalUrl: string;
  publicationName: string;
  originalPublishDate: string;
  journalistId: string;       // Profile ID of verified journalist
}

// Native Publication
export interface NativeArticle extends BaseArticle {
  mintType: 'native';
  fullContent: string;        // Full markdown/rich text content
  coverImage?: string;        // IPFS hash of cover image
}

// Type guard functions
export function isCommunityArticle(article: BaseArticle): article is CommunityArticle {
  return article.mintType === 'community';
}

export function isPortfolioArticle(article: BaseArticle): article is PortfolioArticle {
  return article.mintType === 'portfolio';
}

export function isNativeArticle(article: BaseArticle): article is NativeArticle {
  return article.mintType === 'native';
}

export type PublishedArticle = CommunityArticle | PortfolioArticle | NativeArticle;

export interface PublishedArticlesResponse {
  articles: PublishedArticle[];
  total: number;
  nextCursor?: string;
}