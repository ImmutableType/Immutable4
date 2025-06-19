// lib/publishing/services/mockPublishingService.ts
import { BaseArticle, PublishedArticle, PublishedArticlesResponse, CommunityArticle, PortfolioArticle, NativeArticle } from '../types/publishedArticle';
import rawArticlesData from '../mockData/articles.json';
import { TokenType } from '../types/publishingToken';
import { mockTokenVerificationService } from './tokenVerificationService';
import { mockFeesService } from './feesService';

// Safely access the imported JSON data
const articlesData = {
  articles: Array.isArray(rawArticlesData.articles) ? rawArticlesData.articles : [],
  total: typeof rawArticlesData.total === 'number' ? rawArticlesData.total : 0
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockPublishingService = {
  // Get all published articles
  getPublishedArticles: async (limit = 10, cursor?: string): Promise<PublishedArticlesResponse> => {
    await delay(800); // Simulate network delay
    
    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const endIndex = startIndex + limit;
    const paginatedArticles = articlesData.articles.slice(startIndex, endIndex);
    
    return {
      articles: paginatedArticles as PublishedArticle[],
      total: articlesData.total,
      nextCursor: endIndex < articlesData.total ? endIndex.toString() : undefined
    };
  },
  
  // Rest of the methods remain the same
  // ...
  
  // Get published articles by author
  getPublishedArticlesByAuthor: async (authorId: string, limit = 10, cursor?: string): Promise<PublishedArticlesResponse> => {
    await delay(800); // Simulate network delay
    
    const { articles } = articlesData;
    const authorArticles = articles.filter(article => article.authorId === authorId);
    const total = authorArticles.length;
    
    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const endIndex = startIndex + limit;
    const paginatedArticles = authorArticles.slice(startIndex, endIndex);
    
    return {
      articles: paginatedArticles as PublishedArticle[],
      total,
      nextCursor: endIndex < total ? endIndex.toString() : undefined
    };
  },
  
  // Get a single article by ID
  getArticleById: async (articleId: string): Promise<PublishedArticle | null> => {
    await delay(600); // Simulate network delay
    
    const { articles } = articlesData;
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
      return null;
    }
    
    return article as PublishedArticle;
  },
  
  // Publish a community curated article
  publishCommunityArticle: async (
    authorId: string,
    articleData: Omit<CommunityArticle, 'id' | 'contentHash' | 'createdAt' | 'publishedAt' | 'fee' | 'transactionHash'>
  ): Promise<PublishedArticle> => {
    await delay(1500); // Simulate network delay
    
    // Verify token
    const tokenResponse = await mockTokenVerificationService.verifyToken(authorId, 'subscriber');
    if (!tokenResponse.hasToken) {
      throw new Error('You do not have the required token to publish a community article');
    }
    
    // Process fee
    const feeResponse = await mockFeesService.processPayment(authorId, 0.5);
    if (!feeResponse.success) {
      throw new Error('Fee payment failed: ' + (feeResponse.error || 'Unknown error'));
    }
    
    // Create article
    const newArticle: CommunityArticle = {
      id: `article-${Date.now().toString(36)}`,
      contentHash: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      fee: 0.5,
      transactionHash: feeResponse.fee.transactionHash,
      ...articleData
    };
    
    // In a real implementation, this would be persisted to the blockchain
    
    return newArticle;
  },
  
  // Publish a portfolio verification article
  publishPortfolioArticle: async (
    authorId: string,
    articleData: Omit<PortfolioArticle, 'id' | 'contentHash' | 'createdAt' | 'publishedAt' | 'fee' | 'transactionHash'>
  ): Promise<PublishedArticle> => {
    await delay(1500); // Simulate network delay
    
    // Verify token
    const tokenResponse = await mockTokenVerificationService.verifyToken(authorId, 'journalist');
    if (!tokenResponse.hasToken) {
      throw new Error('You do not have the required token to publish a portfolio article');
    }
    
    // Process fee
    const feeResponse = await mockFeesService.processPayment(authorId, 0.5);
    if (!feeResponse.success) {
      throw new Error('Fee payment failed: ' + (feeResponse.error || 'Unknown error'));
    }
    
    // Create article
    const newArticle: PortfolioArticle = {
      id: `article-${Date.now().toString(36)}`,
      contentHash: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      fee: 0.5,
      transactionHash: feeResponse.fee.transactionHash,
      ...articleData
    };
    
    // In a real implementation, this would be persisted to the blockchain
    
    return newArticle;
  },
  
  // Publish a native article
  publishNativeArticle: async (
    authorId: string,
    articleData: Omit<NativeArticle, 'id' | 'contentHash' | 'createdAt' | 'publishedAt' | 'fee' | 'transactionHash'>
  ): Promise<PublishedArticle> => {
    await delay(1500); // Simulate network delay
    
    // Verify token
    const tokenResponse = await mockTokenVerificationService.verifyToken(authorId, 'creator');
    if (!tokenResponse.hasToken) {
      throw new Error('You do not have the required token to publish a native article');
    }
    
    // Process fee
    const feeResponse = await mockFeesService.processPayment(authorId, 0.5);
    if (!feeResponse.success) {
      throw new Error('Fee payment failed: ' + (feeResponse.error || 'Unknown error'));
    }
    
    // Create article
    const newArticle: NativeArticle = {
      id: `article-${Date.now().toString(36)}`,
      contentHash: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      fee: 0.5,
      transactionHash: feeResponse.fee.transactionHash,
      ...articleData
    };
    
    // In a real implementation, this would be persisted to the blockchain
    // In a real implementation, this would store content on IPFS
    
    return newArticle;
  },
  
// lib/publishing/services/mockPublishingService.ts
// Fix the createProposalFromArticle method (lines around 176-195)

createProposalFromArticle: async (articleId: string, authorId: string): Promise<string> => {
    await delay(1000); // Simulate network delay
    
    // Instead of using 'this', use the direct service reference
    const article = await mockPublishingService.getArticleById(articleId);
    
    if (!article || article.mintType !== 'community') {
      throw new Error('Cannot create proposal: Invalid article or article type');
    }
    
    if (article.authorId !== authorId) {
      throw new Error('You can only create proposals from your own articles');
    }
    
    // In a real implementation, this would interact with the News Proposals system
    const proposalId = `proposal-${Date.now().toString(36)}`;
    
    // Update the article with the proposal ID
    // In a real implementation, this would update the blockchain record
    
    return proposalId;
  }

};