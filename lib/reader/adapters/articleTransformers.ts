// lib/reader/adapters/articleTransformers.ts
// Article transformers for different contract types

import { Article } from '../types/article';
import { CommunityArticle } from '../../blockchain/contracts/CommunityArticleService';
import { PortfolioArticle } from '../../blockchain/contracts/PortfolioArticleService';

// Transform community article from blockchain to Article interface
export const transformCommunityArticle = (blockchainArticle: CommunityArticle): Article => {
  return {
    id: `community_${blockchainArticle.id}`,
    title: blockchainArticle.title,
    content: blockchainArticle.description,
    summary: blockchainArticle.description.substring(0, 200) + (blockchainArticle.description.length > 200 ? '...' : ''),
    author: blockchainArticle.author,
    authorName: undefined, // Will be truncated address in UI
    authorType: 'Citizen' as const,
    contentHash: blockchainArticle.id.toString(),
    createdAt: new Date(Number(blockchainArticle.timestamp) * 1000).toISOString(),
    location: blockchainArticle.location || 'Miami, FL',
    category: blockchainArticle.category || 'Community',
    tags: blockchainArticle.tags || [],
    imageUrl: undefined,
    proposalId: undefined,
    articleType: 'community',
    readerMetrics: {
      viewCount: 0,
      tipAmount: 0,
      commentCount: 0
    }
  };
};

// Transform portfolio article from blockchain to Article interface
export const transformPortfolioArticle = (blockchainArticle: PortfolioArticle): Article => {
  return {
    id: `portfolio_${blockchainArticle.id}`,
    title: blockchainArticle.title,
    content: blockchainArticle.description,
    summary: blockchainArticle.description.substring(0, 200) + (blockchainArticle.description.length > 200 ? '...' : ''),
    author: blockchainArticle.author,
    authorName: undefined, // Will be truncated address in UI
    authorType: 'Journalist' as const,
    contentHash: blockchainArticle.id.toString(),
    createdAt: new Date(Number(blockchainArticle.timestamp) * 1000).toISOString(),
    location: blockchainArticle.location || 'Miami, FL',
    category: blockchainArticle.category || 'Portfolio',
    tags: blockchainArticle.tags || [],
    imageUrl: undefined,
    proposalId: undefined,
    articleType: 'portfolio',
    // Portfolio-specific fields
    originalUrl: blockchainArticle.contentUrl,
    publicationName: blockchainArticle.publicationName,
    originalAuthor: blockchainArticle.originalAuthor,
    originalPublishDate: blockchainArticle.originalPublishDate,
    portfolioType: blockchainArticle.portfolioType as 'verification' | 'showcase',
    readerMetrics: {
      viewCount: 0,
      tipAmount: 0,
      commentCount: 0
    }
  };
};

// Transform encrypted article from blockchain to Article interface
export const transformEncryptedArticle = (blockchainArticle: any): Article => {
  return {
    id: `encrypted_${blockchainArticle.id}`,
    title: blockchainArticle.title,
    content: blockchainArticle.encryptedContent || '', // This will be encrypted
    summary: blockchainArticle.summary || '',
    author: blockchainArticle.author,
    authorName: undefined, // Will be truncated address in UI
    authorType: 'Journalist' as const,
    contentHash: blockchainArticle.id.toString(),
    createdAt: new Date(Number(blockchainArticle.publishedAt) * 1000).toISOString(),
    location: blockchainArticle.location || 'Miami, FL',
    category: blockchainArticle.category || 'Native',
    tags: blockchainArticle.tags || [],
    imageUrl: undefined,
    proposalId: blockchainArticle.proposalId > 0 ? blockchainArticle.proposalId.toString() : undefined,
    articleType: 'native',
    // Encrypted-specific fields
    encryptedContent: blockchainArticle.encryptedContent,
    nftCount: Number(blockchainArticle.nftCount),
    nftPrice: Number(blockchainArticle.nftPrice),
    readerLicenseRatio: Number(blockchainArticle.readerLicenseRatio),
    hasAccess: false, // Will be determined by license check
    readerMetrics: {
      viewCount: 0,
      tipAmount: 0,
      commentCount: 0
    }
  };
};

// Helper function to determine article card type
export const getArticleCardType = (article: Article): 'community' | 'portfolio' | 'article' => {
  switch (article.articleType) {
    case 'community':
      return 'community';
    case 'portfolio':
      return 'portfolio';
    case 'native':
    default:
      return 'article';
  }
};