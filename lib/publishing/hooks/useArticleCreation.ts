// lib/publishing/hooks/useArticleCreation.ts
import { useState } from 'react';
import { PublishedArticle, CommunityArticle, PortfolioArticle, NativeArticle } from '../types/publishedArticle';
import { useWallet } from '../../hooks/useWallet';

// Helper function to extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error('Invalid URL:', url);
    return '';
  }
}

export function useArticleCreation(authorId: string) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdArticle, setCreatedArticle] = useState<PublishedArticle | null>(null);

  // Get wallet state at hook level
  const { provider } = useWallet();
  if (!provider) {
    console.warn('Wallet not connected');
  }

  const publishCommunityArticle = async (
    articleData: Omit<CommunityArticle, 'id' | 'contentHash' | 'createdAt' | 'publishedAt' | 'fee' | 'transactionHash' | 'authorId'>
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Check wallet connection
      if (!provider) {
        throw new Error('Wallet not connected');
      }
      
      // Get signer from provider
      const signer = await provider.getSigner();
      
      // Import the blockchain service
      const { CommunityArticleService } = await import('../../blockchain/contracts/CommunityArticleService');
      
      // Get contract address from deployment info
      const deploymentInfo = await import('../../../deployments/CommunityArticles.json');
      const contractAddress = deploymentInfo.address;
      
      // Transform form data to match contract's ArticleInput struct
      const articleInput = {
        title: articleData.title,
        description: articleData.shortDescription,
        contentUrl: articleData.originalUrl,
        category: articleData.category,
        location: articleData.location,
        tags: articleData.tags || [],
        originalAuthor: articleData.originalAuthor || '',
        sourceDomain: articleData.sourceDomain || ''
      };

      const service = new CommunityArticleService(contractAddress, provider);
      const txResponse = await service.createCommunityArticle(articleInput, signer);
      
      // Wait for transaction to be mined
      const receipt = await txResponse.wait();
      
      // Extract article ID from transaction events
      let articleId = 'temp-id-' + Date.now(); // Fallback ID
      if (receipt && receipt.logs) {
        try {
          const { Interface } = await import('ethers');
          const iface = new Interface([
            "event ArticleCreated(uint256 indexed id, address indexed author, string title)"
          ]);
          for (const log of receipt.logs) {
            try {
              const parsed = iface.parseLog(log);
              if (parsed && parsed.name === 'ArticleCreated') {
                articleId = parsed.args.id.toString();
                break;
              }
            } catch (e) {
              // Skip logs that don't match our event
            }
          }
        } catch (e) {
          console.warn('Could not parse transaction logs for article ID');
        }
      }
      
      // Create article object in the expected format
      const article = {
        ...articleData,
        id: articleId,
        authorId,
        contentHash: '', 
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        fee: 0.009 as any, // Temporarily bypass type check
        transactionHash: txResponse.hash,
        mintType: 'community' as const
      };
      
      setCreatedArticle(article);
      return article;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to publish community article'));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const publishPortfolioArticle = async (
    articleData: Omit<PortfolioArticle, 'id' | 'contentHash' | 'createdAt' | 'publishedAt' | 'fee' | 'transactionHash' | 'authorId'>
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Check wallet connection
      if (!provider) {
        throw new Error('Wallet not connected');
      }
      
      // Get signer from provider
      const signer = await provider.getSigner();
      
      // Import the Portfolio blockchain service
      const { PortfolioArticleService } = await import('../../blockchain/contracts/PortfolioArticleService');
      
      // Get contract address from deployment info
      const deploymentInfo = await import('../../../deployments/PortfolioArticles.json');
      const contractAddress = deploymentInfo.address;
      
      // Transform form data to match contract's PortfolioArticleInput struct
      const articleInput = {
        title: articleData.title,
        description: articleData.shortDescription,
        contentUrl: articleData.originalUrl,
        category: articleData.category,
        location: articleData.location,
        tags: articleData.tags || [],
        originalAuthor: '', // Portfolio articles don't track original author separately
        sourceDomain: extractDomain(articleData.originalUrl),
        publicationName: articleData.publicationName,
        originalPublishDate: articleData.originalPublishDate,
        portfolioType: 'verification' // Default to verification type
      };

      const service = new PortfolioArticleService(contractAddress, provider);
      const txResponse = await service.createPortfolioArticle(articleInput, signer);
      
      // Wait for transaction to be mined
      const receipt = await txResponse.wait();
      
      // Extract article ID from transaction events
      let articleId = 'temp-id-' + Date.now(); // Fallback ID
      if (receipt && receipt.logs) {
        try {
          const { Interface } = await import('ethers');
          const iface = new Interface([
            "event PortfolioArticleCreated(uint256 indexed articleId, address indexed author, string indexed category, string title, string contentUrl, string publicationName, uint256 timestamp)"
          ]);
          for (const log of receipt.logs) {
            try {
              const parsed = iface.parseLog(log);
              if (parsed && parsed.name === 'PortfolioArticleCreated') {
                articleId = parsed.args.articleId.toString();
                break;
              }
            } catch (e) {
              // Skip logs that don't match our event
            }
          }
        } catch (e) {
          console.warn('Could not parse transaction logs for article ID');
        }
      }
      
      // Create article object in the expected format
      const article = {
        ...articleData,
        id: articleId,
        authorId,
        contentHash: '', 
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        fee: 1.0 as any, // Portfolio fee is 1 FLOW
        transactionHash: txResponse.hash,
        mintType: 'portfolio' as const
      };
      
      setCreatedArticle(article);
      return article;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to publish portfolio article'));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const publishNativeArticle = async (
    articleData: Omit<NativeArticle, 'id' | 'contentHash' | 'createdAt' | 'publishedAt' | 'fee' | 'transactionHash' | 'authorId'>
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const article = { 
        success: false, 
        error: 'Native article publishing not implemented in production' 
      } as any;
      
      setCreatedArticle(null);
      return article;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to publish native article'));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const createProposalFromArticle = async (articleId: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const proposalId = null; // Proposal creation not implemented in production
      return proposalId;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create proposal from article'));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    publishCommunityArticle,
    publishPortfolioArticle,
    publishNativeArticle,
    createProposalFromArticle,
    isSubmitting,
    error,
    createdArticle,
    resetCreatedArticle: () => setCreatedArticle(null),
    resetError: () => setError(null)
  };
}